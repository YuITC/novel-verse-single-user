// ============================================================================
// Shared AI Types
// ============================================================================

export interface NovelOption {
  id: string;
  title: string;
  total_chapters: number;
  cover_url: string | null;
}

// ============================================================================
// Characters
// ============================================================================

export interface Character {
  id: string;
  novel_id: string;
  name: string;
  name_translated: string | null;
  role: string | null;
  biography: string | null;
  personality_traits: string[];
  speech_patterns: string | null;
  avatar_url: string | null;
  first_appearance_chapter: number | null;
  importance_rank: number | null;
}

export interface CharacterState {
  id: string;
  character_id: string;
  chapter_number: number;
  location: string | null;
  power_level: string | null;
  key_items: string[];
  faction: string | null;
  status: string | null;
}

// ============================================================================
// Character Chat
// ============================================================================

export interface ChatSession {
  id: string;
  character_id: string;
  novel_id: string;
  knowledge_limit: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  rating: "positive" | "negative" | null;
  created_at: string;
}

// ============================================================================
// Group Chat
// ============================================================================

export interface GroupChatSession {
  id: string;
  title: string | null;
  scenario_context: string | null;
  auto_chat_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupChatMember {
  id: string;
  session_id: string;
  character_id: string;
  novel_id: string;
  knowledge_limit: number;
  color_slot: number;
  display_order: number;
  character?: Character;
}

export interface GroupChatMessage {
  id: string;
  session_id: string;
  sender_type: "character" | "user";
  character_id: string | null;
  content: string;
  is_auto_generated: boolean;
  is_edited: boolean;
  created_at: string;
}

export interface GroupChatMemory {
  id: string;
  session_id: string;
  title: string;
  summary: string;
  created_at: string;
}

export const GROUP_CHAT_COLOR_SLOTS = [
  { slot: 1, avatarBg: "bg-blue-100", textColor: "text-blue-600", bubbleBg: "bg-white", bubbleBorder: "border border-slate-200", bubbleText: "text-slate-700" },
  { slot: 2, avatarBg: "bg-purple-100", textColor: "text-purple-600", bubbleBg: "bg-slate-900", bubbleBorder: "", bubbleText: "text-slate-200" },
  { slot: 3, avatarBg: "bg-emerald-100", textColor: "text-emerald-600", bubbleBg: "bg-emerald-50", bubbleBorder: "border border-emerald-100", bubbleText: "text-slate-700" },
  { slot: 4, avatarBg: "bg-amber-100", textColor: "text-amber-600", bubbleBg: "bg-amber-50", bubbleBorder: "border border-amber-100", bubbleText: "text-slate-700" },
  { slot: 5, avatarBg: "bg-rose-100", textColor: "text-rose-600", bubbleBg: "bg-rose-50", bubbleBorder: "border border-rose-100", bubbleText: "text-slate-700" },
] as const;

// ============================================================================
// Relationship Graph
// ============================================================================

export interface GraphNode {
  id: string;
  name: string;
  initials: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  faction: string | null;
  importance_rank: number;
  first_appearance_chapter: number;
  primary_relationship_to_protagonist: string | null;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: "ally" | "enemy" | "romantic" | "master_disciple" | "acquaintance";
  label: string;
  direction: "bidirectional" | "a_to_b";
  chapter_established: number;
}

export const RELATIONSHIP_COLORS: Record<string, { stroke: string; bg: string; text: string; label: string }> = {
  ally: { stroke: "#10b981", bg: "bg-emerald-500", text: "text-emerald-600", label: "Ally / Friendly" },
  enemy: { stroke: "#ef4444", bg: "bg-red-500", text: "text-red-600", label: "Enemy / Hostile" },
  romantic: { stroke: "#f472b6", bg: "bg-pink-400", text: "text-pink-600", label: "Romantic Interest" },
  master_disciple: { stroke: "#3b82f6", bg: "bg-blue-500", text: "text-blue-600", label: "Master / Disciple" },
  acquaintance: { stroke: "#cbd5e1", bg: "bg-slate-300", text: "text-slate-600", label: "Acquaintance" },
};

// ============================================================================
// Event Timeline
// ============================================================================

export type EventCategory = "major_plot_point" | "character_growth" | "world_history" | "romance_relationship";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  importance: "major" | "standard";
  chapter_start: number;
  chapter_end: number;
  characters_involved: string[];
  ai_note: string | null;
  icon: string | null;
}

export interface StoryArc {
  id: string;
  novel_id: string;
  title: string;
  description: string | null;
  start_chapter: number;
  end_chapter: number;
  arc_order: number;
}

export const EVENT_CATEGORY_CONFIG: Record<EventCategory, { color: string; dotBg: string; badgeBg: string; badgeText: string; label: string }> = {
  major_plot_point: { color: "#f59e0b", dotBg: "bg-amber-500", badgeBg: "bg-amber-100", badgeText: "text-amber-700", label: "Major Plot Points" },
  character_growth: { color: "#3b82f6", dotBg: "bg-blue-500", badgeBg: "bg-blue-100", badgeText: "text-blue-700", label: "Character Growth" },
  world_history: { color: "#10b981", dotBg: "bg-emerald-500", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", label: "World History" },
  romance_relationship: { color: "#f43f5e", dotBg: "bg-rose-500", badgeBg: "bg-rose-100", badgeText: "text-rose-700", label: "Romances/Relationships" },
};

// ============================================================================
// Concept Index
// ============================================================================

export interface ConceptEntry {
  id: string;
  name: string;
  category: string;
  tier: string | null;
  short_description: string | null;
  metadata: Record<string, string> | null;
  first_introduced_chapter: number | null;
  is_user_created: boolean;
}

export interface ConceptDetail extends ConceptEntry {
  detailed_description: string | null;
  diagram_type: string | null;
  evidence: ConceptEvidence[];
}

export interface ConceptEvidence {
  id: string;
  chapter_number: number;
  chapter_title: string | null;
  verbatim_quote: string;
}

export interface ConceptCategory {
  name: string;
  key: string;
  icon: string;
  count: number;
}

export const CONCEPT_CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "cultivation_realms", label: "Cultivation Realms", icon: "psychiatry" },
  { key: "magic_systems", label: "Magic Systems", icon: "auto_fix_high" },
  { key: "ancient_artifacts", label: "Ancient Artifacts", icon: "swords" },
  { key: "world_geography", label: "World Geography", icon: "public" },
  { key: "factions_sects", label: "Factions & Sects", icon: "diversity_3" },
];

// ============================================================================
// Story Q&A
// ============================================================================

export interface QASession {
  id: string;
  novel_id: string;
  knowledge_limit: number;
  created_at: string;
  updated_at: string;
}

export interface QAMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[] | null;
  created_at: string;
}

export interface Citation {
  chapter: number;
  paragraph: number;
  type: "primary" | "reference";
  label: string;
  chunk_id?: string;
}

export interface QAContextEntity {
  name: string;
  type: "character" | "item" | "location";
  role: string;
  status: string;
  avatar_color: string;
}

export interface QuickContext {
  current_arc: StoryArc | null;
  entities: QAContextEntity[];
}
