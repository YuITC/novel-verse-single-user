# Reader Page — Functional Specification

> **Screens:** Novel Details (`/novel/:id`) + Reader Mode (`/reader/:novelId/:chapterId`)
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Two interconnected views: (1) a novel details page for browsing metadata and chapter lists, and (2) an immersive reader mode for reading chapter content with customizable experience settings and TTS.

---

## 1. Screen 1 — Novel Details Page

**Route:** `/novel/:id`

The Novel Details page displays complete metadata for a single novel, its synopsis, and a paginated chapter list. It serves as the transition point between the Library and the Reader.

### 1.1 Page-Level Structure

| Zone             | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| **Header**       | Global navigation bar (shared across all pages)                 |
| **Hero Section** | Cover image + metadata + actions — horizontal flex layout       |
| **Chapters**     | Sortable, paginated list of all chapters belonging to the novel |

### 1.2 Hero Section

**Layout:** Horizontal flex on desktop (`flex-row`), stacked on mobile (`flex-col`). Gap: `gap-10`.

#### 1.2.1 Cover Image (Left)

| Property    | Value                                     |
| ----------- | ----------------------------------------- |
| Width       | `w-64` (md) / `w-80` (lg), full on mobile |
| Aspect      | `aspect-[2/3]`                            |
| Corners     | `rounded-2xl`                             |
| Shadow      | `shadow-md`                               |
| Border      | `border border-slate-200`                 |
| Image fit   | `bg-cover bg-center bg-no-repeat`         |
| Data source | `novels.cover_url`                        |

#### 1.2.2 Metadata Panel (Right)

**Structure (top to bottom):**

```
Title (h1)
Author · Chapter Count · Last Updated · Source URL
[GENRE] [GENRE] [GENRE]
[Read Now]  [Check Status]          [Edit] [Translate] [Delete]
Synopsis
  paragraph...
```

**Data Mapping:**

| UI Element       | Source                                                    | Format                                                             |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Title            | `novels.title_translated ?? novels.title_raw`             | `text-4xl lg:text-5xl font-bold`, `leading-tight`                  |
| Author           | `novels.author_translated ?? novels.author_raw`           | `person` icon + text, `text-sm font-medium text-slate-600`         |
| Chapter Count    | `novels.total_chapters`                                   | `menu_book` icon + `"N Chapters"`                                  |
| Last Updated     | `novels.last_updated_at`                                  | `update` icon + relative time (e.g., `"2h ago"`)                   |
| Source URL       | `novels.source_url`                                       | `link` icon + `"Source URL"`, links to `source_url`, primary color |
| Genres           | `novels.genres[]`                                         | Uppercase bordered badges (same as library card)                   |
| Synopsis heading | Static `"Synopsis"`                                       | `text-lg font-semibold text-slate-900`                             |
| Synopsis body    | `novels.description_translated ?? novels.description_raw` | Prose content, `text-slate-600 leading-relaxed`                    |

#### 1.2.3 Action Buttons

| Button           | Icon        | Style                                                         | Behavior                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Read Now**     | `menu_book` | Primary fill (`bg-primary text-white rounded-xl`), bold       | Navigate to reader at `current_chapter_id` or chapter 1 if none          |
| **Check Status** | `sync`      | Outlined (`bg-white border border-slate-200 rounded-xl`)      | Trigger status check for new chapters from source                        |
| **Edit**         | `edit`      | Icon-only square (`size-12`), outlined, `rounded-xl`          | Open novel metadata edit modal                                           |
| **Translate**    | `translate` | Icon-only square (`size-12`), outlined, `rounded-xl`          | Trigger AI translation for untranslated fields                           |
| **Delete**       | `delete`    | Icon-only square (`size-12`), red-tinted border, `rounded-xl` | Delete novel with confirmation dialog (cascades chapters, library entry) |

**Layout:** Read Now and Check Status are left-aligned; Edit, Translate, Delete are right-aligned (`ml-auto`).

### 1.3 Chapter List Section

#### 1.3.1 Section Header

```
Chapters                               [Newest] [Oldest]
────────────────────────────────────────────────────────
```

- **Title:** `"Chapters"`, `text-2xl font-bold`.
- **Sort Toggle:** Pill group (`bg-white border rounded-lg p-1 shadow-sm`).
  - **Active:** `bg-slate-100 text-slate-900 font-semibold rounded-md`.
  - **Inactive:** `text-slate-500 font-medium`, hover: `text-slate-900`.
