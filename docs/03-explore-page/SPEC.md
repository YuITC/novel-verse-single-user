# Explore Page — Functional Specification

> **Route:** `/explore`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Discovery interface for browsing, searching, and filtering all novels in the system. Enables users to find new stories by keyword, status, genre tags, chapter range, and sort order, with paginated results.

---

## 1. Page-Level Structure

The Explore page is a single-page view composed of a filter panel, result count, a paginated grid of novel cards, and pagination controls.

| Zone             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| **Header**       | Global navigation bar (shared across all pages)                   |
| **Page Header**  | Title ("Explore Novels"), subtitle                                |
| **Filter Panel** | Search input, multi-select filters, dropdowns for refining novels |
| **Result Count** | Displays total number of matching novels                          |
| **Results Grid** | 2-column grid of novel cards                                      |
| **Pagination**   | Numbered pagination control at page bottom                        |

### 1.1 Page Header

- **Title:** `"Explore Novels"` — static, always visible.
- **Subtitle:** `"Discover your next favorite story"` — static.

---

## 2. Filter Panel

A white card container (`bg-white`, `rounded-2xl`, `border border-slate-200`, `shadow-sm`) with two rows of filter controls arranged horizontally on desktop and stacked vertically on mobile.

### 2.1 Filter Layout

```
Row 1:  [SEARCH]                [STATUS (multi-select)]        [CH. RANGE (select)]
Row 2:  [TAGS (multi-select)]                                  [SORT BY (select)]
```

### 2.2 Filter Definitions

| Filter        | Type         | Label       | Width (Desktop) | Description                               |
| ------------- | ------------ | ----------- | --------------- | ----------------------------------------- |
| **Search**    | Text input   | `SEARCH`    | `w-[280px]`     | Free-text search by novel title or author |
| **Status**    | Multi-select | `STATUS`    | `flex-1`        | Filter by `publication_status`            |
| **Ch. Range** | Select       | `CH. RANGE` | `w-[160px]`     | Filter by chapter count range             |
| **Tags**      | Multi-select | `TAGS`      | `flex-1`        | Filter by genre tags                      |
| **Sort By**   | Select       | `SORT BY`   | `w-[200px]`     | Sort order for results                    |

### 2.3 Filter Details

#### 2.3.1 Search Input

- **Placeholder:** `"Title, author..."`
- **Icon:** `search` Material icon, left-aligned.
- **Behavior:** Debounced search (300–500ms). Filters results as the user types.
- **Matches against:** `novels.title_raw`, `novels.title_translated`, `novels.author_raw`, `novels.author_translated`.
- **Style:** `bg-slate-50`, `border border-slate-200`, `rounded-xl`, `h-10`. Focus: `border-primary`, `ring-1 ring-primary`.

#### 2.3.2 Status Filter (Multi-Select)

Filters novels by `novels.publication_status`. Multiple values can be selected simultaneously.

| Option        | Value       | Maps To                                   |
| ------------- | ----------- | ----------------------------------------- |
| **Ongoing**   | `ongoing`   | `novels.publication_status = 'ongoing'`   |
| **Completed** | `completed` | `novels.publication_status = 'completed'` |
| **Cancelled** | `cancelled` | `novels.publication_status = 'cancelled'` |

**UI behavior:**

- Selected values appear as removable chips inside the field.
- Each chip shows the status label in uppercase with a close (`close`) icon.
- Chip style: `bg-white`, `border border-slate-200`, `text-slate-600`, `text-[11px]`, `font-semibold`, `tracking-wide`, `uppercase`, `rounded-md`, with `shadow-sm`.
- A dropdown chevron (`expand_more`) is right-aligned.
- Empty state: Placeholder text or empty field.

#### 2.3.3 Chapter Range Select

Filters novels by `novels.total_chapters` within a numeric range.

| Option          | Value      | Query Condition                                 |
| --------------- | ---------- | ----------------------------------------------- |
| **Any**         | `any`      | No filter applied                               |
| **0 – 100**     | `0-100`    | `total_chapters >= 0 AND total_chapters <= 100` |
| **100 – 1000+** | `100-1000` | `total_chapters >= 100`                         |

Additional range options may include: `0-50`, `50-200`, `200-500`, `500-1000`, `1000+`.

**Style:** Standard `<select>`, `bg-slate-50`, `border border-slate-200`, `rounded-xl`, `h-10`. Focus: `border-primary`, `ring-primary`.

