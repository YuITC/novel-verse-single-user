# Design System: NovelVerse — Explore Page

**Stitch Project ID:** `719353196857464339`
**Screen ID:** `Explore #1 - Main`

---

## 1. Visual Theme & Atmosphere

The Explore page inherits the same **clean, airy, and unhurried** aesthetic established across the NovelVerse application. It feels like a well-organized **bookshop catalog** — orderly, spacious, and designed to let the novel covers do the visual storytelling.

The dominant impression is one of **structured openness**: a white card housing the filter controls sits prominently at the top — a calm command center — followed by a generous grid of novel cards below. The generous whitespace between elements creates a sense of browsability without information overload.

**Keywords:** Airy, Organized, Catalog-like, Browsable, Clean.

---

## 2. Color Palette & Roles

### Primary Colors

| Name                 | Hex       | Role                                                                                                                                                                        |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Primary brand accent. Used for: selected tag chips (background tint + text), "Read →" action buttons, active pagination dot, logo icon, focus ring on search/filter inputs. |
| **Near-White Linen** | `#fafafa` | Page background canvas. The same barely-warm gray that prevents pure-white harshness.                                                                                       |
| **Pure Snow**        | `#ffffff` | Card surfaces (filter panel, novel cards), input field backgrounds when focused, active pagination dot text.                                                                |

### Neutral Palette (Slate Scale)

| Name              | Hex                   | Role                                                                                                                           |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Deep Charcoal** | `#0f172a` (slate-900) | Page title, novel titles, result count heading, active nav link. Maximum contrast for primary headability.                     |
| **Graphite**      | `#334155` (slate-700) | More-button hover state, dropdown menu text hover.                                                                             |
| **Storm Gray**    | `#475569` (slate-600) | Inactive pagination numbers, status chip text, more-button icon hover, next-arrow text.                                        |
| **Pewter**        | `#64748b` (slate-500) | Subtitle, author/chapter metadata, description text, genre tag text, inactive nav links, filter labels.                        |
| **Silver Mist**   | `#94a3b8` (slate-400) | Search icon tint, schedule icon, placeholder text, chevron icons, pagination arrows (disabled), ellipsis.                      |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Focus border transition.                                                                                                       |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Filter input borders, card borders, genre tag borders, status chip borders, pagination borders, avatar border, header divider. |
| **Ghost White**   | `#f1f5f9` (slate-100) | Novel card borders (`border-slate-100`), cover image borders, inner card separators.                                           |
| **Mist**          | `#f8fafc` (slate-50)  | Filter input backgrounds (`bg-slate-50`), card inner separator (`border-t border-slate-50`), hover backgrounds.                |

### Semantic Colors

| Name                | Hex                     | Role                                                                        |
| ------------------- | ----------------------- | --------------------------------------------------------------------------- |
| **Success Emerald** | `#059669` (emerald-600) | "Completed" publication status indicator text, paired with `done_all` icon. |

### Derived / Opacity Colors

| Name                       | Value                  | Role                                                      |
| -------------------------- | ---------------------- | --------------------------------------------------------- |
| **Amethyst Tint (10%)**    | `#8c2bee` at 10% alpha | Tag chip background in the filter panel.                  |
| **Amethyst Border (20%)**  | `#8c2bee` at 20% alpha | Tag chip border in the filter panel.                      |
| **Amethyst Faded (70%)**   | `#8c2bee` at 70% alpha | Tag close icon hover state.                               |
| **Slate Background (80%)** | `#f1f5f9` at 80% alpha | Header search bar background (`bg-slate-100/80`).         |
| **Slate Border (50%)**     | `#e2e8f0` at 50% alpha | Header search bar border at rest (`border-slate-200/50`). |

---

## 3. Typography Rules

### Font Family

**Inter** (Google Fonts) — geometric sans-serif designed for screen readability. Applied globally via `font-sans: ["Inter", "sans-serif"]`.

### Type Scale