- **Divider:** `border-b border-slate-200` below header.
- **Default sort:** Newest first (descending `chapter_index`).

#### 1.3.2 Chapter Row

Each row is a clickable link navigating to the reader for that chapter.

**Structure:**

```
[chapter_index]   Chapter Title                          Time Ago
```

**Data Mapping:**

| UI Element    | Source                                            | Style                                                  |
| ------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Chapter Index | `chapters.chapter_index`                          | `w-12 text-sm font-semibold text-slate-400`            |
| Chapter Title | `chapters.title_translated ?? chapters.title_raw` | `font-medium text-slate-800`, hover: `text-primary`    |
| Time          | `chapters.created_at`                             | `text-sm text-slate-500`, right-aligned, relative time |

**Row Styling:**

| Property   | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Padding    | `p-4`                                                    |
| Background | `bg-white`                                               |
| Border     | `border border-slate-100 rounded-xl`                     |
| Hover      | `border-slate-300`, `shadow-sm`                          |
| Transition | `transition-all`                                         |
| Gap        | `gap-3` between rows                                     |
| Opacity    | Older chapters (beyond a threshold) fade to `opacity-70` |
| Layout     | `flex-col sm:flex-row sm:items-center justify-between`   |

**Click Behavior:** Navigate to `/reader/:novelId/:chapterId`.

#### 1.3.3 Load More

- **Button:** `"Load More Chapters"`, full-width, dashed border (`border-2 border-dashed border-slate-200`).
- **Style:** `text-slate-500 font-medium rounded-xl`.
- **Hover:** `bg-slate-50 text-slate-700`.
- **Behavior:** Fetch next page of chapters and append to list.
- **Pagination:** Offset-based, loading N chapters per page (e.g., 20). Button hidden when all chapters are loaded.

---

## 2. Screen 2 — Reader Mode Page

**Route:** `/reader/:novelId/:chapterId`

A full-viewport, immersive reading experience with a three-panel layout. The screen fills 100vh with no external scrolling — only the content column scrolls.

### 2.1 Page-Level Structure

| Zone               | Visibility              | Description                                |
| ------------------ | ----------------------- | ------------------------------------------ |
| **Top Bar**        | Always visible          | Novel/chapter info + action buttons        |
| **Left Sidebar**   | `hidden lg:flex`, 320px | Chapter navigation + bookmarks tabs        |
| **Content Column** | Always visible          | Chapter text + prev/next navigation        |
| **Right Sidebar**  | `hidden xl:flex`, 320px | Reading experience settings + TTS controls |

**Layout:** `h-screen flex flex-col overflow-hidden`. The three-panel area uses `flex-1 overflow-hidden relative`.

### 2.2 Top Bar (Header)

**Height:** Auto, sticky at top. `bg-white border-b border-slate-200 shadow-sm z-10`.

**Structure:**

```
[←]  NOVEL TITLE (uppercase, small)                [Edit] [Translate] [Bookmark] [TTS]
     Chapter N: Chapter Title
```

**Left Side:**

| Element       | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| Back button   | `arrow_back` icon, `p-2 rounded-full hover:bg-slate-100 text-slate-600` |
| Novel title   | `text-xs font-semibold text-slate-500 uppercase tracking-wider`         |
| Chapter title | `text-sm font-medium text-slate-900`                                    |

**Right Side — Action Icons:**

| Button    | Icon              | Title              | Behavior                                                                 |
| --------- | ----------------- | ------------------ | ------------------------------------------------------------------------ |
| Edit      | `edit`            | `"Edit"`           | Open chapter content editor                                              |
| Translate | `translate`       | `"Translate"`      | Trigger AI translation for this chapter                                  |
| Bookmark  | `bookmark_border` | `"Bookmark"`       | Toggle bookmark for current chapter. Filled when bookmarked (`bookmark`) |
| TTS       | `volume_up`       | `"Text-to-Speech"` | Toggle TTS playback for current chapter                                  |

All action buttons: `p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors`.

### 2.3 Left Sidebar — Chapter Navigation

**Width:** `w-80`, `bg-white border-r border-slate-200`. Hidden below `lg` breakpoint.

#### 2.3.1 Tab Bar

Two tabs at the top of the sidebar:

