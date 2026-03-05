# Design System: NovelVerse — Uploader Page

**Stitch Project ID:** `719353196857464339`
**Screen ID:** `Uploader #1 - Main`

---

## 1. Visual Theme & Atmosphere

The Uploader page embodies a **focused, distraction-free writing environment** — a creative workspace that prioritizes content authoring over visual complexity. The aesthetic is **clean, professional, and calm**, designed to channel the user's attention toward the act of writing.

The visual metaphor is a **writer's desk**: a crisp white manuscript card sits on a warm neutral canvas, with clear form fields inviting input and a generous editor area offering room to create. The interface is deliberately minimal — no sidebars, no competing panels — just the story metadata above and the blank page below.

**Keywords:** Focused, Professional, Calm, Minimalist, Authorial.

---

## 2. Color Palette & Roles

### Primary Colors

| Name                 | Hex       | Role                                                                                                          |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| **Royal Amethyst**   | `#8c2bee` | Primary brand accent. Used for: Publish button background, input focus rings/borders, logo icon, cover hover. |
| **Near-White Linen** | `#fafafa` | Page background. Warm off-white canvas that reduces eye strain during long writing sessions.                  |
| **Pure Snow**        | `#ffffff` | Card surfaces, input fields, and editor background. Creates the "manuscript on desk" depth separation.        |

### Neutral Palette (Slate Scale)

| Name              | Hex                   | Role                                                                                                   |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| **Deep Charcoal** | `#0f172a` (slate-900) | Page title, section titles ("Creator Workspace", "Chapter Writing Editor"). Maximum readability.       |
| **Graphite**      | `#334155` (slate-700) | Form labels, tag chip text, select text, editor body content, toolbar active state.                    |
| **Storm Gray**    | `#475569` (slate-600) | Save Draft button text, cover upload label text.                                                       |
| **Pewter**        | `#64748b` (slate-500) | Subtitle text, toolbar buttons at rest, chapter label text (uppercase), toolbar text buttons.          |
| **Silver Mist**   | `#94a3b8` (slate-400) | Placeholder text in inputs, cover upload hint, tag remove icons, word count / reading time text.       |
| **Pale Frost**    | `#cbd5e1` (slate-300) | Editor placeholder text color.                                                                         |
| **Whisper Gray**  | `#e2e8f0` (slate-200) | Input borders, card borders, header divider, toolbar dividers, dashed cover border, Save Draft border. |
| **Ghost White**   | `#f1f5f9` (slate-100) | Card borders (`border-slate-100`), tag chip backgrounds, toolbar hover backgrounds, cover hover area.  |
| **Pale Mist**     | `#f8fafc` (slate-50)  | Cover upload area background.                                                                          |

### Semantic Colors

| Name            | Hex                  | Role                                                        |
| --------------- | -------------------- | ----------------------------------------------------------- |
| **Danger Rose** | `#f43f5e` (rose-500) | Tag remove button hover state — signals destructive action. |

---

## 3. Typography Rules

### Font Family

**Inter** (Google Fonts) — a geometric sans-serif optimized for screen readability. Applied globally via `font-sans: ["Inter", "sans-serif"]`.

### Type Scale

