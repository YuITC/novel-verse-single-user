# Design System: NovelVerse — Crawler Page

**Stitch Project ID:** `719353196857464339`
**Screen ID:** Crawler #1 - Main

---

## 1. Visual Theme & Atmosphere

The Crawler page carries the same **clean, airy, and purposeful** aesthetic found throughout NovelVerse, but introduces a **utilitarian, engineering-dashboard** undertone appropriate for a tool-centric workflow. The page balances the soft bookish sensibility with the precision of a command-line interface, creating a feel that is **professional yet approachable**.

The terminal-style log panel — dark, monospaced, and quietly authoritative — serves as the page's visual anchor, grounding the otherwise light UI with a sense of technical depth. The overall impression is of a **well-crafted instrument panel**: clean controls up top, live diagnostic output in the center, and organized results below.

**Keywords:** Clean, Utilitarian, Dashboard-like, Technical, Purposeful.

---

## 2. Color Palette & Roles

### Primary Colors

| Name                 | Hex       | Role                                                                                                                                        |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Primary brand accent. Used for: "Start Crawl" button, URL input focus ring, source link text, logo icon. Applied boldly on the primary CTA. |
| **Near-White Linen** | `#fafafa` | Page background. The barely-warm gray canvas everything sits upon.                                                                          |
| **Pure Snow**        | `#ffffff` | Card surfaces for the status panel, metadata sidebar, and chapters list. Creates the lifted-card depth effect.                              |

### Neutral Palette (Slate Scale)

| Name              | Hex                   | Role                                                                                        |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| **Deep Charcoal** | `#0f172a` (slate-900) | Page title, novel title, chapter titles, section headers. Also the terminal log background. |
| **Graphite**      | `#334155` (slate-700) | —                                                                                           |
| **Storm Gray**    | `#475569` (slate-600) | —                                                                                           |
| **Pewter**        | `#64748b` (slate-500) | Subtitle text, metadata labels, "Showing latest" caption, stat labels.                      |
| **Silver Mist**   | `#94a3b8` (slate-400) | Timestamp text, URL input placeholder, chapter URL path text.                               |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Terminal log base text color (`text-slate-300`).                                            |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Input borders at rest, header divider, card borders.                                        |
| **Ghost White**   | `#f1f5f9` (slate-100) | Progress bar background, card borders, inner row separators.                                |
| **Near Canvas**   | `#f8fafc` (slate-50)  | Hover background in chapter rows, metadata row separators.                                  |

### Semantic Colors

| Name                     | Hex                     | Role                                                             |
| ------------------------ | ----------------------- | ---------------------------------------------------------------- |
| **Success Emerald**      | `#059669` (emerald-600) | Successful chapter count number in status panel.                 |
| **Success Emerald BG**   | `#ecfdf5` (emerald-50)  | Success badge pill background.                                   |
| **Success Emerald Text** | `#047857` (emerald-700) | Success badge text and icon.                                     |
| **Success Emerald 500**  | `#10b981` (emerald-500) | Progress bar success segment.                                    |
| **Alert Amber**          | `#d97706` (amber-600)   | In-progress status message text (e.g., "Bypassing Cloudflare…"). |
| **Danger Rose**          | `#f43f5e` (rose-500)    | Failed chapter count number, progress bar failure segment.       |
| **Danger Rose BG**       | `#fff1f2` (rose-50)     | Failed badge pill background, failed row tint.                   |
| **Danger Rose Text**     | `#be123c` (rose-700)    | Failed badge text and icon.                                      |

### Terminal Log Colors

| Name              | Hex                     | Role                                       |
| ----------------- | ----------------------- | ------------------------------------------ |
| **Terminal BG**   | `#0f172a` (slate-900)   | Log container background — dark, recessed. |
| **Terminal Text** | `#cbd5e1` (slate-300)   | Default log text color.                    |
| **Log Info**      | `#34d399` (emerald-400) | `[INFO]` tag color — positive operations.  |
| **Log Warning**   | `#fbbf24` (amber-400)   | `[WARN]` tag color — caution notices.      |
| **Log Error**     | `#fb7185` (rose-400)    | `[ERROR]` tag color — failure markers.     |

---

## 3. Typography Rules

### Font Family

