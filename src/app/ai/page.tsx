import { AIHubPage } from "@/features/ai/components/hub/AIHubPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Features - NovelVerse",
  description: "AI-powered tools for novel analysis and interaction",
};

export default function Page() {
  return <AIHubPage />;
}
