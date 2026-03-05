# Design System: NovelVerse — AI Features Pages

**Source:** Stitch-generated HTML screens  
**Screens analyzed:** 7 (Hub, Character Chat, Group Chat, Relationship Graph, Event Timeline, Concept Index, Story Q&A)

---

## 1. Visual Theme & Atmosphere

The AI Features suite projects a **bright, intelligent, and tool-forward** aesthetic — the kind of workspace where powerful analytical tools feel accessible rather than intimidating. Each feature page maintains the NovelVerse signature lightness while introducing **feature-specific accent colors** that give each tool its own identity without breaking the cohesive whole.

The Hub page acts as a showcase gallery with compact preview cards, while individual feature pages adopt a **three-panel workspace** layout (sidebar + main canvas + context panel) that communicates professional-grade capability wrapped in consumer-friendly warmth.

The overall philosophy is **"colorful clarity"** — each feature earns a distinct hue (purple for chat, emerald for group dynamics, blue for graphs, amber for timelines, rose for encyclopedias, indigo for Q&A), applied restrained to icons and accent surfaces, never as overwhelming washes.

**Keywords:** Bright, Intelligent, Tool-forward, Colorful-but-restrained, Workspace-grade.

---

## 2. Color Palette & Roles

### Global Primaries

| Name                 | Hex       | Role                                                                                  |
| -------------------- | --------- | ------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Global brand accent. Send buttons, active nav, accent badges, sliders, progress bars. |
| **Near-White Linen** | `#fafafa` | Page and panel backgrounds. Warm, non-harsh canvas.                                   |
| **Pure Snow**        | `#ffffff` | Card surfaces, chat bubbles (AI side), sidebars, headers.                             |

### Slate Neutral Scale

| Name              | Hex                   | Role                                                                                |
| ----------------- | --------------------- | ----------------------------------------------------------------------------------- |
| **Deep Charcoal** | `#0f172a` (slate-900) | Page titles, active nav, character names. Also used as dark chat bubble background. |
| **Graphite**      | `#334155` (slate-700) | Body text in chat, card descriptions, form labels.                                  |
| **Storm Gray**    | `#475569` (slate-600) | Select dropdown text, category labels, metadata tags.                               |
| **Pewter**        | `#64748b` (slate-500) | Subtitles, inactive nav, placeholder-adjacent text, timestamp text.                 |
| **Silver Mist**   | `#94a3b8` (slate-400) | Placeholder text, icons at rest, chapter range labels, section headers (uppercase). |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Timeline connector lines, avatar placeholders, inactive dots.                       |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Borders on cards, inputs, sidebars, header dividers, chat bubble borders.           |
| **Ghost White**   | `#f1f5f9` (slate-100) | Inner container backgrounds, subtle card borders, tag backgrounds.                  |
| **Barely There**  | `#f8fafc` (slate-50)  | Panel inner backgrounds (`bg-slate-50`), chat area canvas, form field backgrounds.  |

### Feature Accent Colors

Each AI feature uses a unique accent to differentiate its icon, interactive focus states, and highlighted data surfaces:

| Feature                | Accent Name              | Hex(es)                 | Usage                                                            |
| ---------------------- | ------------------------ | ----------------------- | ---------------------------------------------------------------- |
| **Character Chat**     | Royal Amethyst (primary) | `#8c2bee`               | Icon bg `primary/10`, user bubble bg, send button.               |
| **Group Chat**         | Verdant Emerald          | `#10b981` (emerald-500) | Icon bg `emerald-500/10`, chat bubble borders, member initials.  |
| **Relationship Graph** | Ocean Blue               | `#3b82f6` (blue-500)    | Icon bg `blue-500/10`, node glow, ally edge lines.               |
| **Event Timeline**     | Warm Amber               | `#f59e0b` (amber-500)   | Icon bg `amber-500/10`, active event dots, highlighted arc.      |
| **Concept Index**      | Coral Rose               | `#f43f5e` (rose-500)    | Icon bg `rose-500/10`, focus ring color, search accent.          |
| **Story Q&A**          | Deep Indigo              | `#6366f1` (indigo-500)  | Icon bg `indigo-500/10`, user question bubble, source citations. |

