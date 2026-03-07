import { useState } from "react";

interface Props {
  data: {
    title: string;
    content: string;
    chapter_index?: number;
  };
  onChange: (data: Partial<Props["data"]>) => void;
  onChapterSelect?: (id: string) => void;
  chapters?: { id: string; title: string; chapter_index: number }[];
  currentChapterId?: string;
  disabled?: boolean;
}

export function ChapterEditorCard({
  data,
  onChange,
  onChapterSelect,
  chapters,
  currentChapterId,
  disabled,
}: Props) {
  const words = data.content.trim()
    ? data.content.trim().split(/\s+/).length
    : 0;
  const readingTime = Math.ceil(words / 250); // Avg 250 wpm

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
      {/* Editor Info Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 ">Chapter Content</h2>
          {chapters && chapters.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Chapter:
              </label>
              <select
                value={currentChapterId || ""}
                onChange={(e) => onChapterSelect?.(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-primary transition-all"
              >
                <option value="">New Chapter</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Ch {ch.chapter_index}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-24">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Ch #
            </label>
            <input
              type="number"
              min="1"
              value={data.chapter_index || ""}
              onChange={(e) =>
                onChange({
                  chapter_index: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              disabled={disabled}
              placeholder="Auto"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium font-mono text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Chapter Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              disabled={disabled}
              placeholder="E.g., The Journey Begins"
              className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
            />
          </div>
        </div>
      </div>

      {/* Toolbar (Visual Only for V1) */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Bold"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_bold
          </span>
        </button>
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Italic"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_italic
          </span>
        </button>
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Underline"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_underlined
          </span>
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Heading 1"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_h1
          </span>
        </button>
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Heading 2"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_h2
          </span>
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button
          className="w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Bullet List"
        >
          <span className="material-symbols-outlined text-[20px]">
            format_list_bulleted
          </span>
        </button>
      </div>

      {/* Text Area */}
      <div className="p-6 bg-slate-50/30">
        <textarea
          value={data.content}
          onChange={(e) => onChange({ content: e.target.value })}
          disabled={disabled}
          placeholder="Write your chapter here..."
          className="w-full min-h-[400px] outline-none bg-transparent resize-y text-slate-800 leading-relaxed font-serif"
          style={{ fontSize: "15px" }}
        />
      </div>

      {/* Status Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <div>
          {words > 0 ? (
            <span className="flex items-center gap-3">
              <span>{words.toLocaleString()} words</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>~{readingTime} min read</span>
            </span>
          ) : (
            <span>0 words</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Draft
        </div>
      </div>
    </div>
  );
}
