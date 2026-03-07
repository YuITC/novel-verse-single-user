import { BaseCrawler } from "./base";
import { TextCleaner } from "./text_cleaner";
import { FileCache } from "./cache";

export interface NovelMetadata {
  sourceId: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  totalChapters?: number;
  totalWords?: string;
  lastUpdatedAt?: string;
}

export interface ChapterMetadata {
  index: number;
  title: string;
  url: string;
}

export interface ChapterData extends ChapterMetadata {
  content: string;
}

export class Shuba69Crawler extends BaseCrawler {
  private baseUrl = "https://www.69shuba.com";

  async getNovelMetadata(novelId: string): Promise<NovelMetadata> {
    const url = `${this.baseUrl}/book/${novelId}.htm`;
    const html = await this.fetchHtml(url, { delayMs: 1500 }); // Let BaseCrawler handle Cloudflare if any
    const $ = this.parseHtml(html);

    const title =
      $(".booknav2 h1 a").text().trim() || $(".booknav2 h1").text().trim();

    const authorRaw = $(".booknav2 p").eq(0).text() || "";
    const author = authorRaw
      .replace("作者：", "")
      .replace("作    者：", "")
      .trim();

    const statusWordsRaw = $(".booknav2 p").eq(2).text() || "";
    const statusWordsParts = statusWordsRaw.split("|").map((s) => s.trim());
    const totalWords = statusWordsParts[0] || "";

    const updateRaw = $(".booknav2 p").eq(3).text() || "";
    const lastUpdatedAt = updateRaw.replace("更新：", "").trim();

    const coverUrl = $(".bookimg2 img").attr("src") || "";

    const descriptionHtml = $(".navtxt p").first().html() || "";
    const description = descriptionHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    const totalChaptersRaw = $(".infolist li").eq(1).text() || "";
    const totalChapters =
      parseInt(totalChaptersRaw.replace("章节数", "").trim(), 10) || 0;

    return {
      sourceId: novelId,
      title,
      author,
      coverUrl,
      description,
      totalChapters,
      totalWords,
      lastUpdatedAt,
    };
  }

  async getChapterList(novelId: string): Promise<ChapterMetadata[]> {
    const cache = new FileCache();
    const cacheKey = `69shuba_chapters_${novelId}`;

    const cached = await cache.get<ChapterMetadata[]>(cacheKey);
    if (cached) {
      console.log(
        `[Shuba69Crawler] Restored chapter list from cache for ${novelId}`,
      );
      return cached;
    }

    const url = `${this.baseUrl}/book/${novelId}/`;
    const html = await this.fetchHtml(url, { delayMs: 1000 });
    const $ = this.parseHtml(html);

    const chapters: ChapterMetadata[] = [];

    const lists = $("#catalog ul");
    const allChaptersList = lists.length > 1 ? lists.eq(1) : lists.eq(0);

    const extracted: { title: string; href: string }[] = [];
    allChaptersList.find("li a").each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (href) {
        extracted.push({ title, href });
      }
    });

    // Reverse at 69shuba for 1 -> N
    extracted.reverse();

    extracted.forEach((ch, i) => {
      chapters.push({
        index: i + 1,
        title: ch.title,
        url: ch.href.startsWith("http") ? ch.href : `${this.baseUrl}${ch.href}`,
      });
    });

    await cache.set(cacheKey, chapters);

    return chapters;
  }

  async getChapterContent(chapterUrl: string): Promise<string> {
    const match = chapterUrl.match(/\/txt\/(\d+)\//);
    const referer = match ? `${this.baseUrl}/book/${match[1]}/` : this.baseUrl;

    const html = await this.fetchHtml(chapterUrl, {
      delayMs: 2000,
      headers: { Referer: referer },
    });

    const cleanContent = TextCleaner.extractAndClean(html, ".txtnav");

    if (!cleanContent || cleanContent.length < 30) {
      throw new Error(
        `Empty content returned at ${chapterUrl}. Extracted length: ${cleanContent.length}`,
      );
    }

    return cleanContent;
  }

  async *crawlAndStream(
    novelId: string,
    targetIndexes?: number[],
  ): AsyncGenerator<ChapterData, void, unknown> {
    let chapters = await this.getChapterList(novelId);

    if (targetIndexes && targetIndexes.length > 0) {
      chapters = chapters.filter((ch) => targetIndexes.includes(ch.index));
    }

    // Queue all tasks. PQueue will control concurrency limit automatically.
    const tasks = chapters.map((chapter) =>
      this.queue.add(async () => {
        try {
          const content = await this.getChapterContent(chapter.url);
          return { ...chapter, content };
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(
            `[Shuba69Crawler] Failed to fetch chapter ${chapter.index}: ${errMsg}`,
          );
          return { ...chapter, content: `[CRAWL_FAILED] ${errMsg}` }; // Fallback to avoid breaking stream
        }
      }),
    );

    // Yield as they resolve in order
    for (const task of tasks) {
      const result = await task;
      if (result) {
        yield result as ChapterData;
      }
    }
  }
}
