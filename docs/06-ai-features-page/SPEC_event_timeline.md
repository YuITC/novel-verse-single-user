# Event Timeline — Functional Specification

> **Route:** `/ai/event-timeline`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Present a horizontal, scrollable timeline of AI-extracted story events — major plot points, character growth milestones, world history reveals, and relationship changes — overlaid on color-coded story arc regions. Users can filter by event category, navigate by arc, and inspect events for detailed descriptions with AI-generated narrative notes.

---

## 1. Page-Level Structure

The Event Timeline uses a **header + filter sidebar + full-width timeline** layout (NOT the standard three-panel workspace):

| Zone                   | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **Page Header**        | Back navigation, page title, novel selector                           |
| **Left Filter Panel**  | Event search, category filter checkboxes, story arc navigation        |
| **Main Timeline Area** | Horizontal scrollable timeline with arc regions, event nodes, popover |
| **Minimap Navigator**  | Compressed overview bar at the bottom with drag-to-scroll viewport    |

### 1.1 Page Container

- **Container:** `max-w-[1400px] flex-1 w-full h-full`, centered with `px-8 md:px-12 lg:px-20`.
- **Body:** `min-h-screen overflow-hidden` — no vertical scroll; all content fits viewport.

---

## 2. Page Header

### 2.1 Back Navigation

- **Link:** `arrow_back` icon + `"Back to AI Features"` — `text-primary font-medium text-sm hover:underline`.

### 2.2 Title

- `"Story Event Timeline"` — `text-2xl md:text-3xl font-bold tracking-tight text-slate-900`.

### 2.3 Novel Selector

- **Position:** Right side of header row (flex row with `justify-between`).
- **Input:** `<select>` — `w-full md:w-72 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 shadow-sm font-medium appearance-none`.
- **Data source:** User's library novels.
- **Behavior:** Changing the novel reloads all timeline events and story arcs.

---

## 3. Left Filter Panel

### 3.1 Container

- `w-64 flex-shrink-0`, `bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- Scrollable with `overflow-y-auto scrollbar-hide`.

### 3.2 Event Search

- **Input:** `bg-slate-50 border border-slate-200 rounded-lg h-10 text-sm pl-9 pr-3`, with `search` icon.
- **Placeholder:** `"Search events..."`.
- **Behavior:** Filters visible events on the timeline. Matching events stay visible; non-matching events dim or hide.

### 3.3 Event Categories

Checkbox filters controlling which event types are visible on the timeline:

- **Label:** `"EVENT CATEGORIES"` — `text-xs font-bold text-slate-400 uppercase tracking-wider`.

| Category                   | Color Dot        | Checked by Default |
| -------------------------- | ---------------- | ------------------ |
| **Major Plot Points**      | `bg-amber-500`   | ✅ Yes             |
| **Character Growth**       | `bg-blue-500`    | ✅ Yes             |
| **World History**          | `bg-emerald-500` | ✅ Yes             |
| **Romances/Relationships** | `bg-rose-500`    | ❌ No              |

**Each checkbox row:**

- **Layout:** `flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors`.
- **Checkbox:** `rounded border-slate-300 text-primary focus:ring-primary w-4 h-4`.
- **Label:** `text-sm text-slate-700 font-medium`, with a `w-2.5 h-2.5 rounded-full bg-{color}` dot.

**Behavior:** Toggling a checkbox shows/hides events of that category on the timeline with a smooth animation.

### 3.4 Story Arcs Navigation

A list of story arcs that serve as "bookmarks" for timeline navigation:

- **Label:** `"STORY ARCS"` — `text-xs font-bold text-slate-400 uppercase tracking-wider`.

| State        | Styling                                                                               |
| ------------ | ------------------------------------------------------------------------------------- |
| **Active**   | `text-primary font-bold bg-primary/10 rounded-lg border-l-2 border-primary px-3 py-2` |
| **Inactive** | `text-slate-700 font-medium hover:bg-slate-50 rounded-lg px-3 py-2`                   |

- **Text:** `text-sm truncate` — e.g., `"Origin Village Arc (Ch 1-45)"`.
- **Behavior:** Clicking an arc scrolls the main timeline to center on that arc region.

**Data source:** `story_arcs` table (same as Story Q&A).

---

## 4. Main Timeline Area

### 4.1 Container

- `flex-1`, `bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- `overflow-hidden flex flex-col`.

