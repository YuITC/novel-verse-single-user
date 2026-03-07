import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const sessionId = params.id;

  try {
    const { character_id, novel_id, knowledge_limit, color_slot, display_order } = await req.json();

    const { data: member, error } = await supabase
      .from("group_chat_members")
      .insert({
        session_id: sessionId,
        character_id,
        novel_id,
        knowledge_limit,
        color_slot,
        display_order,
      })
      .select("*, character:characters(*)")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(member);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
