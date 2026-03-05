# Concept Index — Functional Specification

> **Route:** `/ai/concept-index`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** A structured, wiki-like encyclopedia of novel-specific terminology — cultivation realms, magic systems, ancient artifacts, world geography, factions, and sects. Entries are AI-extracted from novel text and enriched with detailed descriptions, visual diagrams, sub-stage breakdowns, and source evidence citations. Users can browse by category, read detailed entries, and add custom entries.

---

## 1. Page-Level Structure

The Concept Index uses a **sidebar + master-detail** layout (NOT the standard three-panel workspace):

| Zone                      | Width       | Purpose                                                    |
| ------------------------- | ----------- | ---------------------------------------------------------- |
| **Left Sidebar**          | `w-64`      | Page title, search, category navigation                    |
| **Main Content (Master)** | `flex-1`    | Breadcrumb, category header, entry list (scrollable cards) |
| **Detail Panel**          | `w-[450px]` | Selected entry's full details, diagram, source evidence    |

### 1.1 Body Overflow

`overflow-hidden` — the page fills the viewport. Internal panels scroll independently.

---

## 2. Left Sidebar — Navigation

### 2.1 Sidebar Header

- **Icon + title:** `menu_book` icon (primary) + `"Concept Index"` — `font-semibold text-primary`.

### 2.2 Search

- **Input:** `bg-white border border-slate-200 rounded-xl text-sm pl-10 pr-4 py-2.5 shadow-sm`, with `search` icon.
- **Placeholder:** `"Search index..."`.
- **Behavior:** Filters the entry list in the master panel to show matching entries across all categories. Results update as the user types (debounced 300ms).

### 2.3 Categories

- **Label:** `"CATEGORIES"` — `text-xs font-bold text-slate-400 uppercase tracking-wider px-3`.

**Category list:**

| Category               | Icon            | Example Count |
| ---------------------- | --------------- | ------------- |
| **Cultivation Realms** | `psychiatry`    | 12            |
| **Magic Systems**      | `auto_fix_high` | 8             |
| **Ancient Artifacts**  | `swords`        | 45            |
| **World Geography**    | `public`        | 24            |
| **Factions & Sects**   | `diversity_3`   | 18            |

**Each category row:**

| State        | Styling                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Active**   | `bg-primary/10 text-primary font-medium`, count badge: `bg-primary/20 text-primary`                              |
| **Inactive** | `text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium`, count badge: `bg-slate-100 text-slate-500` |

- **Layout:** `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer`.
- **Icon:** `material-symbols-outlined text-lg` + label text in a `flex items-center gap-3` group.
- **Count badge:** `text-xs px-2 py-0.5 rounded-full`.

**Behavior:** Clicking a category loads its entries in the master panel.

**Data source:** Categories are defined by type. Entry counts are dynamically calculated from `concept_entries` filtered by `novel_id` and `category`.

---

## 3. Main Content — Entry List (Master Panel)

### 3.1 Breadcrumb

- `text-sm text-slate-500`, `flex items-center gap-2`.
- Format: `Index > {Category Name}`.
- `"Index"` is clickable (`hover:text-primary cursor-pointer`), linked to the category overview.
- `chevron_right` icon separator.
- Current category name: `text-slate-900 font-medium`.

### 3.2 Category Header

- **Title:** `text-3xl font-bold tracking-tight text-slate-900` — e.g., `"Cultivation Realms"`.
- **Description:** `text-slate-500 mt-1` — e.g., `"The structured stages of power progression within the Heavenly Dao universe."`.
- **New Entry button:** `flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm`, with `add` icon + `"New Entry"` label.

**Container:** `p-6 border-b border-slate-100 flex-shrink-0 bg-slate-50/50`.

### 3.3 Entry Cards

The scrollable list of concept entries:

- **Container:** `flex-1 border-r border-slate-100 overflow-y-auto p-6 space-y-4`.

#### 3.3.1 Selected Entry Card