### 4.2 Scrollable Timeline Region

- `flex-1 relative overflow-x-auto overflow-y-hidden scrollbar-hide cursor-grab active:cursor-grabbing`.
- Inner content extends to `min-w-[150%]` (or wider, scaling with total chapters).

### 4.3 Arc Background Regions

The timeline background is divided into color-coded vertical bands representing story arcs:

| Arc Position  | Width Proportion              | Background Color                          | Label Style                                                 |
| ------------- | ----------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Previous arcs | Proportional to chapter count | `bg-slate-50` (dimmed, `opacity-60`)      | `text-xs font-bold text-slate-400 uppercase tracking-wider` |
| Active arc    | Proportional to chapter count | `bg-amber-50/50` (highlighted)            | `text-xs font-bold text-amber-600/80 uppercase`             |
| Future arcs   | Proportional to chapter count | `bg-emerald-50/50` (dimmed, `opacity-60`) | `text-xs font-bold text-emerald-600/80 uppercase`           |

- **Arc labels:** Centered at the top of each band (`pt-6`).
- **Separators:** `border-r border-slate-200` between each arc band.

### 4.4 Central Timeline Spine

A horizontal line running through the middle of the timeline:

- `absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-10`.

### 4.5 Event Nodes

Events are positioned along the timeline spine as colored circles:

**Node sizes:**

| Event Importance | Size      | Ring style                                                           |
| ---------------- | --------- | -------------------------------------------------------------------- |
| **Major**        | `w-5 h-5` | `shadow-[0_0_0_4px_rgba(255,255,255,1),0_0_0_8px_rgba({color},0.4)]` |
| **Standard**     | `w-4 h-4` | `shadow-[0_0_0_4px_rgba(255,255,255,1),0_0_0_6px_rgba({color},0.3)]` |

**Node colors** match the event category:

| Category               | Fill Color       |
| ---------------------- | ---------------- |
| Major Plot Points      | `bg-amber-500`   |
| Character Growth       | `bg-blue-500`    |
| World History          | `bg-emerald-500` |
| Romances/Relationships | `bg-rose-500`    |

**Node behavior:**

- `cursor-pointer hover:scale-125 transition-transform z-30`.
- **Label below/above:** Alternating positions (odd events above, even below) to avoid overlap:
  - `text-center w-24` (or `w-32` for major events).
  - **Chapter number:** `text-xs font-semibold text-slate-700` (or `text-{color}-600 font-bold` for major).
  - **Event title:** `text-[10px] text-slate-500 truncate mt-0.5`.

#### 4.5.1 Major Event Node — Icon Variant

Major plot point nodes can contain a small icon inside:

- `flex items-center justify-center` inside the circle.
- Icon: `material-symbols-outlined text-[12px] text-white` — e.g., `swords` for battle events.

### 4.6 Event Popover (Detail Card)

Clicking an event node opens a floating detail card anchored to the node:

- **Position:** `absolute`, above or below the node (avoiding viewport edges).
- **Container:** `w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in`.

| Element            | Specification                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category badge** | `px-2 py-0.5 rounded text-[10px] font-bold bg-{color}-100 text-{color}-700`                                                                                             |
| **Chapter range**  | `text-[10px] font-medium text-slate-500` — e.g., `"Ch. 89-92"`                                                                                                          |
| **Close button**   | `close` icon — `text-slate-400 hover:text-slate-700`                                                                                                                    |
| **Title**          | `text-sm font-bold text-slate-900 mb-1`                                                                                                                                 |
| **Description**    | `text-xs text-slate-600 leading-relaxed mb-3`                                                                                                                           |
| **AI Note**        | `bg-slate-50 rounded-lg p-2 flex items-center gap-2 text-xs text-slate-700 border border-slate-100`, with `auto_awesome` icon (primary color) + italicized insight text |

