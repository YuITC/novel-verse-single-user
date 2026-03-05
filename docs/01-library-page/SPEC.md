# Library Page — Functional Specification

> **Route:** `/library`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Central hub for managing the user's personal novel collection, organized by reading status, custom collections, and chapter-level bookmarks.

---

## 1. Page-Level Structure

The Library page is a single-page view with **tab-based navigation** that switches the main content area. The layout is composed of three zones:

| Zone             | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| **Header**       | Global navigation bar (shared across all pages)            |
| **Page Header**  | Title ("My Library"), subtitle, tab bar, and action button |
| **Content Area** | Tab-dependent content rendered below the tab bar           |

### 1.1 Page Header

- **Title:** `"My Library"` — static, always visible.
- **Subtitle:** Changes per active tab:
  - Tabs `All`, `Reading`, `Completed`, `On Hold`: `"Continue reading your favorite web novels"`
  - Tab `My Collections`: `"Continue reading your favorite web novels"`
  - Tab `My Bookmarks`: `"Manage your saved reading positions"`
- **Tab Bar:** Horizontal, scrollable on mobile. Contains 6 tabs.
- **Action Button:** `"+ Create Collections"` — pill-shaped, positioned to the right of the tab bar on the same row.

---

## 2. Tab System

### 2.1 Tab Definitions

| Tab Label          | Filter Logic                                   | Content Component    |
| ------------------ | ---------------------------------------------- | -------------------- |
| **All**            | All novels in the user's library               | `NovelCardGrid`      |
| **Reading**        | `library_entries.reading_status = 'reading'`   | `NovelCardGrid`      |
| **Completed**      | `library_entries.reading_status = 'completed'` | `NovelCardGrid`      |
| **On Hold**        | `library_entries.reading_status = 'on-hold'`   | `NovelCardGrid`      |
| **My Collections** | User-created collections                       | `CollectionCardGrid` |
| **My Bookmarks**   | All bookmarks grouped by novel                 | `BookmarkList`       |

### 2.2 Tab Behavior

- **Active indicator:** Bottom border (`border-b-2 border-slate-900`) with `font-semibold` text.
- **Inactive state:** `text-slate-500`, `font-medium`, `border-transparent`.
- **Hover:** Inactive tabs transition to `text-slate-800`.
- **State management:** Tab state is managed via URL query parameter (e.g., `?tab=collections`) or client-side state. Default tab is `All`.
- **Horizontal scroll:** On small screens, the tab bar scrolls horizontally with hidden scrollbar (`no-scrollbar`).

---

## 3. Content Views

### 3.1 Novel Card Grid (Tabs: All, Reading, Completed, On Hold)

**Layout:** 2-column grid on `xl` screens (`grid-cols-1 xl:grid-cols-2`), single column on smaller screens. Gap: `gap-6 md:gap-8`.

#### 3.1.1 Novel Card — Component Specification

Each card represents one `library_entries` row joined with `novels` and `chapters`.

**Structure:**

```
┌─────────────────────────────────────────────────┐
│  ┌─────────┐  Title                    [⋮]     │
│  │  Cover   │  ✦ Author  📖 N Ch.  🕐 Time    │
│  │  Image   │  Description (2-line clamp)       │
│  │          │  ──────────────────────────        │
│  └─────────┘  [TAG] [TAG]      Action Button →  │
└─────────────────────────────────────────────────┘
```

**Data Mapping:**

| UI Element    | Source                                                    | Format                                          |
| ------------- | --------------------------------------------------------- | ----------------------------------------------- |
| Cover Image   | `novels.cover_url`                                        | `aspect-[3/4]`, `rounded-xl`, `w-36` (desktop)  |
| Title         | `novels.title_translated ?? novels.title_raw`             | Truncated, single line                          |
| Author        | `novels.author_translated ?? novels.author_raw`           | Prefixed with person icon                       |
| Chapter Count | `novels.total_chapters`                                   | Formatted as `"N Ch."`                          |
| Last Activity | `library_entries.updated_at`                              | Relative time (e.g., `"2h ago"`, `"Yesterday"`) |
| Description   | `novels.description_translated ?? novels.description_raw` | 2-line clamp (`line-clamp-2`)                   |
| Genre Tags    | `novels.genres[]`                                         | Uppercase, bordered badges                      |
| More Button   | —                                                         | Vertical ellipsis icon (`more_vert`), top-right |

