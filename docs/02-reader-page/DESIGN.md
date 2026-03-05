# Design System: NovelVerse — Reader Page

**Stitch Project ID:** `719353196857464339`

---

## 1. Visual Theme & Atmosphere

The Reader Page spans two distinct visual modes unified by the same design language:

### 1.1 Novel Details Page

A **bright, editorial-grade** layout that treats the novel cover as the hero visual. The design is **spacious and informational** — presenting metadata in a clean hierarchy without crowding. The overall feel is **"book jacket in a bookstore"**: the cover commands attention while metadata arranges itself into neat, scannable clusters.

### 1.2 Reader Mode

An **immersive, distraction-free** reading environment designed for extended sessions. The three-panel layout employs a **"desk lamp on parchment"** metaphor: warm, focused light on the content column with functional controls tucked away in side panels. The UI dissolves around the text — borders whisper, sidebars serve without competing, and the content stands on a quiet stage.

**Keywords:** Editorial, Immersive, Focused, Bookish, Configurable.

---

## 2. Color Palette & Roles

### Primary Colors

| Name                 | Hex       | Role                                                                                                                      |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Primary brand accent. Read Now button fill, active sidebar tab indicator, active setting selections, range slider accent. |
| **Near-White Linen** | `#fafafa` | Page background and "Light" theme canvas. A barely-warm gray that avoids screen-white glare during reading.               |
| **Pure Snow**        | `#ffffff` | Card surfaces, sidebar backgrounds, top bar background, input fields. Creates panel-on-canvas separation.                 |

### Reader Theme Palette

| Name               | Hex       | Role                                                                   |
| ------------------ | --------- | ---------------------------------------------------------------------- |
| **Light Canvas**   | `#fafafa` | Default reader theme. Clean, modern, near-white.                       |
| **Warm Parchment** | `#f4ecd8` | Sepia theme. Aged paper tone for reduced eye strain during long reads. |
| **Twilight Slate** | `#1e293b` | Dark theme. Deep blue-charcoal for low-light reading.                  |
| **True Black**     | `#000000` | OLED theme. Pure black for OLED screens, maximum contrast saving.      |

### Neutral Palette (Slate Scale)

| Name              | Hex                   | Role                                                                                    |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------- |
| **Deep Charcoal** | `#0f172a` (slate-900) | Primary text: novel title, chapter numbers, active toggle labels. Maximum contrast.     |
| **Ink**           | `#1e293b` (slate-800) | Chapter content body text. Slightly softer than pure headings.                          |
| **Graphite**      | `#334155` (slate-700) | Secondary text: chapter subtitle in header, dropdown items, chapter titles in sidebar.  |
| **Storm Gray**    | `#475569` (slate-600) | Tertiary text: action icon tints, inactive settings text, metadata labels.              |
| **Pewter**        | `#64748b` (slate-500) | Body metadata: novel title in top bar (reader), inactive tabs, sort label, time stamps. |
| **Silver Mist**   | `#94a3b8` (slate-400) | Chapter index numbers, range slider labels ("A", "0.5x"), sidebar chapter labels.       |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Ellipsis separators, disabled states, subtle borders.                                   |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Card borders, input borders, sidebar dividers, chapter row borders, genre tag borders.  |
| **Ghost White**   | `#f1f5f9` (slate-100) | Chapter row borders, sidebar inner dividers, sort bar background tint.                  |

### Semantic Colors

| Name            | Hex                 | Role                                                         |
| --------------- | ------------------- | ------------------------------------------------------------ |
| **Danger Rose** | `#ef4444` (red-500) | Delete button icon color and border tint (`border-red-200`). |

---

## 3. Typography Rules

### Font Families

| Family         | Font                        | Usage                                                           |
| -------------- | --------------------------- | --------------------------------------------------------------- |
| **Sans-serif** | Inter (Google Fonts)        | UI chrome: headers, navigation, buttons, sidebars, settings.    |
| **Serif**      | Merriweather (Google Fonts) | Chapter content body (default). Optimized for extended reading. |

Applied via Tailwind: `font-sans: ["Inter", "sans-serif"]`, `font-serif: ["Merriweather", "serif"]`.

### Type Scale — Novel Details Page

