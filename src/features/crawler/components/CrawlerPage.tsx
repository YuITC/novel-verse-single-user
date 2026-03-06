"use client";

import { useState, useRef, useEffect } from "react";
import { crawlerApi } from "../api/crawlerApi";
import {
  CrawlPhase,
  CrawlLogEntry,
  NovelMetadataDisplay,
  CrawledChapter,
} from "../types";
import { CrawlStatusPanel } from "./CrawlStatusPanel";
import { NovelMetadataSidebar } from "./NovelMetadataSidebar";
import { CrawledChaptersList } from "./CrawledChaptersList";

export function CrawlerPage() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<CrawlPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<NovelMetadataDisplay | null>(null);
  const [logs, setLogs] = useState<CrawlLogEntry[]>([]);
  const [chapters, setChapters] = useState<CrawledChapter[]>([]);
  const [progress, setProgress] = useState({ success: 0, failed: 0, total: 0 });
  const [jobId, setJobId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const validateUrl = (url: string) => {
    if (!url.trim()) return "URL cannot be empty";
    try {
      const u = new URL(url);
      if (
        !u.hostname.includes("69shuba") &&
        !u.hostname.includes("69shu") &&
        !u.hostname.includes("uukanshu.cc")
      ) {
        return "Unsupported source. Currently supported: 69shuba.com, uukanshu.cc";
      }
      return null;
    } catch {
      return "Invalid URL format";
    }
  };

  const handleStartCrawl = async () => {
    const valError = validateUrl(url);
    if (valError) {
      setError(valError);
      return;
    }

    setError(null);
    setPhase("validating");
    setLogs([]);
    setMetadata(null);
    setChapters([]);
    setProgress({ success: 0, failed: 0, total: 0 });

    try {
      const res = await crawlerApi.startCrawl(url);
      setJobId(res.jobId);
      connectStream(res.jobId);
    } catch (err: any) {
      setError(
        err.message || "Failed to start crawl. Check that the URL is valid.",
      );
      setPhase("failed");
    }
  };

  const handleCancelCrawl = async () => {
    if (!jobId) return;
    try {
      await crawlerApi.cancelJob(jobId);
      setPhase("cancelled");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch (err: any) {
      console.error("Failed to cancel job", err);
    }
  };

  const connectStream = (jobId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/crawl/${jobId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener("phase", (e) =>
      setPhase(JSON.parse((e as MessageEvent).data)),
    );
    es.addEventListener("log", (e) => {
      const log = JSON.parse((e as MessageEvent).data);
      setLogs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), timestamp: new Date(), ...log },
      ]);
    });
    es.addEventListener("metadata", (e) =>
      setMetadata(JSON.parse((e as MessageEvent).data)),
    );
    es.addEventListener("chapter", (e) => {
      const ch = JSON.parse((e as MessageEvent).data);
      setChapters((prev) => {
        const existingIdx = prev.findIndex((p) => p.index === ch.index);
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = ch;
          return copy;
        }
        return [...prev, ch];
      });
    });
    es.addEventListener("progress", (e) =>
      setProgress(JSON.parse((e as MessageEvent).data)),
    );
    es.addEventListener("error", (e) => {
      const err = JSON.parse((e as MessageEvent).data);
      setError(err.message);
      setPhase("failed");
      es.close();
    });

    es.onerror = () => {
      es.close();
    };
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const isRunning = ["validating", "fetching_meta", "crawling"].includes(phase);

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-8 py-8 mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header & Input Section */}
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">
              pest_control
            </span>
            Source Crawler
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-[15px]">
            Extract and format web novel content from supported sources.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                link
              </span>
              <input
                type="url"
                placeholder="Enter novel URL (e.g., https://www.69shuba.com/book/12345.htm)"
                className="w-full h-[52px] pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-sm"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                disabled={isRunning}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRunning) handleStartCrawl();
                }}
              />
            </div>

            {isRunning ? (
              <button
                onClick={handleCancelCrawl}
                className="h-[52px] px-8 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold transition-all shadow-sm border border-slate-200 flex items-center justify-center gap-2.5 group"
              >
                <span className="material-symbols-outlined text-[22px] group-hover:text-rose-500 transition-colors">
                  stop_circle
                </span>
                Cancel Job
              </button>
            ) : (
              <button
                onClick={handleStartCrawl}
                className="h-[52px] px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[22px]">
                  play_arrow
                </span>
                Start Crawl
              </button>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-4 text-rose-500 bg-rose-50/50 px-4 py-3 rounded-lg border border-rose-100 animate-in fade-in slide-in-from-top-1">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Metadata) */}
        <div className="lg:col-span-1">
          <NovelMetadataSidebar metadata={metadata} />
        </div>

        {/* Right Column (Status & Chapters) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <CrawlStatusPanel phase={phase} logs={logs} progress={progress} />
          {(chapters.length > 0 ||
            phase === "completed" ||
            phase === "crawling") && (
            <CrawledChaptersList chapters={chapters} />
          )}
        </div>
      </div>
    </div>
  );
}
