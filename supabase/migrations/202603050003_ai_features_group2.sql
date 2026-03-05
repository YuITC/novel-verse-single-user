-- =============================================================================
-- CHARACTER RELATIONSHIPS (Relationship Graph)
-- =============================================================================
create table character_relationships (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  character_a_id uuid references characters(id) on delete cascade not null,
  character_b_id uuid references characters(id) on delete cascade not null,

  relationship_type text not null,
  relationship_label text,
  description text,
  direction text default 'bidirectional',

  chapter_established integer not null,
  chapter_ended integer,

  cited_chapter integer,

  created_at timestamptz default timezone('utc', now()) not null,

  unique(novel_id, character_a_id, character_b_id, chapter_established)
);

create index idx_character_relationships_novel_id on character_relationships(novel_id);
create index idx_character_relationships_chars on character_relationships(character_a_id, character_b_id);


-- =============================================================================
-- TIMELINE EVENTS (Event Timeline)
-- =============================================================================
create table timeline_events (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  title text not null,
  description text,
  category text not null,
  importance text default 'standard',

  chapter_start integer not null,
  chapter_end integer not null,

  characters_involved text[],
  ai_note text,

  icon text,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_timeline_events_novel_id on timeline_events(novel_id);
create index idx_timeline_events_chapters on timeline_events(novel_id, chapter_start);


-- =============================================================================
-- CONCEPT ENTRIES (Concept Index)
-- =============================================================================
create table concept_entries (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  name text not null,
  category text not null,
  tier text,

  short_description text,
  detailed_description text,

  metadata jsonb,

  first_introduced_chapter integer,
  diagram_type text,

  is_user_created boolean default false,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_concept_entries_novel_id on concept_entries(novel_id);
create index idx_concept_entries_category on concept_entries(novel_id, category);

create trigger trg_concept_entries_updated_at
before update on concept_entries
for each row execute function update_updated_at_column();


-- =============================================================================
-- CONCEPT EVIDENCE (Concept Index — Source Citations)
-- =============================================================================
create table concept_evidence (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references concept_entries(id) on delete cascade not null,

  chapter_number integer not null,
  chapter_title text,
  verbatim_quote text not null,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_concept_evidence_entry_id on concept_evidence(entry_id);
