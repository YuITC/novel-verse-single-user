import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OpenRouterService } from "@/lib/openrouter";

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

    // Get session details
    const { data: session, error: sessionErr } = await supabase
      .from("chat_sessions")
      .select("*, character:characters(*)")
      .eq("id", sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get character state at knowledge limit
    const { data: charState } = await supabase
      .from("character_states")
      .select("*")
      .eq("character_id", session.character_id)
      .lte("chapter_number", session.knowledge_limit)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get novel title
    const { data: novel } = await supabase
      .from("novels")
      .select("title_raw")
      .eq("id", session.novel_id)
      .single();

    // Save user message
    const { data: userMsg, error: userMsgErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, role: "user", content })
      .select()
      .single();

    if (userMsgErr) throw new Error(userMsgErr.message);

    // Get recent messages for context
    const { data: recentMsgs } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(20);

    const char = session.character;
    const systemPrompt = `You are ${char.name} from the novel "${novel?.title_raw || "Unknown"}".

PERSONALITY TRAITS: ${(char.personality_traits || []).join(", ")}
BIOGRAPHY: ${char.biography || "Unknown background"}

CURRENT STATE (as of Chapter ${session.knowledge_limit}):
- Location: ${charState?.location || "Unknown"}
- Power Level: ${charState?.power_level || "Unknown"}
- Key Items: ${(charState?.key_items || []).join(", ") || "None"}

KNOWLEDGE BOUNDARY: You only know events up to Chapter ${session.knowledge_limit}.
You MUST NOT reference or hint at events after this chapter.
If asked about future events, respond as if you genuinely don't know.

SPEECH STYLE: ${char.speech_patterns || "Speak naturally in character."}
- Use action text in *italics* for physical actions and expressions.
- Stay in character at all times.
- Respond conversationally, not as an AI.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(recentMsgs || []).reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Generate AI response
    const aiContent = await OpenRouterService.createChatCompletion(messages);

    // Save assistant message
    const { data: assistantMsg, error: assistantMsgErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, role: "assistant", content: aiContent })
      .select()
      .single();

    if (assistantMsgErr) throw new Error(assistantMsgErr.message);

    // Update session timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json({
      user_message: userMsg,
      assistant_message: assistantMsg,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
