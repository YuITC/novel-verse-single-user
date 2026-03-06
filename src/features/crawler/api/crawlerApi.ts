import {
  CrawledChapter,
  CrawlLogEntry,
  CrawlPhase,
  NovelMetadataDisplay,
} from "../types";

export interface StartCrawlRequest {
  url: string;
}

export interface StartCrawlResponse {
  jobId: string;
  novelId: string;
  message: string;
}

export const crawlerApi = {
  startCrawl: async (url: string): Promise<StartCrawlResponse> => {
    const response = await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start crawl");
    }

    return response.json();
  },

  retryJob: async (
    jobId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/crawl/${jobId}/retry`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to retry job");
    }

    return response.json();
  },

  cancelJob: async (
    jobId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/crawl/${jobId}/cancel`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel job");
    }

    return response.json();
  },
};
