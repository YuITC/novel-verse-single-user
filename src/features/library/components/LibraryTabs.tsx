"use client";

import React, { useState, Suspense } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NovelCardGrid } from "./NovelCardGrid";
import { CollectionCardGrid } from "./CollectionCardGrid";
import { BookmarkList } from "./BookmarkList";
import { LibraryToolbar, ToolbarFilters } from "./LibraryToolbar";
import { libraryApi } from "../api/libraryApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TabId =
  | "all"
  | "reading"
  | "completed"
  | "dropped"
  | "read-later"
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
    subtitle: "Explore and manage your entire novel library",
  },
  {
    id: "reading",
    label: "Reading",
    subtitle: "Quickly pick up where you left off",
  },
  {
    id: "completed",
    label: "Completed",
    subtitle: "Novels you've finished reading",
  },
  {
    id: "dropped",
    label: "Dropped",
    subtitle: "Novels you've stopped reading",
  },
  {
    id: "read-later",
    label: "Read Later",
    subtitle: "Novels you've saved for later",
  },
  {
    id: "collections",
    label: "My Collections",
    subtitle: "Organize your library into custom groups",
  },
  {
    id: "bookmarks",
    label: "My Bookmarks",
    subtitle: "Manage your saved reading positions",
  },
];

const NOVEL_TABS: TabId[] = [
  "all",
  "reading",
  "completed",
  "dropped",
  "read-later",
];

const DEFAULT_FILTERS: ToolbarFilters = {
  search: "",
  publicationStatus: "all",
  chapterRange: [0, 5000],
  sort: "recently-read",
  includeTags: [],
  excludeTags: [],
};

export const LibraryTabs: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [toolbarFilters, setToolbarFilters] =
    useState<ToolbarFilters>(DEFAULT_FILTERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");

  const createCollectionMutation = useMutation({
    mutationFn: (title: string) => libraryApi.createCollection(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setActiveTab("collections");
      setIsCreateModalOpen(false);
      setNewCollectionTitle("");
    },
  });

  const handleCreateCollection = () => {
    setNewCollectionTitle("");
    setIsCreateModalOpen(true);
  };

  const handleSubmitCollection = () => {
    if (newCollectionTitle.trim()) {
      createCollectionMutation.mutate(newCollectionTitle.trim());
    }
  };

  const currentTabDef = TABS.find((t) => t.id === activeTab) || TABS[0];
  const showToolbar = NOVEL_TABS.includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "all":
      case "reading":
      case "completed":
      case "dropped":
      case "read-later":
        return (
          <NovelCardGrid
            filterStatus={activeTab === "all" ? undefined : activeTab}
            toolbarFilters={toolbarFilters}
          />
        );
      case "collections":
        return (
          <CollectionCardGrid onCreateCollection={handleCreateCollection} />
        );
      case "bookmarks":
        return <BookmarkList />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-8 md:mb-10 px-4 md:px-6 lg:px-8 max-w-[1300px] w-full mx-auto mt-8">
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

          <button
            onClick={handleCreateCollection}
            disabled={createCollectionMutation.isPending}
            className="hidden sm:flex shrink-0 mb-3 ml-4 items-center justify-center gap-1 h-9 px-4 rounded-full border border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              {createCollectionMutation.isPending ? "progress_activity" : "add"}
            </span>
            {createCollectionMutation.isPending
              ? "Creating..."
              : "Create Collection"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 max-w-[1300px] w-full mx-auto pb-20">
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

      {/* Create Collection Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Give your new collection a name to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
              placeholder="Collection name"
              value={newCollectionTitle}
              onChange={(e) => setNewCollectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitCollection();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCollection}
              disabled={
                !newCollectionTitle.trim() || createCollectionMutation.isPending
              }
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createCollectionMutation.isPending ? "Creating..." : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
