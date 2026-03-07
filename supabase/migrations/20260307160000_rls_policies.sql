-- =============================================================================
-- ENABLE ROW LEVEL SECURITY & DEFINE POLICIES
-- =============================================================================
-- Migration: 20260307160000_rls_policies.sql
-- Description: Enables RLS and sets default 'owner-only' policies for all tables.

-- =============================================================================
-- 1. CORE TABLES (HAVE user_id)
-- =============================================================================

-- openrouter_keys
alter table openrouter_keys enable row level security;
create policy "Users can perform all actions on their own keys"
on openrouter_keys for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- novels
alter table novels enable row level security;
create policy "Users can perform all actions on their own novels"
on novels for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- chapters
alter table chapters enable row level security;
create policy "Users can perform all actions on their own chapters"
on chapters for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- chunks
alter table chunks enable row level security;
create policy "Users can perform all actions on their own chunks"
on chunks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- library_entries
alter table library_entries enable row level security;
create policy "Users can perform all actions on their own library entries"
on library_entries for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- collections
alter table collections enable row level security;
create policy "Users can perform all actions on their own collections"
on collections for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- collection_novels
alter table collection_novels enable row level security;
create policy "Users can perform all actions on their own collection items"
on collection_novels for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- bookmarks
alter table bookmarks enable row level security;
create policy "Users can perform all actions on their own bookmarks"
on bookmarks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- reading_preferences
alter table reading_preferences enable row level security;
create policy "Users can perform all actions on their own reading preferences"
on reading_preferences for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- crawl_jobs
alter table crawl_jobs enable row level security;
create policy "Users can perform all actions on their own crawl jobs"
on crawl_jobs for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- chat_sessions
alter table chat_sessions enable row level security;
create policy "Users can perform all actions on their own chat sessions"
on chat_sessions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- group_chat_sessions
alter table group_chat_sessions enable row level security;
create policy "Users can perform all actions on their own group chat sessions"
on group_chat_sessions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- qa_sessions
alter table qa_sessions enable row level security;
create policy "Users can perform all actions on their own qa sessions"
on qa_sessions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =============================================================================
-- 2. CHILD TABLES (NO user_id DIRECTLY - USING JOINED POLICIES)
-- =============================================================================

-- embeddings
alter table embeddings enable row level security;
create policy "Users can access embeddings via parent chunk"
on embeddings for all
to authenticated
using (exists (select 1 from chunks where id = chunk_id and user_id = auth.uid()));

-- characters
alter table characters enable row level security;
create policy "Users can access characters via parent novel"
on characters for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- character_states
alter table character_states enable row level security;
create policy "Users can access character states via parent character"
on character_states for all
to authenticated
using (exists (
  select 1 from characters c 
  join novels n on c.novel_id = n.id 
  where c.id = character_id and n.user_id = auth.uid()
));

-- chat_messages
alter table chat_messages enable row level security;
create policy "Users can access chat messages via parent session"
on chat_messages for all
to authenticated
using (exists (select 1 from chat_sessions where id = session_id and user_id = auth.uid()));

-- group_chat_members
alter table group_chat_members enable row level security;
create policy "Users can access group chat members via parent session"
on group_chat_members for all
to authenticated
using (exists (select 1 from group_chat_sessions where id = session_id and user_id = auth.uid()));

-- group_chat_messages
alter table group_chat_messages enable row level security;
create policy "Users can access group chat messages via parent session"
on group_chat_messages for all
to authenticated
using (exists (select 1 from group_chat_sessions where id = session_id and user_id = auth.uid()));

-- group_chat_memory
alter table group_chat_memory enable row level security;
create policy "Users can access group chat memory via parent session"
on group_chat_memory for all
to authenticated
using (exists (select 1 from group_chat_sessions where id = session_id and user_id = auth.uid()));

-- novel_chunks
alter table novel_chunks enable row level security;
create policy "Users can access novel chunks via parent novel"
on novel_chunks for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- story_arcs
alter table story_arcs enable row level security;
create policy "Users can access story arcs via parent novel"
on story_arcs for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- qa_messages
alter table qa_messages enable row level security;
create policy "Users can access qa messages via parent session"
on qa_messages for all
to authenticated
using (exists (select 1 from qa_sessions where id = session_id and user_id = auth.uid()));

-- character_relationships
alter table character_relationships enable row level security;
create policy "Users can access relationships via parent novel"
on character_relationships for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- timeline_events
alter table timeline_events enable row level security;
create policy "Users can access timeline events via parent novel"
on timeline_events for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- concept_entries
alter table concept_entries enable row level security;
create policy "Users can access concepts via parent novel"
on concept_entries for all
to authenticated
using (exists (select 1 from novels where id = novel_id and user_id = auth.uid()));

-- concept_evidence
alter table concept_evidence enable row level security;
create policy "Users can access concept evidence via parent concept entry"
on concept_evidence for all
to authenticated
using (exists (
  select 1 from concept_entries e
  join novels n on e.novel_id = n.id 
  where e.id = entry_id and n.user_id = auth.uid()
));
