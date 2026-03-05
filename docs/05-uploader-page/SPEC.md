# Uploader Page — Functional Specification

> **Route:** `/uploader`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Creator workspace for writing, editing, and publishing original novel content — story metadata and chapter authoring in a unified interface.

---

## 1. Page-Level Structure

The Uploader page is a single-page authoring environment composed of three stacked zones:

| Zone                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| **Header**              | Global navigation bar (shared across all pages)                     |
| **Page Header**         | Title ("Creator Workspace"), subtitle                               |
| **Story Metadata Card** | Form for novel-level metadata: title, author, tags, cover, status   |
| **Chapter Editor Card** | Rich text editor for chapter content with toolbar and word analysis |
| **Action Bar**          | Save Draft and Publish Chapter buttons                              |

### 1.1 Page Header

- **Title:** `"Creator Workspace"` — static, always visible.
- **Subtitle:** `"Write, edit, and publish your stories to NovelVerse."` — static.
- **Layout:** Stacked vertically with `gap-2`, `mb-8`.

---

## 2. Story Metadata Card

A white card containing the novel-level form fields. All fields here apply to the `novels` table.

### 2.1 Layout

Horizontal layout on desktop (`flex-row`), stacked on mobile (`flex-col`). The cover image uploader sits on the left, form fields on the right.

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────┐   Story Title        [________________]    │
│  │             │                                             │
│  │   Cover     │   Author Name        Story Status           │
│  │   Upload    │   [____________]     [Ongoing ▼]            │
│  │   Area      │                                             │
│  │             │   Story Tags                                │
│  └─────────────┘   [Fantasy ✕] [Action ✕] [___________]     │
│                                                              │
│                    Story Description                         │
│                    [_________________________________]       │
│                    [_________________________________]       │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Cover Image Uploader

| Property       | Value                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Aspect**     | `aspect-[2/3]` (portrait, book-cover proportions)                                           |
| **Width**      | `w-full md:w-64` — full width on mobile, fixed 256px on desktop                             |
| **Border**     | Dashed, `border-2 border-dashed border-slate-200`                                           |
| **Background** | `bg-slate-50`                                                                               |
| **Hover**      | `bg-slate-100`, border transitions to `border-primary/50`                                   |
| **Icon**       | `add_photo_alternate` (Material Symbols), `text-4xl`, transitions to primary color on hover |
| **Label**      | `"Upload Cover Image"` — `text-sm font-medium text-slate-600`                               |
| **Hint**       | `"Drag & drop or click"` — `text-xs text-slate-400`                                         |
| **Cursor**     | `cursor-pointer`                                                                            |

**Behavior:**

1. Click opens a file picker (`accept="image/*"`).
2. Drag & drop support.
3. After selection, the dashed box is replaced with a preview of the uploaded image.
4. Image is uploaded to Supabase Storage (`covers/` bucket) and the URL persists to `novels.cover_url`.

### 2.3 Form Fields

| Field                 | Input Type | DB Column                   | Placeholder                                            | Validation                   |
| --------------------- | ---------- | --------------------------- | ------------------------------------------------------ | ---------------------------- |
| **Story Title**       | `text`     | `novels.title_raw`          | `"Enter story title..."`                               | Required, non-empty          |
| **Author Name**       | `text`     | `novels.author_raw`         | `"Pen name..."`                                        | Optional                     |
| **Story Status**      | `select`   | `novels.publication_status` | —                                                      | Required, one of enum values |
| **Story Tags**        | Tag input  | `novels.genres[]`           | `"Add a tag and press enter..."`                       | Array of strings             |
| **Story Description** | `textarea` | `novels.description_raw`    | `"Write a compelling description for your readers..."` | Optional                     |

#### 2.3.1 Story Status Options

| Label       | DB Value    |
| ----------- | ----------- |
| `Ongoing`   | `ongoing`   |
| `Completed` | `completed` |
| `Hiatus`    | `hiatus`    |
| `Draft`     | `draft`     |

#### 2.3.2 Story Tags — Interaction Model

- **Container:** Flex-wrap container with inline tag chips and a trailing text input.
- **Adding a tag:** User types a tag and presses `Enter`. A new pill chip is created.
- **Removing a tag:** Each chip has an `✕` button (`close` icon). Clicking removes the tag.
- **Chip styling:**
  - `px-3 py-1`, `rounded-full`, `bg-slate-100`, `text-slate-700`, `text-sm font-medium`.
  - Remove button: `text-slate-400`, hover: `text-rose-500`.

### 2.4 Input Styling (Shared)

