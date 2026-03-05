import { LibraryTabs } from "@/features/library/components/LibraryTabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Library - NovelVerse",
  description: "Your personal web novel collection and bookmarks",
};

export default function LibraryPage() {
  return (
    <>
      <LibraryTabs />
    </>
  );
}