### Relationship Graph Edge Colors

| Line Style  | Color                   | Meaning           |
| ----------- | ----------------------- | ----------------- |
| Solid green | `#10b981` (emerald-500) | Ally / Friendly   |
| Dashed red  | `#ef4444` (red-500)     | Enemy / Hostile   |
| Solid pink  | `#f472b6` (pink-400)    | Romantic Interest |
| Dotted blue | `#3b82f6` (blue-500)    | Master / Disciple |
| Solid gray  | `#cbd5e1` (slate-300)   | Acquaintance      |

---

## 3. Typography Rules

### Font Family

**Inter** (Google Fonts) — geometric sans-serif optimized for screen readability. Applied globally as `font-sans: ["Inter", "sans-serif"]`.

### Type Scale

| Element                           | Size                           | Weight                | Tracking/Leading           | Color             |
| --------------------------------- | ------------------------------ | --------------------- | -------------------------- | ----------------- |
| Page Title (`h1`)                 | `text-2xl` to `text-4xl`       | `font-bold` (700)     | `tracking-tight`           | slate-900         |
| Page Subtitle                     | `text-base` (16px)             | `font-normal` (400)   | Default                    | slate-500         |
| Logo Text                         | `text-xl` (20px)               | `font-bold` (700)     | `tracking-tight`           | slate-900         |
| Feature Card Title (`h3`)         | `text-lg` (18px)               | `font-bold` (700)     | Default                    | slate-900         |
| Sidebar Section Header            | `text-sm` (14px)               | `font-semibold` (600) | Default                    | slate-900         |
| Sidebar Section Label (uppercase) | `text-xs` (12px)               | `font-bold` (700)     | `uppercase tracking-wider` | slate-400         |
| Chat Bubble Text                  | `text-sm` (14px)               | `font-normal` (400)   | `leading-relaxed`          | slate-700         |
| Character Name (chat)             | `text-xs` (12px)               | `font-semibold` (600) | Default                    | slate-700         |
| Personality Trait Tag             | `text-[11px]`                  | `font-medium` (500)   | Default                    | slate-600         |
| Metadata / Timestamp              | `text-xs` or `text-[10px]`     | `font-medium` (500)   | Default                    | slate-400/500     |
| Source Citation Text              | `text-[11px]`                  | `font-medium` (500)   | Default                    | indigo-700        |
| Category Count Badge              | `text-xs` (12px)               | `font-normal` (400)   | Default                    | primary/slate-500 |
| Minimap Label                     | `text-[9px]`                   | `font-medium` (500)   | Default                    | slate-400         |
| AI Disclaimer                     | `text-[10px]` to `text-[11px]` | `font-normal` (400)   | Default                    | slate-400         |

### Weight Hierarchy

- **700 (Bold):** Page titles, card titles, detail panel headings, character names in headers.
- **600 (Semibold):** Sidebar labels, active nav, personality tags, arc buttons (active).
- **500 (Medium):** Nav links, metadata, chat sender names, form labels.
- **400 (Regular):** Body text, chat content, descriptions, subtitles.

---

## 4. Component Stylings

### 4.1 Hub Feature Cards

