"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  ChevronDown,
  ArrowDownWideNarrow,
  X,
  Plus,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolbarFilters {
  search: string;
  publicationStatus: string;
  chapterRange: [number, number];
  sort: string;
  includeTags: string[];
  excludeTags: string[];
}

interface LibraryToolbarProps {
  filters: ToolbarFilters;
  onFiltersChange: (filters: ToolbarFilters) => void;
}

const CHAPTER_MIN = 0;
const CHAPTER_MAX = 5000;

export const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const { data: allGenres = [] } = useSuspenseQuery({
    queryKey: ["library-genres"],
    queryFn: () => libraryApi.getDistinctGenres(),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const isIncluded = filters.includeTags.includes(tag);
    if (isIncluded) {
      updateFilter(
        "includeTags",
        filters.includeTags.filter((t) => t !== tag),
      );
    } else {
      updateFilter("includeTags", [...filters.includeTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter(
      "includeTags",
      filters.includeTags.filter((t) => t !== tag),
    );
  };

  const rangeLabel =
    filters.chapterRange[0] === CHAPTER_MIN &&
    filters.chapterRange[1] === CHAPTER_MAX
      ? "Any"
      : `${filters.chapterRange[0]} – ${filters.chapterRange[1] === CHAPTER_MAX ? "5000+" : filters.chapterRange[1]}`;

  const MAX_VISIBLE_CHIPS = 3;
  const displayedTags = filters.includeTags.slice(0, MAX_VISIBLE_CHIPS);
  const remainingCount = Math.max(
    0,
    filters.includeTags.length - MAX_VISIBLE_CHIPS,
  );

  return (
    <div className="mb-10 p-5 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-5">
      {/* Row 1: Search + Status + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[320px]">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-full focus:bg-white focus:border-primary/50 focus:ring-[6px] focus:ring-primary/5 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium text-[15px]"
            placeholder="Search title, author in library..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Publication Status */}
        <div className="flex items-center gap-3">
          <label className="text-[14px] font-extrabold text-slate-600 shrink-0 tracking-tight whitespace-nowrap">
            Status:
          </label>
          <div className="relative group min-w-[120px]">
            <select
              className="w-full h-11 appearance-none bg-white border border-slate-200 rounded-full px-5 text-[14px] font-bold text-slate-600 outline-none hover:border-slate-300 focus:border-primary/50 focus:ring-[6px] focus:ring-primary/5 transition-all cursor-pointer pr-10 shadow-sm"
              value={filters.publicationStatus}
              onChange={(e) =>
                updateFilter("publicationStatus", e.target.value)
              }
            >
              <option value="all">All</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">
              <ChevronDown size={18} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-[14px] font-extrabold text-slate-600 shrink-0 tracking-tight whitespace-nowrap">
            Sort by:
          </label>
          <div className="relative group min-w-[170px]">
            <select
              className="w-full h-11 appearance-none bg-white border border-slate-200 rounded-full px-5 text-[14px] font-bold text-slate-600 outline-none hover:border-slate-300 focus:border-primary/50 focus:ring-[6px] focus:ring-primary/5 transition-all cursor-pointer pr-10 shadow-sm"
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
            >
              <option value="recently-read">Recently Read</option>
              <option value="recently-added">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="chapters-high">Chapters (High-Low)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">
              <ArrowDownWideNarrow size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Chapters Range + Tags */}
      <div className="flex flex-wrap items-center gap-10">
        {/* Chapters Range Slider */}
        <div className="flex items-center gap-5 flex-1 min-w-[340px]">
          <span className="text-[14px] font-extrabold text-slate-600 shrink-0 tracking-tight">
            Chapters Range:{" "}
            <span className="text-primary/80 font-black ml-1 uppercase">
              {rangeLabel}
            </span>
          </span>
          <div className="flex-1">
            <Slider
              min={CHAPTER_MIN}
              max={CHAPTER_MAX}
              step={50}
              value={filters.chapterRange}
              onValueChange={(value) =>
                updateFilter("chapterRange", value as [number, number])
              }
              className="py-4"
            />
          </div>
        </div>

        {/* Tags Multi-select */}
        <div className="flex items-center gap-4 flex-[1.5] min-w-[420px]">
          <label className="text-[14px] font-extrabold text-slate-600 shrink-0 tracking-tight">
            Tags:
          </label>
          <div ref={tagDropdownRef} className="relative flex-1">
            <div
              className={cn(
                "min-h-11 p-1.5 flex items-center gap-2 bg-white border rounded-full transition-all cursor-pointer pr-12 shadow-sm relative overflow-hidden",
                isTagDropdownOpen
                  ? "border-primary/40 ring-[6px] ring-primary/5"
                  : "border-slate-200 hover:border-slate-300",
              )}
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            >
              <div className="flex flex-nowrap items-center gap-2 overflow-hidden px-1">
                {displayedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[12px] font-black flex items-center gap-2 hover:border-primary/40 hover:scale-[1.02] transition-all shrink-0 animate-in zoom-in-95 duration-200"
                  >
                    {tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                      className="hover:bg-primary/10 rounded-full p-0.5 transition-colors -mr-1"
                    >
                      <X size={12} strokeWidth={4} />
                    </button>
                  </span>
                ))}

                {remainingCount > 0 && (
                  <span className="bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1.5 rounded-full text-[11px] font-black shadow-sm shrink-0">
                    +{remainingCount} more
                  </span>
                )}

                {filters.includeTags.length === 0 ? (
                  <span className="text-[14px] text-slate-400 ml-2 font-bold tracking-tight opacity-70 whitespace-nowrap">
                    Select genres...
                  </span>
                ) : (
                  <span className="text-[12px] text-slate-300 font-bold tracking-tight opacity-50 whitespace-nowrap ml-1">
                    Select more...
                  </span>
                )}
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary pointer-events-none bg-white/80 pl-2">
                <ChevronDown
                  size={18}
                  strokeWidth={3}
                  className={cn(
                    "transition-transform duration-300",
                    isTagDropdownOpen && "rotate-180",
                  )}
                />
              </div>
            </div>

            {/* Tag Dropdown Menu */}
            {isTagDropdownOpen && (
              <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white rounded-[2rem] border border-slate-200 shadow-[0_15px_50px_rgb(0,0,0,0.12)] z-50 p-4 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="max-h-64 overflow-y-auto pr-1 overflow-x-hidden custom-scrollbar">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {allGenres.map((tag) => {
                      const isSelected = filters.includeTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-4 py-2.5 text-left rounded-xl text-[12px] font-black transition-all flex items-center justify-between group border border-transparent",
                            isSelected
                              ? "bg-primary text-white shadow-md shadow-primary/20 scale-[0.98]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/10",
                          )}
                        >
                          {tag}
                          {isSelected ? (
                            <X size={12} strokeWidth={4} />
                          ) : (
                            <Plus
                              size={12}
                              strokeWidth={4}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {allGenres.length === 0 && (
                    <div className="py-10 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Filter size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-bold tracking-tight">
                        No tags found in your library
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
