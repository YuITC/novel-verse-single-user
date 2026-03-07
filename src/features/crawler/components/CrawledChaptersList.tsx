import { formatDistanceToNow } from "date-fns";
import { CrawledChapter } from "../types";

export function CrawledChaptersList({
  chapters,
}: {
  chapters: CrawledChapter[];
}) {
  if (chapters.length === 0) {
    return null;
  }

  // Reverse chronological order for UI
  const reversed = [...chapters].reverse();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            menu_book
          </span>
          Crawled Chapters
        </h3>
        <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md">
          {chapters.length} items
        </span>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        <div className="flex flex-col gap-1">
          {reversed.map((ch) => (
            <div
              key={ch.index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent transition-colors group"
            >
              <div className="w-12 text-right shrink-0">
                <span className="text-xs font-mono text-slate-400 group-hover:text-slate-500 transition-colors">
                  #{ch.index.toString().padStart(3, "0")}
                </span>
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <p
                  className="text-sm font-medium text-slate-700 truncate"
                  title={ch.title}
                >
                  {ch.title}
                </p>
                {ch.timestamp && (
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {formatDistanceToNow(ch.timestamp, { addSuffix: true })}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center">
                {ch.status === "success" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] uppercase tracking-wide font-bold border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Success
                  </span>
                )}
                {ch.status === "failed" && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[11px] uppercase tracking-wide font-bold border border-rose-200/50"
                    title={ch.error}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Failed
                  </span>
                )}
                {ch.status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wide font-bold border border-slate-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
