import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const novelId = req.nextUrl.searchParams.get("novel_id");
  const chapter = parseInt(req.nextUrl.searchParams.get("ch") || "1");

  if (!novelId) {
    return NextResponse.json({ error: "novel_id required" }, { status: 400 });
  }

  try {
    // Get current arc
    const { data: arcs } = await supabase
      .from("story_arcs")
      .select("*")
      .eq("novel_id", novelId)
      .lte("start_chapter", chapter)
      .gte("end_chapter", chapter)
      .limit(1)
      .maybeSingle();

    // Get notable characters up to this chapter
    const { data: characters } = await supabase
      .from("characters")
      .select("name, role, importance_rank")
      .eq("novel_id", novelId)
      .lte("first_appearance_chapter", chapter)
      .order("importance_rank", { ascending: true })
      .limit(5);

    const entities = (characters || []).map((c) => ({
      name: c.name,
      type: "character" as const,
      role: c.role || "Supporting",
      status: "",
      avatar_color: c.role === "protagonist" ? "slate" : c.role === "antagonist" ? "red" : "blue",
    }));

    return NextResponse.json({
      current_arc: arcs || null,
      entities,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
