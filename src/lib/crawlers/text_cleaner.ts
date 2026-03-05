import * as cheerio from "cheerio";

export class TextCleaner {
  /**
   * Layer 1: DOM Cleaning
   */
  static cleanDOM($: cheerio.CheerioAPI, containerSelector: string) {
    const $container = $(containerSelector);

    // Remove scripts and styles
    $container.find("script, style").remove();

    // Custom logic to remove ads and watermarks based on typical class names or patterns
    $container.find('.ad, .ads, .advertisement, [id^="ad_"]').remove();
    $container.find(".watermark, .hide720, .xs-hidden").remove();

    // Remove hidden spans (anti-copy protection)
    $container
      .find('span[style*="display:none"], span[style*="display: none"]')
      .remove();

    // Transform HTML tags to preserves structure when extracting text
    $container.find("br").replaceWith("\n");
    $container.find("p").each((_, el) => {
      $(el).replaceWith("\n" + $(el).text() + "\n");
    });

    return $container.text();
  }

  /**
   * Layer 2 & 3: Pattern Cleaning & Text Normalization
   */
  static normalizeText(rawText: string): string {
    let cleanText = rawText;

    // Normalize UTF-8 characters via regex if needed, or by ensuring correct encoding from the fetcher

    // Meaningless pattern cleaning - Example patterns often found in Chinese domains
    const patternsToRemove = [
      /请记住本书首发域名：.*$/gim,
      /UU看书.*www\.uukanshu\.cc/gim,
      /69书吧.*www\.69shuba\.com/gim,
      /天才一秒记住.*$/gim,
    ];

    patternsToRemove.forEach((pattern) => {
      cleanText = cleanText.replace(pattern, "");
    });

    // Remove hidden characters (Zero-width spaces, etc.)
    cleanText = cleanText.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Normalize line breaks (CRLF to LF)
    cleanText = cleanText.replace(/\r\n/g, "\n");

    // Remove redundant spaces:
    // Split lines, trim spaces per line, filter empty lines, join with double newline
    cleanText = cleanText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    return cleanText;
  }

  /**
   * Wrapper for 3-step workflow: Extract -> Clean DOM -> Normalize Text
   */
  static extractAndClean(html: string, containerSelector: string): string {
    const $ = cheerio.load(html);
    const rawText = this.cleanDOM($, containerSelector);
    return this.normalizeText(rawText);
  }
}