All text inputs and the select dropdown share a common styling:

| Property       | Value                                                     |
| -------------- | --------------------------------------------------------- |
| **Border**     | `border border-slate-200`                                 |
| **Radius**     | `rounded-xl` (12px)                                       |
| **Focus**      | `border-primary`, `ring-1 ring-primary`                   |
| **Shadow**     | `shadow-sm`                                               |
| **Background** | `bg-white`                                                |
| **Padding**    | `px-4 py-3` (title), `px-4 py-2.5` (author, status, tags) |
| **Transition** | `transition-all`                                          |

---

## 3. Chapter Writing Editor

A tall white card that functions as the primary chapter authoring area.

### 3.1 Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Chapter Writing Editor                                      │
│                                                              │
│  CHAPTER NO.     CHAPTER TITLE                               │
│  [  1  ]         [e.g. The Beginning_________________]       │
│                                                              │
│  [B] [I]  |  [H1] [H2]  |  [•] [1.]                        │
│  ─────────────────────────────────────────────────────────   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Start writing your chapter here...                          │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
│  📄 Word Count: 1,250 words    🕐 Reading Time: ~5 mins     │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Chapter Metadata Fields

| Field             | Input Type | DB Column                | Default / Placeholder     | Validation                 |
| ----------------- | ---------- | ------------------------ | ------------------------- | -------------------------- |
| **Chapter No.**   | `number`   | `chapters.chapter_index` | `1`                       | Required, positive integer |
| **Chapter Title** | `text`     | `chapters.title_raw`     | `"e.g. The Beginning..."` | Required, non-empty        |

- Labels use uppercase tracking: `text-xs font-semibold text-slate-500 uppercase tracking-wider`.
- Chapter No. input has fixed width `w-32`.

### 3.3 Formatting Toolbar

A horizontal button bar below the chapter metadata, separated by a bottom border.

| Button Group | Buttons                    | Icon / Label                                   |
| ------------ | -------------------------- | ---------------------------------------------- |
| **Text**     | Bold, Italic               | `format_bold`, `format_italic`                 |
| —            | Vertical divider           | `w-px h-6 bg-slate-200 mx-2`                   |
| **Headings** | H1, H2                     | Text buttons: `"H1"`, `"H2"`                   |
| —            | Vertical divider           | Same as above                                  |
| **Lists**    | Bullet list, Numbered list | `format_list_bulleted`, `format_list_numbered` |

**Toolbar Button Styling:**

- Icon buttons: `p-2`, icon `text-[20px]`.
- Text buttons (H1/H2): `px-3 py-1.5`, `text-sm font-semibold`.
- All: `text-slate-500`, hover: `text-slate-900 bg-slate-100`.
- Shape: `rounded-lg`.
- Transition: `transition-colors`.

### 3.4 Content Editor

- **Element:** `<textarea>` (or rich text editor component).
- **Min height:** `min-h-[500px]`.
- **Font:** `text-lg`, `leading-relaxed`.
- **Placeholder:** `"Start writing your chapter here..."` — `text-slate-300`.
- **Styling:** No borders, no ring on focus. Transparent background. Full-width.
- **DB Column:** `chapters.content_raw`.

### 3.5 Word Analysis Footer

Displayed at the bottom of the editor area, aligned left.

| Metric           | Icon          | Format                      | Calculation                                   |
| ---------------- | ------------- | --------------------------- | --------------------------------------------- |
| **Word Count**   | `description` | `"Word Count: N,NNN words"` | Count words in content, formatted with commas |
| **Reading Time** | `schedule`    | `"Reading Time: ~N mins"`   | Calculated at ~250 words per minute           |

- Style: `text-sm font-medium text-slate-400`.
- Icons: `text-[18px]`, same color.
- Gap between metrics: `gap-6`.

---

## 4. Action Bar

Positioned below the chapter editor card, right-aligned. Contains two buttons.

| Button              | Style                                 | Icon      | Behavior                                        |
| ------------------- | ------------------------------------- | --------- | ----------------------------------------------- |
| **Save Draft**      | Outlined, `border-2 border-slate-200` | —         | Saves novel metadata + chapter content as draft |
| **Publish Chapter** | Filled, `bg-primary text-white`       | `publish` | Validates and publishes the chapter             |

### 4.1 Save Draft Flow

1. Validates required fields (Story Title is required).
2. If novel doesn't exist: `INSERT INTO novels(...)` → creates new novel record.
3. If novel exists: `UPDATE novels SET ...` → updates metadata.
4. Chapter data is saved: `INSERT INTO chapters(...)` or `UPDATE chapters SET ...`.
5. No publication_status change — draft state is implicit (content saved but not marked as published).
6. Success feedback shown to user.

