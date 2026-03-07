// npm i cheerio got-scraping tough-cookie iconv-lite playwright
// npm i -D @types/tough-cookie
// TODO: Investigate if we can apply multi-threading to speed up the crawling process

import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { chromium, Browser, BrowserContext } from "playwright";
import PQueue from "p-queue";

export interface CrawlerFetchOptions {
  useProxy?: boolean;
  delayMs?: number;
  headers?: Record<string, string>;
  forcePlaywright?: boolean;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.184 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.224 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.105 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; Samsung SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.165 Mobile Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

export class BaseCrawler {
  protected cookieJar: CookieJar;
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected maxRetries = 3;
  protected queue: PQueue;
  protected isAborted = false;

  constructor(concurrency = 5) {
    this.cookieJar = new CookieJar();
    this.queue = new PQueue({ concurrency });
  }

  public abort() {
    this.isAborted = true;
    this.queue.clear();
    this.closeBrowser().catch(console.error);
  }

  protected getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  protected async adaptiveDelay(minMs: number, maxMs: number) {
    if (this.isAborted) return;

    // 5% chance to take a "long pause" (10-15s) to simulate reading/break
    if (Math.random() < 0.05) {
      const longPause = Math.floor(Math.random() * 5000) + 10000;
      await this.delay(longPause);
    } else {
      const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
      await this.delay(delay);
    }
  }

  protected async delay(ms: number) {
    if (this.isAborted) return;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async closeBrowser() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async initBrowserContext() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-features=IsolateOrigins,site-per-process",
        ],
      });
    }
    if (!this.context) {
      this.context = await this.browser.newContext({
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
      });
    }
    return this.context;
  }

  /**
   * Main fetch method. Implements Anti-bot BYPASS STRATEGY
   * Level 1: got-scraping with retry and random agent
   * Level 2: Playwright fallback
   * Level 3: Graceful failure
   */
  protected async fetchHtml(
    url: string,
    options?: CrawlerFetchOptions,
  ): Promise<string> {
    let attempt = 0;
    let forcePlaywright = options?.forcePlaywright || false;

    while (attempt < this.maxRetries) {
      if (this.isAborted) throw new Error("Aborted");
      try {
        if (options?.delayMs) {
          // Use adaptive delay logic: +/- 30% of the given delayMs
          const minMs = Math.floor(options.delayMs * 0.7);
          const maxMs = Math.floor(options.delayMs * 1.3);
          await this.adaptiveDelay(minMs, maxMs);
        }

        let html = "";
        if (forcePlaywright) {
          html = await this.fetchWithPlaywright(url, options);
        } else {
          html = await this.fetchWithGot(url, options);
          // Check for Cloudflare or JS challenge
          if (this.isCloudflareBlocked(html)) {
            console.log(
              `[BaseCrawler] Cloudflare challenge detected for ${url}. Switching to Playwright.`,
            );
            forcePlaywright = true;
            throw new Error("Cloudflare JS challenge detected");
          }
        }
        return html;
      } catch (error: any) {
        attempt++;

        // If got-scraping fails with 403/503 it might be cloudflare, so fallback to Playwright next
        if (error.message.includes("403") || error.message.includes("503")) {
          forcePlaywright = true;
        }

        if (attempt >= this.maxRetries) {
          console.error(
            `[BaseCrawler] Failed gracefully after ${this.maxRetries} attempts for URL: ${url}`,
          );
          throw new Error(`Crawl failed for ${url}: ${error.message}`);
        }
        const backoffDelay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(
          `[BaseCrawler] Attempt ${attempt} failed: ${error.message}. Retrying in ~${Math.round(backoffDelay)}ms...`,
        );
        await this.delay(backoffDelay);
      }
    }
    throw new Error("Unreachable");
  }

  protected isCloudflareBlocked(html: string): boolean {
    const $ = cheerio.load(html);
    const title = $("title").text().toLowerCase();

    // Cloudflare challenge markers
    if (
      title.includes("just a moment") ||
      title.includes("attention required") ||
      title.includes("cloudflare")
    ) {
      return true;
    }
    if (
      html.includes("cf-browser-verification") ||
      html.includes("cf-challenge-form") ||
      html.includes("cf_chl_opt")
    ) {
      return true;
    }
    return false;
  }

  private async fetchWithGot(
    url: string,
    options?: CrawlerFetchOptions,
  ): Promise<string> {
    const { gotScraping } = await import("got-scraping");
    const iconv = await import("iconv-lite");

    const response = await gotScraping({
      url,
      cookieJar: this.cookieJar,
      headers: {
        "User-Agent": this.getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...options?.headers,
      },
      headerGeneratorOptions: {
        devices: ["desktop", "mobile"],
        locales: ["en-US"],
      },
      http2: true, // Enables HTTP/2 multiplexing for connection reuse
      responseType: "buffer",
      retry: { limit: 0 }, // Disable internal retry so our class can control exponential backoff
    });

    const contentType =
      (response.headers["content-type"] as string)?.toLowerCase() || "";

    // Explicit encoding based on domain and headers
    if (
      contentType.includes("gbk") ||
      (url.includes("69shuba") && !url.includes("uukanshu"))
    ) {
      return iconv.default.decode(response.body as Buffer, "gbk");
    }

    if (url.includes("uukanshu.cc")) {
      return (response.body as Buffer).toString("utf-8");
    }

    if (url.includes("uukanshu")) {
      // Legacy uukanshu mirrors often use GBK
      return iconv.default.decode(response.body as Buffer, "gbk");
    }

    return (response.body as Buffer).toString("utf-8");
  }

  private async fetchWithPlaywright(
    url: string,
    options?: CrawlerFetchOptions,
  ): Promise<string> {
    const ctx = await this.initBrowserContext();
    const page = await ctx.newPage();

    if (options?.headers) {
      await page.setExtraHTTPHeaders(options.headers);
    }

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Basic wait to give CF a chance to load
      await page.waitForTimeout(3000);

      // Wait until there's no title "Just a moment..."
      let title = await page.title();
      let waitTime = 0;
      while (
        title.toLowerCase().includes("just a moment") &&
        waitTime < 15000
      ) {
        await this.delay(1000);
        waitTime += 1000;
        title = await page.title();
      }

      // Simulate human scrolling
      await page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight / 2),
      );
      await this.delay(500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const html = await page.content();
      return html;
    } finally {
      await page.close();
    }
  }

  protected parseHtml(html: string) {
    return cheerio.load(html);
  }
}
