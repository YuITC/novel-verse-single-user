-- Enable pgvector
create extension if not exists vector;

-- =============================================================================
-- OPENROUTER KEYS
-- =============================================================================

create table openrouter_keys (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,

  label text not null,
  key_value text not null,

  is_active boolean default true,

  -- OpenRouter metadata
  limit_total decimal,
  limit_remaining decimal,
  usage_total decimal default 0,

  created_at timestamptz default timezone('utc', now()) not null
);

-- =============================================================================
-- NOVELS
-- =============================================================================

create table novels (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,

  source_url text, -- e.g. https://www.wuxiaworld.com/novel/a-will-eternal
  source_origin text, -- e.g. https://www.wuxiaworld.com/

  title_raw text not null,
  title_translated text,

  author_raw text,
  author_translated text,

  cover_url text,

  description_raw text,
  description_translated text,

  genres text[],

  publication_status text, -- ongoing, completed, cancelled
  reading_status text, -- reading, completed, dropped, read-later

  total_chapters integer default 0,
  total_words integer default 0,

  last_updated_at timestamptz,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- =============================================================================
-- CHAPTERS
-- =============================================================================

create table chapters (
  id uuid default gen_random_uuid() primary key,

  novel_id uuid references novels(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,

  chapter_index integer not null,

  title_raw text not null,
  title_translated text,

  content_raw text,
  content_translated text,

  is_translated boolean default false,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,

  unique (novel_id, chapter_index)
);

-- =============================================================================
-- CHUNKS (RAG TEXT STORAGE)
-- =============================================================================

create table chunks (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,

  chunk_index integer not null,

  content text not null,

  token_count integer,

  created_at timestamptz default timezone('utc', now()) not null
);

-- =============================================================================
-- EMBEDDINGS (VECTOR STORAGE)
-- =============================================================================

create table embeddings (
  chunk_id uuid primary key
    references chunks(id) on delete cascade,

  embedding vector(1024) not null
);

-- =============================================================================
-- LIBRARY
-- =============================================================================

create table library_entries (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,

  current_chapter_id uuid references chapters(id),

  reading_status text default 'reading',

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,

  unique (user_id, novel_id)
);

-- =============================================================================
-- COLLECTIONS
-- =============================================================================

create table collections (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,

  title text not null,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table collection_novels (
  collection_id uuid references collections(id) on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,

  created_at timestamptz default timezone('utc', now()) not null,

  primary key (collection_id, novel_id)
);

-- =============================================================================
-- BOOKMARKS
-- =============================================================================

create table bookmarks (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,

  novel_id uuid references novels(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,

  created_at timestamptz default timezone('utc', now()) not null,

  unique (user_id, novel_id, chapter_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_chapters_novel_id on chapters(novel_id);
create index idx_chapters_user_id on chapters(user_id);

create index idx_chunks_novel_id on chunks(novel_id);
create index idx_chunks_chapter_id on chunks(chapter_id);

-- Vector index (HNSW)
create index idx_embeddings_hnsw
on embeddings
using hnsw (embedding vector_cosine_ops);

create index idx_library_user_id on library_entries(user_id);

create index idx_bookmarks_user_id on bookmarks(user_id);
create index idx_bookmarks_novel_id on bookmarks(novel_id);

-- =============================================================================
-- TRIGGER updated_at
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger trg_novels_updated_at
before update on novels
for each row execute function update_updated_at_column();

create trigger trg_chapters_updated_at
before update on chapters
for each row execute function update_updated_at_column();

create trigger trg_library_updated_at
before update on library_entries
for each row execute function update_updated_at_column();

create trigger trg_collections_updated_at
before update on collections
for each row execute function update_updated_at_column();