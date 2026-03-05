"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NovelHeroProps {
  novel: any;
}

export function NovelHero({ novel }: NovelHeroProps) {
  const currentChapterId =
    novel.library_entries?.[0]?.current_chapter_id || null;
  const readNowUrl = currentChapterId
    ? `/reader/${novel.id}/${currentChapterId}`
    : `/reader/${novel.id}/1`; // assuming chapter lookup would redirect or handle '1'

  const title = novel.title_translated || novel.title_raw;
  const author = novel.author_translated || novel.author_raw;
  const description = novel.description_translated || novel.description_raw;

  return (
    <div className="flex flex-col md:flex-row gap-10 mb-12">
      <div className="w-full md:w-64 lg:w-80 shrink-0">
        <div
          className="w-full aspect-[2/3] bg-center bg-no-repeat bg-cover rounded-2xl shadow-md border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400"
          style={{
            backgroundImage: novel.cover_url
              ? `url(${novel.cover_url})`
              : "none",
          }}
        >
          {!novel.cover_url && (
            <span className="material-symbols-outlined text-4xl">
              import_contacts
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600 mb-4">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                person
              </span>{" "}
              {author || "Unknown Author"}
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                menu_book
              </span>{" "}
              {novel.total_chapters} Chapters
            </span>
            {novel.last_updated_at && (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  update
                </span>{" "}
                Last updated:{" "}
                {formatDistanceToNow(new Date(novel.last_updated_at), {
                  addSuffix: true,
                })}
              </span>
            )}
            {novel.source_url && (
              <a
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
                href={novel.source_url}
              >
                <span className="material-symbols-outlined text-[18px]">
                  link
                </span>{" "}
                Source URL
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {(novel.genres || []).map((genre: string) => (
              <span
                key={genre}
                className="px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-md border border-slate-200 text-slate-500 bg-white"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href={readNowUrl}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">menu_book</span>
              Read Now
            </Link>
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined">sync</span>
              Check Status
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <button
                className="flex items-center justify-center size-12 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                title="Edit"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button
                className="flex items-center justify-center size-12 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                title="Translate"
              >
                <span className="material-symbols-outlined">translate</span>
              </button>
              <button
                className="flex items-center justify-center size-12 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                title="Delete"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Synopsis
            </h3>
            {description ? (
              <p className="mb-4">{description}</p>
            ) : (
              <p className="mb-4 italic">No synopsis available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
