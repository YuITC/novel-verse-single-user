"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

interface Chapter {
  id: string;
  chapter_index: number;
  title_raw: string;
  title_translated?: string;
  created_at: string;
}

interface ChapterListProps {
  novelId: string;
  initialChapters: Chapter[];
}

const PAGE_SIZE = 20;

export function ChapterList({ novelId, initialChapters }: ChapterListProps) {
  const supabase = createClient();
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialChapters.length === PAGE_SIZE);

  const handleSortChange = async (newSort: "desc" | "asc") => {
    if (sort === newSort) return;
    setSort(newSort);
    setLoading(true);

    const { data } = await supabase
      .from("chapters")
      .select("id, chapter_index, title_raw, title_translated, created_at")
      .eq("novel_id", novelId)
      .order("chapter_index", { ascending: newSort === "asc" })
      .limit(PAGE_SIZE);

    setChapters(data || []);
    setHasMore((data || []).length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const lastChapterIndex = chapters[chapters.length - 1].chapter_index;
    
    // Keyset pagination using chapter_index is much faster securely
    let query = supabase
      .from("chapters")
      .select("id, chapter_index, title_raw, title_translated, created_at")
      .eq("novel_id", novelId)
      .order("chapter_index", { ascending: sort === "asc" })
      .limit(PAGE_SIZE);

    if (sort === "desc") {
      query = query.lt("chapter_index", lastChapterIndex);
    } else {
      query = query.gt("chapter_index", lastChapterIndex);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      setChapters((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Chapters</h2>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => handleSortChange("desc")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md ${
              sort === "desc"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSortChange("asc")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md ${
              sort === "asc"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {chapters.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No chapters available yet
          </div>
        ) : (
          chapters.map((chapter) => {
            const timeAgo = formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true });
            
            // Just simple fade visual indicator for very old chapters for aesthetic
            // Let's assume if it is over 30 days old we slightly dim it
            const isOld = new Date().getTime() - new Date(chapter.created_at).getTime() > 30 * 24 * 60 * 60 * 1000;
            
            return (
              <Link
                key={chapter.id}
                href={`/reader/${novelId}/${chapter.id}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group ${isOld ? 'opacity-80' : ''}`}
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <span className="w-12 text-sm font-semibold text-slate-400">
                    {chapter.chapter_index}
                  </span>
                  <span className="font-medium text-slate-800 group-hover:text-primary transition-colors">
                    {chapter.title_translated || chapter.title_raw}
                  </span>
                </div>
                <span className="text-sm text-slate-500 sm:ml-4">{timeAgo}</span>
              </Link>
            );
          })
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-4 py-3 w-full border-2 border-dashed border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Chapters"}
          </button>
        )}
      </div>
    </div>
  );
}
