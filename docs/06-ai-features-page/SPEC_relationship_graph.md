# Relationship Graph — Functional Specification

> **Route:** `/ai/relationship-graph`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Visualize the web of connections between novel characters as an interactive, pannable, zoomable node-and-edge graph. Edges represent typed relationships (ally, enemy, romantic, master/disciple) with labels, and are filtered by a chapter timeline range to prevent spoilers. Clicking a node reveals detailed profile and connection information.

---

## 1. Page-Level Structure

The Relationship Graph page uses a **three-panel workspace** layout with a full-viewport canvas:

| Panel                  | Width    | Purpose                                                                |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| **Left Sidebar**       | `w-80`   | Source material, timeline range, character search, relationship legend |
| **Main Canvas**        | `flex-1` | Interactive SVG/Canvas graph with nodes and edges                      |
| **Right Detail Panel** | `w-80`   | Selected character profile, known connections                          |

### 1.1 Body Overflow

The page body uses `overflow-hidden` to prevent scrolling — all interaction happens via the pannable canvas.

---

## 2. Left Sidebar — Controls & Legend

### 2.1 Sidebar Header

- **Title:** `"Interactive Graph"` — `text-xl font-bold text-slate-900` with `hub` icon (primary color).
- **Subtitle:** `"Visualize complex character connections and affiliations."` — `text-sm text-slate-500`.

### 2.2 Source Material Dropdown

- **Label:** `"Source Material"` — `text-sm font-semibold text-slate-700`.
- **Input:** `<select>` dropdown — `bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-medium`.
- **Data source:** User's library novels.
- **Behavior:** Changing the novel reloads the entire graph (new characters, new relationships).

### 2.3 Timeline Range Slider

Controls the chapter boundary — only relationships established up to this point are shown.

- **Label:** `"Timeline Range"` — `text-sm font-semibold text-slate-700`.
- **Current value badge:** `text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md` — e.g., `"Ch. 1 - 250"`.
- **Explanation:** `"Adjust to avoid spoilers from later chapters."` — `text-xs text-slate-500`.
- **Range input:** `<input type="range">`, `min="1"`, `max="{novel.total_chapters}"`, `accent-primary`.
- **Range labels:** `"Ch. 1"` (left), `"Latest"` (right) — `text-[10px] text-slate-400 font-medium`.

**Behavior:**

- Dragging the slider filters the graph in real-time:
  - Character nodes that haven't appeared yet (by `first_appearance_chapter`) are hidden.
  - Relationship edges established after the range are hidden.
- Smooth animated transitions as nodes appear/disappear.

### 2.4 Find Character/Faction

- **Label:** `"Find Character/Faction"` — `text-sm font-semibold text-slate-700`.
- **Input:** Search field with `search` icon — `bg-slate-50 border border-slate-200 rounded-xl text-sm pl-9 pr-3 py-2.5 placeholder:text-slate-400`.
- **Placeholder:** `"e.g. Lin Fan, Crimson Sect..."`.
- **Behavior:** Typing filters the graph to highlight matching nodes and dim unrelated nodes. Pressing Enter or clicking a result zooms and pans the canvas to center on that character.

### 2.5 Relationship Legend

A fixed section below the controls, separated by `border-t border-slate-100 mt-8 pt-6`:

- **Title:** `"Relationship Legend"` — `text-sm font-semibold text-slate-700`.

| Relationship Type     | Line Visual                                             | Label                 |
| --------------------- | ------------------------------------------------------- | --------------------- |
| **Ally / Friendly**   | Solid line, `bg-emerald-500`, `h-0.5 w-8`               | `"Ally / Friendly"`   |
| **Enemy / Hostile**   | Dashed line, `border-t-2 border-dashed border-red-500`  | `"Enemy / Hostile"`   |
| **Romantic Interest** | Solid line, `bg-pink-400`, `h-0.5 w-8`                  | `"Romantic Interest"` |
| **Master / Disciple** | Dotted line, `border-t-2 border-dotted border-blue-500` | `"Master / Disciple"` |
| **Acquaintance**      | Solid line, `bg-slate-300`, `h-0.5 w-8`                 | `"Acquaintance"`      |

- **Entry layout:** `flex items-center gap-3`, each with line swatch + `text-xs font-medium text-slate-600`.

---

## 3. Main Canvas — Interactive Graph

### 3.1 Canvas Container

- **Container:** `flex-1 relative bg-slate-50/50 z-10 overflow-hidden`.
- **Cursor:** `cursor-grab` default, `active:cursor-grabbing` while dragging.
- **Dot-grid background:** `radial-gradient(#000 1px, transparent 1px)`, `background-size: 24px 24px`, `opacity-[0.03]`.