#### 2.3.4 Tags Filter (Multi-Select)

Filters novels where `novels.genres` array contains ALL of the selected tags (AND logic).

**Tag source:** Distinct values from `novels.genres[]` across all user novels.

**UI behavior:**

- Selected tags appear as removable chips inside the field.
- Chip style (different from Status chips): `bg-primary/10`, `text-primary`, `border border-primary/20`, `text-[11px]`, `uppercase`, `tracking-wide`, `rounded-md`, `font-semibold`. Close icon hover: `text-primary/70`.
- A dropdown chevron (`expand_more`) is right-aligned.

#### 2.3.5 Sort By Select

Controls the ordering of results.

| Option          | Value      | Order By                                            |
| --------------- | ---------- | --------------------------------------------------- |
| **Popularity**  | `popular`  | `novels.total_chapters DESC` (proxy for popularity) |
| **Chapters**    | `chapters` | `novels.total_chapters DESC`                        |
| **Update Date** | `updated`  | `novels.last_updated_at DESC NULLS LAST`            |
| **Rating**      | `rating`   | Reserved for future use                             |

**Default:** `Popularity`.

**Style:** Same as Chapter Range select.

### 2.4 Filter State Management

- Filters are managed as URL query parameters for shareability and back-button support:
  - `?q=keyword&status=ongoing,completed&ch=100-1000&tags=action,fantasy&sort=popular&page=1`
- Changing any filter resets pagination to page 1.
- All filters are combined with AND logic.

---

## 3. Result Count

A single line displayed between the filter panel and the results grid.

- **Text:** `"Found {count} Results"` where `{count}` is the total matching novel count.
- **Style:** `text-lg font-bold text-slate-900`.
- **Spacing:** Below filter panel (`mb-6`).

---

## 4. Results Grid

### 4.1 Layout

**Grid:** 2-column on `xl` screens (`grid-cols-1 xl:grid-cols-2`), single column on smaller screens. Gap: `gap-6 md:gap-8`.

### 4.2 Novel Card — Component Specification

Each card represents one `novels` row. This is a **read-only discovery card** (no library-specific state).

**Structure:**

```
┌─────────────────────────────────────────────────┐
│  ┌─────────┐  Title                    [⋮]     │
│  │  Cover   │  ✦ Author  📖 N Ch.  🕐 Time    │
│  │  Image   │  Description (2-line clamp)       │
│  │          │  ──────────────────────────        │
│  └─────────┘  [TAG] [TAG]         Read →        │
└─────────────────────────────────────────────────┘
```

**Data Mapping:**

| UI Element    | Source                                                    | Format                                                        |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| Cover Image   | `novels.cover_url`                                        | `aspect-[3/4]`, `rounded-xl`, `w-36` (desktop)                |
| Title         | `novels.title_translated ?? novels.title_raw`             | Truncated, single line (`truncate`)                           |
| Author        | `novels.author_translated ?? novels.author_raw`           | Prefixed with `person` icon                                   |
| Chapter Count | `novels.total_chapters`                                   | Formatted as `"N Ch."`                                        |
| Time Info     | `novels.last_updated_at`                                  | Relative time (e.g., `"2h ago"`, `"Yesterday"`)               |
| Status Badge  | `novels.publication_status`                               | Shown only if `completed`: emerald `done_all` + `"Completed"` |
| Description   | `novels.description_translated ?? novels.description_raw` | 2-line clamp (`line-clamp-2`)                                 |
| Genre Tags    | `novels.genres[]`                                         | Uppercase, bordered badges                                    |
| More Button   | —                                                         | Vertical ellipsis icon (`more_vert`), top-right               |

### 4.3 Cover Image Fallback

When `novels.cover_url` is `null` or empty, display a placeholder:

- **Container:** Same dimensions as cover (`w-36`, `aspect-[3/4]`).
- **Background:** `bg-slate-200`.
- **Content:** Centered `menu_book` Material icon in `text-slate-400`, `text-4xl`.
- **Border:** `border border-slate-100`, `rounded-xl`.

### 4.4 Card Action Button

The primary action button in the bottom-right corner of each card:

- **Label:** `"Read"`
- **Icon:** `arrow_forward` (right-aligned after text)
- **Style:** `text-primary`, `font-semibold`, `text-sm`
- **Hover:** `opacity-70`
- **Behavior:** Navigates to novel detail page or reader at chapter 1: `/reader?novel={novels.id}`

