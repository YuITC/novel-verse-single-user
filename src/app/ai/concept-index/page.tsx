import { ConceptIndexPage } from "@/features/ai/components/concept-index/ConceptIndexPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concept Index - NovelVerse",
  description: "Encyclopedia of novel world-building concepts",
};

export default function Page() {
  return <ConceptIndexPage />;
}
