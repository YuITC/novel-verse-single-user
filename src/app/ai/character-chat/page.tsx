import { CharacterChatPage } from "@/features/ai/components/character-chat/CharacterChatPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Character Chat - NovelVerse",
  description: "Chat with AI-powered novel characters",
};

export default function Page() {
  return <CharacterChatPage />;
}
