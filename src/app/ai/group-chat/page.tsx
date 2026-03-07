import { GroupChatPage } from "@/features/ai/components/group-chat/GroupChatPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Chat - NovelVerse",
  description: "Multi-character AI group conversations",
};

export default function Page() {
  return <GroupChatPage />;
}
