"use client";

import { ReadingPreferences } from "./ReaderLayout";

interface RightSidebarProps {
  preferences: ReadingPreferences;
  updatePreference: <K extends keyof ReadingPreferences>(
    key: K,
    value: ReadingPreferences[K]
  ) => void;
}

export function RightSidebar({
  preferences,
  updatePreference,
}: RightSidebarProps) {
  return (
    <aside className="w-80 flex-none bg-white border-l border-slate-200 flex flex-col h-full z-10 hidden xl:flex text-slate-800">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-400">tune</span>
        <h2 className="text-base font-semibold text-slate-800">
          Reading Experience
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Font Family
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updatePreference("font_family", "serif")}
              className={`py-3 px-4 rounded-xl text-sm font-medium font-serif text-center transition-colors ${
                preferences.font_family === "serif"
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Serif
            </button>
            <button
              onClick={() => updatePreference("font_family", "sans-serif")}
              className={`py-3 px-4 rounded-xl text-sm font-medium font-sans text-center transition-colors ${
                preferences.font_family === "sans-serif"
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Sans-Serif
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Font Size
            </h3>
            <span className="text-sm font-medium text-slate-700">
              {preferences.font_size}px
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">A</span>
            <input
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              max="24"
              min="12"
              type="range"
              value={preferences.font_size}
              onChange={(e) =>
                updatePreference("font_size", parseInt(e.target.value))
              }
            />
            <span className="text-lg text-slate-400 font-medium">A</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Line Height
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "snug", title: "Compact" },
              { id: "relaxed", title: "Comfortable" },
              { id: "loose", title: "Spacious" },
            ].map((lh) => (
              <button
                key={lh.id}
                onClick={() =>
                  updatePreference("line_height", lh.id as any)
                }
                title={lh.title}
                className={`py-2 rounded-lg flex items-center justify-center transition-colors ${
                  preferences.line_height === lh.id
                    ? "border-2 border-primary bg-primary/5"
                    : "border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    preferences.line_height === lh.id
                      ? "text-primary"
                      : "text-slate-500"
                  }`}
                >
                  format_line_spacing
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Paragraph Spacing
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "small", label: "Small" },
              { id: "medium", label: "Med" },
              { id: "large", label: "Large" },
            ].map((ps) => (
              <button
                key={ps.id}
                onClick={() =>
                  updatePreference("paragraph_spacing", ps.id as any)
                }
                className={`py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  preferences.paragraph_spacing === ps.id
                    ? "border-2 border-primary bg-primary/5 text-primary"
                    : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {ps.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Theme
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "light", bg: "bg-[#fafafa]", label: "Light" },
              { id: "sepia", bg: "bg-[#f4ecd8]", label: "Sepia" },
              { id: "dark", bg: "bg-[#1e293b]", label: "Dark" },
              { id: "oled", bg: "bg-black", label: "OLED" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => updatePreference("theme", t.id as any)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-colors ${
                    t.bg
                  } ${
                    preferences.theme === t.id
                      ? "border-2 border-primary"
                      : "border border-slate-200 group-hover:border-slate-400"
                  }`}
                >
                  {preferences.theme === t.id && (
                    <span className="material-symbols-outlined text-primary text-sm">
                      check
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    preferences.theme === t.id
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-slate-400">
              record_voice_over
            </span>
            <h2 className="text-base font-semibold text-slate-800">
              Text-to-Speech
            </h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Voice Selection
              </h3>
              <select
                value={preferences.tts_voice}
                onChange={(e) =>
                  updatePreference("tts_voice", e.target.value)
                }
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none hover:border-slate-300 transition-colors cursor-pointer"
              >
                <option>Female - Soft</option>
                <option>Male - Deep</option>
                <option>Female - Energetic</option>
                <option>Male - Calm</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Speed Control
                </h3>
                <span className="text-sm font-medium text-slate-700">
                  {preferences.tts_speed.toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">0.5x</span>
                <input
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  max="2"
                  min="0.5"
                  step="0.1"
                  type="range"
                  value={preferences.tts_speed}
                  onChange={(e) =>
                    updatePreference("tts_speed", parseFloat(e.target.value))
                  }
                />
                <span className="text-xs font-medium text-slate-400">2.0x</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pitch Adjustment
                </h3>
                <span className="text-sm font-medium text-slate-700">
                  {preferences.tts_pitch === 1.0
                    ? "Normal"
                    : preferences.tts_pitch.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">Low</span>
                <input
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  max="2"
                  min="0"
                  step="0.1"
                  type="range"
                  value={preferences.tts_pitch}
                  onChange={(e) =>
                    updatePreference("tts_pitch", parseFloat(e.target.value))
                  }
                />
                <span className="text-xs font-medium text-slate-400">High</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Auto-Scroll
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.tts_auto_scroll}
                  onChange={(e) =>
                    updatePreference("tts_auto_scroll", e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