| Tab           | Active Style                                           | Inactive Style                                    |
| ------------- | ------------------------------------------------------ | ------------------------------------------------- |
| **Chapters**  | `text-primary border-b-2 border-primary font-semibold` | `text-slate-500 font-medium hover:text-slate-900` |
| **Bookmarks** | Same as active Chapters when selected                  | Same inactive style                               |

#### 2.3.2 Sort Controls

Below the tab bar: `bg-slate-50/50`, `p-4 border-b border-slate-100`.

- **Label:** `"SORT BY"` — `text-xs font-semibold text-slate-500 uppercase tracking-wider`.
- **Toggle:** `bg-slate-200/50 rounded-lg p-0.5` container with:
  - **Active:** `bg-white shadow-sm text-slate-900 font-semibold rounded-md`.
  - **Inactive:** `text-slate-600 font-medium`.

#### 2.3.3 Chapter List (Chapters Tab)

Scrollable area (`overflow-y-auto overflow-x-hidden`).

**Chapter Item:**

| Element       | Source                                            | Style                                                                    |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Chapter label | `"Chapter N"` from `chapters.chapter_index`       | `text-xs font-medium text-slate-400 mb-1`                                |
| Chapter title | `chapters.title_translated ?? chapters.title_raw` | `text-sm font-medium text-slate-700 line-clamp-2`, hover: `text-primary` |

**Active Chapter (currently reading):**

| Property   | Value                                   |
| ---------- | --------------------------------------- |
| Background | `bg-primary/5` (very faint purple tint) |
| Border     | `border border-primary/20`              |
| Label      | `text-xs font-semibold text-primary`    |
| Title      | `text-sm font-semibold text-slate-900`  |

**Click Behavior:** Navigate to that chapter (update route). Content column re-renders.

#### 2.3.4 Bookmark List (Bookmarks Tab)

When the Bookmarks tab is active, the list area shows bookmarked chapters for the current novel.

**Data Source:** `bookmarks` table filtered by `novel_id` + `user_id`, joined with `chapters`.

**Each bookmark item mirrors the chapter item style** but with a bookmark icon prefix.

### 2.4 Content Column — Chapter Text

**Layout:** `flex-1 h-full overflow-y-auto bg-background-light`.

**Container:** `max-w-3xl mx-auto px-8 py-16 md:px-12 lg:px-16 min-h-full flex flex-col`.

#### 2.4.1 Chapter Header

```
                    Chapter 1542
          The Final Confrontation (Part 3)
```

| Element        | Style                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Chapter number | `text-3xl md:text-4xl font-bold text-slate-900 text-center font-sans`              |
| Chapter title  | `text-2xl md:text-3xl text-slate-700 font-medium mt-4 block text-center font-sans` |
| Bottom margin  | `mb-12`                                                                            |

#### 2.4.2 Chapter Content

- **Wrapper:** `<article class="flex-1 font-serif">` — serif font for immersive reading.
- **Text styling:** `prose prose-lg prose-slate max-w-none text-slate-800 leading-relaxed space-y-6`.
- **Data source:** `chapters.content_translated ?? chapters.content_raw`.
- **Rendering:** Raw text split into paragraphs wrapped in `<p>` tags.
- **Font:** Merriweather (serif) for body. Chapter header uses Inter (sans-serif).

#### 2.4.3 Chapter Navigation Footer

Below the content, separated by a border:

```
──────────────────────────────────────────────────
[← Previous Chapter]                [Next Chapter →]
```

| Button           | Icon            | Style                                                  | Position |
| ---------------- | --------------- | ------------------------------------------------------ | -------- |
| Previous Chapter | `arrow_back`    | Outlined (`bg-white border rounded-xl text-slate-700`) | Left     |
| Next Chapter     | `arrow_forward` | Primary fill (`bg-primary text-white rounded-xl`)      | Right    |

- **Container:** `mt-20 pt-8 border-t border-slate-200 flex items-center justify-between font-sans`.
- **Disabled state:** When there is no previous/next chapter, the button is disabled and grayed out.
- **Click behavior:** Navigate to the adjacent chapter. Update `library_entries.current_chapter_id`.

### 2.5 Right Sidebar — Reading Experience Settings

**Width:** `w-80`, `bg-white border-l border-slate-200`. Hidden below `xl` breakpoint.

**Header:** `p-5 border-b border-slate-100`. Contains a `tune` icon + `"Reading Experience"` label.

