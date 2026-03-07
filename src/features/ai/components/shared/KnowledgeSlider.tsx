"use client";

interface KnowledgeSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
}

export function KnowledgeSlider({ value, max, onChange, label = "Chapter Knowledge", description }: KnowledgeSliderProps) {
  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>
      )}
      {description && (
        <p className="text-xs text-slate-500 mb-3">{description}</p>
      )}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500">Current:</span>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
            Chapter {value}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={max || 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary h-1.5"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Ch. 1</span>
          <span className="text-[10px] text-slate-400 font-medium">Ch. {max}</span>
        </div>
      </div>
    </div>
  );
}