#### 3.1.2 Card Action Button — Status-Dependent

The primary action button in the bottom-right corner varies based on `library_entries.reading_status`:

| Reading Status | Button Label   | Icon            | Behavior                                   | Style                             |
| -------------- | -------------- | --------------- | ------------------------------------------ | --------------------------------- |
| `reading`      | `"Continue"`   | `arrow_forward` | Navigate to reader at `current_chapter_id` | `text-primary`, `font-semibold`   |
| `on-hold`      | `"Read"`       | `arrow_forward` | Navigate to reader at `current_chapter_id` | `text-primary`, `font-semibold`   |
| `completed`    | `"Read Again"` | `refresh`       | Navigate to reader at chapter 1            | `text-slate-500`, `font-semibold` |
| `read-later`   | `"Read"`       | `arrow_forward` | Navigate to reader at chapter 1            | `text-primary`, `font-semibold`   |

#### 3.1.3 Card Visual States

| State                              | Visual Treatment                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Active novel** (reading/on-hold) | Full opacity, `bg-white`, normal shadow                                                                                                                                       |
| **Completed novel**                | Cover: `grayscale-[0.5] opacity-80`, card: `bg-white/60`, title: `text-slate-700`, reduced shadow. Status chip: `text-emerald-600` with `done_all` icon showing `"Completed"` |
| **Hover**                          | Title transitions to `text-primary`, shadow intensifies                                                                                                                       |

#### 3.1.4 Card Context Menu (More Button `⋮`)

The `more_vert` button opens a context menu (dropdown or modal) with the following actions:

| Action                  | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Change Status**       | Switch `reading_status` between `reading`, `on-hold`, `completed`, `read-later` |
| **Add to Collection**   | Open collection picker to add the novel                                         |
| **Remove from Library** | Delete the `library_entries` row (with confirmation)                            |

---

### 3.2 Collection Card Grid (Tab: My Collections)

**Layout:** Responsive 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Gap: `gap-6 md:gap-8`.

#### 3.2.1 Collection Card — Component Specification

Each card represents one `collections` row with its associated `collection_novels`.

**Structure:**

```
┌──────────────────────────┐
│                          │
│   [back]  [FRONT]  [back]│   ← Stacked cover fan
│                          │
│    Collection Title       │
│    N stories              │
└──────────────────────────┘
```

**Cover Fan Layout:**

A visual stack of up to 3 novel covers arranged in a fan pattern:

| Layer        | Position                      | Style                                                |
| ------------ | ----------------------------- | ---------------------------------------------------- |
| Back-left    | `-translate-x-10`, `scale-90` | `opacity-60`, `w-20`, `z-10`                         |
| Back-right   | `translate-x-10`, `scale-90`  | `opacity-60`, `w-20`, `z-10`                         |
| Front-center | centered                      | `w-24`, `z-20`, `border-2 border-white`, `shadow-md` |

All covers use `aspect-[2/3]`, `rounded-lg`. The fan container has a fixed height of `h-44`.

**Data Mapping:**

| UI Element             | Source                                              | Format                                          |
| ---------------------- | --------------------------------------------------- | ----------------------------------------------- |
| Cover images (up to 3) | First 3 `novels.cover_url` from `collection_novels` | Fan layout                                      |
| Title                  | `collections.title`                                 | Truncated, single line, `text-[17px] font-bold` |
| Story count            | `COUNT(collection_novels)`                          | `"N stories"`                                   |

**Interactions:**

- **Click card:** Navigate to a filtered view showing only novels within that collection.
- **Hover:** Title transitions to `text-primary`, shadow intensifies.
- **Empty collection:** Show a placeholder illustration or default covers.

#### 3.2.2 Create Collection Flow

Triggered by the `"+ Create Collections"` button.

| Step       | UI             | Action                                    |
| ---------- | -------------- | ----------------------------------------- |
| 1. Trigger | Click button   | Open modal/dialog                         |
| 2. Input   | Text field     | User enters collection title              |
| 3. Submit  | Confirm button | `INSERT INTO collections(user_id, title)` |
| 4. Result  | Refresh grid   | New collection card appears               |

---

### 3.3 Bookmark List (Tab: My Bookmarks)

**Layout:** Vertical list of bookmark groups. Each group represents one novel with its bookmarked chapters listed beneath. Gap between groups: `gap-12`.

#### 3.3.1 Bookmark Group — Component Specification

**Structure:**