**Content:** `p-6 space-y-8`, scrollable (`overflow-y-auto`).

#### 2.5.1 Font Family Selector

| Option         | Style when active                                              | Style when inactive                                 |
| -------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| **Serif**      | `border-2 border-primary bg-primary/5 text-primary font-serif` | `border border-slate-200 text-slate-600 font-serif` |
| **Sans-Serif** | Same active style with `font-sans`                             | Same inactive with `font-sans`                      |

**Layout:** `grid grid-cols-2 gap-3`. Buttons have `py-3 px-4 rounded-xl text-sm font-medium`.

**Behavior:** When user selects a font, the content column's `<article>` switches between `font-serif` and `font-sans`. Preference persisted to `reading_preferences`.

#### 2.5.2 Font Size Slider

- **Label:** `"FONT SIZE"` with current value display (e.g., `"18px"`).
- **Input:** `<input type="range" min="12" max="24" value="18">`.
- **Visual indicators:** Small `"A"` on left, large `"A"` on right.
- **Behavior:** Dynamically adjusts the `font-size` CSS of the content column. Persisted.

#### 2.5.3 Line Height Selector

Three options: Compact, Comfortable (default), Spacious.

| Option      | Icon                  | Mapping                   |
| ----------- | --------------------- | ------------------------- |
| Compact     | `format_line_spacing` | `leading-snug` (1.375)    |
| Comfortable | `format_line_spacing` | `leading-relaxed` (1.625) |
| Spacious    | `format_line_spacing` | `leading-loose` (2.0)     |

**Active style:** `border-2 border-primary bg-primary/5` with icon in `text-primary`.
**Layout:** `grid grid-cols-3 gap-2`.

#### 2.5.4 Paragraph Spacing Selector

Three options: Small (default), Med, Large.

| Option | Mapping      |
| ------ | ------------ |
| Small  | `space-y-4`  |
| Med    | `space-y-6`  |
| Large  | `space-y-10` |

**Active style:** Same as line height (`border-2 border-primary bg-primary/5 text-primary`).
**Layout:** `grid grid-cols-3 gap-2`.

#### 2.5.5 Theme Selector

Four theme options displayed as colored circles:

| Theme | Background Color | Text Color  | Circle Color                                              |
| ----- | ---------------- | ----------- | --------------------------------------------------------- |
| Light | `#fafafa`        | `slate-800` | `bg-[#fafafa]` with `border-2 border-primary` when active |
| Sepia | `#f4ecd8`        | `#5b4636`   | `bg-[#f4ecd8]`                                            |
| Dark  | `#1e293b`        | `slate-300` | `bg-[#1e293b]`                                            |
| OLED  | `#000000`        | `slate-400` | `bg-black`                                                |

**Active indicator:** `border-2 border-primary` ring + `check` icon inside circle + label in `text-primary`.
**Inactive:** `border border-slate-200`, label in `text-slate-500`.
**Layout:** `grid grid-cols-4 gap-3`. Each option: circle (`w-10 h-10 rounded-full`) + label below.

**Behavior:** Changes `background-color` and `color` of the content column. Persisted to `reading_preferences`.

#### 2.5.6 Text-to-Speech Section

Separated from reading settings by a `border-t border-slate-200 pt-8`.

**Header:** `record_voice_over` icon + `"Text-to-Speech"` label.

**Controls:**

| Control          | Type       | Options / Range                                                     | Default         |
| ---------------- | ---------- | ------------------------------------------------------------------- | --------------- |
| Voice Selection  | `<select>` | `Female - Soft`, `Male - Deep`, `Female - Energetic`, `Male - Calm` | `Female - Soft` |
| Speed Control    | `<range>`  | `0.5x` – `2.0x`, step `0.1`                                         | `1.0x`          |
| Pitch Adjustment | `<range>`  | `Low` – `High` (0 – 2), step `0.1`                                  | `Normal` (1.0)  |
| Auto-Scroll      | Toggle     | On/Off                                                              | On              |

**Voice Selection style:** `bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium`.
**Range slider style:** `h-1.5 bg-slate-200 rounded-lg accent-primary`.
**Toggle style:** Tailwind peer checkbox with `peer-checked:bg-primary` track.