### 3.2 Graph Rendering

The graph is rendered using SVG overlaid on the canvas:

#### 3.2.1 Edges (Relationship Lines)

Edges are drawn as SVG `<path>` elements with quadratic Bézier curves (`Q` command) connecting character nodes:

| Relationship Type     | Stroke Color | Stroke Pattern           | Stroke Width | Marker      |
| --------------------- | ------------ | ------------------------ | ------------ | ----------- |
| **Ally / Friendly**   | `#10b981`    | Solid                    | `2`          | Arrow green |
| **Enemy / Hostile**   | `#ef4444`    | `stroke-dasharray="6,4"` | `2`          | Arrow red   |
| **Romantic**          | `#f472b6`    | Solid                    | `2`          | Arrow pink  |
| **Master / Disciple** | `#3b82f6`    | `stroke-dasharray="2,4"` | `2`          | Arrow blue  |
| **Acquaintance**      | `#cbd5e1`    | Solid                    | `1.5`        | None        |

- **All edges:** `fill="none"`.
- **Relationship label:** `<text>` element positioned at the midpoint of the curve — `font-size="12"`, `font-weight="600"`, `text-anchor="middle"`, fill color matches stroke.

#### 3.2.2 Arrow Markers

SVG `<marker>` definitions for directional edges:

```svg
<marker id="arrow-{color}" markerWidth="6" markerHeight="6"
        refX="20" refY="3" orient="auto-start-reverse">
  <path d="M 0 0 L 6 3 L 0 6 z" fill="{color}" />
</marker>
```

#### 3.2.3 Character Nodes

Each character is rendered as a positioned `<div>` (absolutely positioned within the canvas):

**Protagonist node (focal character):**

| Element           | Specification                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Glow ring**     | `absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse`                                                    |
| **Circle**        | `w-16 h-16 rounded-full bg-white border-4 border-primary shadow-[0_0_0_4px_rgba(140,43,238,0.1)]`                                |
| **Inner content** | `bg-primary/10`, initials text: `text-primary font-bold text-xl`                                                                 |
| **Name label**    | Below node: `bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-800 whitespace-nowrap` |

**Secondary character nodes:**

| Element           | Specification                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Circle**        | `w-12 h-12` or `w-14 h-14` (varies by importance), `rounded-full bg-white border-2 border-{type-color} shadow-sm`                                       |
| **Inner content** | `bg-{type-color}/10`, initials: `text-{type-color} font-bold text-sm`                                                                                   |
| **Hover glow**    | `group-hover:shadow-[0_0_15px_rgba({color-rgb},0.4)] transition-shadow`                                                                                 |
| **Name label**    | Below node: `bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap` |

**Node border color by primary relationship to protagonist:**

| Relationship | Border Color  | Inner BG         |
| ------------ | ------------- | ---------------- |
| Ally         | `emerald-500` | `emerald-500/10` |
| Enemy        | `red-500`     | `red-500/10`     |
| Romantic     | `pink-400`    | `pink-400/10`    |
| Mentor       | `blue-500`    | `blue-500/10`    |
| Neutral      | `slate-300`   | `slate-100`      |

**Node sizing by importance:**

| Importance      | Size        | Label style                |
| --------------- | ----------- | -------------------------- |
| Protagonist     | `w-16 h-16` | Bold, shadowed, glow ring  |
| Major character | `w-14 h-14` | Semibold label             |
| Supporting      | `w-12 h-12` | Standard label             |
| Minor           | `w-10 h-10` | Small label, lower opacity |

### 3.3 Canvas Interaction

| Action         | Behavior                                                               |
| -------------- | ---------------------------------------------------------------------- |
| **Pan**        | Click-and-drag on empty canvas space to pan the viewport               |
| **Zoom**       | Scroll wheel to zoom in/out. Minimum 0.3x, maximum 3x                  |
| **Click node** | Opens the right detail panel with character info and known connections |
| **Hover node** | Highlights all edges connected to that node, dims unrelated nodes      |
| **Hover edge** | Highlights the edge and shows the relationship label more prominently  |

### 3.4 Zoom Controls

A floating control group at the bottom-left of the canvas:

- **Container:** `absolute bottom-6 left-6`, `bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden`, flex row.
- **Buttons:**

| Button         | Icon         | Behavior                | Separator                   |
| -------------- | ------------ | ----------------------- | --------------------------- |
| **Zoom In**    | `zoom_in`    | Increment zoom by 0.25x | `border-r border-slate-200` |
| **Zoom Out**   | `zoom_out`   | Decrement zoom by 0.25x | `border-r border-slate-200` |
| **Fit Screen** | `fit_screen` | Reset to fit all nodes  | None                        |

