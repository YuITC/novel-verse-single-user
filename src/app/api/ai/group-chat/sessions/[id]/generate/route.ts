import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OpenRouterService } from "@/lib/openrouter";

export async function POST(
  _req: NextRequest,
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
    // Get session with scenario
    const { data: session } = await supabase
      .from("group_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get members with character details
    const { data: members } = await supabase
      .from("group_chat_members")
      .select("*, character:characters(*)")
      .eq("session_id", sessionId)
      .order("display_order", { ascending: true });

    if (!members || members.length < 2) {
      return NextResponse.json({ error: "Need at least 2 members" }, { status: 400 });
    }

    // Get recent messages
    const { data: recentMsgs } = await supabase
      .from("group_chat_messages")
      .select("*, character:characters(name)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(15);

    // Determine next speaker (avoid last speaker, round-robin with context)
    const lastCharId = recentMsgs?.[0]?.character_id;
    const eligibleMembers = members.filter((m) => m.character_id !== lastCharId);
    const nextMember = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)] || members[0];
    const char = nextMember.character;

    // Build system prompt for this character
    const otherMembers = members
      .filter((m) => m.character_id !== nextMember.character_id)
      .map((m) => `- ${m.character.name} from their novel`)
      .join("\n");

    const systemPrompt = `You are ${char.name}.

PERSONALITY: ${(char.personality_traits || []).join(", ")}
KNOWLEDGE LIMIT: Events up to Chapter ${nextMember.knowledge_limit} of your novel.

SCENARIO: ${session.scenario_context || "A casual conversation."}

OTHER PARTICIPANTS:
${otherMembers}

INSTRUCTIONS:
- Stay in character. Respond to what others say based on your personality.
- You may agree, disagree, challenge, or ally with other characters.
- Use action text in *asterisks* for physical actions.
- Keep responses to 2-4 sentences to maintain conversational pacing.
- Reference events from your novel only within your knowledge limit.`;

    const conversationHistory = (recentMsgs || []).reverse().map((m) => ({
      role: (m.sender_type === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.sender_type === "user"
        ? `[Author]: ${m.content}`
        : `[${m.character?.name || "Unknown"}]: ${m.content}`,
    }));

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: `Now respond as ${char.name}. Stay in character.` },
    ];

    const aiContent = await OpenRouterService.createChatCompletion(messages);

    // Save message
    const { data: message, error } = await supabase
      .from("group_chat_messages")
      .insert({
        session_id: sessionId,
        sender_type: "character",
        character_id: nextMember.character_id,
        content: aiContent,
        is_auto_generated: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(message);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