**Behavior:** TTS uses the Web Speech API (`SpeechSynthesis`) or a cloud TTS service. Auto-scroll synchronizes the scroll position with the current spoken paragraph. Preferences persisted.

---

## 3. Data Layer

### 3.1 Database Tables (Relevant)

| Table                 | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `novels`              | Novel metadata (title, author, cover, genres, status, URL)        |
| `chapters`            | Chapter content and metadata (index, title, raw/translated text)  |
| `library_entries`     | Reading progress tracker (`current_chapter_id`, `reading_status`) |
| `bookmarks`           | Chapter-level bookmarks                                           |
| `reading_preferences` | **[NEW]** User-scoped reading settings (font, size, theme, TTS)   |

### 3.2 New Table: `reading_preferences`

The reader mode requires persistent user preferences. This requires a new table:

```sql
create table reading_preferences (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null unique,

  font_family text default 'serif',        -- 'serif' | 'sans-serif'
  font_size integer default 18,            -- 12–24 px
  line_height text default 'relaxed',      -- 'snug' | 'relaxed' | 'loose'
  paragraph_spacing text default 'small',  -- 'small' | 'medium' | 'large'
  theme text default 'light',              -- 'light' | 'sepia' | 'dark' | 'oled'

  -- TTS preferences
  tts_voice text default 'female-soft',
  tts_speed decimal default 1.0,
  tts_pitch decimal default 1.0,
  tts_auto_scroll boolean default true,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create trigger trg_reading_preferences_updated_at
before update on reading_preferences
for each row execute function update_updated_at_column();
```

### 3.3 API Endpoints

#### 3.3.1 Novel Details

| Method   | Endpoint          | Description                                             |
| -------- | ----------------- | ------------------------------------------------------- |
| `GET`    | `/api/novels/:id` | Fetch novel with full metadata                          |
| `PATCH`  | `/api/novels/:id` | Update novel metadata (edit modal)                      |
| `DELETE` | `/api/novels/:id` | Delete novel and cascade (chapters, library, bookmarks) |

**GET `/api/novels/:id` Response Shape:**

```ts
interface NovelDetail {
  id: string;
  title: string; // title_translated ?? title_raw
  title_raw: string;
  author: string; // author_translated ?? author_raw
  author_raw: string;
  cover_url: string | null;
  source_url: string | null;
  source_origin: string | null;
  description: string; // description_translated ?? description_raw
  description_raw: string;
  genres: string[];
  publication_status: string;
  total_chapters: number;
  total_words: number;
  last_updated_at: string | null;
  created_at: string;
}
```

#### 3.3.2 Chapters

| Method  | Endpoint                   | Description                                    |
| ------- | -------------------------- | ---------------------------------------------- | ------------------------- |
| `GET`   | `/api/novels/:id/chapters` | Paginated chapter list. Supports `?sort=newest | oldest&offset=0&limit=20` |
| `GET`   | `/api/chapters/:id`        | Fetch single chapter with content              |
| `PATCH` | `/api/chapters/:id`        | Update chapter content (via editor)            |

**GET `/api/novels/:id/chapters` Response Shape:**

```ts
interface ChapterListItem {
  id: string;
  chapter_index: number;
  title: string; // title_translated ?? title_raw
  is_translated: boolean;
  created_at: string;
}
```

**GET `/api/chapters/:id` Response Shape:**

```ts
interface ChapterDetail {
  id: string;
  novel_id: string;
  chapter_index: number;
  title: string;
  title_raw: string;
  content: string; // content_translated ?? content_raw
  content_raw: string;
  is_translated: boolean;
  created_at: string;
  // Navigation helpers
  prev_chapter_id: string | null;
  next_chapter_id: string | null;
}
```

#### 3.3.3 Bookmarks

| Method   | Endpoint                      | Description                                |
| -------- | ----------------------------- | ------------------------------------------ |
| `POST`   | `/api/bookmarks`              | Create bookmark `{ novel_id, chapter_id }` |
| `DELETE` | `/api/bookmarks/:id`          | Remove bookmark                            |
| `GET`    | `/api/bookmarks?novel_id=:id` | Get bookmarks for a specific novel         |

#### 3.3.4 Reading Preferences

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| `GET`  | `/api/preferences` | Get user's reading preferences       |
| `PUT`  | `/api/preferences` | Create or update reading preferences |

**GET/PUT `/api/preferences` Shape:**

