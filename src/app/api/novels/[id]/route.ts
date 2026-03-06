import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: novel, error } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !novel)
    return NextResponse.json({ error: "Novel not found" }, { status: 404 });

  return NextResponse.json({
    title: novel.title_raw,
    author: novel.author_raw,
    genres: novel.genres || [],
    publication_status: novel.publication_status,
    description: novel.description_raw,
    cover_url: novel.cover_url,
    source_url: novel.source_url,
  });
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const { error: updateError } = await supabase
      .from("novels")
      .update({
        title_raw: body.title,
        author_raw: body.author,
        genres: body.genres,
        publication_status: body.publication_status,
        description_raw: body.description,
        cover_url: body.cover_url,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError)
      throw new Error("Failed to update novel: " + updateError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
