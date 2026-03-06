import { useEffect, useRef } from "react";
import { CrawlPhase, CrawlLogEntry } from "../types";

interface Props {
  phase: CrawlPhase;
  logs: CrawlLogEntry[];
  progress: { success: number; failed: number; total: number };
}

export function CrawlStatusPanel({ phase, logs, progress }: Props) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const getPhaseText = () => {
    switch (phase) {
      case "idle":
        return "Ready to start";
      case "validating":
        return "Validating source URL...";
      case "fetching_meta":
        return "Fetching novel metadata...";
      case "crawling":
        return "Running background crawler...";
      case "completed":
        return "Crawl completed successfully!";
      case "failed":
        return "Crawl job failed.";
      case "cancelled":
        return "Crawl job cancelled.";
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case "idle":
        return "radio_button_unchecked";
      case "completed":
        return "check_circle";
      case "failed":
        return "error";
      case "cancelled":
        return "cancel";
      default:
        return "autorenew";
    }
  };

  const isSpinning = ["validating", "fetching_meta", "crawling"].includes(
    phase,
  );

  const formatLogTime = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[1].substring(0, 8); // HH:MM:SS
  };

  // Prevent NaN if total is 0
  const total = Math.max(progress.total, 1);
  const percentSuccess = (progress.success / total) * 100;
  const percentFailed = (progress.failed / total) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between gap-6 md:items-center">
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-[28px] ${isSpinning ? "animate-spin text-primary" : phase === "completed" ? "text-emerald-500" : "text-slate-400"}`}
          >
            {getPhaseIcon()}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">{getPhaseText()}</p>
            <div className="text-xs font-semibold mt-1 flex flex-wrap gap-2.5">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                Success: {progress.success}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                Failed: {progress.failed}
              </span>
              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                Total: {progress.total}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full md:max-w-xs flex flex-col gap-1.5 justify-center">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500">
            <span>Progress</span>
            <span>{Math.round(percentSuccess + percentFailed)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100/80 rounded-full overflow-hidden flex border border-slate-200/50">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${percentSuccess}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${percentFailed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="bg-[#0c111d] rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[340px]">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="text-[11px] font-mono text-slate-400 ml-2 uppercase tracking-wide font-medium">
            Crawler Log Shell
          </span>
        </div>
        <div className="p-4 overflow-y-auto flex-1 font-mono text-[13px] text-slate-300 leading-relaxed font-medium space-y-1.5">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Waiting for logs...</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 hover:bg-white/5 px-1 -mx-1 rounded py-0.5 transition-colors break-words"
              >
                <span className="text-slate-600 shrink-0">
                  [{formatLogTime(log.timestamp)}]
                </span>
                <span
                  className={`shrink-0 w-[60px] ${
                    log.level === "warn"
                      ? "text-amber-400"
                      : log.level === "error"
                        ? "text-rose-400"
                        : "text-sky-400"
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span
                  className={`flex-1 ${
                    log.level === "error" ? "text-rose-200" : ""
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
