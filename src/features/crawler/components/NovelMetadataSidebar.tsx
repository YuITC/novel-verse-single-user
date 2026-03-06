import { NovelMetadataDisplay } from "../types";

export function NovelMetadataSidebar({
  metadata,
}: {
  metadata: NovelMetadataDisplay | null;
}) {
  if (!metadata) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center min-h-[400px] shadow-sm">
        <p className="text-slate-400 text-sm font-medium flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[48px] opacity-20">
            library_books
          </span>
          Novel metadata will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm sticky top-24">
      {metadata.coverUrl ? (
        <div className="w-full aspect-[2/3] relative bg-slate-100 border-b border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={metadata.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[2/3] relative bg-slate-100 border-b border-slate-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">
            image
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-5">
        <div>
          <h2 className="font-bold text-lg text-slate-900 leading-tight mb-1.5">
            {metadata.title}
          </h2>
          <p className="text-sm font-medium text-primary">{metadata.author}</p>
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Source</span>
            <span
              className="font-semibold text-slate-700 truncate max-w-[150px]"
              title={metadata.sourceUrl}
            >
              {new URL(metadata.sourceUrl).hostname}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Chapters</span>
            <span className="font-semibold text-slate-700">
              {metadata.totalChapters}
            </span>
          </div>
          {metadata.lastUpdatedAt && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Updated</span>
              <span className="font-semibold text-slate-700">
                {metadata.lastUpdatedAt}
              </span>
            </div>
          )}
        </div>

        {metadata.description && (
          <div className="mt-1">
            <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-medium">
              {metadata.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
