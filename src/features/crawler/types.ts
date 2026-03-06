// Crawler Domain Types

export type CrawlPhase =
  | "idle"
  | "validating"
  | "fetching_meta"
  | "crawling"
  | "completed"
  | "failed"
  | "cancelled";

export type LogLevel = "info" | "warn" | "error";

export interface CrawlLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
}

export interface NovelMetadataDisplay {
  title: string;
  author: string;
  coverUrl: string;
  sourceUrl: string;
  description: string;
  totalChapters: number;
  lastUpdatedAt?: string;
  status?: string;
}

export interface CrawledChapter {
  index: number;
  title: string;
  url: string;
  status: "pending" | "success" | "failed";
  error?: string;
  timestamp?: Date;
}
