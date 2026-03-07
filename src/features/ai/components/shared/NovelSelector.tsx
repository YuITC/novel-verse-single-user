"use client";

import { useEffect, useState } from "react";
import { aiApi } from "../../api/aiApi";
import type { NovelOption } from "../../types";

interface NovelSelectorProps {
  value: string;
  onChange: (novelId: string, novel: NovelOption) => void;
  label?: string;
  className?: string;
}

export function NovelSelector({ value, onChange, label = "Select Novel", className = "" }: NovelSelectorProps) {
  const [novels, setNovels] = useState<NovelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi.getNovels().then((data) => {
      setNovels(data);
      if (data.length > 0 && !value) {
        onChange(data[0].id, data[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className={`text-sm text-slate-500 ${className}`}>
        Add a novel to your library first.
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => {
          const novel = novels.find((n) => n.id === e.target.value);
          if (novel) onChange(novel.id, novel);
        }}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-medium appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
      >
        {novels.map((novel) => (
          <option key={novel.id} value={novel.id}>
            {novel.title}
          </option>
        ))}
      </select>
    </div>
  );
}