- **Shape:** Generously rounded (`rounded-2xl`, 16px).
- **Background:** Pure white (`bg-white`).
- **Border:** `border border-slate-100`.
- **Shadow:** Whisper-lift at rest: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- **Shadow (hover):** Gentle bloom: `shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)]`.
- **Transition:** `transition-all duration-300`.
- **Padding:** `p-6` (24px).
- **Height:** `h-full` — fills grid row.
- **Icon Badge:** `p-2 rounded-lg bg-{accent}/10 text-{accent}` — small rounded square with feature tint.
- **Preview Area:** `bg-slate-50 p-4 rounded-xl border border-slate-100` — an inset preview region with muted canvas.
- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`.

### 4.2 Chat Bubbles (Character Chat & Group Chat)

#### AI / Character Message (left-aligned)

- **Shape:** `rounded-2xl rounded-tl-none` (Character Chat) or `rounded-2xl rounded-tl-sm` (Group Chat).
- **Background:** `bg-white` with `border border-slate-200`.
- **Shadow:** `shadow-sm`.
- **Padding:** `px-5 py-3` (Character Chat) or `p-4` (Group Chat).
- **Text:** `text-sm text-slate-700 leading-relaxed`.
- **Avatar:** `w-8 h-8 rounded-full` (Character Chat) or `w-10 h-10` (Group Chat), `object-cover`, with `border border-slate-200`.

#### User Message (right-aligned)

- **Shape:** `rounded-2xl rounded-tr-none` (Character Chat) or `rounded-tr-sm` (Group Chat).
- **Background:** `bg-primary/10 border border-primary/20` (Character Chat) or varies per character in Group Chat.
- **Text:** `text-sm text-slate-800`.

#### Group Chat — Character Differentiation

| Character   | Bubble BG           | Text Color | Avatar BG        |
| ----------- | ------------------- | ---------- | ---------------- |
| Character 1 | `bg-white` + border | slate-700  | `bg-blue-100`    |
| Character 2 | `bg-slate-900`      | slate-200  | `bg-purple-100`  |
| Character 3 | `bg-emerald-50`     | slate-700  | `bg-emerald-100` |

#### Feedback Buttons (Character Chat)

- Three inline buttons below AI messages: 👍 (`thumb_up`), 👎 (`thumb_down`), 📋 (`content_copy`).
- Color: `text-slate-400`, hover to `text-primary` (up), `text-rose-500` (down), `text-slate-700` (copy).
- Size: `text-[14px]` icons.

### 4.3 Chat Input Area

- **Container:** `rounded-2xl p-2`, `bg-slate-50` (Character Chat) or `bg-white` (Story Q&A).
- **Border:** `border border-slate-200`, focus: `border-primary ring-1 ring-primary`.
- **Textarea:** `bg-transparent`, `text-sm text-slate-700`, `resize-none`, `min-h-[44px] max-h-32`.
- **Send Button:** `p-2 bg-primary text-white rounded-xl shadow-sm`, hover: `bg-primary/90`.
- **Regenerate Button:** `p-2 text-slate-400 hover:text-slate-700 rounded-xl`.
- **Disclaimer:** Centered text below input, `text-[10px] text-slate-400`.

### 4.4 Sidebar Panels

All feature pages use consistent sidebar patterns:

- **Width:** `w-80` (320px) for left/right panels, `w-72` (288px) for narrow context panels, `w-64` (256px) for filter panels.
- **Background:** `bg-white`.
- **Border:** `border-r border-slate-200` (left) or `border-l border-slate-200` (right).
- **Padding:** `p-6` for content areas.
- **Scrolling:** `overflow-y-auto`, with `scrollbar-hide` utility.
- **Section Separator:** `border-b border-slate-100`.
- **Section Heading:** `text-xs font-bold text-slate-400 uppercase tracking-wider mb-3`.
- **Select Inputs:** `bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm`.

### 4.5 Knowledge Range Slider

- **Track:** `h-1.5 bg-slate-200 rounded-lg`.
- **Accent:** `accent-primary` (browser native accent on `<input type="range">`).
- **Labels:** Chapter range in `text-[10px] text-slate-400`, current value in `text-primary font-bold`.
- **Context Label:** Badge showing current chapter: `bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold`.

### 4.6 Relationship Graph Components

#### Character Nodes

| Node Type      | Size        | Border                    | Glow                                                          |
| -------------- | ----------- | ------------------------- | ------------------------------------------------------------- |
| Main Character | `w-16 h-16` | `border-4 border-primary` | Pulsing aura: `bg-primary/20 blur-xl scale-150 animate-pulse` |
| Major chars    | `w-14 h-14` | `border-2 border-{color}` | Hover glow: `shadow-[0_0_15px_rgba({r},{g},{b},0.4)]`         |
| Minor chars    | `w-12 h-12` | `border-2 border-{color}` | Same hover glow pattern                                       |

#### Node Labels

- Below node via absolute positioning: `bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-slate-200 text-xs font-semibold text-slate-700`.
- MC label uses opaque `bg-white` and `text-sm font-bold`.

#### Graph Canvas

- Background: `bg-slate-50/50` with dot grid overlay: `radial-gradient(#000 1px, transparent 1px)` at `24px` intervals, `opacity-[0.03]`.
- Cursor: `cursor-grab active:cursor-grabbing`.
- Zoom controls: Grouped button strip `bg-white rounded-lg shadow-sm border border-slate-200`, positioned `bottom-6 left-6`.

#### Connection Detail Cards (right sidebar)

- Container: `bg-slate-50 rounded-lg p-3 border border-slate-100`.
- Relationship badge: `text-[10px] font-medium bg-{color}-100 text-{color}-600 px-1.5 py-0.5 rounded`.
- Citation: `text-[10px] text-slate-400 font-medium` with `menu_book` icon.

### 4.7 Event Timeline Components

#### Timeline Canvas

- Horizontal scrollable area within a `rounded-2xl bg-white border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]` container.
- Central connector line: `h-1 bg-slate-200` centered vertically.
- Story arc backgrounds: Semi-transparent tinted columns (`bg-amber-50/50`, `bg-emerald-50/50`).

#### Event Nodes

| Node Type       | Size      | Color                     | Ring                                                       |
| --------------- | --------- | ------------------------- | ---------------------------------------------------------- |
| Standard event  | `w-4 h-4` | `bg-{category-color}-500` | `shadow-[0_0_0_4px_white,0_0_0_6px_rgba({r},{g},{b},0.3)]` |
| Active/selected | `w-5 h-5` | `bg-amber-500`            | `shadow-[0_0_0_4px_white,0_0_0_8px_rgba(245,158,11,0.4)]`  |

#### Event Detail Popover

- `w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50`.
- Category badge: `px-2 py-0.5 rounded text-[10px] font-bold bg-{color}-100 text-{color}-700`.
- AI Note: `bg-slate-50 rounded-lg p-2 flex items-center gap-2 text-xs border border-slate-100` with `auto_awesome` icon.

#### Event Category Colors

| Category               | Dot Color        |
| ---------------------- | ---------------- |
| Major Plot Points      | `bg-amber-500`   |
| Character Growth       | `bg-blue-500`    |
| World History          | `bg-emerald-500` |
| Romances/Relationships | `bg-rose-500`    |

#### Minimap

- `h-16 bg-white rounded-xl border border-slate-200 shadow-sm`.
- Arc sections shown as colored bars (`bg-amber-200/60`, `bg-emerald-200/60`, `bg-purple-200/60`).
- Selection window: `border-2 border-primary rounded bg-primary/10 cursor-ew-resize` with outer dimming via `shadow-[0_0_0_9999px_rgba(255,255,255,0.4)]`.

### 4.8 Concept Index Components

#### Category List (sidebar)

- Active category: `bg-primary/10 text-primary font-medium` with count badge `bg-primary/20 text-primary rounded-full`.
- Inactive category: `text-slate-600 hover:bg-slate-100`, count badge `bg-slate-100 text-slate-500 rounded-full`.
- Icon: Material Symbol per category, `text-lg`.

#### Concept Entry Cards

- **Selected/Active:** `border-2 border-primary/20 rounded-xl p-5 shadow-sm` with left accent bar `w-1 bg-primary rounded-l-xl`.
- **Default:** `border border-slate-200 rounded-xl p-5 shadow-sm`, hover: `shadow-md border-slate-300`.
- **Metadata row:** Sub-stage count badge: `bg-primary/5 text-primary rounded-md`, lifespan badge: `bg-slate-50 text-slate-500 border border-slate-100 rounded-md`.
- **Chapter citation:** `text-slate-400` with `menu_book` icon.

#### Concept Detail Panel (right)

- Animated illustration: Concentric rotating rings (`animate-[spin_10s_linear_infinite]`) around a glowing primary core.
- Source evidence blocks: Left accent bar `before:w-1 before:bg-primary/40 before:rounded-r`, chapter title in `text-xs font-semibold text-primary`.
- Block quote: `text-[11px] text-slate-600 italic pl-2 border-l border-slate-100`.

### 4.9 Story Q&A Components

#### User Question Bubble

- `bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-md shadow-primary/20`.
- Aligned right via `self-end max-w-[80%]`.

#### AI Answer Bubble

- `bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- AI avatar: `w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200` with `robot_2` Material icon.
- Inline entity highlighting: `font-semibold text-primary` for key terms.

#### Source Citation Chips

- Primary source: `bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 text-[11px] font-medium`, with `menu_book` icon.
- Secondary source: `bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium`, with `history_edu` icon.
- Hover: slightly darker bg, `cursor-pointer transition-colors`.

#### Quick Context Panel (right sidebar)

- Arc card: `bg-white p-4 rounded-xl border border-slate-200 shadow-sm`.
- Entity cards: Same styling with avatar initials (`w-8 h-8 rounded-full bg-{color}-100`).
- Item cards: Square icon container (`w-8 h-8 rounded-md bg-purple-100`).
- Active indicator: Animated ping dot `w-1.5 h-1.5 rounded-full bg-emerald-500` with `animate-ping` overlay.

#### Loading State

- Three bouncing dots: `w-2 h-2 bg-slate-300 rounded-full animate-bounce` with staggered `animation-delay`.
- Text: `text-slate-500 italic text-sm` — "Searching knowledge base...".

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

### Global Icons

| Icon Name      | Usage                       | Size          |
| -------------- | --------------------------- | ------------- |
| `auto_stories` | Logo icon                   | `text-2xl`    |
| `search`       | Search inputs               | `text-xl`     |
| `send`         | Send message in chat        | `text-[20px]` |
| `autorenew`    | Regenerate response         | `text-[20px]` |
| `arrow_back`   | Back navigation             | `text-base`   |
| `settings`     | Settings in dropdown        | `text-lg`     |
| `logout`       | Log out in dropdown         | `text-lg`     |
| `close`        | Close / Remove item         | `text-sm`     |
| `menu_book`    | Source/chapter citations    | `text-sm`     |
| `auto_awesome` | AI note / insight highlight | `text-sm`     |
| `more_vert`    | Context menu trigger        | Default       |

### Feature-Specific Icons

| Feature            | Icon Name(s)                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Character Chat     | `forum`, `book`, `person`, `tune`, `refresh`                                                     |
| Group Chat         | `groups`, `add_circle`, `play_arrow`, `edit`, `delete`, `memory`                                 |
| Relationship Graph | `hub`, `zoom_in`, `zoom_out`, `fit_screen`                                                       |
| Event Timeline     | `timeline`, `swords`                                                                             |
| Concept Index      | `menu_book`, `psychiatry`, `auto_fix_high`, `swords`, `public`, `diversity_3`, `verified`, `add` |
| Story Q&A          | `psychology_alt`, `robot_2`, `history_edu`, `add_circle`, `local_fire_department`                |

---

## 6. Layout Principles

### Hub Page Layout

- **Max-width:** `max-w-[1200px]` centered.
- **Horizontal padding:** `px-8 md:px-12 lg:px-20`.
- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`.
- **Header–content gap:** `mb-8` after header, `mb-10` after title section.

### Feature Page Layouts (Three-Panel Workspace)

All individual feature pages follow a **sidebar + main + context panel** pattern:

| Panel        | Width         | Background                  | Features                              |
| ------------ | ------------- | --------------------------- | ------------------------------------- |
| Left Sidebar | `w-80`        | `bg-white`                  | Configuration, selection, navigation  |
| Main Area    | `flex-1`      | `bg-slate-50/50`            | Chat messages, graph canvas, timeline |
| Right Panel  | `w-72`–`w-80` | `bg-white` or `bg-slate-50` | Context, lore, connections, entities  |

- **Overflow:** `overflow-hidden` on root, `overflow-y-auto` on individual panels.
- **Sticky Headers:** Chat headers use `bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm`.

### Spacing Strategy

- **Panel padding:** `p-6` consistently within sidebars.
- **Chat message gap:** `gap-6` between messages.
- **Section spacing:** `mb-6` between sidebar sections.
- **Chat max-width:** `max-w-3xl` for message bubbles, `max-w-4xl` for input container.
- **Inner panels:** `space-y-3` to `space-y-4` for stacked items.

### Depth & Elevation

| Level               | Usage                           | Shadow                             |
| ------------------- | ------------------------------- | ---------------------------------- |
| 0 — Canvas          | Page background, chat area      | None                               |
| 1 — Card (rest)     | Hub cards, sidebar panels       | `0 2px 10px -4px rgba(0,0,0,0.05)` |
| 1.5 — Card (hover)  | Hub cards on hover              | `0 8px 20px -8px rgba(0,0,0,0.08)` |
| 2 — Floating        | Chat input area, sticky headers | `shadow-sm`                        |
| 2.5 — Popover       | Event detail, dropdowns         | `shadow-xl` or `shadow-lg`         |
| 3 — Graph node glow | MC node aura                    | `blur-xl` + `animate-pulse`        |

### Responsive Breakpoints

- **Mobile (`< md`):** Single-column hub grid, sidebars hidden behind toggles, full-width main area.
- **Tablet (`md`):** 2-column hub grid, left sidebar visible.
- **Desktop (`lg`):** 3-column hub grid, both sidebars visible.
- **Wide (`xl`):** Right context panel visible (Story Q&A).

---

## 7. Interaction & Motion

### Transitions

| Element                    | Property  | Duration | Easing         |
| -------------------------- | --------- | -------- | -------------- |
| Card shadow & border       | `all`     | `300ms`  | Default (ease) |
| Nav link text color        | `colors`  | `150ms`  | Default        |
| Button background          | `colors`  | `150ms`  | Default        |
| Chat input focus ring      | `all`     | `150ms`  | Default        |
| Node glow (graph)          | `shadow`  | `150ms`  | Default        |
| Dropdown visibility        | `all`     | `200ms`  | Default        |
| Edit/delete button opacity | `opacity` | `150ms`  | Default        |

### Hover Behaviors

| Element              | Hover Effect                                                          |
| -------------------- | --------------------------------------------------------------------- |
| Hub card             | Shadow blooms, border may tighten                                     |
| Timeline event dot   | `scale-125` with smooth transition                                    |
| Graph node           | Colored glow aura appears: `shadow-[0_0_15px_rgba({r},{g},{b},0.4)]`  |
| Sidebar nav item     | `bg-slate-100 text-slate-900`                                         |
| Chat message actions | `opacity-0` → `opacity-100` on message hover (Group Chat edit/delete) |
| Citation chip        | Background darkens slightly                                           |

### Animations

| Animation | Usage                              | Spec                                  |
| --------- | ---------------------------------- | ------------------------------------- |
| Pulse     | MC node glow (graph), activity dot | `animate-pulse` (CSS default)         |
| Ping      | Active knowledge indicator (Q&A)   | `animate-ping` on inner dot           |
| Bounce    | Loading dots (Q&A)                 | `animate-bounce` with staggered delay |
| Spin      | Concept illustration rings         | `animate-[spin_10s_linear_infinite]`  |

---

## 8. Design Reference Screenshots

| Screen               | File                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| AI Features Hub      | [ai-1-hub.png](assets/ai-1-hub.png)                                   |
| Character Chat       | [ai-2-character-chat.png](assets/ai-2-character-chat.png)             |
| Character Group Chat | [ai-3-character-group-chat.png](assets/ai-3-character-group-chat.png) |
| Relationship Graph   | [ai-4-relationship-graph.png](assets/ai-4-relationship-graph.png)     |
| Event Timeline       | [ai-5-event-timeline.png](assets/ai-5-event-timeline.png)             |
| Concept Index        | [ai-6-concept-index.png](assets/ai-6-concept-index.png)               |
| Story Q&A            | [ai-7-story-qa.png](assets/ai-7-story-qa.png)                         |

Source HTML files for each screen are co-located in the `assets/` directory:

- [ai-1-hub.html](assets/ai-1-hub.html)
- [ai-2-character-chat.html](assets/ai-2-character-chat.html)
- [ai-3-character-group-chat.html](assets/ai-3-character-group-chat.html)
- [ai-4-relationship-graph.html](assets/ai-4-relationship-graph.html)
- [ai-5-event-timeline.html](assets/ai-5-event-timeline.html)
- [ai-6-concept-index.html](assets/ai-6-concept-index.html)
- [ai-7-story-qa.html](assets/ai-7-story-qa.html)
