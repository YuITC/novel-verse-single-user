import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
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

    const { data: entry, error } = await supabase
      .from("concept_entries")
      .insert({
        novel_id: body.novel_id,
        name: body.name,
        category: body.category,
        tier: body.tier || null,
        short_description: body.short_description || null,
        detailed_description: body.detailed_description || null,
        metadata: body.metadata || null,
        first_introduced_chapter: body.first_introduced_chapter || null,
        is_user_created: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(entry);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
