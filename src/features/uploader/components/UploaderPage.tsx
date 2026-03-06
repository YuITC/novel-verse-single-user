"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { uploaderApi } from "../api/uploaderApi";
import { NovelFormData, ChapterFormData } from "../types";
import { StoryMetadataCard } from "./StoryMetadataCard";
import { ChapterEditorCard } from "./ChapterEditorCard";
import { ActionBar } from "./ActionBar";

export function UploaderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const novelIdParam = searchParams.get("novel");

  const [novelId, setNovelId] = useState<string | null>(novelIdParam);
  const [isLoading, setIsLoading] = useState(novelIdParam ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [novelData, setNovelData] = useState<NovelFormData>({
    title: "",
    author: "",
    genres: [],
    publication_status: "ongoing",
    description: "",
  });

  const [chapterData, setChapterData] = useState<ChapterFormData>({
    title: "",
    content: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (novelIdParam) {
      uploaderApi
        .getNovel(novelIdParam)
        .then((data) => {
          setNovelData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setToast({ message: "Failed to load novel", type: "error" });
          setIsLoading(false);
        });
    }
  }, [novelIdParam]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    if (!novelData.title.trim()) return "Story Title is required";
    if (!novelData.author.trim()) return "Author is required";
    if (!chapterData.title.trim()) return "Chapter Title is required";
    if (!chapterData.content.trim()) return "Chapter Content is required";
    return null;
  };

  const handleSaveOrPublish = async (isPublishingAction: boolean) => {
    const error = validate();
    if (error) {
      showToast(error, "error");
      return;
    }

    const actionSetter = isPublishingAction ? setIsPublishing : setIsSaving;
    actionSetter(true);

    try {
      let currentNovelId = novelId;

      // 1. Create or Update Novel
      if (!currentNovelId) {
        const res = await uploaderApi.createNovel(novelData);
        currentNovelId = res.id;
        setNovelId(currentNovelId);
        // Update URL without reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("novel", currentNovelId);
        window.history.pushState({}, "", newUrl.toString());
      } else {
        await uploaderApi.updateNovel(currentNovelId, novelData);
      }

      // 2. Create Chapter
      await uploaderApi.createChapter(currentNovelId, chapterData);

      showToast(
        isPublishingAction
          ? "Chapter Published Successfully!"
          : "Draft Saved Successfully!",
        "success",
      );

      // Clear chapter data after publish/save (optional, assuming they want to write next chapter)
      if (isPublishingAction) {
        setChapterData({
          title: "",
          content: "",
          chapter_index: (chapterData.chapter_index || 0) + 1,
        });
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred", "error");
    } finally {
      actionSetter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center text-slate-500">Loading editor...</div>
    );
  }

  return (
    <div className="w-full max-w-[800px] px-4 py-8 mx-auto flex flex-col gap-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px]">
            edit_document
          </span>
          Creator Workspace
        </h1>
        <p className="text-slate-500 mt-2 font-medium text-[15px]">
          Write and publish your original stories directly to the platform.
        </p>
      </div>

      <StoryMetadataCard
        data={novelData}
        onChange={(updates) =>
          setNovelData((prev) => ({ ...prev, ...updates }))
        }
      />

      <ChapterEditorCard
        data={chapterData}
        onChange={(updates) =>
          setChapterData((prev) => ({ ...prev, ...updates }))
        }
      />

      <ActionBar
        onSave={() => handleSaveOrPublish(false)}
        onPublish={() => handleSaveOrPublish(true)}
        isSaving={isSaving}
        isPublishing={isPublishing}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border font-bold shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-rose-50 text-rose-600 border-rose-200"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