| Element               | Size                                 | Weight            | Tracking / Leading                | Color     |
| --------------------- | ------------------------------------ | ----------------- | --------------------------------- | --------- |
| Novel Title (`h1`)    | `text-4xl lg:text-5xl` (36px → 48px) | `font-bold` (700) | `tracking-tight`, `leading-tight` | slate-900 |
| Synopsis Heading      | `text-lg` (18px)                     | `font-semibold`   | Default                           | slate-900 |
| Synopsis Body         | `text-base` (16px)                   | `font-normal`     | `leading-relaxed`                 | slate-600 |
| Metadata Row          | `text-sm` (14px)                     | `font-medium`     | Default                           | slate-600 |
| Genre Tags            | `text-xs` (12px)                     | `font-semibold`   | `tracking-wide`, `uppercase`      | slate-500 |
| Chapter Section Title | `text-2xl` (24px)                    | `font-bold`       | Default                           | slate-900 |
| Chapter Row Index     | `text-sm` (14px)                     | `font-semibold`   | Default                           | slate-400 |
| Chapter Row Title     | `text-base` (16px)                   | `font-medium`     | Default                           | slate-800 |
| Chapter Row Time      | `text-sm` (14px)                     | `font-normal`     | Default                           | slate-500 |

### Type Scale — Reader Mode

| Element                      | Size                             | Weight          | Tracking / Leading         | Color     |
| ---------------------------- | -------------------------------- | --------------- | -------------------------- | --------- |
| Top Bar Novel Title          | `text-xs` (12px)                 | `font-semibold` | `uppercase tracking-wider` | slate-500 |
| Top Bar Chapter Title        | `text-sm` (14px)                 | `font-medium`   | Default                    | slate-900 |
| Chapter Number (content)     | `text-3xl md:text-4xl` (30→36px) | `font-bold`     | `leading-tight`, centered  | slate-900 |
| Chapter Title (content)      | `text-2xl md:text-3xl` (24→30px) | `font-medium`   | `mt-4 block`, centered     | slate-700 |
| Chapter Body Text            | `prose-lg` (~18px)               | Regular (400)   | `leading-relaxed`          | slate-800 |
| Sidebar Chapter Label        | `text-xs` (12px)                 | `font-medium`   | Default                    | slate-400 |
| Sidebar Chapter Title        | `text-sm` (14px)                 | `font-medium`   | `line-clamp-2`             | slate-700 |
| Settings Section Label       | `text-xs` (12px)                 | `font-semibold` | `uppercase tracking-wider` | slate-500 |
| Settings Panel Title         | `text-base` (16px)               | `font-semibold` | Default                    | slate-800 |
| Setting Option Text          | `text-sm` (14px)                 | `font-medium`   | Default                    | slate-600 |
| Theme Label                  | `text-xs` (12px)                 | `font-medium`   | Default                    | slate-500 |
| Range Slider Endpoint Labels | `text-xs` (12px)                 | `font-medium`   | Default                    | slate-400 |

---

## 4. Component Stylings

### 4.1 Novel Cover (Details Page)

- **Shape:** Generously rounded (`rounded-2xl`, 16px radius).
- **Aspect:** `aspect-[2/3]` — tall portrait orientation.
- **Shadow:** Medium lift (`shadow-md`).
- **Border:** `border border-slate-200`.
- **Image Fit:** `bg-cover bg-center bg-no-repeat`.
- **Width:** `w-64` (md), `w-80` (lg), full-width on mobile.

### 4.2 Primary CTA Button (Read Now)

- **Shape:** Generously rounded (`rounded-xl`, 12px radius).
- **Background:** Solid Royal Amethyst (`bg-primary`).
- **Text:** White, bold, `text-base`.
- **Padding:** `px-8 py-3`.
- **Shadow:** `shadow-sm`.
- **Hover:** `bg-primary/90` — subtle darkening.
- **Icon:** `menu_book` icon, left-aligned.

### 4.3 Secondary Button (Check Status)

- **Shape:** `rounded-xl`.
- **Background:** White (`bg-white`).
- **Border:** `border border-slate-200`.
- **Text:** `text-slate-700 font-medium`.
- **Padding:** `px-4 py-3`.
- **Hover:** `bg-slate-50`.

### 4.4 Icon-Only Action Buttons

- **Shape:** Square with rounded corners (`size-12 rounded-xl`).
- **Background:** White (`bg-white`).
- **Border:** `border border-slate-200`. Delete variant: `border-red-200`.
- **Icon color:** `text-slate-600`. Delete variant: `text-red-500`.
- **Hover:** `bg-slate-50`. Delete variant: `bg-red-50`.
- **Shadow:** `shadow-sm`.

### 4.5 Chapter Rows (Details Page)

