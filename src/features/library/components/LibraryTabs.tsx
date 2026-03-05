"use client";

import React, { useState, Suspense } from "react";
import { NovelCardGrid } from "./NovelCardGrid";
import { CollectionCardGrid } from "./CollectionCardGrid";
import { BookmarkList } from "./BookmarkList";
import { LibraryToolbar, ToolbarFilters } from "./LibraryToolbar";

type TabId =
  | "all"
  | "reading"
  | "completed"
  | "on-hold"
  | "collections"
  | "bookmarks";

interface TabDefinition {
  id: TabId;
  label: string;
  subtitle: string;
}

const TABS: TabDefinition[] = [
  {
    id: "all",
    label: "All",
    subtitle: "Continue reading your favorite web novels",
  },
  {
    id: "reading",
    label: "Reading",
    subtitle: "Continue reading your favorite web novels",
  },
  {
    id: "completed",
    label: "Completed",
    subtitle: "Continue reading your favorite web novels",
  },
  {
    id: "on-hold",
    label: "On Hold",
    subtitle: "Continue reading your favorite web novels",
  },
  {
    id: "collections",
    label: "My Collections",
    subtitle: "Continue reading your favorite web novels",
  },
  {
    id: "bookmarks",
    label: "My Bookmarks",
    subtitle: "Manage your saved reading positions",
  },
];

const NOVEL_TABS: TabId[] = ["all", "reading", "completed", "on-hold"];

const DEFAULT_FILTERS: ToolbarFilters = {
  search: "",
  publicationStatus: "all",
  chapterRange: "any",
  sort: "recently-read",
  tags: [],
};

export const LibraryTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [toolbarFilters, setToolbarFilters] =
    useState<ToolbarFilters>(DEFAULT_FILTERS);

  const currentTabDef = TABS.find((t) => t.id === activeTab) || TABS[0];
  const showToolbar = NOVEL_TABS.includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "all":
      case "reading":
      case "completed":
      case "on-hold":
        return (
          <NovelCardGrid
            filterStatus={activeTab === "all" ? undefined : activeTab}
            toolbarFilters={toolbarFilters}
          />
        );
      case "collections":
        return <CollectionCardGrid />;
      case "bookmarks":
        return <BookmarkList />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-8 md:mb-10 px-8 md:px-12 lg:px-20 max-w-[1200px] w-full mx-auto mt-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          My Library
        </h1>
        <p className="text-base font-normal text-slate-500 mb-6">
          {currentTabDef.subtitle}
        </p>

        {/* Tab Bar & Action Row */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-x-8 overflow-x-auto no-scrollbar -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm transition-colors whitespace-nowrap border-b-2 font-medium
                    ${
                      isActive
                        ? "border-slate-900 text-slate-900 font-semibold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button className="hidden sm:flex shrink-0 mb-3 ml-4 items-center justify-center gap-1 h-9 px-4 rounded-full border border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
            Create Collections
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 md:px-12 lg:px-20 max-w-[1200px] w-full mx-auto pb-20">
        {/* Toolbar — only shown on novel tabs */}
        {showToolbar && (
          <Suspense
            fallback={
              <div className="mb-8 h-[88px] rounded-xl bg-slate-50 animate-pulse" />
            }
          >
            <LibraryToolbar
              filters={toolbarFilters}
              onFiltersChange={setToolbarFilters}
            />
          </Suspense>
        )}

        <div className="w-full min-h-[300px]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40 text-slate-400">
                <span className="material-symbols-outlined animate-spin mr-2">
                  progress_activity
                </span>
                Loading...
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};
