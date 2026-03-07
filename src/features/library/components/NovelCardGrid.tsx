import React from "react";
import { NovelCard } from "./NovelCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";
import { ToolbarFilters } from "./LibraryToolbar";
import Link from "next/link";

interface NovelCardGridProps {
  filterStatus?: string;
  toolbarFilters?: ToolbarFilters;
}

export const NovelCardGrid: React.FC<NovelCardGridProps> = ({
  filterStatus,
  toolbarFilters,
}) => {
  const { data: entries } = useSuspenseQuery({
    queryKey: [
      "library",
      filterStatus || "all",
      toolbarFilters?.search || "",
      toolbarFilters?.publicationStatus || "all",
      toolbarFilters?.chapterRange?.join("-") || "0-5000",
      toolbarFilters?.sort || "recently-read",
      toolbarFilters?.includeTags?.join(",") || "",
      toolbarFilters?.excludeTags?.join(",") || "",
    ],
    queryFn: () =>
      libraryApi.getLibrary({
        readingStatus: filterStatus,
        search: toolbarFilters?.search,
        publicationStatus: toolbarFilters?.publicationStatus,
        chapterRange: toolbarFilters?.chapterRange,
        includeTags: toolbarFilters?.includeTags,
        excludeTags: toolbarFilters?.excludeTags,
        sort: toolbarFilters?.sort,
      }),
  });

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
          auto_stories
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No novels found
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          {toolbarFilters?.search ||
          toolbarFilters?.includeTags?.length ||
          toolbarFilters?.excludeTags?.length ||
          (toolbarFilters?.publicationStatus &&
            toolbarFilters.publicationStatus !== "all") ||
          (toolbarFilters?.chapterRange &&
            (toolbarFilters.chapterRange[0] > 0 || toolbarFilters.chapterRange[1] < 5000))
            ? "No novels match your current filters. Try adjusting your search or filter criteria."
            : "Import novels via the Crawler or Uploader to get started."}
        </p>
        {!toolbarFilters?.search && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/crawler"
              className="flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">
                travel_explore
              </span>
              Crawl Novels
            </Link>
            <Link
              href="/uploader"
              className="flex items-center gap-2 h-10 px-6 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                upload_file
              </span>
              Upload Manually
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
      {entries.map((entry) => (
        <NovelCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
