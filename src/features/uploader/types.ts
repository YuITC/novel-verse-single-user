export interface NovelFormData {
  title: string;
  author: string;
  genres: string[];
  publication_status: "ongoing" | "completed" | "hiatus" | "draft";
  description: string;
  cover_url?: string;
  source_url?: string; // Optional, if user provides one, mostly null for original works
}

export interface ChapterFormData {
  title: string;
  content: string;
  chapter_index?: number;
}

export interface UploadCoverResponse {
  url: string;
}
