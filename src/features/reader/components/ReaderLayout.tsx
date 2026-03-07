"use client";

import { useState, useEffect, ReactNode } from "react";
import { ReaderTopbar } from "./ReaderTopbar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { createClient } from "@/lib/supabase/client";

interface ReaderLayoutProps {
  novel: any;
  chapter: any;
  prevChapterId: string | null;
  nextChapterId: string | null;
  allChapters: any[];
  initialBookmarks: any[];
}

export interface ReadingPreferences {
  font_family: "serif" | "sans-serif";
  font_size: number;
  line_height: "snug" | "relaxed" | "loose";
  paragraph_spacing: "small" | "medium" | "large";
  theme: "light" | "sepia" | "dark" | "oled";
  tts_voice: string;
  tts_speed: number;
  tts_pitch: number;
  tts_auto_scroll: boolean;
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  font_family: "serif",
  font_size: 18,
  line_height: "relaxed",
  paragraph_spacing: "small",
  theme: "light",
  tts_voice: "Female - Soft",
  tts_speed: 1.0,
  tts_pitch: 1.0,
  tts_auto_scroll: true,
};

export function ReaderLayout({
  novel,
  chapter,
  prevChapterId,
  nextChapterId,
  allChapters,
  initialBookmarks,
}: ReaderLayoutProps) {
  const supabase = createClient();
  const [preferences, setPreferences] =
    useState<ReadingPreferences>(DEFAULT_PREFERENCES);
  const [isBookmarked, setIsBookmarked] = useState(
    initialBookmarks.some((b) => b.chapter_id === chapter.id),
  );
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // Load from local storage initially
  useEffect(() => {
    const saved = localStorage.getItem("reader_prefs");
    if (saved) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      } catch (e) {}
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    localStorage.setItem("reader_prefs", JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof ReadingPreferences>(
    key: K,
    value: ReadingPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleBookmarkToggle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const prevState = isBookmarked;
    setIsBookmarked(!prevState);

    if (prevState) {
      // Remove bookmark
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("chapter_id", chapter.id);
    } else {
      // Add bookmark
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        novel_id: novel.id,
        chapter_id: chapter.id,
      });
    }
  };

  const toggleTts = () => {
    if (isTtsPlaying) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
      return;
    }

    const text = chapter.content_translated || chapter.content_raw || "";
    const utterance = new SpeechSynthesisUtterance(text);

    // Simple voice matching based on prefs (could be improved)
    const voices = window.speechSynthesis.getVoices();
    if (preferences.tts_voice.includes("Female")) {
      utterance.voice =
        voices.find(
          (v) =>
            v.name.includes("Female") || v.name.includes("Google US English"),
        ) || null;
    } else {
      utterance.voice =
        voices.find(
          (v) => v.name.includes("Male") || v.name.includes("Grandpa"),
        ) || null;
    }

    utterance.rate = preferences.tts_speed;
    utterance.pitch = preferences.tts_pitch;

    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsTtsPlaying(true);
  };

  // Stop TTS if navigating away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Map theme to background colors
  const themeClasses = {
    light: "bg-[#fafafa] text-slate-900",
    sepia: "bg-[#f4ecd8] text-[#5b4636]",
    dark: "bg-[#1e293b] text-slate-300",
    oled: "bg-black text-slate-400",
  };

  const currentThemeClass =
    themeClasses[preferences.theme] || themeClasses.light;

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${currentThemeClass}`}
    >
      <ReaderTopbar
        novel={novel}
        chapter={chapter}
        isBookmarked={isBookmarked}
        onBookmarkToggle={handleBookmarkToggle}
        isTtsPlaying={isTtsPlaying}
        onTtsToggle={toggleTts}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar
          novel={novel}
          currentChapterId={chapter.id}
          allChapters={allChapters}
          bookmarks={initialBookmarks}
        />
        <main className="flex-1 h-full overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-16 md:px-12 lg:px-16 min-h-full flex flex-col">
            <article
              className={`flex-1 ${
                preferences.font_family === "serif" ? "font-serif" : "font-sans"
              }`}
              style={{ fontSize: `${preferences.font_size}px` }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-12 leading-tight text-center font-sans">
                Chapter {chapter.chapter_index}
                <br />
                <span className="text-2xl md:text-3xl font-medium mt-4 block opacity-80">
                  {chapter.title_translated || chapter.title_raw}
                </span>
              </h1>
              <div
                className={`prose max-w-none ${
                  preferences.theme === "dark" || preferences.theme === "oled"
                    ? "prose-invert"
                    : ""
                } leading-${preferences.line_height} ${
                  preferences.paragraph_spacing === "small"
                    ? "space-y-4"
                    : preferences.paragraph_spacing === "medium"
                      ? "space-y-6"
                      : "space-y-10"
                }`}
                style={{
                  color: preferences.theme === "sepia" ? "#5b4636" : undefined,
                }}
              >
                {(chapter.content_translated || chapter.content_raw)
                  ?.split(/\n+/)
                  .filter((p: string) => p.trim())
                  .map((p: string, idx: number) => (
                    <p key={idx}>{p}</p>
                  ))}
              </div>
            </article>
            <div className="mt-20 pt-8 border-t border-slate-200/50 flex items-center justify-between font-sans">
              {prevChapterId ? (
                <a
                  href={`/reader/${novel.id}/${prevChapterId}`}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-200/50 rounded-xl font-medium hover:bg-black/5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Previous Chapter
                </a>
              ) : (
                <div />
              )}
              {nextChapterId ? (
                <a
                  href={`/reader/${novel.id}/${nextChapterId}`}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Next Chapter
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </a>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
        <RightSidebar
          preferences={preferences}
          updatePreference={updatePreference}
        />
      </div>
    </div>
  );
}