```ts
interface ReadingPreferences {
  font_family: "serif" | "sans-serif";
  font_size: number;
  line_height: "snug" | "relaxed" | "loose";
  paragraph_spacing: "small" | "medium" | "large";
  theme: "light" | "sepia" | "dark" | "oled";
  tts_voice: string;
  tts_speed: number;
  tts_pitch: number;
  tts_auto_scroll: boolean;
}
```

#### 3.3.5 Reading Progress

| Method  | Endpoint           | Description                                              |
| ------- | ------------------ | -------------------------------------------------------- |
| `PATCH` | `/api/library/:id` | Update `current_chapter_id` when user navigates chapters |

---

## 4. User Flows

### 4.1 Open Novel Details from Library

1. User clicks a novel card in the Library.
2. App navigates to `/novel/:id`.
3. Novel details, synopsis, and chapter list load.

### 4.2 Start Reading

1. User clicks `"Read Now"` on the novel details page.
2. If `library_entries.current_chapter_id` exists → navigate to that chapter.
3. If no current chapter → navigate to chapter 1 (lowest `chapter_index`).
4. App navigates to `/reader/:novelId/:chapterId`.

### 4.3 Navigate Between Chapters

1. User clicks "Previous Chapter" or "Next Chapter" footer buttons.
2. App navigates to the adjacent chapter.
3. `library_entries.current_chapter_id` is updated via `PATCH /api/library/:id`.
4. Content column scrolls to top.

### 4.4 Navigate via Sidebar

1. User clicks a chapter in the left sidebar list.
2. Content column loads the selected chapter.
3. Sidebar highlights the newly active chapter.
4. `library_entries.current_chapter_id` is updated.

### 4.5 Toggle Bookmark

1. User clicks the bookmark icon in the top bar.
2. If not bookmarked → `POST /api/bookmarks`.
3. If already bookmarked → `DELETE /api/bookmarks/:id`.
4. Icon toggles between `bookmark_border` (empty) and `bookmark` (filled).

### 4.6 Adjust Reading Settings

1. User changes any setting in the right sidebar.
2. Change applies immediately to the content column (optimistic UI).
3. Debounced `PUT /api/preferences` call persists the change (300ms debounce).
4. On next visit, preferences are loaded via `GET /api/preferences`.

### 4.7 Use Text-to-Speech

1. User clicks the TTS icon in the top bar (or adjusts TTS settings in sidebar).
2. TTS begins reading from the current paragraph.
3. If auto-scroll is enabled, the content column scrolls to follow the spoken text.
4. User can pause/resume via the TTS icon.
5. Speed and pitch adjustments take effect immediately.

### 4.8 Sort Chapters

1. User clicks "Newest" or "Oldest" toggle in the chapter list header (details page) or sidebar.
2. Chapter list re-sorts client-side.
3. Active sort button highlights.

---

## 5. Responsive Behavior

| Breakpoint               | Layout Changes                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `< 640px` (mobile)       | Novel details: stacked (cover full-width above metadata). Chapter rows stack vertically. Reader: both sidebars hidden, full-width content. |
| `640px – 1023px` (sm/md) | Novel details: horizontal layout. Reader: both sidebars hidden.                                                                            |
| `1024px – 1279px` (lg)   | Reader: left sidebar visible, right sidebar hidden. Nav links visible.                                                                     |
| `≥ 1280px` (xl)          | Reader: both sidebars visible. Full three-panel layout.                                                                                    |

**Mobile Reader Considerations:**

- Navigation between chapters via swipe gestures or footer buttons only.
- Reading settings accessible via a bottom sheet or modal triggered by a floating action button.
- Chapter list accessible via a slide-out drawer.

---

## 6. Empty & Edge States

| Scenario                | Display                                                         |
| ----------------------- | --------------------------------------------------------------- |
| Novel has 0 chapters    | Chapter list shows `"No chapters available yet"` message        |
| Chapter has no content  | Content area shows `"This chapter has no content"` placeholder  |
| No bookmarks for novel  | Bookmarks tab shows `"No bookmarks for this novel"`             |
| First chapter (no prev) | "Previous Chapter" button disabled/hidden                       |
| Last chapter (no next)  | "Next Chapter" button disabled/hidden                           |
| Content not translated  | Show raw content with a `"Not yet translated"` indicator        |
| Preferences not set     | Use defaults (serif, 18px, relaxed, small spacing, light theme) |
