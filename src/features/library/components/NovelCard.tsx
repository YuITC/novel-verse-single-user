import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LibraryEntry } from "../types/library";

interface NovelCardProps {
  entry: LibraryEntry;
}

function timeSince(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export const NovelCard: React.FC<NovelCardProps> = ({ entry }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { novel, reading_status, updated_at } = entry;
  const isCompleted = reading_status === "completed";

  const getActionButton = () => {
    switch (reading_status) {
      case "reading":
        return (
          <span className="text-primary font-semibold flex items-center gap-1 group-hover:opacity-70 transition-opacity">
            Continue{" "}
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </span>
        );
      case "on-hold":
      case "read-later":
        return (
          <span className="text-primary font-semibold flex items-center gap-1 group-hover:opacity-70 transition-opacity">
            Read{" "}
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </span>
        );
      case "completed":
        return (
          <span className="text-slate-500 font-semibold flex items-center gap-1 hover:text-slate-800 transition-colors">
            Read Again{" "}
            <span className="material-symbols-outlined text-lg">refresh</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => router.push(`/novel/${novel.id}`)}
      className={`relative flex flex-col sm:flex-row p-5 rounded-2xl border border-slate-100 transition-all duration-300 group cursor-pointer
      ${isCompleted ? "bg-white/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.05)] hover:bg-white" : "bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)]"}`}
    >
      {/* Cover */}
      <div
        className={`shrink-0 w-full sm:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center mb-4 sm:mb-0 sm:mr-5
        ${isCompleted ? "grayscale-[0.5] opacity-80" : ""}`}
      >
        {novel.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.cover_url}
            alt={novel.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-4xl text-slate-300">
            import_contacts
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3
            className={`text-xl font-bold leading-snug truncate pr-4 transition-colors duration-150 group-hover:text-primary ${isCompleted ? "text-slate-700 group-hover:text-slate-900" : "text-slate-900"}`}
          >
            {novel.title}
          </h3>
          <div className="relative">
            <button
              className="text-slate-300 hover:text-slate-600 transition-colors focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <span className="material-symbols-outlined text-xl">
                more_vert
              </span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-1 flex flex-col">
                <button className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg">
                  Change Status
                </button>
                <button className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg">
                  Add to Collection
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button className="text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-red-50 rounded-lg">
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">
              person
            </span>
            {novel.author}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">
              menu_book
            </span>
            {novel.total_chapters} Ch.
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">
              schedule
            </span>
            {timeSince(updated_at)}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-emerald-600 ml-auto sm:ml-0">
              <span className="material-symbols-outlined text-[15px]">
                done_all
              </span>
              Completed
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm font-normal text-slate-500 leading-relaxed line-clamp-2">
          {novel.description}
        </p>

        {/* Bottom Row */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-wrap gap-2 overflow-hidden">
            {novel.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold tracking-wide text-slate-500 uppercase whitespace-nowrap"
              >
                {genre}
              </span>
            ))}
          </div>
          <button
            className="shrink-0 ml-4 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              // For now, also jump to novel details on button click
              // (can be changed to go to reader directly depending on current_chapter_id)
              router.push(`/novel/${novel.id}`);
            }}
          >
            {getActionButton()}
          </button>
        </div>
      </div>
    </div>
  );
};