| Element                | Size                                 | Weight                | Tracking / Leading            | Color                      |
| ---------------------- | ------------------------------------ | --------------------- | ----------------------------- | -------------------------- |
| Page Title (`h1`)      | `text-3xl md:text-4xl` (30px → 36px) | `font-bold` (700)     | `tracking-tight` (-0.025em)   | slate-900                  |
| Page Subtitle          | `text-base` (16px)                   | `font-normal` (400)   | Default                       | slate-500                  |
| Logo Text              | `text-xl` (20px)                     | `font-bold` (700)     | `tracking-tight`              | slate-900                  |
| Novel Title (`h3`)     | `text-xl` (20px)                     | `font-bold` (700)     | `leading-snug` (1.375)        | slate-900                  |
| Result Count (`h2`)    | `text-lg` (18px)                     | `font-bold` (700)     | Default                       | slate-900                  |
| Filter Label           | `text-xs` (12px)                     | `font-semibold` (600) | `tracking-wider`, `uppercase` | slate-500                  |
| Filter Input Text      | `text-sm` (14px)                     | `font-normal` (400)   | Default                       | slate-900                  |
| Filter Placeholder     | `text-sm` (14px)                     | `font-normal` (400)   | Default                       | slate-400                  |
| Status Chip (filter)   | `text-[11px]` (11px)                 | `font-semibold` (600) | `tracking-wide`, `uppercase`  | slate-600                  |
| Tag Chip (filter)      | `text-[11px]` (11px)                 | `font-semibold` (600) | `tracking-wide`, `uppercase`  | Royal Amethyst             |
| Metadata Text          | `text-xs` (12px)                     | `font-medium` (500)   | Default                       | slate-500                  |
| Description            | `text-sm` (14px)                     | `font-normal` (400)   | `leading-relaxed` (1.625)     | slate-500                  |
| Genre Tags (card)      | `text-[11px]` (11px)                 | `font-semibold` (600) | `tracking-wide`, `uppercase`  | slate-500                  |
| Nav Links (active)     | `text-sm` (14px)                     | `font-semibold` (600) | Default                       | slate-900                  |
| Nav Links (inactive)   | `text-sm` (14px)                     | `font-medium` (500)   | Default                       | slate-500                  |
| Action Button ("Read") | `text-sm` (14px)                     | `font-semibold` (600) | Default                       | Royal Amethyst             |
| Pagination Number      | Inherited (14px)                     | `font-medium` (500)   | Default                       | slate-600 / white (active) |

### Weight Hierarchy

- **700 (Bold):** Page title, novel titles, result count — maximum visual anchor.
- **600 (Semibold):** Filter labels, active nav, action buttons, genre/chip labels — emphasis.
- **500 (Medium):** Metadata, inactive nav, pagination numbers — supporting text.
- **400 (Regular):** Descriptions, subtitles, filter input text — reading text.

---

## 4. Component Stylings

### 4.1 Filter Panel

- **Shape:** Generously rounded container (`rounded-2xl`, 16px radius).
- **Background:** Pure white (`bg-white`).
- **Border:** `border border-slate-200`.
- **Shadow:** Subtle soft shadow (`shadow-sm`).
- **Padding:** `p-5` (20px) all sides.
- **Internal gap:** `gap-4` between rows, `gap-4` between filter elements in each row.
- **Margin bottom:** `mb-10` — significant breathing room before results.

### 4.2 Filter Inputs (Search)

- **Shape:** Rounded (`rounded-xl`, 12px radius).
- **Background:** `bg-slate-50`.
- **Border:** `border border-slate-200` at rest. Focus: `border-primary`, `ring-1 ring-primary`.
- **Height:** `h-10` (40px).
- **Icon:** `search` Material icon, `text-slate-400`, `text-lg`, left-aligned within `px-3`.
- **Transition:** `transition-all` on focus border/ring.

### 4.3 Filter Selects (Ch. Range, Sort By)

- **Shape:** Rounded (`rounded-xl`, 12px radius).
- **Background:** `bg-slate-50`.
- **Border:** `border border-slate-200`. Focus: `border-primary`, `ring-primary`.
- **Height:** `h-10` (40px).
- **Padding:** `px-3`.

### 4.4 Multi-Select Fields (Status, Tags)

- **Shape:** Rounded container (`rounded-xl`).
- **Background:** `bg-slate-50`.
- **Border:** `border border-slate-200`.
- **Min height:** `min-h-[40px]`, expands with chips.
- **Padding:** `py-1.5 px-3`.
- **Chevron:** `expand_more` icon, `text-slate-400`, `text-lg`, right-aligned (`ml-2`).
- **Cursor:** `cursor-pointer`.

#### Status Chips (inside multi-select)

- **Background:** `bg-white`.
- **Border:** `border border-slate-200`.
- **Text:** `text-slate-600`, `text-[11px]`, `font-semibold`, `tracking-wide`, `uppercase`.
- **Padding:** `px-2 py-0.5`.
- **Shape:** Subtly rounded (`rounded-md`).
- **Shadow:** `shadow-sm`.
- **Close icon:** `close` Material icon, `text-[14px]`. Hover: `text-slate-900`.

