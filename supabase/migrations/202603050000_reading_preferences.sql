-- =============================================================================
-- READING PREFERENCES
-- =============================================================================

create table reading_preferences (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null unique,

  -- Display settings
  font_family text default 'serif',           -- 'serif' | 'sans-serif'
  font_size integer default 18,               -- 12–24 px
  line_height text default 'relaxed',         -- 'snug' | 'relaxed' | 'loose'
  paragraph_spacing text default 'small',     -- 'small' | 'medium' | 'large'
  theme text default 'light',                 -- 'light' | 'sepia' | 'dark' | 'oled'

  -- TTS settings
  tts_voice text default 'female-soft',
  tts_speed decimal default 1.0,
  tts_pitch decimal default 1.0,
  tts_auto_scroll boolean default true,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_reading_preferences_user_id on reading_preferences(user_id);

-- =============================================================================
-- TRIGGER updated_at
-- =============================================================================

create trigger trg_reading_preferences_updated_at
before update on reading_preferences
for each row execute function update_updated_at_column();
