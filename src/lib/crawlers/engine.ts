import { EventEmitter } from "events";
import { Shuba69Crawler } from "./69shuba";
import { UukanshuCrawler } from "./uukanshu";
import { createClient } from "@/lib/supabase/server";

export class JobEmitter extends EventEmitter {
  history: {
    phase?: string;
    metadata?: any;
    logs: any[];
    chapters: any[];
    progress?: any;
  } = { logs: [], chapters: [] };
  cancelled = false;

  constructor() {
    super();
    this.on("phase", (p) => (this.history.phase = p));
    this.on("metadata", (m) => (this.history.metadata = m));
    this.on("log", (l) => this.history.logs.push(l));
    this.on("chapter", (c) => this.history.chapters.push(c));
    this.on("progress", (pr) => (this.history.progress = pr));
  }

  addLog(level: "info" | "warn" | "error", message: string) {
    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    this.emit("log", log);
  }
}

// Global cache to persist across hot reloads in dev
const globalForCrawl = globalThis as unknown as {
  crawlJobs: Map<string, JobEmitter>;
};

if (!globalForCrawl.crawlJobs) {
  globalForCrawl.crawlJobs = new Map();
}

export const crawlJobs = globalForCrawl.crawlJobs;

export function getCrawlerForUrl(url: string) {
  if (
    url.includes("69shuba.com") ||
    url.includes("69shuba.pro") ||
    url.includes("69shu.pro")
  )
    return new Shuba69Crawler(2);
  if (url.includes("uukanshu.cc")) return new UukanshuCrawler(2);
  throw new Error(
    "Unsupported URL source. Only 69shuba and uukanshu.cc are supported.",
  );
}

export function getNovelIdFromUrl(url: string): string {
  if (
    url.includes("69shuba.com") ||
    url.includes("69shuba.pro") ||
    url.includes("69shu.pro")
  ) {
    const match = url.match(/\/book\/(\d+)\.htm/);
    if (match) return match[1];
    const match2 = url.match(/\/book\/(\d+)\/?/);
    if (match2) return match2[1];
  }
  if (url.includes("uukanshu.cc")) {
    const match = url.match(/\/book\/(\d+)\/?/);
    if (match) return match[1];
  }
  throw new Error("Could not extract novel ID from URL");
}

export async function runBackgroundCrawl(
  jobId: string,
  url: string,
  userId: string,
  novelId: string,
  targetIndexes?: number[],
) {
  const emitter = new JobEmitter();
  crawlJobs.set(jobId, emitter);
  const supabase = await createClient();

  emitter.addLog(
    "info",
    targetIndexes?.length
      ? `Retry job started for ${targetIndexes.length} chapters.`
      : "Job registered successfully in memory.",
  );

  try {
    const crawler = getCrawlerForUrl(url);
    const sourceNovelId = getNovelIdFromUrl(url);

    emitter.addLog("info", "Fetching novel metadata...");

    // 1. Fetch metadata needed for updating crawl_jobs total_chapters
    const meta = await crawler.getNovelMetadata(sourceNovelId);

    // Upsert novel using the real novel details
    const origin = new URL(url).origin;
    const { data: updatedNovel, error: novelError } = await supabase
      .from("novels")
      .update({
        title_raw: meta.title,
        author_raw: meta.author,
        cover_url: meta.coverUrl,
        description_raw: meta.description,
        total_chapters: meta.totalChapters || 0,
        total_words: meta.totalWords
          ? parseInt(meta.totalWords.replace(/[^\d]/g, "")) || 0
          : 0,
        publication_status: "ongoing", // Placeholder
        source_origin: origin,
      })
      .eq("id", novelId)
      .select()
      .single();

    if (novelError)
      throw new Error("Failed to update novel metadata: " + novelError.message);

    emitter.emit("metadata", {
      title: meta.title,
      author: meta.author,
      coverUrl: meta.coverUrl,
      sourceUrl: url,
      description: meta.description,
      totalChapters: meta.totalChapters,
    });

    emitter.addLog(
      "info",
      `Metadata fetched. Found ${meta.totalChapters || "unknown"} chapters.`,
    );

    // Update job status
    await supabase
      .from("crawl_jobs")
      .update({
        status: "running",
        total_chapters: meta.totalChapters || 0,
      })
      .eq("id", jobId);

    emitter.emit("phase", "crawling");

    let successCount = 0;
    let failedCount = 0;

    // 2. Start streaming
    for await (const chapterData of crawler.crawlAndStream(
      sourceNovelId,
      targetIndexes,
    )) {
      if (emitter.cancelled) {
        crawler.abort();
        break;
      }

      const isFailed = chapterData.content.startsWith("[CRAWL_FAILED]");
      if (isFailed) {
        failedCount++;
        emitter.addLog(
          "error",
          `Failed to fetch chapter ${chapterData.index}: ${chapterData.title}`,
        );
        emitter.emit("chapter", {
          index: chapterData.index,
          title: chapterData.title,
          url: chapterData.url,
          status: "failed",
          error: chapterData.content,
        });
      } else {
        successCount++;
        emitter.addLog(
          "info",
          `Successfully fetched chapter ${chapterData.index}: ${chapterData.title}`,
        );
        emitter.emit("chapter", {
          index: chapterData.index,
          title: chapterData.title,
          url: chapterData.url,
          status: "success",
        });

        // Upsert chapter to DB
        const { error: chapterError } = await supabase.from("chapters").upsert(
          {
            novel_id: novelId,
            user_id: userId,
            chapter_index: chapterData.index,
            title_raw: chapterData.title,
            content_raw: chapterData.content,
          },
          { onConflict: "novel_id,chapter_index" },
        );

        if (chapterError) {
          emitter.addLog(
            "error",
            `DB save failed for chapter ${chapterData.index}: ${chapterError.message}`,
          );
        }
      }

      // Progress update every few chapters to not spam DB
      if ((successCount + failedCount) % 5 === 0) {
        emitter.emit("progress", {
          success: successCount,
          failed: failedCount,
          total: targetIndexes?.length || meta.totalChapters || 0,
        });
      }
    }

    // 3. Complete
    await crawler.closeBrowser();

    if (emitter.cancelled) return;

    await supabase
      .from("crawl_jobs")
      .update({
        status: "completed",
        successful_chapters: successCount,
        failed_chapters: failedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    emitter.emit("progress", {
      success: successCount,
      failed: failedCount,
      total:
        targetIndexes?.length ||
        meta.totalChapters ||
        successCount + failedCount,
    });
    emitter.addLog("info", "Crawl job completed successfully.");
    emitter.emit("phase", "completed");
  } catch (error: any) {
    emitter.addLog("error", `Crawl job failed: ${error.message}`);
    emitter.emit("phase", "failed");
    await supabase
      .from("crawl_jobs")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } finally {
    // Keep it in memory slightly longer for late arrivers, then clear
    setTimeout(() => {
      crawlJobs.delete(jobId);
    }, 60000);
  }
}

export async function retryBackgroundCrawl(jobId: string, userId: string) {
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("crawl_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) throw new Error("Job not found");

  await supabase
    .from("crawl_jobs")
    .update({
      status: "pending",
      error_message: null,
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return runBackgroundCrawl(jobId, job.source_url, userId, job.novel_id);
}