**AI Note:** A generated analytical note that connects this event to broader narrative themes — e.g., "This event foreshadows the wrath of the Wang family in the next arc."

---

## 5. Minimap Navigator

A compressed overview of the entire timeline at the bottom of the page:

### 5.1 Container

- `h-16 bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col relative shrink-0`.

### 5.2 Chapter Range Labels

- `flex justify-between text-[9px] text-slate-400 font-medium px-1 mb-1`.
- Left: `"Chapter 1"`, Right: `"Chapter {total_chapters}"`.

### 5.3 Minimap Bar

- `flex-1 relative bg-slate-100 rounded-md overflow-hidden cursor-pointer`.

**Arc color bands:** Same proportional widths as the main timeline, rendered as colored blocks:

| Arc              | Color               |
| ---------------- | ------------------- |
| Origin Village   | `bg-slate-200`      |
| Sect Tournament  | `bg-amber-200/60`   |
| Ancient Realm    | `bg-emerald-200/60` |
| Imperial Capital | `bg-purple-200/60`  |

**Event dots:** Tiny circles positioned proportionally along the minimap:

- Size: `w-1.5 h-1.5` (standard) or `w-2 h-2` (major).
- Color: Matches event category.
- Position: `absolute top-1/2 -translate-y-1/2 left-[{percent}%]`.

**Center line:** `absolute top-1/2 -translate-y-1/2 w-full h-px bg-slate-300`.

### 5.4 Viewport Indicator

A draggable rectangle showing the currently visible portion of the timeline:

- **Style:** `absolute left-[{start}%] w-[{width}%] h-full border-2 border-primary rounded bg-primary/10 shadow-[0_0_0_9999px_rgba(255,255,255,0.4)] cursor-ew-resize`.
- **Behavior:**
  - Dragging the viewport indicator scrolls the main timeline.
  - Resizing adjusts zoom level.
  - The indicator width corresponds to the visible percentage of the total timeline.

---

## 6. AI Event Extraction — Backend Logic

### 6.1 Extraction Pipeline

Events are extracted during novel ingestion:

```
Chapters ──→ [Batch LLM Extraction] ──→ [Deduplication] ──→ [Classify & Score] ──→ [Store]
```

### 6.2 Extraction Prompt

```
Analyze the following chapter(s) and extract significant story events.

For each event, provide:
1. title: Short event name (3-6 words)
2. description: 2-3 sentence description of what happened
3. category: One of [major_plot_point, character_growth, world_history, romance_relationship]
4. chapter_start: Starting chapter number
5. chapter_end: Ending chapter number (same as start if single-chapter event)
6. importance: "major" or "standard"
7. characters_involved: List of character names involved
8. ai_note: One sentence connecting this event to broader narrative themes

Chapter text:
{chapter_content}
```

### 6.3 Story Arc Detection

Arcs are detected by analyzing event density, setting changes, and narrative structure:

```
All Events ──→ [Cluster by Setting/Theme] ──→ [Identify Arc Boundaries] ──→ [Name & Describe]
```

---

## 7. Data Layer

### 7.1 Database Tables

#### 7.1.1 New Table Required

**`timeline_events`** — AI-extracted story events:

```sql
create table timeline_events (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  title text not null,
  description text,
  category text not null, -- 'major_plot_point', 'character_growth', 'world_history', 'romance_relationship'
  importance text default 'standard', -- 'major' | 'standard'

  chapter_start integer not null,
  chapter_end integer not null,

  characters_involved text[],
  ai_note text, -- narrative analysis note

  icon text, -- Material icon name, e.g., 'swords', 'favorite'

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_timeline_events_novel_id on timeline_events(novel_id);
create index idx_timeline_events_chapters on timeline_events(novel_id, chapter_start);
```

