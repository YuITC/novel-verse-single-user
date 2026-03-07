import { createClient } from "@/lib/supabase/client";
import type {
  NovelOption,
  Character,
  CharacterState,
  ChatSession,
  ChatMessage,
  GroupChatSession,
  GroupChatMember,
  GroupChatMessage,
  GroupChatMemory,
  GraphNode,
  GraphEdge,
  TimelineEvent,
  StoryArc,
  ConceptEntry,
  ConceptDetail,
  ConceptCategory,
  QASession,
  QAMessage,
  QuickContext,
} from "../types";

// ============================================================================
// Shared
// ============================================================================

export const aiApi = {
  getNovels: async (): Promise<NovelOption[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("library_entries")
      .select("novel:novels ( id, title_raw, total_chapters, cover_url )");
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
      .filter((e) => e.novel)
      .map((e) => ({
        id: e.novel.id,
        title: e.novel.title_raw || "Untitled",
        total_chapters: e.novel.total_chapters || 0,
        cover_url: e.novel.cover_url,
      }));
  },

  // ==========================================================================
  // Characters
  // ==========================================================================

  getCharacters: async (novelId: string): Promise<Character[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("novel_id", novelId)
      .order("importance_rank", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  getCharacterState: async (characterId: string, chapter: number): Promise<CharacterState | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("character_states")
      .select("*")
      .eq("character_id", characterId)
      .lte("chapter_number", chapter)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // Character Chat
  // ==========================================================================

  createChatSession: async (characterId: string, novelId: string, knowledgeLimit: number): Promise<ChatSession> => {
    const res = await fetch("/api/ai/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character_id: characterId, novel_id: novelId, knowledge_limit: knowledgeLimit }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getChatMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  sendChatMessage: async (sessionId: string, content: string): Promise<{ user_message: ChatMessage; assistant_message: ChatMessage }> => {
    const res = await fetch(`/api/ai/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  rateChatMessage: async (messageId: string, rating: "positive" | "negative"): Promise<void> => {
    const supabase = createClient();
    await supabase.from("chat_messages").update({ rating }).eq("id", messageId);
  },

  deleteChatSession: async (sessionId: string): Promise<void> => {
    const supabase = createClient();
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
  },

  // ==========================================================================
  // Group Chat
  // ==========================================================================

  createGroupSession: async (title: string, scenarioContext: string): Promise<GroupChatSession> => {
    const res = await fetch("/api/ai/group-chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, scenario_context: scenarioContext }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getGroupSession: async (sessionId: string): Promise<GroupChatSession> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("group_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (error) throw error;
    return data;
  },

  updateGroupScenario: async (sessionId: string, scenario: string): Promise<void> => {
    const supabase = createClient();
    await supabase
      .from("group_chat_sessions")
      .update({ scenario_context: scenario })
      .eq("id", sessionId);
  },

  getGroupMembers: async (sessionId: string): Promise<GroupChatMember[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("group_chat_members")
      .select("*, character:characters(*)")
      .eq("session_id", sessionId)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  addGroupMember: async (sessionId: string, characterId: string, novelId: string, knowledgeLimit: number, colorSlot: number, displayOrder: number): Promise<GroupChatMember> => {
    const res = await fetch(`/api/ai/group-chat/sessions/${sessionId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character_id: characterId, novel_id: novelId, knowledge_limit: knowledgeLimit, color_slot: colorSlot, display_order: displayOrder }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  removeGroupMember: async (sessionId: string, characterId: string): Promise<void> => {
    const res = await fetch(`/api/ai/group-chat/sessions/${sessionId}/members/${characterId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(await res.text());
  },

  getGroupMessages: async (sessionId: string): Promise<GroupChatMessage[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("group_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  sendGroupMessage: async (sessionId: string, content: string): Promise<GroupChatMessage> => {
    const res = await fetch(`/api/ai/group-chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  generateGroupMessage: async (sessionId: string): Promise<GroupChatMessage> => {
    const res = await fetch(`/api/ai/group-chat/sessions/${sessionId}/generate`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  toggleAutoChat: async (sessionId: string, active: boolean): Promise<{ auto_chat_active: boolean }> => {
    const res = await fetch(`/api/ai/group-chat/sessions/${sessionId}/auto-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getGroupMemory: async (sessionId: string): Promise<GroupChatMemory[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("group_chat_memory")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  editGroupMessage: async (messageId: string, content: string): Promise<void> => {
    const supabase = createClient();
    await supabase.from("group_chat_messages").update({ content, is_edited: true }).eq("id", messageId);
  },

  deleteGroupMessage: async (messageId: string): Promise<void> => {
    const supabase = createClient();
    await supabase.from("group_chat_messages").delete().eq("id", messageId);
  },

  // ==========================================================================
  // Relationship Graph
  // ==========================================================================

  getGraphNodes: async (novelId: string, maxChapter: number): Promise<GraphNode[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("characters")
      .select("id, name, role, faction, importance_rank, first_appearance_chapter")
      .eq("novel_id", novelId)
      .lte("first_appearance_chapter", maxChapter)
      .order("importance_rank", { ascending: true });
    if (error) throw error;
    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      initials: c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: c.role || "supporting",
      faction: c.faction,
      importance_rank: c.importance_rank || 99,
      first_appearance_chapter: c.first_appearance_chapter || 1,
      primary_relationship_to_protagonist: null,
    }));
  },

  getGraphEdges: async (novelId: string, maxChapter: number): Promise<GraphEdge[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("character_relationships")
      .select("*")
      .eq("novel_id", novelId)
      .lte("chapter_established", maxChapter)
      .order("chapter_established", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      source_id: r.character_a_id,
      target_id: r.character_b_id,
      relationship_type: r.relationship_type,
      label: r.relationship_label || r.relationship_type,
      direction: r.direction || "bidirectional",
      chapter_established: r.chapter_established,
    }));
  },

  // ==========================================================================
  // Event Timeline
  // ==========================================================================

  getTimelineEvents: async (novelId: string, categories?: string[]): Promise<TimelineEvent[]> => {
    const supabase = createClient();
    let query = supabase
      .from("timeline_events")
      .select("*")
      .eq("novel_id", novelId)
      .order("chapter_start", { ascending: true });
    if (categories && categories.length > 0) {
      query = query.in("category", categories);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getStoryArcs: async (novelId: string): Promise<StoryArc[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("story_arcs")
      .select("*")
      .eq("novel_id", novelId)
      .order("arc_order", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ==========================================================================
  // Concept Index
  // ==========================================================================

  getConceptCategories: async (novelId: string): Promise<ConceptCategory[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("concept_entries")
      .select("category")
      .eq("novel_id", novelId);
    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.category] = (counts[row.category] || 0) + 1;
    }

    const { CONCEPT_CATEGORIES } = await import("../types");
    return CONCEPT_CATEGORIES.map((c) => ({
      name: c.label,
      key: c.key,
      icon: c.icon,
      count: counts[c.key] || 0,
    }));
  },

  getConceptEntries: async (novelId: string, category?: string, search?: string): Promise<ConceptEntry[]> => {
    const supabase = createClient();
    let query = supabase
      .from("concept_entries")
      .select("id, name, category, tier, short_description, metadata, first_introduced_chapter, is_user_created")
      .eq("novel_id", novelId)
      .order("name", { ascending: true });
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getConceptDetail: async (entryId: string): Promise<ConceptDetail> => {
    const supabase = createClient();
    const { data: entry, error: entryErr } = await supabase
      .from("concept_entries")
      .select("*")
      .eq("id", entryId)
      .single();
    if (entryErr) throw entryErr;

    const { data: evidence, error: evidenceErr } = await supabase
      .from("concept_evidence")
      .select("*")
      .eq("entry_id", entryId)
      .order("chapter_number", { ascending: true });
    if (evidenceErr) throw evidenceErr;

    return { ...entry, evidence: evidence || [] };
  },

  createConcept: async (novelId: string, data: Partial<ConceptEntry>): Promise<ConceptEntry> => {
    const res = await fetch("/api/ai/concepts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novel_id: novelId, ...data }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ==========================================================================
  // Story Q&A
  // ==========================================================================

  getQASessions: async (novelId: string): Promise<QASession[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("qa_sessions")
      .select("*")
      .eq("novel_id", novelId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createQASession: async (novelId: string, knowledgeLimit: number): Promise<QASession> => {
    const res = await fetch("/api/ai/qa/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novel_id: novelId, knowledge_limit: knowledgeLimit }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getQAMessages: async (sessionId: string): Promise<QAMessage[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("qa_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  askQuestion: async (sessionId: string, question: string, knowledgeLimit: number): Promise<{ user_message: QAMessage; assistant_message: QAMessage; entities: import("../types").QAContextEntity[] }> => {
    const res = await fetch(`/api/ai/qa/sessions/${sessionId}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, knowledge_limit: knowledgeLimit }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getQuickContext: async (novelId: string, chapter: number): Promise<QuickContext> => {
    const res = await fetch(`/api/ai/qa/context?novel_id=${novelId}&ch=${chapter}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
