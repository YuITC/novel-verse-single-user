import { useState, useRef } from "react";
import { uploaderApi } from "../api/uploaderApi";

interface Props {
  data: {
    title: string;
    author: string;
    genres: string[];
    publication_status: "ongoing" | "completed" | "hiatus" | "draft";
    description: string;
    cover_url?: string;
  };
  onChange: (data: Partial<Props["data"]>) => void;
  disabled?: boolean;
}

export function StoryMetadataCard({ data, onChange, disabled }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploaderApi.uploadCover(file);
      onChange({ cover_url: res.url });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload cover image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!data.genres.includes(tagInput.trim())) {
        onChange({ genres: [...data.genres, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({ genres: data.genres.filter((g) => g !== tag) });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        Story Details
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Cover Upload */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-40 h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                ${isUploading ? "opacity-50 pointer-events-none" : ""} 
                ${data.cover_url ? "border-primary/30" : "border-slate-300 hover:border-primary/50 hover:bg-primary/5"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {data.cover_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">
                    edit
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors p-4 text-center">
                <span className="material-symbols-outlined text-4xl">
                  add_photo_alternate
                </span>
                <span className="text-xs font-semibold">Upload Cover</span>
                <span className="text-[10px] opacity-70">JPG, PNG (2:3)</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>

        {/* Right: Form Fields */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Story Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => onChange({ title: e.target.value })}
                disabled={disabled}
                placeholder="My Awesome Novel"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Author
              </label>
              <input
                type="text"
                value={data.author}
                onChange={(e) => onChange({ author: e.target.value })}
                disabled={disabled}
                placeholder="Pen Name"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={data.publication_status}
                  onChange={(e) =>
                    onChange({ publication_status: e.target.value as any })
                  }
                  disabled={disabled}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white font-medium text-slate-700"
                >
                  <option value="draft">Draft</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  expand_more
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Genres / Tags
              </label>
              <div className="w-full min-h-[44px] px-2 py-1 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-wrap items-center gap-2 bg-white">
                {data.genres.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold border border-primary/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition-colors flex"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={disabled}
                  placeholder={
                    data.genres.length === 0 ? "Type and press enter..." : ""
                  }
                  className="flex-1 min-w-[120px] h-8 outline-none bg-transparent text-sm placeholder:text-slate-400 text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Synopsis
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              disabled={disabled}
              placeholder="What is this story about?"
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 resize-y font-medium text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
