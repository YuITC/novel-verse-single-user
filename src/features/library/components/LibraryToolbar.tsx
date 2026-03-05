"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";

export interface ToolbarFilters {
  search: string;
  publicationStatus: string;
  chapterRange: string;
  sort: string;
  tags: string[];
}

interface LibraryToolbarProps {
  filters: ToolbarFilters;
  onFiltersChange: (filters: ToolbarFilters) => void;
}

const MAX_VISIBLE_TAGS = 4;

export const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const { data: allGenres = [] } = useSuspenseQuery({
    queryKey: ["library-genres"],
    queryFn: () => libraryApi.getDistinctGenres(),
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onFiltersChange],
  );

  const updateFilter = <K extends keyof ToolbarFilters>(
    key: K,
    value: ToolbarFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const current = filters.tags;
    if (current.includes(tag)) {
      updateFilter(
        "tags",
        current.filter((t) => t !== tag),
      );
    } else {
      updateFilter("tags", [...current, tag]);
    }
  };

  const visibleGenres = showAllTags
    ? allGenres
    : allGenres.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = allGenres.length > MAX_VISIBLE_TAGS;

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Row 1: Search + Status + Ch. Range + Sort */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <label className="flex flex-col min-w-40 h-10 max-w-sm flex-1">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              type="text"
              className="flex w-full min-w-0 flex-1 bg-transparent text-slate-900 focus:outline-none border-none h-full placeholder:text-slate-400 px-3 text-sm font-medium"
              placeholder="Search title, author in library..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </label>

        {/* Status Select */}
        <div className="relative min-w-[140px] h-10">
          <select
            className="w-full h-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            value={filters.publicationStatus}
            onChange={(e) => updateFilter("publicationStatus", e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </div>
        </div>

        {/* Chapter Range Select */}
        <div className="relative min-w-[150px] h-10">
          <select
            className="w-full h-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            value={filters.chapterRange}
            onChange={(e) => updateFilter("chapterRange", e.target.value)}
          >
            <option value="any">Ch. Range: Any</option>
            <option value="1-100">1 – 100</option>
            <option value="101-500">101 – 500</option>
            <option value="501-1000">501 – 1000</option>
            <option value="1000+">1000+</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </div>
        </div>

        {/* Sort Select — pushed to right */}
        <div className="relative min-w-[180px] h-10 ml-auto">
          <select
            className="w-full h-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="recently-read">Sort: Recently Read</option>
            <option value="recently-added">Recently Added</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="chapters-high">Chapters (High-Low)</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-xl">sort</span>
          </div>
        </div>
      </div>

      {/* Row 2: Tags */}
      {allGenres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500 mr-2">Tags:</span>
          {visibleGenres.map((genre) => {
            const isSelected = filters.tags.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleTag(genre)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {genre}
                <span className="material-symbols-outlined text-sm">
                  {isSelected ? "close" : "add"}
                </span>
              </button>
            );
          })}
          {hasMoreTags && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-primary text-xs font-semibold hover:underline"
            >
              {showAllTags
                ? "Show Less"
                : `+ ${allGenres.length - MAX_VISIBLE_TAGS} More Tags`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
