-- =============================================================================
-- CRAWL JOBS
-- =============================================================================

create table crawl_jobs (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,

  source_url text not null,

  status text not null default 'pending',
  -- Allowed values: 'pending', 'running', 'completed', 'failed', 'cancelled'

  total_chapters integer default 0,
  successful_chapters integer default 0,
  failed_chapters integer default 0,

  error_message text,

  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_crawl_jobs_user_id on crawl_jobs(user_id);
create index idx_crawl_jobs_novel_id on crawl_jobs(novel_id);

-- =============================================================================
-- TRIGGER updated_at
-- =============================================================================

create trigger trg_crawl_jobs_updated_at
before update on crawl_jobs
for each row execute function update_updated_at_column();
