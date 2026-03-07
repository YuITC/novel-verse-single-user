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
    const { title, scenario_context } = await req.json();

    const { data: session, error } = await supabase
      .from("group_chat_sessions")
      .insert({
        user_id: user.id,
        title: title || "New Group Chat",
        scenario_context: scenario_context || "",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(session);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