- **Shape:** `rounded-xl`.
- **Background:** `bg-white`.
- **Border:** `border border-slate-100`.
- **Padding:** `p-4`.
- **Hover:** `border-slate-300`, `shadow-sm`.
- **Transition:** `transition-all`.
- **Spacing:** `gap-3` between rows.

### 4.6 Sort Toggle Pill

- **Container:** `bg-white border border-slate-200 rounded-lg p-1 shadow-sm`.
- **Active button:** `bg-slate-100 text-slate-900 font-semibold rounded-md px-4 py-1.5`.
- **Inactive button:** `text-slate-500 font-medium`, hover: `text-slate-900`.

### 4.7 Top Bar (Reader Mode)

- **Background:** `bg-white`.
- **Border:** `border-b border-slate-200`.
- **Shadow:** `shadow-sm`.
- **Z-index:** `z-10`.
- **Padding:** `px-6 py-4`.
- **Action icons:** `p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors`.

### 4.8 Left Sidebar Tabs

- **Active tab:** `text-primary border-b-2 border-primary font-semibold`.
- **Inactive tab:** `text-slate-500 font-medium hover:text-slate-900`.
- **Container:** Full width tabs (`flex-1`), `py-4`.

### 4.9 Active Chapter Indicator (Sidebar)

- **Background:** `bg-primary/5` — a 5% opacity purple wash.
- **Border:** `border border-primary/20` — a 20% opacity purple ring.
- **Label:** `text-primary font-semibold`.
- **Title:** `text-slate-900 font-semibold`.

### 4.10 Settings Controls

**Selection buttons (Font, Line Height, Paragraph Spacing):**

- **Active:** `border-2 border-primary bg-primary/5 text-primary`.
- **Inactive:** `border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50`.
- **Shape:** `rounded-xl` (font family), `rounded-lg` (line height, spacing).

**Range sliders:**

- **Track:** `h-1.5 bg-slate-200 rounded-lg`.
- **Accent:** `accent-primary` (Royal Amethyst for the filled portion).
- **Cursor:** `cursor-pointer`.

**Select dropdown (Voice):**

- **Background:** `bg-white`.
- **Border:** `border border-slate-200 rounded-xl`.
- **Padding:** `p-3`.
- **Focus:** `ring-primary border-primary`.

**Toggle switch (Auto-Scroll):**

- **Track off:** `bg-slate-200`, `w-11 h-6 rounded-full`.
- **Track on:** `bg-primary`.
- **Thumb:** `w-5 h-5 rounded-full bg-white border-slate-300 shadow`.

### 4.11 Theme Selector Circles

- **Size:** `w-10 h-10 rounded-full`.
- **Active:** `border-2 border-primary shadow-sm` + `check` icon centered inside.
- **Inactive:** `border border-slate-200 shadow-sm`, hover: `border-slate-400`.
- **Label below:** `text-xs font-medium`. Active: `text-primary`. Inactive: `text-slate-500`.

### 4.12 Chapter Navigation Footer

- **Separator:** `border-t border-slate-200`.
- **Container:** `mt-20 pt-8 flex items-center justify-between font-sans`.
- **Previous button:** Outlined style (same as 4.3 secondary button), with `arrow_back` icon.
- **Next button:** Primary fill style (same as 4.2 Read Now), with `arrow_forward` icon.

### 4.13 Load More Button (Details Page)

- **Shape:** Full width, `rounded-xl`.
- **Border:** `border-2 border-dashed border-slate-200`.
- **Text:** `text-slate-500 font-medium`.
- **Hover:** `bg-slate-50 text-slate-700`.
- **Transition:** `transition-colors`.

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

### Novel Details Page Icons

| Icon Name      | Usage                        | Size                    |
| -------------- | ---------------------------- | ----------------------- |
| `auto_stories` | Logo icon                    | `text-2xl`              |
| `search`       | Search input prefix          | `text-xl`               |
| `person`       | Author metadata              | `text-[18px]`           |
| `menu_book`    | Chapter count + Read Now btn | `text-[18px]` / default |
| `update`       | Last updated time            | `text-[18px]`           |
| `link`         | Source URL link              | `text-[18px]`           |
| `sync`         | Check Status button          | default                 |
| `edit`         | Edit button                  | default                 |
| `translate`    | Translate button             | default                 |
| `delete`       | Delete button                | default                 |

### Reader Mode Icons

