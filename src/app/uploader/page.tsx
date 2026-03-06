import { UploaderPage } from "@/features/uploader/components/UploaderPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Workspace - NovelVerse",
  description: "Write and publish original stories",
};

export default function Page() {
  return <UploaderPage />;
}
