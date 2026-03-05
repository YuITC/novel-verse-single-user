# Design System: NovelVerse — Library Page

**Stitch Project ID:** `719353196857464339`
**Screen IDs:** `7318ec81849c438a8f3cf38e819b6d81`, `ebc85de2ae214524a089734f20259304`, `62010ff575344e68b74decfdbd8431e5`

---

## 1. Visual Theme & Atmosphere

The Library page breathes a **clean, airy, and unhurried** aesthetic — the kind of space designed for quiet, focused reading management rather than sensory stimulation. The overall feeling is **light and restrained**, with generous whitespace creating comfortable breathing room between elements.

The interface favors a **paper-on-linen** metaphor: crisp white cards sit atop a barely-tinted warm-gray canvas, producing a sense of physical depth without the heaviness of dramatic shadows. The design philosophy is **"invisible UI"** — nothing competes with the novel covers themselves, which provide all the visual richness the page needs.

**Keywords:** Airy, Minimal, Clean, Bookish, Unhurried.

---

## 2. Color Palette & Roles

### Primary Colors

| Name                 | Hex       | Role                                                                                                                                                                   |
| -------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Primary brand accent. Used for: active CTAs ("Continue →"), hover states on titles, bookmark icons, logo icon. Applied sparingly to draw the eye without overwhelming. |
| **Near-White Linen** | `#fafafa` | Page background. A barely-perceptible warm gray that avoids the harshness of pure white while maintaining a bright, open feel.                                         |
| **Pure Snow**        | `#ffffff` | Card surfaces, dropdown menus, and input fields. Creates the "card-on-canvas" depth separation.                                                                        |

### Neutral Palette (Slate Scale)

| Name              | Hex                   | Role                                                                                           |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| **Deep Charcoal** | `#0f172a` (slate-900) | Primary text: page titles, novel titles, active tab labels. Maximum contrast for readability.  |
| **Graphite**      | `#334155` (slate-700) | Secondary text: completed novel titles, dropdown menu items. Slightly softened.                |
| **Storm Gray**    | `#475569` (slate-600) | Tertiary text: chapter titles in bookmarks, form labels.                                       |
| **Pewter**        | `#64748b` (slate-500) | Body text: descriptions, metadata labels (author, chapter count), inactive tab text, subtitle. |
| **Silver Mist**   | `#94a3b8` (slate-400) | Placeholder text, timestamp text, inactive icon tints, search icon.                            |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Separator pipes, more-button icons at rest, subtle borders.                                    |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Card borders, input borders, header divider, genre tag borders, avatar border.                 |
| **Ghost White**   | `#f1f5f9` (slate-100) | Card hover borders, inner separators (`border-t border-slate-50`), search field background.    |

### Semantic Colors

| Name                | Hex                     | Role                                                            |
| ------------------- | ----------------------- | --------------------------------------------------------------- |
| **Success Emerald** | `#059669` (emerald-600) | "Completed" status indicator text, paired with `done_all` icon. |

---

## 3. Typography Rules

### Font Family

**Inter** (Google Fonts) — a geometric sans-serif designed for screen readability at small sizes. Applied globally via `font-sans: ["Inter", "sans-serif"]`.

### Type Scale

