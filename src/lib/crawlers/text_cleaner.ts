import * as cheerio from "cheerio";

export class TextCleaner {
  static extractAndClean(html: string, selector: string): string {
    const $ = cheerio.load(html);
    const contentHtml = $(selector).html() || "";

    // Basic cleaning logic
    return contentHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join("\n\n");
  }
}