```
╔══════════════════════════════════════════════════════╗
║ [Cover]  Novel Title                                  ║
╠══════════════════════════════════════════════════════╣
║ 🔖 Chapter N  |  Chapter Title              Date    ║
║ 🔖 Chapter N  |  Chapter Title              Date    ║
║ 🔖 Chapter N  |  Chapter Title              Date    ║
╚══════════════════════════════════════════════════════╝
```

**Novel Header:**

| UI Element      | Source                                        | Style                                             |
| --------------- | --------------------------------------------- | ------------------------------------------------- |
| Cover thumbnail | `novels.cover_url`                            | `w-12 h-16`, `rounded-md`, with border and shadow |
| Novel title     | `novels.title_translated ?? novels.title_raw` | `text-xl font-bold`                               |

**Bookmark Row:**

Each row is a clickable link that navigates to the reader at the bookmarked chapter.

| UI Element     | Source                                            | Style                                                                                                    |
| -------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Bookmark icon  | —                                                 | `bookmark` Material icon, `text-primary/80`                                                              |
| Chapter number | `chapters.chapter_index`                          | `text-sm font-bold`, hover: `text-primary`                                                               |
| Separator      | —                                                 | `"                                                                                                       | "`pipe character,`text-slate-300` (hidden on mobile) |
| Chapter title  | `chapters.title_translated ?? chapters.title_raw` | `text-sm text-slate-600 font-medium`                                                                     |
| Date           | `bookmarks.created_at`                            | `text-xs text-slate-400`, right-aligned. Formatted as `"MMM DD, YYYY"` or relative (e.g., `"Yesterday"`) |
| More button    | —                                                 | `more_horiz` icon, hidden by default, visible on hover (`opacity-0 group-hover:opacity-100`)             |

**Interactions:**

- **Click row:** Navigate to reader at the specific `chapter_id`.
- **Hover:** Background transitions to `bg-slate-50`. Chapter number transitions to `text-primary`. More button becomes visible.
- **More button actions:**
  - **Remove bookmark:** `DELETE FROM bookmarks WHERE id = ?`

**Grouping & Sorting:**

- Bookmarks are grouped by `novel_id`.
- Within each group, chapters are sorted by `chapters.chapter_index` ascending.
- Groups are sorted by the most recent `bookmarks.created_at` within each group (most recent first).

---

## 4. Global Header (Shared Component)

The global header appears at the top of every page. Documented here for completeness.

### 4.1 Structure

```
[Logo] [Search]               [Nav Links]                [Avatar ▼]
```

### 4.2 Elements

| Element       | Description                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logo**      | `auto_stories` Material icon (primary color) + `"NovelVerse"` text (`text-xl font-bold`)                                                                                                     |
| **Search**    | Pill-shaped input (`rounded-full`), placeholder `"Search novels..."`. Hidden on mobile (`hidden md:flex`). `min-w-40 max-w-64`.                                                              |
| **Nav Links** | Hidden on mobile (`hidden lg:flex`). Links: `Library`, `Explore`, `Crawler`, `Uploader`, `AI Features`. Active link: `text-slate-900 font-semibold`. Inactive: `text-slate-500 font-medium`. |
| **Avatar**    | Circular avatar image (`size-9 rounded-full`). Border: `border-slate-200`.                                                                                                                   |
| **Dropdown**  | Appears on avatar hover. Contains: `Settings` (settings icon), `Log out` (logout icon). White bg, `rounded-xl`, shadow, `z-50`.                                                              |

### 4.3 Nav Link Routes

| Label       | Route       |
| ----------- | ----------- |
| Library     | `/library`  |
| Explore     | `/explore`  |
| Crawler     | `/crawler`  |
| Uploader    | `/uploader` |
| AI Features | `/ai`       |

---

## 5. Data Layer

### 5.1 Database Tables (Relevant)

| Table               | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `novels`            | Novel metadata (title, author, cover, genres, status, chapters count) |
| `library_entries`   | User's library membership + reading status + current chapter          |
| `collections`       | Named groups of novels                                                |
| `collection_novels` | M:N join between collections and novels                               |
| `bookmarks`         | Chapter-level bookmarks tied to a novel                               |
| `chapters`          | Chapter metadata (index, title)                                       |

### 5.2 API Endpoints

#### 5.2.1 Library Entries

