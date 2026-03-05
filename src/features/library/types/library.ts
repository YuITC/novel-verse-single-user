export type ReadingStatus = "reading" | "completed" | "on-hold" | "read-later";

export interface NovelData {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string;
  genres: string[];
  total_chapters: number;
  publication_status: string;
}

export interface LibraryEntry {
  id: string;
  novel: NovelData;
  reading_status: ReadingStatus;
  current_chapter_id: string | null;
  updated_at: string;
}

export interface CollectionData {
  id: string;
  title: string;
  novel_count: number;
  cover_previews: string[]; // up to 3
  created_at: string;
}

export interface BookmarkData {
  id: string;
  chapter: {
    id: string;
    chapter_index: number;
    title: string;
  };
  created_at: string;
}

export interface BookmarkGroup {
  novel: {
    id: string;
    title: string;
    cover_url: string | null;
  };
  bookmarks: BookmarkData[];
}
