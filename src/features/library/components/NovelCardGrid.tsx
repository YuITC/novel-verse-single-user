import React from "react";
import { NovelCard } from "./NovelCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";
import { ToolbarFilters } from "./LibraryToolbar";

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
      toolbarFilters?.chapterRange || "any",
      toolbarFilters?.sort || "recently-read",
      toolbarFilters?.tags?.join(",") || "",
    ],
    queryFn: () =>
      libraryApi.getLibrary({
        readingStatus: filterStatus,
        search: toolbarFilters?.search,
        publicationStatus: toolbarFilters?.publicationStatus,
        chapterRange: toolbarFilters?.chapterRange,
        tags: toolbarFilters?.tags,
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
          toolbarFilters?.tags?.length ||
          (toolbarFilters?.publicationStatus &&
            toolbarFilters.publicationStatus !== "all") ||
          (toolbarFilters?.chapterRange &&
            toolbarFilters.chapterRange !== "any")
            ? "No novels match your current filters. Try adjusting your search or filter criteria."
            : "Import novels via the Crawler or Uploader to get started."}
        </p>
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