### 4.5 Card Context Menu (More Button `⋮`)

The `more_vert` button opens a context menu with the following actions:

| Action                | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Add to Library**    | Add the novel to the user's library (`INSERT INTO library_entries`) with status `reading` |
| **Add to Collection** | Open collection picker to add the novel to a user collection                              |

### 4.6 Card Visual States

| State               | Visual Treatment                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Default**         | `bg-white`, `border border-slate-100`, subtle shadow                                                            |
| **Hover**           | Title transitions to `text-primary`. Shadow intensifies from whisper to gentle bloom.                           |
| **Completed novel** | Status chip: `text-emerald-600` with `done_all` icon showing `"Completed"`. Replaces time info in metadata row. |

### 4.7 Metadata Row — Status-Dependent Display

The third metadata item (after author and chapter count) changes based on `novels.publication_status`:

| Publication Status | Display                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `ongoing`          | `schedule` icon + relative time from `last_updated_at` (e.g., `"Updated 2h ago"`), `text-slate-400` |
| `completed`        | `done_all` icon + `"Completed"`, `text-emerald-600`                                                 |
| `cancelled`        | `schedule` icon + `"Cancelled"`, `text-slate-400`                                                   |

---

## 5. Pagination

### 5.1 Layout

Centered row of page buttons below the results grid, with `mt-12` spacing.

### 5.2 Component Structure

```
[<]  [1]  [2]  [3]  [...]  [124]  [>]
```

### 5.3 Page Button Styles

| Button Type             | Style                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| **Active page**         | `bg-primary`, `text-white`, `rounded-full`, `size-10`, `font-medium`                           |
| **Inactive page**       | `border border-slate-200`, `text-slate-600`, `rounded-full`, `size-10`, `font-medium`          |
| **Inactive page hover** | `bg-slate-50`                                                                                  |
| **Ellipsis**            | `text-slate-400`, non-interactive, same size                                                   |
| **Previous arrow `<`**  | `border border-slate-200`, `text-slate-400`, `rounded-full`, `size-10`. Disabled on page 1.    |
| **Next arrow `>`**      | `border border-slate-200`, `text-slate-600`, `rounded-full`, `size-10`. Disabled on last page. |
| **Disabled state**      | `cursor-not-allowed`, `text-slate-400`                                                         |

### 5.4 Pagination Logic

- **Page size:** 20 novels per page (configurable).
- **Windows:** Show at most 5 page buttons at a time:
  - First 3 pages + ellipsis + last page (e.g., `1 2 3 ... 124`).
  - When in middle: `1 ... 5 6 7 ... 124`.
  - When near end: `1 ... 122 123 124`.
- **URL parameter:** `?page=N` — maintained alongside filter parameters.
- **Scroll behavior:** Scroll to top of results on page change.

---

## 6. Global Header (Shared Component)

