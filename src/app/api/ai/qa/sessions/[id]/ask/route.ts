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
    const { question, knowledge_limit } = await req.json();

    // Get session
    const { data: session } = await supabase
      .from("qa_sessions")
      .select("*, novel:novels(title_raw)")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Save user question
    const { data: userMsg, error: userMsgErr } = await supabase
      .from("qa_messages")
      .insert({ session_id: sessionId, role: "user", content: question })
      .select()
      .single();

    if (userMsgErr) throw new Error(userMsgErr.message);

    // Attempt RAG retrieval — get relevant chunks
    let contextPassages = "";
    let retrievedChunkIds: string[] = [];

    try {
      // Embed the question
      const [questionEmbedding] = await OpenRouterService.createEmbeddingsBatch([question]);

      // Vector search with chapter filter
      const { data: chunks } = await supabase.rpc("match_novel_chunks", {
        query_embedding: questionEmbedding,
        match_novel_id: session.novel_id,
        max_chapter: knowledge_limit,
        match_count: 5,
      });

      if (chunks && chunks.length > 0) {
        retrievedChunkIds = chunks.map((c: { id: string }) => c.id);
        contextPassages = chunks
          .map((c: { chapter_number: number; paragraph_index: number; content: string }) =>
            `[Chapter ${c.chapter_number}, Paragraph ${c.paragraph_index}]: "${c.content}"`,
          )
          .join("\n\n");
      }
    } catch {
      // RAG retrieval may fail if chunks aren't indexed yet — fall back to general knowledge
      contextPassages = "No indexed content available. Answer based on general novel knowledge if possible.";
    }

    const novelTitle = session.novel?.title_raw || "this novel";

    const systemPrompt = `You are a knowledgeable assistant for the web novel "${novelTitle}".

RULES:
1. Answer ONLY based on the provided context passages.
2. If the context doesn't contain the answer, say "I don't have enough information from the available chapters to answer that."
3. NEVER reveal events beyond Chapter ${knowledge_limit}.
4. Cite your sources using [Chapter X, Paragraph Y] format.
5. Highlight key entity names for visual emphasis.
6. Be thorough but concise (2-4 paragraphs maximum).

CONTEXT PASSAGES:
---
${contextPassages}
---`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: question },
    ];

    const aiContent = await OpenRouterService.createChatCompletion(
      messages,
      "qwen/qwen3-next-80b-a3b-instruct",
    );

    // Extract citations from the response
    const citationRegex = /\[Chapter (\d+),?\s*Paragraph (\d+)\]/g;
    const citations: { chapter: number; paragraph: number; type: string; label: string }[] = [];
    let match;
    while ((match = citationRegex.exec(aiContent)) !== null) {
      citations.push({
        chapter: parseInt(match[1]),
        paragraph: parseInt(match[2]),
        type: citations.length === 0 ? "primary" : "reference",
        label: `Chapter ${match[1]}, Paragraph ${match[2]}`,
      });
    }

    // Save assistant answer
    const { data: assistantMsg, error: assistantMsgErr } = await supabase
      .from("qa_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: aiContent,
        citations: citations.length > 0 ? citations : null,
        retrieved_chunk_ids: retrievedChunkIds.length > 0 ? retrievedChunkIds : null,
      })
      .select()
      .single();

    if (assistantMsgErr) throw new Error(assistantMsgErr.message);

    // Update session timestamp
    await supabase
      .from("qa_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json({
      user_message: userMsg,
      assistant_message: assistantMsg,
      entities: [],
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
