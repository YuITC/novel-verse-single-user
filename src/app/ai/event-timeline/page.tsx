import { EventTimelinePage } from "@/features/ai/components/event-timeline/EventTimelinePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Timeline - NovelVerse",
  description: "Chronological story event visualization",
};

export default function Page() {
  return <EventTimelinePage />;
}
