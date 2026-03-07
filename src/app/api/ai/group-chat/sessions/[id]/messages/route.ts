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
    const { content } = await req.json();

    // Pause auto-chat when user intervenes
    await supabase
      .from("group_chat_sessions")
      .update({ auto_chat_active: false })
      .eq("id", sessionId);

    const { data: message, error } = await supabase
      .from("group_chat_messages")
      .insert({
        session_id: sessionId,
        sender_type: "user",
        character_id: null,
        content,
        is_auto_generated: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(message);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
