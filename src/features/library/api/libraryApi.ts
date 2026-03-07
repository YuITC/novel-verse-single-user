/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { LibraryEntry, CollectionData, BookmarkGroup } from "../types/library";

export interface LibraryFilters {
  readingStatus?: string;
  search?: string;
  publicationStatus?: string;
  chapterRange?: [number, number];
  includeTags?: string[];
  excludeTags?: string[];
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
      includeTags,
      excludeTags,
      sort = "recently-read",
    } = filters;

    const hasChapterFilter =
      chapterRange && (chapterRange[0] > 0 || chapterRange[1] < 5000);

    const hasNovelFilter =
      (search && search.trim()) ||
      (publicationStatus && publicationStatus !== "all") ||
      hasChapterFilter ||
      (includeTags && includeTags.length > 0);

    let query = supabase.from("library_entries").select(
      `
        id,
        reading_status,
        current_chapter_id,
        updated_at,
        novel:novels${hasNovelFilter ? "!inner" : ""} (
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

    // Chapter range filter (slider-based)
    if (hasChapterFilter && chapterRange) {
      if (chapterRange[0] > 0) {
        query = query.gte("novels.total_chapters", chapterRange[0]);
      }
      if (chapterRange[1] < 5000) {
        query = query.lte("novels.total_chapters", chapterRange[1]);
      }
    }

    // Genre tags filter — include (AND logic — novel must contain ALL selected tags)
    if (includeTags && includeTags.length > 0) {
      query = query.contains("novels.genres", includeTags);
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

    let results = (data as any[])
      .filter((item) => item.novel !== null);

    // Exclude tags filter (client-side — novel must NOT contain ANY excluded tag)
    if (excludeTags && excludeTags.length > 0) {
      results = results.filter((item) => {
        const genres: string[] = item.novel.genres || [];
        return !excludeTags.some((tag) => genres.includes(tag));
      });
    }

    return results.map((item) => ({
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
      if (!b.novel || !b.chapter) continue;
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

  updateReadingStatus: async (
    entryId: string,
    status: string,
  ): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase
      .from("library_entries")
      .update({ reading_status: status, updated_at: new Date().toISOString() })
      .eq("id", entryId);

    if (error) {
      console.error("Supabase updateReadingStatus error:", error);
      throw error;
    }
  },

  removeFromLibrary: async (entryId: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase
      .from("library_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      console.error("Supabase removeFromLibrary error:", error);
      throw error;
    }
  },

  createCollection: async (title: string): Promise<string> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("collections")
      .insert({ title })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase createCollection error:", error);
      throw error;
    }
    return data.id;
  },

  addNovelToCollection: async (
    collectionId: string,
    novelId: string,
  ): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from("collection_novels").insert({
      collection_id: collectionId,
      novel_id: novelId,
    });

    if (error) {
      console.error("Supabase addNovelToCollection error:", error);
      throw error;
    }
  },

  removeBookmark: async (bookmarkId: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      console.error("Supabase removeBookmark error:", error);
      throw error;
    }
  },
};