> **Note:** The `story_arcs` table is shared with Story Q&A and was created in the Group 1 migration.

### 7.2 API Endpoints

| Method | Endpoint                                                 | Description                     |
| ------ | -------------------------------------------------------- | ------------------------------- |
| `GET`  | `/api/ai/timeline/events?novel_id={id}&categories={csv}` | Get filtered events for a novel |
| `GET`  | `/api/ai/timeline/arcs?novel_id={id}`                    | Get story arcs for a novel      |
| `GET`  | `/api/ai/timeline/events/:id`                            | Get single event detail         |

#### 7.2.1 GET `/api/ai/timeline/events` — List Events

**Query Parameters:**

| Param        | Type   | Description                             |
| ------------ | ------ | --------------------------------------- |
| `novel_id`   | uuid   | Required. The novel to fetch events for |
| `categories` | string | Optional. CSV of categories to include  |
| `min_ch`     | number | Optional. Minimum chapter to include    |
| `max_ch`     | number | Optional. Maximum chapter to include    |

**Response:**

```ts
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  category:
    | "major_plot_point"
    | "character_growth"
    | "world_history"
    | "romance_relationship";
  importance: "major" | "standard";
  chapter_start: number;
  chapter_end: number;
  characters_involved: string[];
  ai_note: string | null;
  icon: string | null;
}

interface TimelineEventsResponse {
  events: TimelineEvent[];
  arcs: StoryArc[]; // reuse from Story Q&A
}
```

---

## 8. State Machine

| State                 | Filter Panel | Timeline          | Minimap | Popover |
| --------------------- | ------------ | ----------------- | ------- | ------- |
| **Loading**           | Skeleton     | Spinner           | Hidden  | Hidden  |
| **Timeline ready**    | Populated    | Events + arcs     | Visible | Hidden  |
| **Event selected**    | Populated    | Event highlighted | Visible | Open    |
| **Searching**         | Populated    | Filtered          | Visible | Hidden  |
| **Empty (no events)** | Populated    | Empty message     | Hidden  | Hidden  |

---

## 9. User Flows

### 9.1 Browse the Timeline

1. User navigates to `/ai/event-timeline`.
2. Selects a novel from the dropdown.
3. Timeline renders with events as colored dots on a horizontal spine.
4. Background shows arc regions.
5. User scrolls horizontally (drag or scroll wheel).
6. Minimap updates to show current viewport position.

### 9.2 Inspect an Event

1. User clicks an event node.
2. Popover appears with event details: title, description, category badge, chapter range.
3. AI Note provides narrative context.
4. User closes the popover by clicking the `×` or clicking elsewhere.

### 9.3 Filter by Category

1. User unchecks "Romances/Relationships" in the filter panel.
2. Rose-colored events fade out of the timeline.
3. User re-checks to restore them.

### 9.4 Navigate by Arc

1. User clicks "Sect Tournament Arc" in the Story Arcs list.
2. Timeline scrolls to center on that arc region.
3. The minimap viewport indicator moves accordingly.

### 9.5 Use the Minimap

1. User drags the viewport indicator rectangle on the minimap.
2. The main timeline pans in sync.
3. User can also click directly on the minimap to jump to a position.

---

## 10. Responsive Behavior

| Breakpoint | Behavior                                                              |
| ---------- | --------------------------------------------------------------------- |
| `< md`     | Filter panel hidden (toggle). Timeline full-width. Minimap simplified |
| `md – <lg` | Filter panel visible. Timeline beside it                              |
| `≥ lg`     | Full layout with sidebar + timeline + minimap                         |

---

## 11. Error States

| Condition                | Display                                                 |
| ------------------------ | ------------------------------------------------------- |
| **No novels in library** | Redirect to Library or show "Add a novel first" message |
| **No events extracted**  | Empty timeline: "No events have been extracted yet."    |
| **Event loading failed** | Error toast with retry                                  |

---

## 12. Global Header

Standard shared header (see Library SPEC). Active nav link: `"AI Features"` — `text-primary text-sm font-semibold`.
