import React from "react";
import { NovelCard } from "./NovelCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";

interface NovelCardGridProps {
  filterStatus?: string;
}

export const NovelCardGrid: React.FC<NovelCardGridProps> = ({
  filterStatus,
}) => {
  const { data: entries } = useSuspenseQuery({
    queryKey: ["library", filterStatus || "all"],
    queryFn: () => libraryApi.getLibrary(filterStatus),
  });

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
          auto_stories
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No novels here yet
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Discover new stories in the Explore tab or import them via the Crawler
          to get started.
        </p>
        <button className="px-6 py-2 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors">
          Explore Novels
        </button>
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