**Inter** (Google Fonts) — geometric sans-serif for screen readability. Applied globally: `font-sans: ["Inter", "sans-serif"]`.

### Type Scale

| Element                  | Size                                 | Weight                  | Tracking                    | Color     |
| ------------------------ | ------------------------------------ | ----------------------- | --------------------------- | --------- |
| Page Title (`h1`)        | `text-3xl md:text-4xl` (30px → 36px) | `font-bold` (700)       | `tracking-tight` (-0.025em) | slate-900 |
| Page Subtitle            | `text-base` (16px)                   | `font-normal` (400)     | Default                     | slate-500 |
| Logo Text                | `text-xl` (20px)                     | `font-bold` (700)       | `tracking-tight`            | slate-900 |
| Section Title (`h3`)     | `text-lg` (18px)                     | `font-bold` (700)       | Default                     | slate-900 |
| Novel Title              | `text-xl` (20px)                     | `font-bold` (700)       | Default                     | slate-900 |
| Status Message           | `text-sm` (14px)                     | `font-medium` (500)     | Default                     | amber-600 |
| Stat Label               | `text-sm` (14px)                     | `font-medium` (500)     | Default                     | slate-500 |
| Stat Number              | `text-xl` (20px)                     | `font-bold` (700)       | Default                     | Varies    |
| Chapter Row Title (`h4`) | `text-sm` (14px)                     | `font-semibold` (600)   | Default                     | slate-900 |
| Chapter URL Path         | `text-xs` (12px)                     | `font-normal` (400)     | Default                     | slate-500 |
| Badge Text               | `text-xs` (12px)                     | `font-semibold` (600)   | Default                     | Varies    |
| Timestamp                | `text-xs` (12px)                     | `font-normal` (400)     | Default                     | slate-400 |
| Metadata Label           | `text-sm` (14px)                     | `font-medium` (500)     | Default                     | slate-500 |
| Metadata Value           | `text-sm` (14px)                     | `font-normal` (400)     | Default                     | slate-900 |
| Description              | `text-sm` (14px)                     | `font-normal` (400)     | `leading-relaxed` (1.625)   | slate-500 |
| Terminal Log             | `text-xs` (12px)                     | Monospace (`font-mono`) | Default                     | slate-300 |
| URL Input Text           | `text-sm` (14px)                     | `font-medium` (500)     | Default                     | slate-900 |
| URL Input Placeholder    | `text-sm` (14px)                     | `font-normal` (400)     | Default                     | slate-400 |
| Nav Links (active)       | `text-sm` (14px)                     | `font-semibold` (600)   | Default                     | slate-900 |
| Nav Links (inactive)     | `text-sm` (14px)                     | `font-medium` (500)     | Default                     | slate-500 |
| Button Text              | `text-base` (16px)                   | `font-semibold` (600)   | Default                     | white     |

### Weight Hierarchy

- **700 (Bold):** Page title, section titles, novel title, stat numbers — anchors.
- **600 (Semibold):** Active nav, chapter titles, badges, primary CTA — emphasis.
- **500 (Medium):** Metadata labels, stat labels, URL input text — supporting.
- **400 (Regular):** Descriptions, subtitles, timestamps, placeholder — reading.

---

## 4. Component Stylings

### 4.1 URL Input Field

- **Shape:** Generously rounded (`rounded-xl`, 12px radius).
- **Background:** Pure white (`bg-white`).
- **Border:** `border border-slate-200` at rest; `border-primary ring-1 ring-primary` on focus.
- **Padding:** `pl-11 pr-4 py-3` — generous left padding for the icon prefix.
- **Shadow:** `shadow-sm` — barely visible lift.
- **Icon Prefix:** `link` Material icon, positioned absolutely at left, `text-slate-400`, `pointer-events-none`.
- **Transition:** `transition-all` on border and ring.

### 4.2 Start Crawl Button

- **Shape:** Boldly rounded (`rounded-xl`).
- **Background:** Solid Royal Amethyst (`bg-primary`).
- **Text:** Pure white, `font-semibold`.
- **Padding:** `px-8 py-3`.
- **Shadow:** `shadow-sm`.
- **Icon:** `play_arrow` Material icon, `text-xl`, left of label.
- **Hover:** `bg-primary/90` — slight transparency fade.
- **Disabled state:** `opacity-50 cursor-not-allowed`.
- **No-wrap:** `whitespace-nowrap`, flex centered with `gap-2`.