### 4.2 Publish Chapter Flow

1. Validates **all** required fields:
   - Story Title must be non-empty.
   - Chapter Title must be non-empty.
   - Chapter content must be non-empty.
2. Same novel upsert as Save Draft.
3. Chapter is inserted/updated with content.
4. `novels.total_chapters` is recalculated (count of chapters for this novel).
5. `novels.total_words` is recalculated (sum of word counts across all chapters).
6. `novels.last_updated_at` is set to current timestamp.
7. Novel is automatically added to the user's library (`library_entries`) if not already present.
8. Success feedback with option to continue writing or view the published chapter.

---

## 5. Global Header (Shared Component)

The global header appears at the top of every page. Same as documented in the Library Page SPEC.

### 5.1 Structure

```
[Logo] [Search]               [Nav Links]                [Avatar ▼]
```

### 5.2 Elements

| Element       | Description                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logo**      | `auto_stories` Material icon (primary color) + `"NovelVerse"` text (`text-xl font-bold`)                                                                                                     |
| **Search**    | Pill-shaped input (`rounded-full`), placeholder `"Search novels..."`. Hidden on mobile (`hidden md:flex`). `min-w-40 max-w-64`.                                                              |
| **Nav Links** | Hidden on mobile (`hidden lg:flex`). Links: `Library`, `Explore`, `Crawler`, `Uploader`, `AI Features`. Active link: `text-slate-900 font-semibold`. Inactive: `text-slate-500 font-medium`. |
| **Avatar**    | Circular avatar image (`size-9 rounded-full`). Border: `border-slate-200`.                                                                                                                   |
| **Dropdown**  | Appears on avatar hover. Contains: `Settings` (settings icon), `Log out` (logout icon). White bg, `rounded-xl`, shadow, `z-50`.                                                              |

### 5.3 Nav Link Routes

| Label       | Route       |
| ----------- | ----------- |
| Library     | `/library`  |
| Explore     | `/explore`  |
| Crawler     | `/crawler`  |
| Uploader    | `/uploader` |
| AI Features | `/ai`       |

---

## 6. Data Layer

### 6.1 Database Tables (Relevant)

| Table             | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `novels`          | Novel metadata (title, author, cover, genres, status) |
| `chapters`        | Chapter content and metadata                          |
| `library_entries` | User's library membership (auto-add on publish)       |

### 6.2 Database Schema Considerations

The existing `novels` table already supports all fields needed by the uploader:

| UI Field          | DB Column                   | Notes                                |
| ----------------- | --------------------------- | ------------------------------------ |
| Story Title       | `novels.title_raw`          | Existing column                      |
| Author Name       | `novels.author_raw`         | Existing column                      |
| Story Status      | `novels.publication_status` | Existing column, accepts text values |
| Story Tags        | `novels.genres[]`           | Existing `text[]` column             |
| Story Description | `novels.description_raw`    | Existing column                      |
| Cover Image       | `novels.cover_url`          | Existing column, stores Storage URL  |
| Chapter No.       | `chapters.chapter_index`    | Existing column                      |
| Chapter Title     | `chapters.title_raw`        | Existing column                      |
| Chapter Content   | `chapters.content_raw`      | Existing column                      |

> **Note:** For user-created novels (via uploader), `novels.source_url` and `novels.source_origin` will be `NULL`, distinguishing them from crawled novels.

### 6.3 API Endpoints

#### 6.3.1 Novels (Uploader-specific)

| Method  | Endpoint          | Description                                 |
| ------- | ----------------- | ------------------------------------------- |
| `POST`  | `/api/novels`     | Create a new novel with metadata            |
| `PATCH` | `/api/novels/:id` | Update novel metadata (title, author, etc.) |
| `GET`   | `/api/novels/:id` | Get novel details for editing               |

**POST `/api/novels` Request Shape:**

```ts
interface CreateNovelRequest {
  title_raw: string; // Required
  author_raw?: string;
  publication_status?: string; // 'ongoing' | 'completed' | 'hiatus' | 'draft'
  genres?: string[];
  description_raw?: string;
  cover_url?: string;
}
```

**Response Shape:**

```ts
interface Novel {
  id: string;
  title_raw: string;
  author_raw: string | null;
  cover_url: string | null;
  description_raw: string | null;
  genres: string[];
  publication_status: string;
  total_chapters: number;
  total_words: number;
  created_at: string;
  updated_at: string;
}
```

