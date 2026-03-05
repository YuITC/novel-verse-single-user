import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ReaderLayout } from "@/features/reader/components/ReaderLayout";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ novelId: string; chapterId: string }>;
}) {
  const { novelId, chapterId } = await params;
  const supabase = await createClient();

  // Fetch the novel data
  const { data: novel } = await supabase
    .from("novels")
    .select("id, title_raw, title_translated")
    .eq("id", novelId)
    .single();

  if (!novel) return notFound();

  // Fetch current chapter
  const { data: currentChapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .single();

  if (!currentChapter) return notFound();

  // Fetch previous chapter
  const { data: prevChapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("novel_id", novelId)
    .lt("chapter_index", currentChapter.chapter_index)
    .order("chapter_index", { ascending: false })
    .limit(1)
    .single();

  // Fetch next chapter
  const { data: nextChapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("novel_id", novelId)
    .gt("chapter_index", currentChapter.chapter_index)
    .order("chapter_index", { ascending: true })
    .limit(1)
    .single();

  // Update current_chapter_id in library_entries for User 1 (mocking actual Auth)
  // In a real app we would get the user_id from session
  // But we have the user from auth.users (the seeded one)
  // We'll skip the update here for simplicity or do it client side? Let's just do it in server side safely below:
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user) {
    await supabase
      .from("library_entries")
      .update({
        current_chapter_id: chapterId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", authData.user.id)
      .eq("novel_id", novelId);
  }

  // Fetch all chapters for the sidebar (first 100 for now or similar)
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, chapter_index, title_raw, title_translated")
    .eq("novel_id", novelId)
    .order("chapter_index", { ascending: false });

  // Fetch bookmarks
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      "id, chapter_id, chapters(chapter_index, title_raw, title_translated)",
    )
    .eq("novel_id", novelId);

  return (
    <ReaderLayout
      novel={novel}
      chapter={currentChapter}
      prevChapterId={prevChapter?.id || null}
      nextChapterId={nextChapter?.id || null}
      allChapters={chapters || []}
      initialBookmarks={bookmarks || []}
    />
  );
}
