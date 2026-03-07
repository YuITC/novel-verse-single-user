import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NovelHero } from "@/features/novel/components/NovelHero";
import { ChapterList } from "@/features/novel/components/ChapterList";

export default async function NovelDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the novel data
  const { data: novel, error } = await supabase
    .from("novels")
    .select(
      `
      *,
      library_entries (
        current_chapter_id,
        reading_status
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !novel) {
    return notFound();
  }

  // Fetch the first chapter ID for "Read Now" logic
  const { data: firstChapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("novel_id", id)
    .order("chapter_index", { ascending: true })
    .limit(1)
    .single();

  // Fetch the first page of chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, chapter_index, title_raw, title_translated, created_at")
    .eq("novel_id", id)
    .order("chapter_index", { ascending: false })
    .limit(20);

  return (
    <main className="flex-1 pb-16">
      <div className="layout-content-container flex flex-col max-w-[1300px] flex-1 w-full mx-auto px-4 md:px-6 lg:px-8 mt-5">
        <NovelHero novel={novel} firstChapterId={firstChapter?.id || null} />
        <ChapterList novelId={id} initialChapters={chapters || []} />
      </div>
    </main>
  );
}
