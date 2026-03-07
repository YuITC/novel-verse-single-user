import { StoryQAPage } from "@/features/ai/components/story-qa/StoryQAPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Story Q&A - NovelVerse",
  description: "RAG-powered story question and answer system",
};

export default function Page() {
  return <StoryQAPage />;
}