- **Button style:** `p-2 hover:bg-slate-50 text-slate-600 transition-colors`, icon `text-xl`.

### 3.5 Graph Layout Algorithm

The graph uses a **force-directed layout** (e.g., D3.js force simulation or similar):

| Force Parameter     | Value / Behavior                                              |
| ------------------- | ------------------------------------------------------------- |
| **Center force**    | Protagonist node is attracted to center                       |
| **Link force**      | Edges act as springs; closer relationships = shorter distance |
| **Repulsion force** | Nodes repel each other to prevent overlap                     |
| **Collision force** | Minimum distance between node edges (node radius + 20px)      |
| **Gravity**         | Weak pull toward center to prevent drift                      |

---

## 4. Right Detail Panel — Character Info

Appears when a character node is clicked. Slides in from the right with `transform transition-transform duration-300`.

### 4.1 Close Button

- `close` icon — `text-slate-400 hover:text-slate-700 transition-colors`, top-right alignment.

### 4.2 Character Profile Header

Centered layout:

| Element           | Specification                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Avatar**        | `w-20 h-20 rounded-full bg-primary/10 border-2 border-primary`, initials `text-primary font-bold text-2xl`                            |
| **Name**          | `text-xl font-bold text-slate-900`                                                                                                    |
| **Title/Role**    | `text-sm font-medium text-primary` — e.g., `"The Supreme Dragon"`                                                                     |
| **Faction badge** | `inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600` — e.g., `"Faction: Heavenly Sword Sect"` |

### 4.3 Profile Summary

- **Label:** `"PROFILE SUMMARY"` — `text-xs font-bold text-slate-400 uppercase tracking-wider`.
- **Content:** `text-sm text-slate-600 leading-relaxed`.
- **Data source:** `characters.biography`.

### 4.4 Known Connections

- **Label:** `"KNOWN CONNECTIONS"` — `text-xs font-bold text-slate-400 uppercase tracking-wider`.
- **Each connection card:** `bg-slate-50 rounded-lg p-3 border border-slate-100`.

| Element              | Specification                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Color dot**        | `w-2 h-2 rounded-full bg-{type-color}` — matches relationship type                                                                     |
| **Name**             | `text-sm font-bold text-slate-800`                                                                                                     |
| **Relationship tag** | `text-[10px] font-medium text-{type-color} bg-{type-color}/10 px-1.5 py-0.5 rounded` — e.g., `"Sworn Brother"`, `"Rival"`, `"Fiancée"` |
| **Description**      | `text-xs text-slate-500 mt-1` — one-line summary of the relationship                                                                   |
| **Citation**         | `menu_book` icon + `"Cited: Ch. {N}"` — `text-[10px] text-slate-400 font-medium mt-2`                                                  |

**Data source:** `character_relationships` filtered by `chapter_number <= timeline_range`.

---

## 5. AI Graph Generation — Backend Logic

### 5.1 Relationship Extraction Pipeline

Character relationships are AI-extracted during novel ingestion:

```
Novel Chapters ──→ [Chunk & Embed] ──→ [NER: Character Detection]
                                              │
                         [Relationship Classification] ──→ [Graph DB / Table]
                                              │
                         [Conflict/Event Linking] ──→ [Chapter Citations]
```

### 5.2 Extraction Prompt

For each chapter or batch of chapters, the LLM is prompted:

```
Analyze this chapter text and extract ALL character relationships.

For each relationship found, provide:
1. character_a: Name of the first character
2. character_b: Name of the second character
3. relationship_type: One of [ally, enemy, romantic, master_disciple, acquaintance]
4. relationship_label: Specific label (e.g., "Sworn Brother", "Rival", "Fiancée")
5. description: One-sentence summary of the relationship
6. chapter_number: Chapter where this relationship is established or changes
7. direction: "bidirectional" or "a_to_b" (e.g., master→disciple)

Chapter text:
{chapter_content}
```

### 5.3 Relationship Merging

Relationships evolve over time. The system tracks changes:

- A relationship at Ch. 50 may be "Ally" but change to "Enemy" at Ch. 200.
- The graph shows the relationship state at the user's selected timeline position.
- New relationship entries override previous ones for the same character pair.

---

## 6. Data Layer

### 6.1 Database Tables

#### 6.1.1 New Table Required

**`character_relationships`** — Relationship edges between characters:

