import { BaseCrawler } from "./base";
import type { NovelMetadata, ChapterMetadata, ChapterData } from "./69shuba";
import { TextCleaner } from "./text_cleaner";
import { FileCache } from "./cache";

export class UukanshuCrawler extends BaseCrawler {
  private baseUrl = "https://uukanshu.cc";

  async getNovelMetadata(novelId: string): Promise<NovelMetadata> {
    const url = `${this.baseUrl}/book/${novelId}/`;
    const html = await this.fetchHtml(url, { delayMs: 1500 });
    const $ = this.parseHtml(html);

    const title =
      $('meta[property="og:novel:book_name"]').attr("content") ||
      $('meta[property="og:title"]').attr("content") ||
      $(".booktitle a").text().trim() ||
      "";
    const author =
      $('meta[property="og:novel:author"]').attr("content") ||
      $(".booktitle .red").first().text().trim() ||
      "";
    const coverUrl = $('meta[property="og:image"]').attr("content") || "";

    let description =
      $('meta[property="og:description"]').attr("content") ||
      $(".bookdec").text().trim() ||
      "";
    description = description
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    const lastUpdatedAt =
      $(".booktime").text().replace("更新時間：", "").trim() ||
      $('meta[property="og:novel:update_time"]').attr("content") ||
      "";
    const totalWords = $(".booktitle span.blue").first().text().trim() || "";

    const totalChapters = $("a")
      .toArray()
      .filter((el) => {
        const href = $(el).attr("href") || "";
        return href.includes(`.html`) && href.includes(`/book/${novelId}/`);
      }).length;

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
    const cacheKey = `uukanshu_chapters_${novelId}`;

    const cached = await cache.get<ChapterMetadata[]>(cacheKey);
    if (cached) {
      console.log(
        `[UukanshuCrawler] Restored chapter list from cache for ${novelId}`,
      );
      return cached;
    }

    const url = `${this.baseUrl}/book/${novelId}/`;
    const html = await this.fetchHtml(url, { delayMs: 1000 });
    const $ = this.parseHtml(html);

    const chapters: ChapterMetadata[] = [];

    let index = 1;
    $("a").each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href") || "";
      // Only get links that are chapter links (typically end in .html and inside the book's directory)
      if (href.includes(`.html`) && href.includes(`/book/${novelId}/`)) {
        chapters.push({
          index: index++,
          title,
          url: href.startsWith("http") ? href : `${this.baseUrl}${href}`,
        });
      }
    });

    await cache.set(cacheKey, chapters);

    return chapters;
  }

  async getChapterContent(chapterUrl: string): Promise<string> {
    const html = await this.fetchHtml(chapterUrl, { delayMs: 2000 });

    const cleanContent = TextCleaner.extractAndClean(html, ".readcotent");

    if (!cleanContent || cleanContent.length < 30) {
      throw new Error(
        `Empty content returned at ${chapterUrl}. Extracted length: ${cleanContent.length}`,
      );
    }

    return cleanContent;
  }

  async *crawlAndStream(
    novelId: string,
  ): AsyncGenerator<ChapterData, void, unknown> {
    const chapters = await this.getChapterList(novelId);

    // Queue all tasks. PQueue will control concurrency limit automatically.
    const tasks = chapters.map((chapter) =>
      this.queue.add(async () => {
        try {
          const content = await this.getChapterContent(chapter.url);
          return { ...chapter, content };
        } catch (error: any) {
          console.error(
            `[UukanshuCrawler] Failed to fetch chapter ${chapter.index}: ${error.message}`,
          );
          return { ...chapter, content: `[CRAWL_FAILED] ${error.message}` }; // Fallback to avoid breaking stream
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
