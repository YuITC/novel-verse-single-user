import { CrawlerPage } from "@/features/crawler/components/CrawlerPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crawler - NovelVerse",
  description: "Extract novel content from supported sources",
};

export default function Page() {
  return <CrawlerPage />;
}
