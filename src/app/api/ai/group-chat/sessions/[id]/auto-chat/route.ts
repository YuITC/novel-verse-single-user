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
    const { active } = await req.json();

    const { error } = await supabase
      .from("group_chat_sessions")
      .update({ auto_chat_active: active })
      .eq("id", sessionId);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      auto_chat_active: active,
      status: active ? "started" : "paused",
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