### 4.3 Status Panel (Crawl Status Card)

- **Shape:** Generously rounded (`rounded-2xl`, 16px radius).
- **Background:** Pure white (`bg-white`).
- **Border:** `border border-slate-100`.
- **Shadow:** Whisper-soft `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- **Padding:** `p-6` (24px) all sides.
- **Layout:** Header row (title + stats) → Progress bar → Terminal log, separated by `mb-4` / `mb-6`.

### 4.4 Progress Bar

- **Container:** `h-2.5`, `rounded-full`, `bg-slate-100`, `overflow-hidden`, `flex`.
- **Success segment:** `bg-emerald-500`, `rounded-l-full` — grows from left.
- **Failed segment:** `bg-rose-500` — immediately follows the success segment.
- **Animation:** Width transitions smoothly as percentages update.

### 4.5 Terminal Log

- **Shape:** Rounded (`rounded-xl`, 12px radius).
- **Background:** Deep Charcoal (`bg-slate-900`) — dark, recessed, console-like.
- **Height:** Fixed `h-48` (192px) with `overflow-y-auto` for scrolling.
- **Padding:** `p-4` (16px).
- **Font:** Monospace (`font-mono`), `text-xs`.
- **Text color:** `text-slate-300` default; colored tags for log levels.
- **Shadow:** `shadow-inner` — subtle inset shadow reinforcing the recessed feel.
- **Line spacing:** `mb-1` between log lines.
- **Animated ellipsis:** The trailing `...` pulses with `animate-pulse` to indicate ongoing activity.

### 4.6 Novel Metadata Card (Sidebar)

- **Shape:** Generously rounded (`rounded-2xl`).
- **Background:** Pure white.
- **Border:** `border border-slate-100`.
- **Shadow:** Same whisper-soft shadow as the status panel.
- **Padding:** `p-6`.
- **Position:** `sticky top-6` — remains visible while scrolling the chapters list.
- **Cover Image:** Full-width, `aspect-[2/3]`, `rounded-xl`, `border border-slate-100`, `shadow-sm`, `mb-6`.
- **Metadata rows:** `flex justify-between`, separated by `border-b border-slate-50`, `pb-2`. Last row has no bottom border.

### 4.7 Chapters List Card

- **Shape:** Generously rounded (`rounded-2xl`).
- **Background:** Pure white.
- **Border:** `border border-slate-100`.
- **Shadow:** Same whisper-soft shadow.
- **Height:** Fixed `h-[800px]` with `overflow-hidden` on container, `overflow-y-auto` on inner scroll area.
- **Header:** Sticky (`sticky top-0`), white background, `z-10`, `p-6`, `border-b border-slate-100`.

### 4.8 Chapter Row

- **Padding:** `p-4` (16px) all sides.
- **Separator:** `border-b border-slate-50` — ghostly thin. Last item: no border.
- **Hover:** `bg-slate-50` background. `rounded-xl` corners on hover.
- **Failed row tint:** `bg-rose-50/30` at rest → `bg-rose-50/50` on hover.
- **Transition:** `transition-colors` for smooth hover effect.
- **Layout:** `flex items-center justify-between gap-4`.

### 4.9 Status Badges

- **Shape:** Pill-shaped (`rounded-full`).
- **Padding:** `px-2.5 py-1`.
- **Typography:** `text-xs font-semibold`.
- **Layout:** `inline-flex items-center gap-1`.
- **Icon size:** `text-[14px]`.

| Variant     | Background      | Text Color  | Icon           |
| ----------- | --------------- | ----------- | -------------- |
| **Success** | `bg-emerald-50` | emerald-700 | `check_circle` |
| **Failed**  | `bg-rose-50`    | rose-700    | `error`        |

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

| Icon Name      | Usage                              | Size          |
| -------------- | ---------------------------------- | ------------- |
| `auto_stories` | Logo icon                          | `text-2xl`    |
| `search`       | Header search input prefix         | `text-xl`     |
| `link`         | URL input prefix, source metadata  | `text-xl`     |
| `play_arrow`   | Start Crawl button                 | `text-xl`     |
| `refresh`      | Spinning status indicator          | `text-sm`     |
| `check_circle` | Success badge, success log entries | `text-[14px]` |
| `error`        | Failed badge                       | `text-[14px]` |
| `person`       | Author metadata row                | `text-[16px]` |
| `menu_book`    | Total chapters metadata row        | `text-[16px]` |
| `update`       | Last updated metadata row          | `text-[16px]` |
| `settings`     | Settings link in avatar dropdown   | `text-lg`     |
| `logout`       | Log out link in avatar dropdown    | `text-lg`     |

**Animation:** The `refresh` icon in the status message uses `animate-spin` CSS animation during active crawl phases.

**Style:** Outlined variant (not filled). Consistent with the overall light, airy feel.

---

## 6. Layout Principles

### Spacing Strategy

- **Page max-width:** `max-w-[1200px]`, centered with `justify-center`.
- **Page horizontal padding:** `px-8 md:px-12 lg:px-20` — breathable margins that scale.
- **Section spacing:** `mb-8` between major sections (page header → URL input → status panel → content grid).
- **Card internal padding:** `p-6` for all major cards (status, sidebar, chapters header).
- **Grid gap:** `gap-8` between sidebar and chapters list.

### Content Grid

- **Breakpoint:** `lg` (1024px+).
- **Columns:** 3-column grid (`grid-cols-1 lg:grid-cols-3`).
- **Sidebar:** `lg:col-span-1` — takes 1/3 width.
- **Chapters list:** `lg:col-span-2` — takes 2/3 width.
- **Below `lg`:** Single column, sidebar stacks above chapters list.

### Depth & Elevation

| Level           | Usage                     | Shadow                                         |
| --------------- | ------------------------- | ---------------------------------------------- |
| 0 — Canvas      | Page background           | None                                           |
| 1 — Card (rest) | Status, Sidebar, Chapters | `0 2px 10px -4px rgba(0,0,0,0.05)` — a whisper |
| -1 — Terminal   | Log console               | `shadow-inner` — recessed feel                 |
| 2 — Input       | URL input, Start button   | `shadow-sm` — subtle lift                      |
| 3 — Overlay     | Avatar dropdown           | `shadow-lg` — elevated floating panel          |

---

## 7. Interaction & Motion

### Transitions

| Element                      | Property  | Duration                     | Easing         |
| ---------------------------- | --------- | ---------------------------- | -------------- |
| URL input border/ring        | `all`     | `150ms`                      | Default (ease) |
| Start Crawl hover            | `colors`  | `150ms`                      | Default        |
| Chapter row hover            | `colors`  | `150ms`                      | Default        |
| Nav link text color          | `colors`  | `150ms`                      | Default        |
| Avatar dropdown visibility   | `all`     | `200ms`                      | Default        |
| Progress bar segment width   | `width`   | `300ms`                      | ease-out       |
| Spinning refresh icon        | `rotate`  | Continuous (`animate-spin`)  | Linear         |
| Pulsing ellipsis in terminal | `opacity` | Continuous (`animate-pulse`) | ease           |

### Hover Behaviors

| Element               | Hover Effect                                                    |
| --------------------- | --------------------------------------------------------------- |
| URL input             | Border transitions to `border-primary` with focus ring.         |
| Start Crawl button    | Background lightens to `bg-primary/90`.                         |
| Chapter row           | Background fills `bg-slate-50`. Corners soften to `rounded-xl`. |
| Failed chapter row    | Background intensifies from `bg-rose-50/30` to `bg-rose-50/50`. |
| Source link (sidebar) | Standard link hover (`hover:underline`).                        |
| Nav links             | Text from slate-500 to slate-900.                               |

---

## 8. Design Reference Screenshot

| Screen       | File                                                          | Dimensions  |
| ------------ | ------------------------------------------------------------- | ----------- |
| Crawler Main | [Crawler #1 - Main.png](assets/Crawler%20%231%20-%20Main.png) | 1024 × 1344 |

Source HTML for the screen is co-located in the `assets/` directory:

- [Crawler #1 - Main.html](assets/Crawler%20%231%20-%20Main.html)
