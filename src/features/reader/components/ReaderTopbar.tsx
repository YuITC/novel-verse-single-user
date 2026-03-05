"use client";

import Link from "next/link";

interface ReaderTopbarProps {
  novel: {
    id: string;
    title_raw: string;
    title_translated?: string;
  };
  chapter: {
    id: string;
    chapter_index: number;
    title_raw: string;
    title_translated?: string;
  };
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

export function ReaderTopbar({
  novel,
  chapter,
  isBookmarked,
  onBookmarkToggle,
}: ReaderTopbarProps) {
  return (
    <header className="flex-none flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-white/10 z-10 shadow-sm text-slate-800">
      <div className="flex items-center gap-4">
        <Link
          href={`/novel/${novel.id}`}
          className="flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex flex-col max-w-full">
          <span className="text-xs font-semibold opacity-60 uppercase tracking-wider truncate">
            {novel.title_translated || novel.title_raw}
          </span>
          <span className="text-sm font-medium truncate">
            Chapter {chapter.chapter_index}:{" "}
            {chapter.title_translated || chapter.title_raw}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2.5 rounded-full hover:bg-black/5 transition-colors"
          title="Edit"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button
          className="p-2.5 rounded-full hover:bg-black/5 transition-colors"
          title="Translate"
        >
          <span className="material-symbols-outlined">translate</span>
        </button>
        <button
          onClick={onBookmarkToggle}
          className="p-2.5 rounded-full hover:bg-black/5 transition-colors"
          title="Bookmark"
        >
          <span className="material-symbols-outlined">
            {isBookmarked ? "bookmark" : "bookmark_border"}
          </span>
        </button>
        <button
          className="p-2.5 rounded-full hover:bg-black/5 transition-colors"
          title="Text-to-Speech"
        >
          <span className="material-symbols-outlined">volume_up</span>
        </button>
      </div>
    </header>
  );
}