#### Tag Chips (inside multi-select)

- **Background:** `bg-primary/10` — a pale amethyst wash.
- **Border:** `border border-primary/20`.
- **Text:** `text-primary` (Royal Amethyst), `text-[11px]`, `font-semibold`, `tracking-wide`, `uppercase`.
- **Padding:** `px-2 py-0.5`.
- **Shape:** Subtly rounded (`rounded-md`).
- **Close icon:** `close` Material icon, `text-[14px]`. Hover: `text-primary/70`.

### 4.5 Novel Cards

- **Shape:** Generously rounded (`rounded-2xl`, 16px radius). Horizontal layout: cover on left, text on right.
- **Background:** Pure white (`bg-white`).
- **Border:** Whisper-thin `border border-slate-100`.
- **Shadows:**
  - Default: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]` — barely perceptible lift.
  - Hover: `shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)]` — a gentle bloom of depth.
- **Padding:** `p-5` (20px) all sides.
- **Gap:** `gap-6` between cover and text content.
- **Transition:** `transition-all duration-300` — slow, deliberate hover lift.
- **Cover Image:** `w-36` (144px) on desktop (`sm:w-36`), full width on mobile. Aspect: `aspect-[2/3]` on mobile, `sm:aspect-[3/4]` on desktop. `rounded-xl`, `border border-slate-100`. `bg-cover bg-center bg-no-repeat`.

### 4.6 Cover Image Fallback

- **Background:** `bg-slate-200`.
- **Content:** Centered `menu_book` icon, `text-slate-400`, `text-4xl`.
- **All other properties:** Same as regular cover (dimensions, rounding, border).

### 4.7 Genre Tags (Card)

- **Shape:** Subtly rounded (`rounded-md`, 6px radius).
- **Background:** Transparent.
- **Border:** `border border-slate-200`.
- **Text:** All-caps (`uppercase`), `text-[11px]`, `font-semibold`, `tracking-wide`, `text-slate-500`.
- **Padding:** `px-2.5 py-1`.

### 4.8 Pagination Buttons

- **Shape:** Perfect circles (`rounded-full`).
- **Size:** `size-10` (40px × 40px).
- **Gap:** `gap-2` between buttons.
- **Active page:** `bg-primary`, `text-white`, `font-medium`.
- **Inactive page:** `border border-slate-200`, `text-slate-600`, `font-medium`. Hover: `bg-slate-50`.
- **Arrows:** Same circle shape, using `chevron_left` / `chevron_right` icons.
- **Disabled arrows:** `text-slate-400`, `cursor-not-allowed`.
- **Ellipsis:** Non-interactive span with same `size-10`, `text-slate-400`.

### 4.9 Search Input (Header)

- **Shape:** Pill-shaped (`rounded-full`).
- **Background:** `bg-slate-100/80` — semi-transparent light gray.
- **Border:** `border border-slate-200/50` at rest, `border-slate-300` on focus.
- **Height:** `h-10` (40px) fixed.
- **Width:** `min-w-40 max-w-64` (160px – 256px).
- **Visibility:** Hidden on mobile (`hidden md:flex`).
- **Icon:** `search`, `text-slate-400`, `text-xl`, with `pl-4`.
- **Placeholder:** `"Search novels..."`, `text-slate-400`.
- **Text:** `text-sm font-medium`, `text-slate-900`.

### 4.10 Avatar & Dropdown

- **Avatar:** Perfect circle (`rounded-full`), `size-9` (36px), `border border-slate-200`.
- **Dropdown:** `rounded-xl`, `shadow-lg`, `border border-slate-200`, `bg-white`. Width: `w-48`. Position: `top-full mt-2 right-0`.
- **Appear:** `opacity-0 invisible` → `opacity-100 visible` on hover. `transition-all duration-200`.
- **Z-index:** `z-50`.

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

| Icon Name       | Usage                                   | Size                       |
| --------------- | --------------------------------------- | -------------------------- |
| `auto_stories`  | Logo icon                               | `text-2xl`                 |
| `search`        | Search input prefix (header)            | `text-xl`                  |
| `search`        | Search input prefix (filter)            | `text-lg`                  |
| `person`        | Author metadata                         | `text-[15px]`              |
| `menu_book`     | Chapter count metadata / cover fallback | `text-[15px]` / `text-4xl` |
| `schedule`      | Update time metadata                    | `text-[15px]`              |
| `done_all`      | Completed status                        | `text-[15px]`              |
| `more_vert`     | Card context menu                       | `text-xl`                  |
| `arrow_forward` | "Read" action button                    | `text-lg`                  |
| `close`         | Remove filter chip                      | `text-[14px]`              |
| `expand_more`   | Multi-select dropdown chevron           | `text-lg`                  |
| `chevron_left`  | Pagination previous                     | `text-xl`                  |
| `chevron_right` | Pagination next                         | `text-xl`                  |
| `settings`      | Settings link in avatar dropdown        | `text-lg`                  |
| `logout`        | Log out link in avatar dropdown         | `text-lg`                  |

**Style:** Outlined variant (not filled). Consistent with the overall light, airy aesthetic.

---

## 6. Layout Principles

### Spacing Strategy

- **Page max-width:** `max-w-[1200px]`, centered with `justify-center`.
- **Page horizontal padding:** `px-8 md:px-12 lg:px-20` — breathing room that scales with viewport.
- **Page header spacing:** `mb-8` between title/subtitle and filter panel.
- **Filter panel to results:** `mb-10` — generous separation.
- **Result count to grid:** `mb-6`.
- **Grid to pagination:** `mt-12`.
- **Card internal padding:** `p-5` (20px).
- **Card inner separator:** `mt-5 pt-4 border-t border-slate-50` for the genre/action row in novel cards.
- **Grid gap:** `gap-6 md:gap-8`.
- **Filter internal gap:** `gap-4` between rows and between controls.

### Depth & Elevation

The design uses a **flat-with-hints** elevation model:

| Level              | Usage                | Shadow                                            |
| ------------------ | -------------------- | ------------------------------------------------- |
| 0 — Canvas         | Page background      | None                                              |
| 0.5 — Filter Panel | Filter card          | `shadow-sm` — barely-there lift                   |
| 1 — Card (rest)    | Novel cards          | `0 2px 10px -4px rgba(0,0,0,0.05)` — a whisper    |
| 1.5 — Card (hover) | Novel cards on hover | `0 8px 20px -8px rgba(0,0,0,0.08)` — gentle bloom |
| 2 — Overlay        | Avatar dropdown      | `shadow-lg` — standard Tailwind large shadow      |

### Responsive Grid System

| Content Type | `< sm`  | `sm`    | `lg`            | `xl`            |
| ------------ | ------- | ------- | --------------- | --------------- |
| Novel Cards  | 1 col   | 1 col   | 1 col           | 2 col           |
| Filter Panel | Stacked | Stacked | Horizontal rows | Horizontal rows |

---

## 7. Interaction & Motion

### Transitions

| Element                    | Property  | Duration          | Easing         |
| -------------------------- | --------- | ----------------- | -------------- |
| Card shadow & background   | `all`     | `300ms`           | Default (ease) |
| Nav link text color        | `colors`  | `150ms` (default) | Default        |
| Search input border        | `colors`  | `150ms` (default) | Default        |
| Filter input focus ring    | `all`     | `150ms` (default) | Default        |
| Avatar dropdown visibility | `all`     | `200ms`           | Default        |
| Action button opacity      | `opacity` | `150ms` (default) | Default        |
| More button color          | `colors`  | `150ms` (default) | Default        |

### Hover Behaviors

| Element                  | Hover Effect                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Novel card               | Title changes from slate-900 to Royal Amethyst. Shadow blooms from whisper to gentle lift. |
| More button (`⋮`)        | Icon from `text-slate-400` to `text-slate-700`.                                            |
| Action button ("Read →") | Opacity drops to `0.7`.                                                                    |
| Pagination (inactive)    | Background fills with `bg-slate-50`.                                                       |
| Previous/Next arrows     | Background fills with `bg-slate-50` (unless disabled).                                     |
| Nav links (inactive)     | Text transitions from `text-slate-500` to `text-slate-900`.                                |
| Genre tags (card)        | No hover effect (non-interactive).                                                         |
| Status chip close icon   | Text transitions from default to `text-slate-900`.                                         |
| Tag chip close icon      | Text transitions from default to `text-primary/70`.                                        |

---

## 8. Design Reference Screenshots

| Screen       | File                                                          | Dimensions  |
| ------------ | ------------------------------------------------------------- | ----------- |
| Explore Main | [Explore #1 - Main.png](assets/Explore%20%231%20-%20Main.png) | 1024 × 1024 |

Source HTML file for the screen is co-located in the `assets/` directory:

- [Explore #1 - Main.html](assets/Explore%20%231%20-%20Main.html)