| Method   | Endpoint           | Description                                                           |
| -------- | ------------------ | --------------------------------------------------------------------- |
| `GET`    | `/api/library`     | Fetch all library entries with novel data. Supports `?status=` filter |
| `PATCH`  | `/api/library/:id` | Update `reading_status` or `current_chapter_id`                       |
| `DELETE` | `/api/library/:id` | Remove novel from library                                             |

**GET `/api/library` Response Shape:**

```ts
interface LibraryEntry {
  id: string;
  novel: {
    id: string;
    title: string; // title_translated ?? title_raw
    author: string; // author_translated ?? author_raw
    cover_url: string | null;
    description: string; // description_translated ?? description_raw
    genres: string[];
    total_chapters: number;
    publication_status: string;
  };
  reading_status: "reading" | "completed" | "on-hold" | "read-later";
  current_chapter_id: string | null;
  updated_at: string; // ISO 8601
}
```

#### 5.2.2 Collections

| Method   | Endpoint                               | Description                                                |
| -------- | -------------------------------------- | ---------------------------------------------------------- |
| `GET`    | `/api/collections`                     | Fetch all collections with novel counts and cover previews |
| `POST`   | `/api/collections`                     | Create a new collection                                    |
| `DELETE` | `/api/collections/:id`                 | Delete a collection                                        |
| `POST`   | `/api/collections/:id/novels`          | Add a novel to a collection                                |
| `DELETE` | `/api/collections/:id/novels/:novelId` | Remove a novel from a collection                           |

**GET `/api/collections` Response Shape:**

```ts
interface Collection {
  id: string;
  title: string;
  novel_count: number;
  cover_previews: string[]; // Up to 3 cover_urls for the fan display
  created_at: string;
}
```

#### 5.2.3 Bookmarks

| Method   | Endpoint             | Description                          |
| -------- | -------------------- | ------------------------------------ |
| `GET`    | `/api/bookmarks`     | Fetch all bookmarks grouped by novel |
| `DELETE` | `/api/bookmarks/:id` | Remove a bookmark                    |

**GET `/api/bookmarks` Response Shape:**

```ts
interface BookmarkGroup {
  novel: {
    id: string;
    title: string;
    cover_url: string | null;
  };
  bookmarks: {
    id: string;
    chapter: {
      id: string;
      chapter_index: number;
      title: string; // title_translated ?? title_raw
    };
    created_at: string;
  }[];
}
```

---

## 6. Empty States

| Tab                                 | Condition                   | Display                                                                      |
| ----------------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| All / Reading / Completed / On Hold | No matching library entries | Centered illustration + `"No novels here yet"` message + CTA to Explore page |
| My Collections                      | No collections created      | `"Create your first collection to organize your novels"` + Create button     |
| My Bookmarks                        | No bookmarks                | `"No bookmarks saved yet"` + explanation text                                |

---

## 7. Responsive Behavior

| Breakpoint                  | Behavior                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `< 640px` (mobile)          | Single column cards. Tab bar horizontally scrollable. Search hidden. Nav links hidden. Novel card cover takes full width above text content (stacked vertically). |
| `640px – 1023px` (tablet)   | Single column novel cards. Collection grid 2 columns. Search visible.                                                                                             |
| `1024px – 1279px` (desktop) | Single column novel cards. Collection grid 3 columns. Nav links visible.                                                                                          |
| `≥ 1280px` (xl)             | 2-column novel cards. Collection grid 4 columns. Full layout.                                                                                                     |

---

## 8. User Flows

### 8.1 Continue Reading

1. User lands on Library → "All" tab is active.
2. User sees their novels with "Continue →" button.
3. User clicks "Continue →" on a novel.
4. App navigates to `/reader?novel={id}&chapter={current_chapter_id}`.

### 8.2 Create a Collection

1. User clicks "+ Create Collections" button.
2. Modal appears with title input.
3. User enters a name and submits.
4. New collection card appears in "My Collections" tab.

### 8.3 Navigate to Bookmark

1. User clicks "My Bookmarks" tab.
2. User sees novels grouped with their bookmarked chapters.
3. User clicks a bookmark row.
4. App navigates to `/reader?novel={novel_id}&chapter={chapter_id}`.

### 8.4 Change Reading Status

1. User clicks `⋮` (more) on a novel card.
2. Context menu appears with status options.
3. User selects new status.
4. Card updates (or moves to appropriate tab).
5. `PATCH /api/library/:id` is called with new `reading_status`.
