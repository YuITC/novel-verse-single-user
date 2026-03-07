"use client";

import { useCallback, useEffect, useState } from "react";
import { aiApi } from "../../api/aiApi";
import type {
  ConceptEntry,
  ConceptDetail,
  ConceptCategory,
  ConceptEvidence,
} from "../../types";
import { CONCEPT_CATEGORIES } from "../../types";

export function ConceptIndexPage() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [selectedNovelId, setSelectedNovelId] = useState<string>("");
  const [categories, setCategories] = useState<ConceptCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [entries, setEntries] = useState<ConceptEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entryDetail, setEntryDetail] = useState<ConceptDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Bootstrap: load first novel
  // ---------------------------------------------------------------------------
  useEffect(() => {
    aiApi.getNovels().then((novels) => {
      if (novels.length > 0) {
        setSelectedNovelId(novels[0].id);
      }
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch categories when novel changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedNovelId) return;
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const cats = await aiApi.getConceptCategories(selectedNovelId);
        setCategories(cats);
        // default to first category with entries, or first overall
        const firstWithEntries = cats.find((c) => c.count > 0);
        setSelectedCategory(firstWithEntries?.key || cats[0]?.key || "");
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [selectedNovelId]);

  // ---------------------------------------------------------------------------
  // Fetch entries when category or search changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedNovelId || !selectedCategory) return;
    async function loadEntries() {
      setLoadingEntries(true);
      setSelectedEntryId(null);
      setEntryDetail(null);
      try {
        const data = await aiApi.getConceptEntries(
          selectedNovelId,
          selectedCategory,
          searchQuery || undefined,
        );
        setEntries(data);
        if (data.length > 0) {
          setSelectedEntryId(data[0].id);
        }
      } catch {
        setEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    }
    loadEntries();
  }, [selectedNovelId, selectedCategory, searchQuery]);

  // ---------------------------------------------------------------------------
  // Fetch detail when selected entry changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedEntryId) {
      // Wrapped in async to avoid synchronous setState at the top of useEffect
      async function clearDetail() {
        setEntryDetail(null);
      }
      clearDetail();
      return;
    }
    const entryId = selectedEntryId;
    async function loadDetail() {
      setLoadingDetail(true);
      try {
        const d = await aiApi.getConceptDetail(entryId);
        setEntryDetail(d);
      } catch {
        setEntryDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedEntryId]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const activeCategoryConfig = CONCEPT_CATEGORIES.find(
    (c) => c.key === selectedCategory,
  );
  const activeCategoryObj = categories.find((c) => c.key === selectedCategory);

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedEntryId(id);
    setDetailOpen(true);
  }, []);

  const metadataPills = (meta: Record<string, string> | null) => {
    if (!meta) return null;
    return Object.entries(meta).map(([k, v]) => (
      <span
        key={k}
        className="px-2 py-1 bg-primary/5 text-primary rounded-md font-medium text-xs"
      >
        {v}
      </span>
    ));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 max-w-[1300px] mx-auto w-full border-x border-slate-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-xl">
            menu_book
          </span>
          <h2 className="font-semibold text-primary text-base">
            Concept Index
          </h2>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loadingCategories ? (
            <div className="space-y-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {categories.map((cat) => {
                const cfg = CONCEPT_CATEGORIES.find((c) => c.key === cat.key);
                const isActive = cat.key === selectedCategory;
                return (
                  <li key={cat.key}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setSidebarOpen(false);
                      }}
                      className={`
                        flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                        ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-slate-600 hover:bg-slate-100"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {cfg?.icon || "category"}
                        </span>
                        <span>{cat.name}</span>
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ===== Main / Master panel ===== */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar with mobile toggle */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600">
              menu
            </span>
          </button>
          <span className="font-semibold text-primary text-base">
            Concept Index
          </span>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 pt-4 md:pt-5">
          <p className="text-sm text-slate-500">
            Index <span className="mx-1">&gt;</span>{" "}
            {activeCategoryObj?.name || "..."}
          </p>
        </div>

        {/* Category header */}
        <div className="px-6 pt-3 pb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeCategoryObj?.name || "Select a Category"}
            </h1>
            {activeCategoryConfig && (
              <p className="text-slate-500 text-sm mt-1">
                Browse all entries in this category.
              </p>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Entry
          </button>
        </div>

        {/* Entries list (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loadingEntries ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse"
                >
                  <div className="h-5 w-48 bg-slate-200 rounded mb-3" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">
                search_off
              </span>
              <p className="text-sm">No entries found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isSelected = entry.id === selectedEntryId;
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry.id)}
                    className={`
                      relative w-full text-left rounded-xl p-5 shadow-sm transition-all
                      ${
                        isSelected
                          ? "bg-white border-2 border-primary/20"
                          : "bg-white border border-slate-200 hover:shadow-md hover:border-slate-300"
                      }
                    `}
                  >
                    {/* Left accent bar for selected */}
                    {isSelected && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                    )}

                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {entry.name}
                      </h3>
                      {entry.tier && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                          {entry.tier}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {entry.short_description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {entry.short_description}
                      </p>
                    )}

                    {/* Footer: metadata pills + chapter citation */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {metadataPills(entry.metadata)}
                      </div>
                      {entry.first_introduced_chapter != null && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                          <span className="material-symbols-outlined text-[14px]">
                            menu_book
                          </span>
                          Ch. {entry.first_introduced_chapter}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ===== Detail panel backdrop (mobile/tablet) ===== */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setDetailOpen(false)}
        />
      )}

      {/* ===== Detail panel ===== */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-40 w-[450px] max-w-full bg-slate-50/50 backdrop-blur-sm border-l border-slate-200 overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${detailOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {entryDetail ? (
          <div className="p-6">
            {/* Close button for mobile */}
            <button
              onClick={() => setDetailOpen(false)}
              className="mb-4 p-1 rounded-lg hover:bg-slate-200 transition-colors lg:hidden"
            >
              <span className="material-symbols-outlined text-slate-500">
                close
              </span>
            </button>

            {/* Title + edit */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <h2 className="text-2xl font-bold text-slate-900">
                {entryDetail.name}
              </h2>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-400 hover:text-primary text-xl">
                  edit
                </span>
              </button>
            </div>

            {/* Tier badge */}
            {entryDetail.tier && (
              <span className="inline-block mb-5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                {entryDetail.tier}
              </span>
            )}

            {/* Visual diagram placeholder */}
            <div className="w-full h-40 bg-white border border-slate-200 rounded-xl shadow-sm mb-6 flex items-center justify-center overflow-hidden relative">
              {/* Radial gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb,99,102,241),0.06)_0%,transparent_70%)]" />
              {/* Spinning concentric circles */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-spin [animation-duration:8s]" />
                <div className="absolute inset-3 border-2 border-primary/15 rounded-full animate-spin [animation-duration:5s] [animation-direction:reverse]" />
                <div className="absolute inset-6 border-2 border-primary/20 rounded-full animate-spin [animation-duration:3s]" />
                <div className="absolute inset-[38%] bg-primary/10 rounded-full" />
              </div>
            </div>

            {/* Detailed description */}
            <div className="mb-6">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Detailed Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
                {entryDetail.detailed_description ||
                  "No detailed description available."}
              </p>
            </div>

            {/* Metadata */}
            {entryDetail.metadata &&
              Object.keys(entryDetail.metadata).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    Properties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entryDetail.metadata).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-1 bg-primary/5 text-primary rounded-md font-medium text-xs"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Source evidence */}
            {entryDetail.evidence && entryDetail.evidence.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified
                  </span>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Source Evidence
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {entryDetail.evidence.map((ev: ConceptEvidence) => (
                    <div
                      key={ev.id}
                      className="relative bg-white border border-slate-200 rounded-lg p-3 shadow-sm pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/40 before:rounded-l-lg"
                    >
                      <p className="text-xs font-semibold text-primary mb-1">
                        {ev.chapter_title
                          ? `Ch. ${ev.chapter_number} - ${ev.chapter_title}`
                          : `Chapter ${ev.chapter_number}`}
                      </p>
                      <p className="text-[11px] text-slate-600 italic leading-relaxed">
                        &ldquo;{ev.verbatim_quote}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : loadingDetail ? (
          <div className="p-6 space-y-4">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
            <span className="material-symbols-outlined text-5xl mb-3">
              menu_book
            </span>
            <p className="text-sm text-center">
              Select an entry to view details.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
