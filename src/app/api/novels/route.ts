import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Insert into novels
    const { data: novel, error: insertError } = await supabase
      .from("novels")
      .insert({
        user_id: user.id,
        title_raw: body.title,
        author_raw: body.author,
        genres: body.genres || [],
        publication_status: body.publication_status || "ongoing",
        description_raw: body.description,
        cover_url: body.cover_url,
        source_url: null, // User created
        source_origin: null,
      })
      .select("id")
      .single();

    if (insertError)
      throw new Error("Failed to create novel: " + insertError.message);

    // Auto-add to library as 'reading' or 'read-later' (maybe own works default to something else, read-later is fine)
    await supabase.from("library_entries").insert({
      user_id: user.id,
      novel_id: novel.id,
      reading_status: "read-later",
    });

    return NextResponse.json({ id: novel.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