#### 6.3.2 Chapters

| Method  | Endpoint                        | Description                                    |
| ------- | ------------------------------- | ---------------------------------------------- |
| `POST`  | `/api/novels/:novelId/chapters` | Create a new chapter                           |
| `PATCH` | `/api/chapters/:id`             | Update chapter content and/or title            |
| `GET`   | `/api/novels/:novelId/chapters` | List all chapters for a novel (for navigation) |

**POST `/api/novels/:novelId/chapters` Request Shape:**

```ts
interface CreateChapterRequest {
  chapter_index: number; // Required
  title_raw: string; // Required
  content_raw: string; // Required (for publish), optional (for draft)
}
```

#### 6.3.3 Cover Image Upload

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| `POST` | `/api/upload/cover` | Upload cover image to Supabase Storage |

**Flow:**

1. Client sends `multipart/form-data` with image file.
2. Server uploads to Supabase Storage bucket (`covers/`).
3. Returns the public URL.
4. Client patches the novel record with the returned `cover_url`.

---

## 7. Mode Detection: New vs. Edit

The uploader page operates in two modes based on URL:

| Mode     | URL                    | Behavior                                                                                           |
| -------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| **New**  | `/uploader`            | All fields empty. Creates new novel + first chapter.                                               |
| **Edit** | `/uploader?novel={id}` | Pre-populates metadata from existing novel. Chapter picker allows selecting which chapter to edit. |

### 7.1 Edit Mode Enhancements

When editing an existing novel:

- Story metadata fields are pre-populated from the `novels` table.
- Cover image preview is shown if `cover_url` exists.
- Chapter No. dropdown/input shows existing chapters for navigation.
- User can select an existing chapter to edit or create a new one.

---

## 8. Empty States & Validation

### 8.1 Validation Messages

| Condition                         | Message                                      | Trigger             |
| --------------------------------- | -------------------------------------------- | ------------------- |
| Story Title empty on Save/Publish | `"Story title is required"`                  | Inline, below field |
| Chapter Title empty on Publish    | `"Chapter title is required"`                | Inline, below field |
| Chapter content empty on Publish  | `"Chapter content cannot be empty"`          | Inline or toast     |
| Cover image too large             | `"Image must be under 5MB"`                  | Toast notification  |
| Cover image wrong format          | `"Only JPG, PNG, and WebP formats accepted"` | Toast notification  |

### 8.2 Success Feedback

| Action          | Feedback                                                 |
| --------------- | -------------------------------------------------------- |
| Save Draft      | Toast: `"Draft saved successfully"`                      |
| Publish Chapter | Toast: `"Chapter published!"` with link to read it       |
| Upload Cover    | Inline preview appears, replacing the upload placeholder |

---

## 9. Responsive Behavior

| Breakpoint                  | Behavior                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `< 640px` (mobile)          | Cover uploader stacks above form fields (full width). Single column layout throughout. |
| `640px – 1023px` (tablet)   | Cover uploader beside form fields. Author/Status remain in 2-col grid.                 |
| `1024px – 1279px` (desktop) | Full horizontal layout. Nav links visible.                                             |
| `≥ 1280px` (xl)             | Max-width `1200px` centered. Full layout with generous spacing.                        |

---

## 10. User Flows

### 10.1 Write and Publish a New Chapter

1. User navigates to `/uploader`.
2. Fills in Story Title (required), Author Name, Status, Tags, Description.
3. Optionally uploads a cover image.
4. Enters Chapter No. (defaults to 1) and Chapter Title.
5. Writes chapter content in the editor.
6. Clicks "Publish Chapter".
7. Novel is created → Chapter is saved → Novel added to library.
8. Success toast appears.

### 10.2 Save a Draft

1. User fills in at least the Story Title.
2. Optionally writes partial chapter content.
3. Clicks "Save Draft".
4. Novel metadata and chapter content saved without publishing.
5. Success toast: "Draft saved successfully".

### 10.3 Edit an Existing Novel

1. User navigates to `/uploader?novel={id}`.
2. Form is pre-populated with existing novel metadata.
3. User modifies fields as needed.
4. Selects or creates a chapter.
5. Edits content and saves/publishes.

### 10.4 Upload Cover Image

1. User clicks the dashed cover area or drags an image onto it.
2. File picker opens (for click) or drop is accepted.
3. Image is validated (type, size).
4. Upload to Supabase Storage.
5. Preview replaces the placeholder.
6. `cover_url` is stored on the novel record.
