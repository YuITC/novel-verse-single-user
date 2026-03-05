/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { LibraryEntry, CollectionData, BookmarkGroup } from "../types/library";

export interface LibraryFilters {
  readingStatus?: string;
  search?: string;
  publicationStatus?: string;
  chapterRange?: string;
  tags?: string[];
  sort?: string;
}

export const libraryApi = {
  getLibrary: async (filters: LibraryFilters = {}): Promise<LibraryEntry[]> => {
    const supabase = createClient();
    const {
      readingStatus,
      search,
      publicationStatus,
      chapterRange,
      tags,
      sort = "recently-read",
    } = filters;

    let query = supabase.from("library_entries").select(
      `
        id,
        reading_status,
        current_chapter_id,
        updated_at,
        novel:novels (
          id,
          title:title_raw,
          author:author_raw,
          cover_url,
          description:description_raw,
          genres,
          total_chapters,
          publication_status
        )
      `,
    );

    // Tab-level reading status filter
    if (readingStatus && readingStatus !== "all") {
      query = query.eq("reading_status", readingStatus);
    }

    // Search filter — matches title or author on the joined novel
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`title_raw.ilike.${term},author_raw.ilike.${term}`, {
        referencedTable: "novels",
      });
    }

    // Publication status filter
    if (publicationStatus && publicationStatus !== "all") {
      query = query.eq("novels.publication_status", publicationStatus);
    }

    // Chapter range filter
    if (chapterRange && chapterRange !== "any") {
      switch (chapterRange) {
        case "1-100":
          query = query
            .gte("novels.total_chapters", 1)
            .lte("novels.total_chapters", 100);
          break;
        case "101-500":
          query = query
            .gte("novels.total_chapters", 101)
            .lte("novels.total_chapters", 500);
          break;
        case "501-1000":
          query = query
            .gte("novels.total_chapters", 501)
            .lte("novels.total_chapters", 1000);
          break;
        case "1000+":
          query = query.gte("novels.total_chapters", 1000);
          break;
      }
    }

    // Genre tags filter (AND logic — novel must contain ALL selected tags)
    if (tags && tags.length > 0) {
      query = query.contains("novels.genres", tags);
    }

    // Sort order
    switch (sort) {
      case "recently-added":
        query = query.order("updated_at", { ascending: false });
        break;
      case "alphabetical":
        query = query.order("title_raw", {
          ascending: true,
          referencedTable: "novels",
        });
        break;
      case "chapters-high":
        query = query.order("total_chapters", {
          ascending: false,
          referencedTable: "novels",
        });
        break;
      case "recently-read":
      default:
        query = query.order("updated_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getLibrary error:", error);
      throw error;
    }

    return (data as any[])
      .filter((item) => item.novel !== null)
      .map((item) => ({
        id: item.id,
        reading_status: item.reading_status as any,
        current_chapter_id: item.current_chapter_id,
        updated_at: item.updated_at,
        novel: {
          id: item.novel.id,
          title: item.novel.title || "",
          author: item.novel.author || "",
          cover_url: item.novel.cover_url,
          description: item.novel.description || "",
          genres: item.novel.genres || [],
          total_chapters: item.novel.total_chapters || 0,
          publication_status: item.novel.publication_status || "ongoing",
        },
      }));
  },

  getDistinctGenres: async (): Promise<string[]> => {
    const supabase = createClient();

    // Fetch all genres arrays from novels that are in the user's library
    const { data, error } = await supabase
      .from("library_entries")
      .select("novel:novels ( genres )");

    if (error) {
      console.error("Supabase getDistinctGenres error:", error);
      throw error;
    }

    const genreSet = new Set<string>();
    for (const entry of data as any[]) {
      if (entry.novel?.genres) {
        for (const g of entry.novel.genres) {
          if (g) genreSet.add(g);
        }
      }
    }

    return Array.from(genreSet).sort();
  },

  getCollections: async (): Promise<CollectionData[]> => {
    const supabase = createClient();
    const { data: cols, error } = await supabase
      .from("collections")
      .select(
        `
        id,
        title,
        created_at,
        collection_novels (
          novel:novels ( cover_url )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getCollections error:", error);
      throw error;
    }

    return (cols as any[]).map((c) => {
      const allCovers = c.collection_novels
        .map((cn: any) => cn.novel?.cover_url)
        .filter(Boolean);

      return {
        id: c.id,
        title: c.title,
        created_at: c.created_at,
        novel_count: c.collection_novels.length,
        cover_previews: allCovers.slice(0, 3),
      };
    });
  },

  getBookmarks: async (): Promise<BookmarkGroup[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        id,
        created_at,
        novel:novels ( id, title_raw, cover_url ),
        chapter:chapters ( id, chapter_index, title_raw )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getBookmarks error:", error);
      throw error;
    }

    const map = new Map<string, BookmarkGroup>();
    for (const b of data as any[]) {
      const nid = b.novel.id;
      if (!map.has(nid)) {
        map.set(nid, {
          novel: {
            id: nid,
            title: b.novel.title_raw || "",
            cover_url: b.novel.cover_url,
          },
          bookmarks: [],
        });
      }
      map.get(nid)!.bookmarks.push({
        id: b.id,
        created_at: b.created_at,
        chapter: {
          id: b.chapter.id,
          chapter_index: b.chapter.chapter_index,
          title: b.chapter.title_raw || `Chapter ${b.chapter.chapter_index}`,
        },
      });
    }

    return Array.from(map.values());
  },
};
