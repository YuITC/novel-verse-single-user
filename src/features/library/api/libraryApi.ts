/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { LibraryEntry, CollectionData, BookmarkGroup } from "../types/library";

export const libraryApi = {
  getLibrary: async (status?: string): Promise<LibraryEntry[]> => {
    const supabase = createClient();

    let query = supabase
      .from("library_entries")
      .select(
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
      )
      .order("updated_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("reading_status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getLibrary error:", error);
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((item) => ({
      id: item.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cols as any[]).map((c) => {
      const allCovers = c.collection_novels
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const b of data as any[]) {
      // Supabase inner join objects could be arrays if one-to-many,
      // but here they are singular references to parent tables
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