| Element              | Size                                 | Weight                                       | Tracking                               | Color     |
| -------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------- | --------- |
| Page Title (`h1`)    | `text-3xl md:text-4xl` (30px → 36px) | `font-bold` (700)                            | `tracking-tight` (-0.025em)            | slate-900 |
| Page Subtitle        | `text-base` (16px)                   | `font-normal` (400)                          | Default                                | slate-500 |
| Logo Text            | `text-xl` (20px)                     | `font-bold` (700)                            | `tracking-tight`                       | slate-900 |
| Novel Title (`h3`)   | `text-xl` (20px)                     | `font-bold` (700)                            | `leading-snug` (1.375)                 | slate-900 |
| Collection Title     | `text-[17px]` (17px)                 | `font-bold` (700)                            | Default                                | slate-900 |
| Bookmark Novel Title | `text-xl` (20px)                     | `font-bold` (700)                            | Default                                | slate-900 |
| Tab Label (active)   | `text-sm` (14px)                     | `font-semibold` (600)                        | Default                                | slate-900 |
| Tab Label (inactive) | `text-sm` (14px)                     | `font-medium` (500)                          | Default                                | slate-500 |
| Metadata Text        | `text-xs` (12px)                     | `font-medium` (500)                          | Default                                | slate-500 |
| Description          | `text-sm` (14px)                     | `font-normal` (400)                          | `leading-relaxed` (1.625)              | slate-500 |
| Genre Tags           | `text-[11px]` (11px)                 | `font-semibold` (600)                        | `tracking-wide` (0.025em), `uppercase` | slate-500 |
| Nav Links (active)   | `text-sm` (14px)                     | `font-semibold` (600)                        | Default                                | slate-900 |
| Nav Links (inactive) | `text-sm` (14px)                     | `font-medium` (500)                          | Default                                | slate-500 |
| Button Text          | `text-sm` (14px)                     | `font-medium` (500) or `font-semibold` (600) | Default                                | Varies    |
| Bookmark Chapter     | `text-sm` (14px)                     | `font-bold` (700)                            | Default                                | slate-900 |
| Bookmark Date        | `text-xs` (12px)                     | `font-medium` (500)                          | Default                                | slate-400 |
| Collection Count     | `text-sm` (14px)                     | `font-medium` (500)                          | Default                                | slate-500 |

### Weight Hierarchy

- **700 (Bold):** Titles, chapter numbers — maximum visual anchor.
- **600 (Semibold):** Active navigation, action buttons, active tabs — emphasis.
- **500 (Medium):** Metadata, inactive tabs, secondary actions — supporting text.
- **400 (Regular):** Descriptions, subtitles — reading text.

---

## 4. Component Stylings

### 4.1 Novel Cards

