import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const novelId = params.id;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Calculate next chapter index
    const { data: chapters, error: indexError } = await supabase
      .from("chapters")
      .select("chapter_index")
      .eq("novel_id", novelId)
      .order("chapter_index", { ascending: false })
      .limit(1);

    const nextIndex =
      chapters && chapters.length > 0 ? chapters[0].chapter_index + 1 : 1;

    const { data: chapter, error: insertError } = await supabase
      .from("chapters")
      .insert({
        novel_id: novelId,
        user_id: user.id,
        chapter_index: body.chapter_index || nextIndex,
        title_raw: body.title,
        content_raw: body.content,
      })
      .select("id")
      .single();

    if (insertError)
      throw new Error("Failed to create chapter: " + insertError.message);

    // Update novel total chapters
    await supabase
      .from("novels")
      .update({
        total_chapters: nextIndex,
      })
      .eq("id", novelId);

    return NextResponse.json({ id: chapter.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