The currently selected entry has enhanced styling:

| Element              | Specification                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Container**        | `bg-white border-2 border-primary/20 rounded-xl p-5 shadow-sm cursor-pointer group hover:border-primary/40 transition-colors`   |
| **Left accent bar**  | `absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl`                                                                    |
| **Title**            | `text-lg font-bold text-slate-900`                                                                                              |
| **Tier badge**       | `px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full uppercase tracking-wide` — e.g., `"Foundation"` |
| **Description**      | `text-sm text-slate-600 mb-4 line-clamp-2`                                                                                      |
| **Metadata pills**   | `px-2 py-1 bg-primary/5 text-primary rounded-md font-medium text-xs` — e.g., `"9 Sub-stages"`                                   |
| **Stat pills**       | `px-2 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100 text-xs` — e.g., `"Avg. lifespan: 120y"`               |
| **Chapter citation** | `menu_book` icon + `"Introduced Ch. {N}"` — `text-xs text-slate-400 flex items-center gap-1`                                    |

#### 3.3.2 Unselected Entry Card

| Element                                                                              | Specification                                                                                                                    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Container**                                                                        | `bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 transition-all` |
| **Title**                                                                            | `text-lg font-bold text-slate-900`                                                                                               |
| **Same sub-elements as selected** but without the left accent bar and primary border |

---

## 4. Detail Panel — Entry View

When an entry is selected from the master list, the right panel shows its complete details.

### 4.1 Panel Container

- `w-[450px] bg-slate-50/50 overflow-y-auto p-6 flex flex-col`.

### 4.2 Entry Header

- **Title:** `text-2xl font-bold text-slate-900` — entry name.
- **Edit button:** `edit` icon — `text-slate-400 hover:text-primary transition-colors`.
- **Layout:** `flex justify-between items-center mb-6`.

### 4.3 Visual Diagram

A decorative/conceptual illustration for the entry:

- **Container:** `w-full h-40 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm overflow-hidden relative`, `flex items-center justify-center`.
- **Background effect:** `bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent`.
- **Diagram content:** AI-generated or template-based visual (e.g., spinning concentric circles for cultivation, weapon silhouette for artifacts).
- **Label:** Bottom-right badge: `text-[10px] text-slate-400 font-medium bg-white/80 px-2 py-1 rounded backdrop-blur-sm` — e.g., `"Meridian Flow Diagram"`.

### 4.4 Detailed Description

- **Section title:** `"DETAILED DESCRIPTION"` — `text-sm font-bold text-slate-900 uppercase tracking-wide`.
- **Content:** Full prose description using `prose prose-sm prose-slate max-w-none`.
- **Text:** `text-slate-600 leading-relaxed`.
- **Paragraph spacing:** `mb-4` between paragraphs.

**Data source:** `concept_entries.description` — AI-generated comprehensive text.

### 4.5 Source Evidence

Cited passages from the novel that establish or describe this concept:

- **Section title:** `verified` icon (primary) + `"SOURCE EVIDENCE"` — `text-sm font-bold text-slate-900 uppercase tracking-wide`, `flex items-center gap-2`.
- **Separator:** `border-b border-slate-200 pb-2` above the section.
- **Position:** `mt-auto` (pushed to bottom of the panel).

**Each evidence card:**

| Element           | Specification                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Container**     | `bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative`                                          |
| **Left accent**   | `before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-primary/40 before:rounded-r` |
| **Chapter title** | `text-xs font-semibold text-primary` — e.g., `"Chapter 3: The Broken Meridian"`                               |
| **Quote text**    | `text-[11px] text-slate-600 italic pl-2 border-l border-slate-100` — verbatim quote                           |

- **Spacing:** `flex flex-col gap-3` between evidence cards.
- **Click behavior:** Clicking an evidence card navigates to the Reader at the cited chapter and paragraph.

---

## 5. AI Concept Extraction — Backend Logic

### 5.1 Extraction Pipeline

