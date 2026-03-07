import React from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";
import { BookmarkGroup } from "../types/library";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  // Simplified relative date for yesterday/today
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const BookmarkList: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: string) => libraryApi.removeBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const { data: bookmarkGroups } = useSuspenseQuery({
    queryKey: ["bookmarks"],
    queryFn: () => libraryApi.getBookmarks(),
  });

  if (!bookmarkGroups || bookmarkGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
          bookmarks
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No bookmarks saved yet
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          While reading, you can bookmark specific chapters to quickly return to
          them later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
      {bookmarkGroups.map((group: BookmarkGroup) => (
        <div key={group.novel.id} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            {group.novel.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={group.novel.cover_url}
                alt="Cover"
                className="w-12 h-16 rounded-md border border-slate-100 shadow-sm object-cover"
              />
            ) : (
              <div className="w-12 h-16 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                <span className="material-symbols-outlined text-slate-300">
                  auto_stories
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-900">
              {group.novel.title}
            </h3>
          </div>

          {/* Bookmark Rows */}
          <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {group.bookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                onClick={() =>
                  router.push(
                    `/reader/${group.novel.id}/${bookmark.chapter.id}`,
                  )
                }
                className={`flex items-center p-4 transition-colors duration-150 cursor-pointer group hover:bg-slate-50
                  ${index !== group.bookmarks.length - 1 ? "border-b border-slate-50" : ""}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-primary/80">
                    bookmark
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors whitespace-nowrap">
                    Chapter {bookmark.chapter.chapter_index}
                  </span>
                  <span className="hidden sm:inline-block text-slate-300">
                    |
                  </span>
                  <span className="text-sm text-slate-600 font-medium truncate">
                    {bookmark.chapter.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-4">
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(bookmark.created_at)}
                  </span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:outline-none focus:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmarkMutation.mutate(bookmark.id);
                    }}
                    disabled={removeBookmarkMutation.isPending}
                    title="Remove bookmark"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