- **Shape:** Generously rounded (`rounded-2xl`, 16px radius). Horizontal layout with cover image on left, text content on right.
- **Background:** Pure white (`bg-white`). Completed variants use `bg-white/60` — a whisper of transparency to visually recede.
- **Border:** Whisper-thin `border border-slate-100`.
- **Shadows:**
  - Default: An almost-imperceptible lift: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
  - Hover: A gentle bloom: `shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)]`.
  - Completed: Even lighter: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]`, bloom to `0.05` on hover.
- **Padding:** `p-5` (20px) all sides.
- **Transition:** `transition-all duration-300` — slow, deliberate hover response.
- **Cover Image:** `w-36` (144px) on desktop, full-width on mobile. `aspect-[3/4]`, `rounded-xl` corners. Completed novels apply `grayscale-[0.5] opacity-80`.

### 4.2 Collection Cards

- **Shape:** Same generous rounding (`rounded-2xl`).
- **Background:** Pure white (`bg-white`).
- **Border:** Same `border border-slate-100`.
- **Shadow:** Same as novel cards.
- **Padding:** `p-6` (24px) — slightly more than novel cards for a centered, spacious feel.
- **Content Alignment:** Centered (`items-center text-center`).
- **Fan Cover Stack:** 3 overlapping book covers arranged in a carousel-like fan with perspective depth via scale, translate, and opacity. Container height: `h-44`.
- **Cursor:** `cursor-pointer` — entire card is clickable.

### 4.3 Bookmark Rows

- **Container:** `rounded-2xl` white card with `border border-slate-100` and subtle shadow.
- **Row Padding:** `p-4` (16px).
- **Row Separator:** `border-b border-slate-50` — nearly invisible, just enough to create row distinction.
- **Hover:** `bg-slate-50` background wash.
- **More Button:** `opacity-0` at rest, `opacity-100` on row hover — progressive disclosure.

### 4.4 Buttons

| Button                     | Shape                  | Background            | Border                    | Text                            | Hover                           |
| -------------------------- | ---------------------- | --------------------- | ------------------------- | ------------------------------- | ------------------------------- |
| **"Continue →"**           | Inline (no background) | None                  | None                      | Royal Amethyst, `font-semibold` | `opacity-70`                    |
| **"Read Again"**           | Inline (no background) | None                  | None                      | slate-500, `font-semibold`      | `text-slate-800`                |
| **"+ Create Collections"** | Pill (`rounded-full`)  | None / `bg-slate-100` | `border border-slate-200` | slate-600, `font-medium`        | `bg-slate-50` / `bg-slate-200`  |
| **Avatar Dropdown Items**  | Rectangular            | None                  | None                      | slate-700                       | `bg-slate-50`, `text-slate-900` |

### 4.5 Search Input

- **Shape:** Pill-shaped (`rounded-full`).
- **Background:** `bg-slate-100/80` — semi-transparent light gray.
- **Border:** `border border-slate-200/50` at rest, `border-slate-300` on focus.
- **Height:** `h-10` (40px) fixed.
- **Width:** `min-w-40 max-w-64` (160px – 256px).
- **Icon:** Search icon in `text-slate-400`, left-aligned with `pl-4`.
- **Placeholder:** `"Search novels..."`, `text-slate-400`.
- **Text:** `text-sm font-medium`, `text-slate-900`.

### 4.6 Tab Bar

- **Active Tab:** Bottom border `border-b-2 border-slate-900`, text `text-slate-900 font-semibold`.
- **Inactive Tab:** `border-b-2 border-transparent`, `text-slate-500 font-medium`.
- **Hover (inactive):** `text-slate-800` transition.
- **Divider:** Full-width `border-b border-slate-200` separating tabs from content.
- **Spacing:** `gap-x-8` between tabs.
- **Scrolling:** `overflow-x-auto no-scrollbar` on mobile for horizontal scroll.

### 4.7 Genre Tags

- **Shape:** Subtly rounded (`rounded-md`, 6px radius).
- **Background:** Transparent.
- **Border:** `border border-slate-200`.
- **Text:** All-caps (`uppercase`), `text-[11px]`, `font-semibold`, `tracking-wide`, `text-slate-500`.
- **Padding:** `px-2.5 py-1`.

### 4.8 Avatar & Dropdown

- **Avatar:** Perfect circle (`rounded-full`), `size-9` (36px), `border border-slate-200`.
- **Dropdown:** `rounded-xl`, `shadow-lg`, `border border-slate-200`, `bg-white`. Width: `w-48`. Positioned `top-full mt-2 right-0`.
- **Appear:** `opacity-0 invisible` → `opacity-100 visible` on hover. `transition-all duration-200`.
- **Z-index:** `z-50`.

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

| Icon Name       | Usage                     | Size           |
| --------------- | ------------------------- | -------------- |
| `auto_stories`  | Logo icon                 | `text-2xl`     |
| `search`        | Search input prefix       | `text-xl`      |
| `person`        | Author metadata           | `text-[15px]`  |
| `menu_book`     | Chapter count metadata    | `text-[15px]`  |
| `schedule`      | Last activity time        | `text-[15px]`  |
| `done_all`      | Completed status          | `text-[15px]`  |
| `more_vert`     | Card context menu         | `text-xl`      |
| `more_horiz`    | Bookmark row menu         | `text-lg`      |
| `arrow_forward` | Continue / Read action    | `text-lg`      |
| `refresh`       | Read Again action         | `text-lg`      |
| `add`           | Create Collection button  | `text-lg`      |
| `bookmark`      | Bookmark indicator        | Default (24px) |
| `settings`      | Settings link in dropdown | `text-lg`      |
| `logout`        | Log out link in dropdown  | `text-lg`      |

**Style:** Outlined variant (not filled). Consistent with the overall light, airy feel.

---

## 6. Layout Principles

### Spacing Strategy

- **Page max-width:** `max-w-[1200px]`, centered with `justify-center`.
- **Page horizontal padding:** `px-8 md:px-12 lg:px-20` — breathing room that scales with viewport.
- **Section spacing:** `mb-8` to `mb-10` between major sections (header → tabs → content).
- **Card internal padding:** `p-5` (novel cards), `p-6` (collection cards), `p-4` (bookmark rows).
- **Grid gap:** `gap-6 md:gap-8` — consistent across all grids.
- **Inner separator:** `mt-5 pt-4 border-t border-slate-50` for the genre/action row in novel cards.

### Depth & Elevation

The design uses a **flat-with-hints** elevation model:

| Level               | Usage                                 | Shadow                                            |
| ------------------- | ------------------------------------- | ------------------------------------------------- |
| 0 — Canvas          | Page background                       | None                                              |
| 1 — Card (rest)     | Novel, Collection, and Bookmark cards | `0 2px 10px -4px rgba(0,0,0,0.05)` — a whisper    |
| 1.5 — Card (hover)  | All cards on hover                    | `0 8px 20px -8px rgba(0,0,0,0.08)` — gentle bloom |
| 2 — Overlay         | Avatar dropdown                       | `shadow-lg` — standard Tailwind large shadow      |
| 3 — Fan front cover | Collection center cover               | `shadow-md` — moderate lift for depth perception  |

No hard or dramatic shadows anywhere. The visual hierarchy relies on subtle opacity changes, border tints, and the minimum necessary shadows to indicate interactivity.

### Responsive Grid System

| Content Type     | `< sm`                                          | `sm`  | `lg`  | `xl`  |
| ---------------- | ----------------------------------------------- | ----- | ----- | ----- |
| Novel Cards      | 1 col                                           | 1 col | 1 col | 2 col |
| Collection Cards | 1 col                                           | 2 col | 3 col | 4 col |
| Bookmark List    | Single column — stacked vertically at all sizes |

---

## 7. Interaction & Motion

### Transitions

| Element                      | Property  | Duration          | Easing         |
| ---------------------------- | --------- | ----------------- | -------------- |
| Card shadow & background     | `all`     | `300ms`           | Default (ease) |
| Tab text color               | `colors`  | `150ms` (default) | Default        |
| Nav link text color          | `colors`  | `150ms` (default) | Default        |
| Avatar dropdown visibility   | `all`     | `200ms`           | Default        |
| Bookmark more-button opacity | `opacity` | `150ms` (default) | Default        |
| Action button opacity        | `opacity` | `150ms` (default) | Default        |

### Hover Behaviors

| Element              | Hover Effect                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Novel card           | Title changes from slate-900 to Royal Amethyst. Shadow blooms.                                  |
| Completed novel card | Background goes from `bg-white/60` to `bg-white`. Title from slate-700 to slate-900.            |
| Collection card      | Title changes to Royal Amethyst. Shadow blooms.                                                 |
| Bookmark row         | Background fills with `bg-slate-50`. Chapter number turns Royal Amethyst. More button fades in. |
| More button (`⋮`)    | Icon from `text-slate-300` to `text-slate-600`.                                                 |
| Genre tags           | No hover effect (non-interactive).                                                              |
| Action buttons       | "Continue": `opacity-70`. "Read Again": `text-slate-800`.                                       |

---

## 8. Design Reference Screenshots

| Screen                   | File                                                                      | Dimensions  |
| ------------------------ | ------------------------------------------------------------------------- | ----------- |
| Library Main ("All" tab) | [screen1-library-main.png](assets/screen1-library-main.png)               | 2560 × 2048 |
| My Collections tab       | [screen2-library-collections.png](assets/screen2-library-collections.png) | 2560 × 2048 |
| My Bookmarks tab         | [screen3-library-bookmarks.png](assets/screen3-library-bookmarks.png)     | 2560 × 2370 |

Source HTML files for each screen are co-located in the `assets/` directory:

- [screen1-library-main.html](assets/screen1-library-main.html)
- [screen2-library-collections.html](assets/screen2-library-collections.html)
- [screen3-library-bookmarks.html](assets/screen3-library-bookmarks.html)