Concepts are extracted during novel ingestion:

```
Chapters ──→ [Batch LLM Analysis] ──→ [Entity Extraction] ──→ [Classify by Category]
                                                                      │
                                          [Enrich with descriptions] ──→ [Cite Sources]
                                                                      │
                                                              [Store entries]
```

### 5.2 Extraction Prompt

```
Analyze these chapters and extract world-building concepts.

For each concept found, provide:
1. name: Concept name (e.g., "Qi Condensation Realm")
2. category: One of [cultivation_realms, magic_systems, ancient_artifacts, world_geography, factions_sects]
3. tier: Classification level (e.g., "Foundation", "Intermediate", "Advanced", "Legendary")
4. short_description: 1-2 sentence summary
5. detailed_description: Full prose description (2-4 paragraphs)
6. metadata: Key-value pairs of attributes (e.g., {"sub_stages": "9", "avg_lifespan": "120 years"})
7. first_introduced_chapter: Chapter number where this concept first appears
8. source_evidence: Array of {chapter_number, chapter_title, verbatim_quote}

Chapter text:
{chapter_content}
```

### 5.3 Deduplication & Merging

- When the same concept is mentioned across multiple chapters, the descriptions are merged.
- Source evidence accumulates across chapters.
- The most detailed/comprehensive description is kept as the primary.

---

## 6. Data Layer

### 6.1 Database Tables

#### 6.1.1 New Table Required

**`concept_entries`** — AI-extracted world-building concepts:

```sql
create table concept_entries (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  name text not null,
  category text not null, -- 'cultivation_realms', 'magic_systems', 'ancient_artifacts', 'world_geography', 'factions_sects'
  tier text, -- 'Foundation', 'Intermediate', 'Advanced', 'Legendary', etc.

  short_description text,
  detailed_description text,

  metadata jsonb, -- flexible key-value pairs: {"sub_stages": "9", "avg_lifespan": "120y"}

  first_introduced_chapter integer,
  diagram_type text, -- template identifier for visual (e.g., 'meridian_flow', 'weapon_silhouette')

  is_user_created boolean default false,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_concept_entries_novel_id on concept_entries(novel_id);
create index idx_concept_entries_category on concept_entries(novel_id, category);

create trigger trg_concept_entries_updated_at
before update on concept_entries
for each row execute function update_updated_at_column();
```

**`concept_evidence`** — Source citations for concept entries:

```sql
create table concept_evidence (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references concept_entries(id) on delete cascade not null,

  chapter_number integer not null,
  chapter_title text,
  verbatim_quote text not null,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_concept_evidence_entry_id on concept_evidence(entry_id);
```

### 6.2 API Endpoints

| Method   | Endpoint                                                   | Description                                  |
| -------- | ---------------------------------------------------------- | -------------------------------------------- |
| `GET`    | `/api/ai/concepts/categories?novel_id={id}`                | Get categories with count for a novel        |
| `GET`    | `/api/ai/concepts?novel_id={id}&category={cat}&q={search}` | List entries (filtered)                      |
| `GET`    | `/api/ai/concepts/:id`                                     | Get single entry with full detail & evidence |
| `POST`   | `/api/ai/concepts`                                         | Create a new user entry                      |
| `PATCH`  | `/api/ai/concepts/:id`                                     | Update an entry                              |
| `DELETE` | `/api/ai/concepts/:id`                                     | Delete a user-created entry                  |

#### 6.2.1 GET `/api/ai/concepts` — List Entries

**Query Parameters:**

| Param      | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| `novel_id` | uuid   | Required. The novel to fetch concepts for    |
| `category` | string | Optional. Filter by category                 |
| `q`        | string | Optional. Search query (fuzzy match on name) |

**Response:**

```ts
interface ConceptEntry {
  id: string;
  name: string;
  category: string;
  tier: string | null;
  short_description: string;
  metadata: Record<string, string>;
  first_introduced_chapter: number | null;
  is_user_created: boolean;
}

interface ConceptListResponse {
  entries: ConceptEntry[];
  total_count: number;
}
```

