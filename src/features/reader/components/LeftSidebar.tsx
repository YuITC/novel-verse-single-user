"use client";

import { useState } from "react";
import Link from "next/link";

interface LeftSidebarProps {
  novel: any;
  currentChapterId: string;
  allChapters: any[];
  bookmarks: any[];
}

export function LeftSidebar({
  novel,
  currentChapterId,
  allChapters,
  bookmarks,
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "bookmarks">("chapters");
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const displayedChapters =
    activeTab === "chapters"
      ? allChapters
      : bookmarks.map((b) => b.chapters); // assuming b.chapters holds the joined data

  // sort chapters
  const sorted = [...displayedChapters].sort((a, b) => {
    if (sort === "desc") {
      return b.chapter_index - a.chapter_index;
    }
    return a.chapter_index - b.chapter_index;
  });

  return (
    <aside className="w-80 flex-none bg-white border-r border-slate-200/50 flex flex-col h-full z-10 hidden lg:flex">
      <div className="flex items-center border-b border-slate-100">
        <button
          onClick={() => setActiveTab("chapters")}
          className={`flex-1 py-4 text-sm ${
            activeTab === "chapters"
              ? "font-semibold text-primary border-b-2 border-primary"
              : "font-medium text-slate-500 hover:text-slate-900 transition-colors"
          }`}
        >
          Chapters
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 py-4 text-sm ${
            activeTab === "bookmarks"
              ? "font-semibold text-primary border-b-2 border-primary"
              : "font-medium text-slate-500 hover:text-slate-900 transition-colors"
          }`}
        >
          Bookmarks
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Sort by
        </span>
        <div className="flex items-center bg-slate-200/50 rounded-lg p-0.5">
          <button
            onClick={() => setSort("desc")}
            className={`px-3 py-1 text-xs rounded-md ${
              sort === "desc"
                ? "font-semibold bg-white shadow-sm text-slate-900"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort("asc")}
            className={`px-3 py-1 text-xs rounded-md ${
              sort === "asc"
                ? "font-semibold bg-white shadow-sm text-slate-900"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <div className="flex flex-col">
          {sorted.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No items found.
            </div>
          ) : (
            sorted.map((chap) => {
              // Be careful with ID if it's from bookmarks mapping
              const chapId = chap.id || chap.chapter_id;
              const isActive = chapId === currentChapterId;

              return (
                <Link
                  key={chapId}
                  href={`/reader/${novel.id}/${chapId}`}
                  className={`flex flex-col p-3 rounded-lg transition-colors group ${
                    isActive
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`text-xs mb-1 ${
                      isActive
                        ? "font-semibold text-primary"
                        : "font-medium text-slate-400"
                    }`}
                  >
                    Chapter {chap.chapter_index}
                  </span>
                  <span
                    className={`text-sm line-clamp-2 ${
                      isActive
                        ? "font-semibold text-slate-900"
                        : "font-medium text-slate-700 group-hover:text-primary"
                    }`}
                  >
                    {chap.title_translated || chap.title_raw}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