| Element                     | Size                                 | Weight                 | Tracking / Leading                  | Color     |
| --------------------------- | ------------------------------------ | ---------------------- | ----------------------------------- | --------- |
| Page Title (`h1`)           | `text-3xl md:text-4xl` (30px → 36px) | `font-bold` (700)      | `tracking-tight` (-0.025em)         | slate-900 |
| Page Subtitle               | `text-base` (16px)                   | `font-normal` (400)    | Default                             | slate-500 |
| Section Title (`h3`)        | `text-xl` (20px)                     | `font-bold` (700)      | Default                             | slate-900 |
| Form Label                  | `text-sm` (14px)                     | `font-semibold` (600)  | Default                             | slate-700 |
| Chapter Label (uppercase)   | `text-xs` (12px)                     | `font-semibold` (600)  | `uppercase tracking-wider` (0.05em) | slate-500 |
| Input Text                  | `text-lg` (18px) / `text-sm` (14px)  | `font-medium` (500)    | Default                             | slate-900 |
| Title Input                 | `text-lg` (18px)                     | `font-medium` (500)    | Default                             | slate-900 |
| Placeholder Text            | Various                              | Inherits parent weight | Default                             | slate-400 |
| Tag Chip Text               | `text-sm` (14px)                     | `font-medium` (500)    | Default                             | slate-700 |
| Editor Body                 | `text-lg` (18px)                     | `font-normal` (400)    | `leading-relaxed` (1.625)           | slate-700 |
| Editor Placeholder          | `text-lg` (18px)                     | `font-normal` (400)    | `leading-relaxed`                   | slate-300 |
| Word Count / Reading Time   | `text-sm` (14px)                     | `font-medium` (500)    | Default                             | slate-400 |
| Toolbar Text Button (H1/H2) | `text-sm` (14px)                     | `font-semibold` (600)  | Default                             | slate-500 |
| Button Text (Save Draft)    | Inherits                             | `font-semibold` (600)  | Default                             | slate-600 |
| Button Text (Publish)       | Inherits                             | `font-semibold` (600)  | Default                             | white     |
| Cover Label                 | `text-sm` (14px)                     | `font-medium` (500)    | Default                             | slate-600 |
| Cover Hint                  | `text-xs` (12px)                     | `font-normal` (400)    | Default                             | slate-400 |
| Logo Text                   | `text-xl` (20px)                     | `font-bold` (700)      | `tracking-tight`                    | slate-900 |
| Nav Links (active)          | `text-sm` (14px)                     | `font-semibold` (600)  | Default                             | slate-900 |
| Nav Links (inactive)        | `text-sm` (14px)                     | `font-medium` (500)    | Default                             | slate-500 |

### Weight Hierarchy

- **700 (Bold):** Page title, section titles, logo — visual anchors.
- **600 (Semibold):** Form labels, action buttons, active nav, toolbar text buttons — emphasis.
- **500 (Medium):** Input text, tag chips, metadata, word count — supporting text.
- **400 (Regular):** Subtitles, placeholders, editor body text — neutral reading weight.

---

## 4. Component Stylings

### 4.1 Story Metadata Card

