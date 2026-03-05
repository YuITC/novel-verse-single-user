-- =============================================================================
-- CHARACTERS
-- =============================================================================
create table characters (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  name text not null,
  name_translated text,
  role text,
  biography text,
  personality_traits text[],
  speech_patterns text,
  avatar_url text,
  first_appearance_chapter integer,
  importance_rank integer,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_characters_novel_id on characters(novel_id);

create trigger trg_characters_updated_at
before update on characters
for each row execute function update_updated_at_column();


-- =============================================================================
-- CHARACTER STATES
-- =============================================================================
create table character_states (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references characters(id) on delete cascade not null,
  chapter_number integer not null,

  location text,
  power_level text,
  key_items text[],
  faction text,
  status text,

  created_at timestamptz default timezone('utc', now()) not null,

  unique(character_id, chapter_number)
);


-- =============================================================================
-- CHAT SESSIONS
-- =============================================================================
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  character_id uuid references characters(id) on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  knowledge_limit integer not null,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_chat_sessions_user_id on chat_sessions(user_id);

create trigger trg_chat_sessions_updated_at
before update on chat_sessions
for each row execute function update_updated_at_column();


-- =============================================================================
-- CHAT MESSAGES
-- =============================================================================
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,

  role text not null,
  content text not null,
  rating text,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_chat_messages_session_id on chat_messages(session_id);


-- =============================================================================
-- GROUP CHAT SESSIONS
-- =============================================================================
create table group_chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  title text,
  scenario_context text,
  auto_chat_active boolean default false,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_group_chat_sessions_user_id on group_chat_sessions(user_id);

create trigger trg_group_chat_sessions_updated_at
before update on group_chat_sessions
for each row execute function update_updated_at_column();


-- =============================================================================
-- GROUP CHAT MEMBERS
-- =============================================================================
create table group_chat_members (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,
  character_id uuid references characters(id) on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,

  knowledge_limit integer not null,
  color_slot integer not null,
  display_order integer not null,

  unique(session_id, character_id)
);


-- =============================================================================
-- GROUP CHAT MESSAGES
-- =============================================================================
create table group_chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,

  sender_type text not null,
  character_id uuid references characters(id),
  content text not null,
  is_auto_generated boolean default false,
  is_edited boolean default false,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_group_chat_messages_session_id on group_chat_messages(session_id);


-- =============================================================================
-- GROUP CHAT MEMORY
-- =============================================================================
create table group_chat_memory (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,

  title text not null,
  summary text not null,
  message_range_start uuid references group_chat_messages(id),
  message_range_end uuid references group_chat_messages(id),

  created_at timestamptz default timezone('utc', now()) not null
);


-- =============================================================================
-- NOVEL CHUNKS (RAG)
-- =============================================================================
create table novel_chunks (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,
  chapter_number integer not null,

  content text not null,
  paragraph_index integer not null,
  token_count integer,
  character_mentions text[],

  embedding vector(1536),

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_novel_chunks_novel_chapter on novel_chunks(novel_id, chapter_number);
create index on novel_chunks using hnsw (embedding vector_cosine_ops);


-- =============================================================================
-- STORY ARCS
-- =============================================================================
create table story_arcs (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  title text not null,
  description text,
  start_chapter integer not null,
  end_chapter integer not null,
  arc_order integer not null,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_story_arcs_novel_id on story_arcs(novel_id);


-- =============================================================================
-- QA SESSIONS
-- =============================================================================
create table qa_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  knowledge_limit integer not null,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create trigger trg_qa_sessions_updated_at
before update on qa_sessions
for each row execute function update_updated_at_column();


-- =============================================================================
-- QA MESSAGES
-- =============================================================================
create table qa_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references qa_sessions(id) on delete cascade not null,

  role text not null,
  content text not null,
  citations jsonb,
  retrieved_chunk_ids uuid[],

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_qa_messages_session_id on qa_messages(session_id);