#### 6.2.2 GET `/api/ai/concepts/:id` — Entry Detail

**Response:**

```ts
interface ConceptDetailResponse {
  id: string;
  name: string;
  category: string;
  tier: string | null;
  short_description: string;
  detailed_description: string;
  metadata: Record<string, string>;
  first_introduced_chapter: number | null;
  diagram_type: string | null;
  is_user_created: boolean;
  evidence: {
    chapter_number: number;
    chapter_title: string;
    verbatim_quote: string;
  }[];
}
```

#### 6.2.3 POST `/api/ai/concepts` — Create Entry

**Request Body:**

```ts
interface CreateConceptRequest {
  novel_id: string;
  name: string;
  category: string;
  tier?: string;
  short_description?: string;
  detailed_description?: string;
  metadata?: Record<string, string>;
  first_introduced_chapter?: number;
}
```

---

## 7. State Machine

| State                  | Sidebar   | Entry List                      | Detail Panel         |
| ---------------------- | --------- | ------------------------------- | -------------------- |
| **Loading**            | Skeleton  | Skeleton                        | Empty                |
| **Category selected**  | Populated | Entries shown                   | Empty (no selection) |
| **Entry selected**     | Populated | Entries shown (one highlighted) | Full detail          |
| **Searching**          | Populated | Filtered results                | Unchanged            |
| **Creating new entry** | Populated | Entries shown                   | Edit form            |
| **Empty category**     | Populated | "No entries" message            | Empty                |

---

## 8. User Flows

### 8.1 Browse the Index

1. User navigates to `/ai/concept-index`.
2. Left sidebar shows categories with entry counts.
3. Default: first category is selected (e.g., "Cultivation Realms").
4. Master panel shows entry cards for that category.
5. User clicks an entry card.
6. Detail panel shows the full entry with description, diagram, and source evidence.

### 8.2 Search for a Concept

1. User types a search query in the sidebar search field.
2. Entry list filters across all categories to show matches.
3. User clicks a result to view its full details.

### 8.3 Switch Categories

1. User clicks a different category in the sidebar.
2. Entry list reloads with entries from the new category.
3. Breadcrumb updates.
4. Detail panel clears (no entry selected).

### 8.4 Create a Custom Entry

1. User clicks "New Entry" in the category header.
2. Detail panel switches to an edit form with fields for name, tier, description, and metadata.
3. User fills in the form and saves.
4. New entry appears in the entry list with an `is_user_created` flag.

### 8.5 Edit an Entry

1. User clicks the `edit` icon in the detail panel header.
2. Detail panel switches to edit mode with pre-filled form fields.
3. User modifies the entry and saves.

### 8.6 View Source Evidence

1. User scrolls to the bottom of the detail panel.
2. Source evidence section shows verbatim quotes from the novel.
3. User clicks a quote card to navigate to the Reader at that chapter.

---

## 9. Responsive Behavior

| Breakpoint | Behavior                                                                |
| ---------- | ----------------------------------------------------------------------- |
| `< md`     | Single column. Sidebar behind toggle. Only entry list or detail visible |
| `md – <lg` | Sidebar + entry list. Detail panel as overlay or modal                  |
| `≥ lg`     | Full three-column layout: sidebar + entry list + detail panel           |

---

## 10. Error States

| Condition                     | Display                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| **No novels in library**      | Sidebar shows "Add a novel to start exploring concepts"         |
| **No concepts extracted**     | Entry list: "No concepts have been extracted yet. Process now." |
| **Search returns no results** | Entry list: "No entries matching '{query}'"                     |
| **Entry load failed**         | Detail panel: Error message with retry button                   |

---

## 11. Global Header

Standard shared header (see Library SPEC). Active nav link: `"AI Features"` — `text-slate-900 text-sm font-semibold`.