```sql
create table character_relationships (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  character_a_id uuid references characters(id) on delete cascade not null,
  character_b_id uuid references characters(id) on delete cascade not null,

  relationship_type text not null, -- 'ally', 'enemy', 'romantic', 'master_disciple', 'acquaintance'
  relationship_label text, -- e.g., 'Sworn Brother', 'Rival', 'Fiancée'
  description text,
  direction text default 'bidirectional', -- 'bidirectional' | 'a_to_b'

  chapter_established integer not null, -- chapter where this state begins
  chapter_ended integer, -- null if still active

  cited_chapter integer, -- primary chapter reference

  created_at timestamptz default timezone('utc', now()) not null,

  unique(novel_id, character_a_id, character_b_id, chapter_established)
);

create index idx_character_relationships_novel_id on character_relationships(novel_id);
create index idx_character_relationships_chars on character_relationships(character_a_id, character_b_id);
```

### 6.2 API Endpoints

| Method | Endpoint                                       | Description                                         |
| ------ | ---------------------------------------------- | --------------------------------------------------- |
| `GET`  | `/api/ai/graph/nodes?novel_id={id}&max_ch={n}` | Get character nodes visible at timeline position    |
| `GET`  | `/api/ai/graph/edges?novel_id={id}&max_ch={n}` | Get relationship edges visible at timeline position |
| `GET`  | `/api/ai/graph/character/:id?max_ch={n}`       | Get character detail + connections for detail panel |
| `GET`  | `/api/ai/graph/search?novel_id={id}&q={query}` | Search characters/factions by name                  |

#### 6.2.1 GET `/api/ai/graph/nodes` — Graph Nodes

**Response:**

```ts
interface GraphNode {
  id: string;
  name: string;
  initials: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  faction: string | null;
  importance_rank: number;
  first_appearance_chapter: number;
  primary_relationship_to_protagonist: string | null; // determines border color
}

interface GraphNodesResponse {
  nodes: GraphNode[];
}
```

#### 6.2.2 GET `/api/ai/graph/edges` — Graph Edges

**Response:**

```ts
interface GraphEdge {
  id: string;
  source_id: string; // character_a
  target_id: string; // character_b
  relationship_type:
    | "ally"
    | "enemy"
    | "romantic"
    | "master_disciple"
    | "acquaintance";
  label: string;
  direction: "bidirectional" | "a_to_b";
  chapter_established: number;
}

interface GraphEdgesResponse {
  edges: GraphEdge[];
}
```

---

## 7. State Machine

| State                     | Sidebar   | Canvas              | Detail Panel | Zoom Controls |
| ------------------------- | --------- | ------------------- | ------------ | ------------- |
| **Loading**               | Skeleton  | Spinner             | Hidden       | Hidden        |
| **Graph ready (no sel.)** | Populated | Nodes + edges shown | Hidden       | Visible       |
| **Node selected**         | Populated | Node highlighted    | Open         | Visible       |
| **Searching**             | Populated | Filtered/dimmed     | Hidden       | Visible       |
| **Empty (no chars)**      | Populated | Empty message       | Hidden       | Hidden        |
| **Error**                 | Populated | Error toast         | Hidden       | Hidden        |

---

## 8. User Flows

### 8.1 Explore the Graph

1. User navigates to `/ai/relationship-graph`.
2. Selects a novel from the dropdown.
3. Graph renders with character nodes and relationship edges.
4. User pans and zooms to explore.
5. User hovers over nodes to highlight their connections.

### 8.2 View Character Details

1. User clicks on a character node.
2. Right panel slides open with character profile.
3. Panel shows name, title, faction, biography, and all known connections.
4. Each connection card shows type, description, and chapter citation.

### 8.3 Filter by Timeline

1. User drags the timeline range slider.
2. Nodes and edges animate in/out based on the chapter range.
3. Characters not yet introduced disappear.
4. Relationships not yet established disappear.

### 8.4 Search for Character

1. User types a character or faction name in the search field.
2. Matching nodes are highlighted; non-matching nodes dim.
3. Pressing Enter zooms the canvas to center on the first match.

---

## 9. Responsive Behavior

| Breakpoint | Behavior                                                                      |
| ---------- | ----------------------------------------------------------------------------- |
| `< lg`     | Only canvas visible. Sidebar behind hamburger toggle. Detail panel as overlay |
| `lg – <xl` | Left sidebar + canvas. Detail panel overlays canvas                           |
| `≥ xl`     | Full three-panel layout                                                       |

---

## 10. Error States

| Condition                     | Display                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| **No novels in library**      | Empty sidebar with link to Library page                                |
| **No characters extracted**   | Canvas shows: "No character data available. Process this novel first." |
| **Graph rendering failed**    | Error toast with retry option                                          |
| **Search returns no results** | Inline indicator: "No characters or factions matching '{query}'"       |

---

## 11. Global Header

Standard shared header (see Library SPEC). Active nav link: `"Relationship Graph"` — `text-primary text-sm font-semibold` with `hub` icon.