- **Shape:** Generously rounded (`rounded-2xl`, 16px radius).
- **Background:** Pure white (`bg-white`).
- **Border:** `border border-slate-100` — barely visible, just enough for edge definition.
- **Shadow:** Whisper-soft: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`.
- **Padding:** `p-6 md:p-8` — comfortable internal spacing that scales with viewport.
- **Layout:** `flex flex-col md:flex-row gap-8` — cover left, form fields right on desktop.

### 4.2 Chapter Editor Card

- **Shape:** Same `rounded-2xl`.
- **Background:** Pure white (`bg-white`). Editor area seamlessly continues the card.
- **Border:** Same `border border-slate-100`.
- **Shadow:** Same whisper-soft shadow.
- **Structure:** Two zones separated by `border-b border-slate-100`:
  - **Upper zone (header):** `p-6 md:p-8` — chapter metadata + toolbar.
  - **Lower zone (editor):** `p-6 md:p-8` — writing area with word analysis.
- **Min height:** `min-h-[700px]` — ensures a tall, manuscript-like writing surface.

### 4.3 Cover Image Uploader

- **Shape:** `rounded-xl` (12px radius).
- **Aspect:** `aspect-[2/3]` — standard book cover proportions.
- **Border (empty):** `border-2 border-dashed border-slate-200` — dashed perimeter inviting action.
- **Background:** `bg-slate-50`.
- **Hover:** `bg-slate-100`, border transitions to `border-primary/50` — hint of brand color.
- **Icon:** `add_photo_alternate`, `text-4xl`, `text-slate-400`. On hover: transitions to Royal Amethyst.
- **Cursor:** `cursor-pointer`.
- **Group hover:** `group-hover:text-primary` on the icon — subtle invitation.

### 4.4 Form Inputs (Text, Select, Textarea)

- **Shape:** `rounded-xl` (12px radius) — matching the card's generously rounded aesthetic.
- **Border:** `border border-slate-200` at rest.
- **Focus:** `border-primary ring-1 ring-primary` — Royal Amethyst glow.
- **Background:** `bg-white`.
- **Shadow:** `shadow-sm` — just enough lift to look tappable.
- **Padding:** Title input: `px-4 py-3`. Other inputs: `px-4 py-2.5`.
- **Transition:** `transition-all` — smooth focus animation.
- **Outline:** `outline-none` — replaced by the ring system.

### 4.5 Tag Input Container

- **Shape:** `rounded-xl` (12px), matching other inputs.
- **Border:** `border border-slate-200`, focus-within: `border-primary ring-1 ring-primary`.
- **Background:** `bg-white`.
- **Shadow:** `shadow-sm`.
- **Min height:** `min-h-[48px]` — ensures at least one row of tags is visible.
- **Layout:** `flex flex-wrap items-center gap-2 p-2`.

### 4.6 Tag Chips

- **Shape:** Pill-shaped (`rounded-full`).
- **Background:** `bg-slate-100` — subtle tint on white.
- **Text:** `text-slate-700`, `text-sm`, `font-medium`.
- **Padding:** `px-3 py-1`.
- **Remove button:** `close` icon at `text-[16px]`, `text-slate-400`, hover: `text-rose-500`.
- **Layout:** `inline-flex items-center gap-1.5`.

### 4.7 Formatting Toolbar

- **Position:** Below chapter metadata, above the editor.
- **Border:** Bottom: `border-b border-slate-100`.
- **Layout:** `flex items-center gap-1`.
- **Icon buttons:** `p-2`, `rounded-lg`, `text-slate-500`, hover: `text-slate-900 bg-slate-100`.
- **Text buttons (H1, H2):** `px-3 py-1.5`, `text-sm font-semibold`, same color scheme.
- **Dividers:** `w-px h-6 bg-slate-200 mx-2` — vertical separators between button groups.

### 4.8 Action Buttons

| Button              | Shape        | Background                    | Border                      | Text                       | Hover                             | Padding     |
| ------------------- | ------------ | ----------------------------- | --------------------------- | -------------------------- | --------------------------------- | ----------- |
| **Save Draft**      | `rounded-xl` | None                          | `border-2 border-slate-200` | slate-600, `font-semibold` | `border-slate-300`, `bg-slate-50` | `px-6 py-3` |
| **Publish Chapter** | `rounded-xl` | `bg-primary` (Royal Amethyst) | None                        | white, `font-semibold`     | `bg-primary/90`                   | `px-8 py-3` |

- Both buttons: `shadow-sm`, `transition-all`.
- Publish button includes `publish` icon at `text-[20px]`, `gap-2`.

### 4.9 Search Input (Header)

- Same as Library page — pill-shaped, `bg-slate-100/80`, `h-10`, `min-w-40 max-w-64`.

### 4.10 Avatar & Dropdown (Header)

- Same as Library page — `size-9 rounded-full`, dropdown `rounded-xl shadow-lg z-50`.

---

## 5. Iconography

**System:** Google Material Symbols Outlined (variable weight/fill).

| Icon Name              | Usage                          | Size          |
| ---------------------- | ------------------------------ | ------------- |
| `auto_stories`         | Logo icon                      | `text-2xl`    |
| `search`               | Search input prefix            | `text-xl`     |
| `add_photo_alternate`  | Cover image upload placeholder | `text-4xl`    |
| `close`                | Tag chip remove button         | `text-[16px]` |
| `format_bold`          | Bold toolbar button            | `text-[20px]` |
| `format_italic`        | Italic toolbar button          | `text-[20px]` |
| `format_list_bulleted` | Bullet list toolbar button     | `text-[20px]` |
| `format_list_numbered` | Numbered list toolbar button   | `text-[20px]` |
| `description`          | Word count icon                | `text-[18px]` |
| `schedule`             | Reading time icon              | `text-[18px]` |
| `publish`              | Publish Chapter button icon    | `text-[20px]` |
| `settings`             | Settings link in dropdown      | `text-lg`     |
| `logout`               | Log out link in dropdown       | `text-lg`     |

**Style:** Outlined variant (not filled). Consistent with the app's light, airy personality.

---

## 6. Layout Principles

### Spacing Strategy

- **Page max-width:** `max-w-[1200px]`, centered with `justify-center`.
- **Page horizontal padding:** `px-8 md:px-12 lg:px-20` — generous breathing room.
- **Section spacing:** `mb-8` between major blocks (header → metadata card → editor card → action bar).
- **Card internal padding:** `p-6 md:p-8` — generous, professional spacing.
- **Form field gap:** `gap-6` between stacked form fields.
- **Grid gap:** `gap-6` for the Author/Status 2-column grid.
- **Bottom padding:** Main area: `pb-16` — generous space below action bar.

### Depth & Elevation

The design uses the same **flat-with-hints** model as the rest of the application:

| Level           | Usage                     | Shadow                                         |
| --------------- | ------------------------- | ---------------------------------------------- |
| 0 — Canvas      | Page background           | None                                           |
| 1 — Card (rest) | Metadata and Editor cards | `0 2px 10px -4px rgba(0,0,0,0.05)` — a whisper |
| 2 — Overlay     | Avatar dropdown           | `shadow-lg` — standard Tailwind large shadow   |

No dramatic shadows or heavy elevation changes. The focus is entirely on the content.

### Responsive Layout

| Content Area    | `< md` (mobile)                    | `≥ md` (tablet+)                         |
| --------------- | ---------------------------------- | ---------------------------------------- |
| Cover + Form    | Cover stacks above form (full-wdt) | Cover left (`w-64`), form right (flex-1) |
| Author / Status | Single column                      | 2-column grid (`grid-cols-2`)            |
| Chapter meta    | Chapter No. above Title            | Side-by-side (`flex-row`)                |
| Action buttons  | Right-aligned, potentially stacked | Right-aligned, horizontal                |

---

## 7. Interaction & Motion

### Transitions

| Element                    | Property | Duration         | Easing         |
| -------------------------- | -------- | ---------------- | -------------- |
| Input focus border/ring    | `all`    | Default (~150ms) | Default (ease) |
| Cover uploader hover       | `colors` | Default (~150ms) | Default        |
| Toolbar button hover       | `colors` | Default (~150ms) | Default        |
| Tag remove icon hover      | `colors` | Default (~150ms) | Default        |
| Action button hover        | `all`    | Default (~150ms) | Default        |
| Nav link hover             | `colors` | Default (~150ms) | Default        |
| Avatar dropdown visibility | `all`    | `200ms`          | Default        |

### Hover Behaviors

| Element                | Hover Effect                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Cover uploader         | Background darkens to `bg-slate-100`. Border shows hint of primary. Icon turns primary. |
| Form inputs            | Focus ring in Royal Amethyst.                                                           |
| Tag remove `✕`         | Icon color transitions from Silver Mist to Danger Rose.                                 |
| Toolbar icon buttons   | Text darkens to slate-900, background fills `bg-slate-100`.                             |
| Save Draft button      | Border darkens to slate-300, background fills with `bg-slate-50`.                       |
| Publish Chapter button | Background lightens to `bg-primary/90`.                                                 |
| Nav links (inactive)   | Text transitions to slate-900.                                                          |

---

## 8. Design Reference Screenshots

| Screen        | File                                                            |
| ------------- | --------------------------------------------------------------- |
| Uploader Main | [Uploader #1 - Main.png](assets/Uploader%20%231%20-%20Main.png) |

Source HTML file for the screen is co-located in the `assets/` directory:

- [Uploader #1 - Main.html](assets/Uploader%20%231%20-%20Main.html)
