"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { aiApi } from "../../api/aiApi";
import type { TimelineEvent, StoryArc, EventCategory } from "../../types";
import { EVENT_CATEGORY_CONFIG } from "../../types";
import { NovelSelector } from "../shared/NovelSelector";
import type { NovelOption } from "../../types";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ACTIVE_CATEGORIES = new Set<EventCategory>([
  "major_plot_point",
  "character_growth",
  "world_history",
]);

const CHAPTER_PX = 80;

const ARC_BG_CLASSES = ["bg-amber-50/50", "bg-slate-50", "bg-emerald-50/50"];

// ============================================================================
// EventTimelinePage
// ============================================================================

export function EventTimelinePage() {
  // ---------- State ----------
  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [selectedNovel, setSelectedNovel] = useState<NovelOption | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [arcs, setArcs] = useState<StoryArc[]>([]);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(DEFAULT_ACTIVE_CATEGORIES),
  );
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewportStart, setViewportStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const isDraggingMinimap = useRef(false);

  // ---------- Derived ----------
  const totalChapters = selectedNovel?.total_chapters || 1;
  const timelineWidth = totalChapters * CHAPTER_PX;

  const filteredEvents = useMemo(() => {
    let filtered = events.filter((e) => activeCategories.has(e.category));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)),
      );
    }
    return filtered;
  }, [events, activeCategories, searchQuery]);

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewportRatio =
    containerWidth > 0 && timelineWidth > 0
      ? Math.min(1, containerWidth / timelineWidth)
      : 1;

  // ---------- Data fetching ----------
  useEffect(() => {
    if (!selectedNovelId) return;
    const load = async () => {
      setLoading(true);
      setSelectedEvent(null);
      setScrollPosition(0);
      setViewportStart(0);
      try {
        const [evts, storyArcs] = await Promise.all([
          aiApi.getTimelineEvents(selectedNovelId),
          aiApi.getStoryArcs(selectedNovelId),
        ]);
        setEvents(evts);
        setArcs(storyArcs);
      } catch {
        setEvents([]);
        setArcs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedNovelId]);

  // ---------- Scroll sync ----------
  const handleTimelineScroll = useCallback(() => {
    if (!timelineRef.current) return;
    const sl = timelineRef.current.scrollLeft;
    setScrollPosition(sl);
    setViewportStart(sl / timelineWidth);
  }, [timelineWidth]);

  // ---------- Minimap interaction ----------
  const handleMinimapPointer = useCallback(
    (clientX: number) => {
      if (!minimapRef.current || !timelineRef.current) return;
      const rect = minimapRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const vpHalf = viewportRatio / 2;
      const clamped = Math.max(vpHalf, Math.min(1 - vpHalf, ratio));
      const newScrollLeft = (clamped - vpHalf) * timelineWidth;
      timelineRef.current.scrollLeft = newScrollLeft;
    },
    [timelineWidth, viewportRatio],
  );

  const handleMinimapMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDraggingMinimap.current = true;
      handleMinimapPointer(e.clientX);

      const onMove = (ev: MouseEvent) => {
        if (isDraggingMinimap.current) handleMinimapPointer(ev.clientX);
      };
      const onUp = () => {
        isDraggingMinimap.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [handleMinimapPointer],
  );

  // ---------- Category toggle ----------
  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // ---------- Novel selector handler ----------
  const handleNovelChange = (novelId: string, novel: NovelOption) => {
    setSelectedNovelId(novelId);
    setSelectedNovel(novel);
  };

  // ---------- Helper: position from chapter ----------
  const chapterToPercent = (ch: number) =>
    totalChapters > 1 ? ((ch - 1) / (totalChapters - 1)) * 100 : 50;

  const chapterToPx = (ch: number) =>
    totalChapters > 1
      ? ((ch - 1) / (totalChapters - 1)) * timelineWidth
      : timelineWidth / 2;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="w-full max-w-[1300px] px-4 md:px-6 lg:px-8 py-8 mx-auto animate-in fade-in duration-500">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/ai"
            className="inline-flex items-center gap-1 text-primary font-medium text-sm mb-3 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to AI Features
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Story Event Timeline
          </h1>
        </div>
        <NovelSelector
          value={selectedNovelId}
          onChange={handleNovelChange}
          label=""
          className="w-full md:w-64"
        />
      </div>

      {/* ---- Mobile filter toggle ---- */}
      <button
        onClick={() => setFilterOpen((o) => !o)}
        className="md:hidden mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">tune</span>
        Filters
      </button>

      {/* ---- Body ---- */}
      <div className="flex gap-6">
        {/* ======== Left Filter Panel ======== */}
        <aside
          className={`w-64 shrink-0 ${
            filterOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-6 sticky top-8">
            {/* Search */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Search Events
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Event Categories */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
                Event Categories
              </label>
              <div className="space-y-2.5">
                {(Object.keys(EVENT_CATEGORY_CONFIG) as EventCategory[]).map(
                  (cat) => {
                    const cfg = EVENT_CATEGORY_CONFIG[cat];
                    const active = activeCategories.has(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleCategory(cat)}
                          className="sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            active
                              ? "border-transparent " + cfg.dotBg
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {active && (
                            <span className="material-symbols-outlined text-white text-[14px] leading-none">
                              check
                            </span>
                          )}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg}`}
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                          {cfg.label}
                        </span>
                      </label>
                    );
                  },
                )}
              </div>
            </div>

            {/* Story Arcs */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
                Story Arcs
              </label>
              {arcs.length === 0 ? (
                <p className="text-xs text-slate-400">No arcs available.</p>
              ) : (
                <ul className="space-y-1">
                  {arcs.map((arc) => {
                    const isActive =
                      containerWidth > 0 &&
                      scrollPosition >= chapterToPx(arc.start_chapter) - 100 &&
                      scrollPosition <= chapterToPx(arc.end_chapter) + 100;
                    return (
                      <li key={arc.id}>
                        <button
                          onClick={() => {
                            if (!timelineRef.current) return;
                            timelineRef.current.scrollLeft =
                              chapterToPx(arc.start_chapter) - 40;
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="block truncate">{arc.title}</span>
                          <span className="text-xs text-slate-400">
                            Ch. {arc.start_chapter} - {arc.end_chapter}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* ======== Main Content ======== */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* ---- Timeline Area ---- */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !selectedNovelId ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                <span className="material-symbols-outlined text-4xl">
                  timeline
                </span>
                <p className="text-sm">
                  Select a novel to view the event timeline.
                </p>
              </div>
            ) : filteredEvents.length === 0 && events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                <span className="material-symbols-outlined text-4xl">
                  event_busy
                </span>
                <p className="text-sm">
                  No timeline events found for this novel.
                </p>
              </div>
            ) : (
              <div
                ref={timelineRef}
                onScroll={handleTimelineScroll}
                className="overflow-x-auto overflow-y-hidden relative"
                style={{ height: 340 }}
              >
                <div
                  className="relative"
                  style={{ width: timelineWidth, height: "100%" }}
                >
                  {/* ---- Story Arc Regions ---- */}
                  {arcs.map((arc, i) => {
                    const left = chapterToPx(arc.start_chapter);
                    const right = chapterToPx(arc.end_chapter);
                    const width = right - left;
                    const bgClass =
                      i === 0
                        ? ARC_BG_CLASSES[0]
                        : ARC_BG_CLASSES[
                            (i % (ARC_BG_CLASSES.length - 1)) + 1
                          ] || ARC_BG_CLASSES[1];
                    return (
                      <div
                        key={arc.id}
                        className={`absolute top-0 bottom-0 ${bgClass}`}
                        style={{ left, width }}
                      >
                        <span className="block px-3 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                          {arc.title}
                        </span>
                      </div>
                    );
                  })}

                  {/* ---- Central Spine ---- */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-slate-200"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />

                  {/* ---- Event Nodes ---- */}
                  {filteredEvents.map((evt, idx) => {
                    const x = chapterToPx(evt.chapter_start);
                    const isMajor = evt.importance === "major";
                    const cfg = EVENT_CATEGORY_CONFIG[evt.category];
                    const above = idx % 2 === 0;

                    return (
                      <div
                        key={evt.id}
                        className="absolute"
                        style={{
                          left: x,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {/* Label */}
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 w-28 text-center ${
                            above ? "bottom-full mb-2" : "top-full mt-2"
                          }`}
                        >
                          <span className="text-[11px] leading-tight text-slate-600 font-medium line-clamp-2">
                            {evt.title}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Ch. {evt.chapter_start}
                            {evt.chapter_end !== evt.chapter_start &&
                              ` - ${evt.chapter_end}`}
                          </span>
                        </div>

                        {/* Dot */}
                        <button
                          onClick={() =>
                            setSelectedEvent(
                              selectedEvent?.id === evt.id ? null : evt,
                            )
                          }
                          className={`relative rounded-full transition-transform hover:scale-125 cursor-pointer ${
                            isMajor
                              ? "w-5 h-5 shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                              : "w-4 h-4"
                          } ${cfg.dotBg}`}
                          title={evt.title}
                        />

                        {/* ---- Popover ---- */}
                        {selectedEvent?.id === evt.id && (
                          <div
                            className={`absolute z-50 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 left-1/2 -translate-x-1/2 ${
                              above ? "top-full mt-4" : "bottom-full mb-4"
                            }`}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                              >
                                {cfg.label}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  close
                                </span>
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-400 font-medium">
                              Ch. {evt.chapter_start}
                              {evt.chapter_end !== evt.chapter_start &&
                                ` - ${evt.chapter_end}`}
                            </span>

                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {evt.title}
                            </h4>

                            {evt.description && (
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                {evt.description}
                              </p>
                            )}

                            {evt.ai_note && (
                              <div className="mt-3 bg-slate-50 rounded-lg p-2 flex gap-2">
                                <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0 mt-0.5">
                                  auto_awesome
                                </span>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {evt.ai_note}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ---- Minimap ---- */}
          {selectedNovelId && !loading && events.length > 0 && (
            <div
              ref={minimapRef}
              onMouseDown={handleMinimapMouseDown}
              className="h-16 bg-white rounded-xl border border-slate-200 shadow-sm p-2 relative cursor-crosshair select-none"
            >
              {/* Arc color bands */}
              <div className="absolute inset-2 flex overflow-hidden rounded-lg">
                {arcs.map((arc, i) => {
                  const fraction =
                    ((arc.end_chapter - arc.start_chapter + 1) /
                      totalChapters) *
                    100;
                  const bgClass =
                    i === 0
                      ? ARC_BG_CLASSES[0]
                      : ARC_BG_CLASSES[(i % (ARC_BG_CLASSES.length - 1)) + 1] ||
                        ARC_BG_CLASSES[1];
                  return (
                    <div
                      key={arc.id}
                      className={bgClass}
                      style={{ width: `${fraction}%` }}
                    />
                  );
                })}
                {arcs.length === 0 && <div className="flex-1 bg-slate-50" />}
              </div>

              {/* Event dots */}
              {filteredEvents.map((evt) => {
                const pct = chapterToPercent(evt.chapter_start);
                const isMajor = evt.importance === "major";
                const cfg = EVENT_CATEGORY_CONFIG[evt.category];
                return (
                  <div
                    key={evt.id}
                    className={`absolute rounded-full ${cfg.dotBg} ${
                      isMajor ? "w-2 h-2" : "w-1.5 h-1.5"
                    }`}
                    style={{
                      left: `calc(${pct}% + 8px - ${isMajor ? 4 : 3}px)`,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                );
              })}

              {/* Viewport indicator */}
              <div
                className="absolute top-1 bottom-1 border-2 border-primary rounded bg-primary/10 cursor-ew-resize"
                style={{
                  left: `calc(${viewportStart * 100}% + 8px)`,
                  width: `calc(${viewportRatio * 100}% - 16px)`,
                  minWidth: 24,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