| Icon Name             | Usage                      | Size      |
| --------------------- | -------------------------- | --------- |
| `arrow_back`          | Back button / Previous Ch. | default   |
| `arrow_forward`       | Next Chapter button        | default   |
| `edit`                | Edit chapter action        | default   |
| `translate`           | Translate chapter action   | default   |
| `bookmark_border`     | Bookmark (empty)           | default   |
| `bookmark`            | Bookmark (filled/active)   | default   |
| `volume_up`           | Text-to-Speech toggle      | default   |
| `tune`                | Reading Experience header  | default   |
| `format_line_spacing` | Line height selector       | default   |
| `record_voice_over`   | TTS section header         | default   |
| `check`               | Active theme indicator     | `text-sm` |

**Style:** Outlined variant throughout. Consistent with the overall minimal, functional aesthetic.

---

## 6. Layout Principles

### Spacing Strategy

**Novel Details Page:**

- **Page max-width:** `max-w-[1200px]`, centered.
- **Page padding:** `px-8 md:px-12 lg:px-20`.
- **Hero gap:** `gap-10` between cover and metadata.
- **Metadata spacing:** `mb-4` between title and meta row, `mb-8` between genres/actions and synopsis.
- **Chapter section top margin:** `mt-12`.
- **Chapter header bottom:** `mb-6 pb-4 border-b border-slate-200`.

**Reader Mode:**

- **Full viewport:** `h-screen flex flex-col overflow-hidden`.
- **Sidebar width:** `w-80` (320px) for both sidebars.
- **Content max-width:** `max-w-3xl` (768px) — optimal line length for reading.
- **Content padding:** `px-8 py-16 md:px-12 lg:px-16`.
- **Settings spacing:** `space-y-8` between setting groups.
- **Footer spacing:** `mt-20 pt-8` — generous breathing room above nav buttons.

### Depth & Elevation

| Level              | Usage                           | Shadow              |
| ------------------ | ------------------------------- | ------------------- |
| 0 — Canvas         | Page background, content column | None                |
| 0.5 — Panel        | Sidebars, top bar               | None (borders only) |
| 1 — Card (rest)    | Chapter rows, settings buttons  | None / `shadow-sm`  |
| 1.5 — Card (hover) | Chapter rows on hover           | `shadow-sm`         |
| 2 — Cover          | Novel cover image               | `shadow-md`         |
| 2 — Top bar        | Reader top bar                  | `shadow-sm`         |
| 3 — Overlay        | Avatar dropdown, modals         | `shadow-lg`         |

The reader mode is intentionally **flatter** than the library page — fewer shadows mean fewer distractions from the reading content.

---

## 7. Interaction & Motion

### Transitions

| Element                    | Property | Duration        | Easing         |
| -------------------------- | -------- | --------------- | -------------- |
| Chapter row border/shadow  | `all`    | Default (150ms) | Default (ease) |
| Chapter title color        | `colors` | Default         | Default        |
| Top bar action icon bg     | `colors` | Default         | Default        |
| Nav link text color        | `colors` | Default         | Default        |
| Settings button border     | `colors` | Default         | Default        |
| Avatar dropdown visibility | `all`    | `200ms`         | Default        |
| Load More button bg/text   | `colors` | Default         | Default        |

### Hover Behaviors

| Element                 | Hover Effect                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| Chapter row (details)   | Title text: slate-800 → Royal Amethyst. Border: slate-100 → slate-300.      |
| Chapter item (sidebar)  | Background: transparent → `bg-slate-50`. Title: slate-700 → Royal Amethyst. |
| Top bar action icons    | Background fills with `bg-slate-100`.                                       |
| Sort toggle button      | Inactive text: slate-500 → slate-900.                                       |
| Theme circle (inactive) | Border: slate-200 → slate-400.                                              |
| Load More button        | Background: transparent → `bg-slate-50`. Text: slate-500 → slate-700.       |
| Settings buttons        | Inactive: border-slate-200 → border-slate-300, bg → `bg-slate-50`.          |

---

## 8. Design Reference Screenshots

| Screen        | File                                                          | Description                                                 |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Novel Details | [screen1-novel-details.png](assets/screen1-novel-details.png) | Cover, metadata, synopsis, and chapter list                 |
| Reader Mode   | [screen2-reader-mode.png](assets/screen2-reader-mode.png)     | Three-panel reading interface with settings and chapter nav |

Source HTML files for each screen are co-located in the `assets/` directory:

- [screen1-novel-details.html](assets/screen1-novel-details.html)
- [screen2-reader-mode.html](assets/screen2-reader-mode.html)