The global header is identical to the Library page header. See [Library SPEC](../01-library-page/SPEC.md#4-global-header-shared-component) for full specification.

**Active link on this page:** `Explore` (`text-slate-900 font-semibold`).

---

## 7. Data Layer

### 7.1 Database Tables (Relevant)

| Table               | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `novels`            | Novel metadata (title, author, cover, genres, status, chapters count) |
| `library_entries`   | Used to check if novel is already in user's library                   |
| `collections`       | Used when adding novel to a collection                                |
| `collection_novels` | M:N join between collections and novels                               |

### 7.2 API Endpoints

#### 7.2.1 Explore / Search Novels

| Method | Endpoint       | Description                              |
| ------ | -------------- | ---------------------------------------- |
| `GET`  | `/api/explore` | Search and filter novels with pagination |

**Query Parameters:**

| Parameter | Type     | Default     | Description                                       |
| --------- | -------- | ----------- | ------------------------------------------------- |
| `q`       | `string` | `""`        | Search keyword (title, author)                    |
| `status`  | `string` | `""`        | Comma-separated publication statuses              |
| `tags`    | `string` | `""`        | Comma-separated genre tags                        |
| `ch`      | `string` | `"any"`     | Chapter range key (e.g., `"0-100"`, `"100-1000"`) |
| `sort`    | `string` | `"popular"` | Sort key                                          |
| `page`    | `number` | `1`         | Page number (1-indexed)                           |
| `limit`   | `number` | `20`        | Items per page                                    |

**Response Shape:**

```ts
interface ExploreResponse {
  novels: ExploreNovel[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface ExploreNovel {
  id: string;
  title: string; // title_translated ?? title_raw
  author: string; // author_translated ?? author_raw
  cover_url: string | null;
  description: string; // description_translated ?? description_raw
  genres: string[];
  total_chapters: number;
  publication_status: string; // ongoing, completed, cancelled
  last_updated_at: string | null; // ISO 8601
  is_in_library: boolean; // Whether the user already has this in library_entries
}
```

**Query Construction (Pseudocode):**

```sql
SELECT n.*,
       EXISTS(
         SELECT 1 FROM library_entries le
         WHERE le.novel_id = n.id AND le.user_id = :user_id
       ) AS is_in_library
FROM novels n
WHERE n.user_id = :user_id
  AND (:q IS NULL OR n.title_raw ILIKE '%' || :q || '%'
       OR n.title_translated ILIKE '%' || :q || '%'
       OR n.author_raw ILIKE '%' || :q || '%'
       OR n.author_translated ILIKE '%' || :q || '%')
  AND (:status IS NULL OR n.publication_status = ANY(:status_arr))
  AND (:tags IS NULL OR n.genres @> :tags_arr)
  AND (chapter range conditions)
ORDER BY :sort_column :sort_direction
LIMIT :limit OFFSET (:page - 1) * :limit;
```

#### 7.2.2 Available Tags

| Method | Endpoint            | Description                             |
| ------ | ------------------- | --------------------------------------- |
| `GET`  | `/api/explore/tags` | Fetch distinct genre tags for filter UI |

**Response Shape:**

```ts
interface TagsResponse {
  tags: string[]; // Distinct genre values, sorted alphabetically
}
```

**Query:**

```sql
SELECT DISTINCT UNNEST(genres) AS tag
FROM novels
WHERE user_id = :user_id
ORDER BY tag;
```

#### 7.2.3 Add to Library (Re-uses Library API)

| Method | Endpoint       | Description                       |
| ------ | -------------- | --------------------------------- |
| `POST` | `/api/library` | Add a novel to the user's library |

**Request Body:**

```ts
interface AddToLibraryRequest {
  novel_id: string;
  reading_status: "reading" | "read-later"; // Default: "reading"
}
```

---

## 8. Empty States

| Condition                  | Display                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| No novels match filters    | Centered illustration + `"No novels found matching your filters"` + suggestion to adjust filters |
| No novels in system at all | Centered illustration + `"No novels yet"` + CTA to Crawler or Uploader page                      |

---

## 9. Responsive Behavior

| Breakpoint                  | Behavior                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `< 640px` (mobile)          | Single column cards. Filters stacked vertically. Search, Status, Ch. Range each full width. Novel card cover takes full width above text (stacked). |
| `640px – 1023px` (tablet)   | Single column novel cards. Filters still stacked but search stays fixed width. Cover sits beside text within card (horizontal layout).              |
| `1024px – 1279px` (desktop) | Single column novel cards. Filters in horizontal rows. Nav links visible in header.                                                                 |
| `≥ 1280px` (xl)             | 2-column novel cards. Full horizontal filter layout. Full navigation.                                                                               |

---

## 10. User Flows

### 10.1 Discover a Novel

1. User lands on Explore page → all novels shown (page 1).
2. User types a keyword in the Search input.
3. Results filter in real-time (debounced).
4. Result count updates.
5. User clicks "Read →" on a novel card.
6. App navigates to `/reader?novel={id}`.

### 10.2 Filter by Genre Tags

1. User clicks the Tags multi-select.
2. Dropdown shows available tags.
3. User selects one or more tags (e.g., "Action", "Fantasy").
4. Selected tags appear as removable chips.
5. Results update to show only novels matching ALL selected tags.
6. Pagination resets to page 1.

### 10.3 Add Novel to Library

1. User clicks `⋮` on a novel card.
2. Context menu appears with "Add to Library".
3. User clicks "Add to Library".
4. `POST /api/library` is called with `novel_id` and `reading_status: "reading"`.
5. Snackbar confirms: `"Added to Library"`.
6. Card's `is_in_library` state updates (menu option changes to "Already in Library" or is hidden).

### 10.4 Navigate Pages

1. User scrolls to bottom of results.
2. User clicks page number or next arrow.
3. Results update to show the selected page.
4. URL updates with `?page=N`.
5. Page scrolls to top of results grid.
