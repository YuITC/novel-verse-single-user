import { RelationshipGraphPage } from "@/features/ai/components/relationship-graph/RelationshipGraphPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relationship Graph - NovelVerse",
  description: "Interactive character relationship visualization",
};

export default function Page() {
  return <RelationshipGraphPage />;
}
