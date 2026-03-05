# Crawler Page — Functional Specification

> **Route:** `/crawler`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Extract and format web novel content from supported source websites. Users paste a story URL, initiate a crawl, and monitor real-time progress as chapters are fetched, cleaned, and stored in the database.

---

## 1. Page-Level Structure

The Crawler page is a single-page view with three main functional zones below the global header:

| Zone                   | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Header**             | Global navigation bar (shared across all pages)                                  |
| **Page Header**        | Title ("Story Crawler"), subtitle, and URL input row                             |
| **Crawl Status Panel** | Real-time crawl progress with stats, progress bar, and terminal-style log output |
| **Content Area**       | Two-column layout: Novel metadata sidebar (left) + Crawled chapters list (right) |

### 1.1 Page Header

- **Title:** `"Story Crawler"` — static, always visible.
- **Subtitle:** `"Extract and format web novel content from supported sources."` — static.

---

## 2. URL Input & Crawl Initiation

### 2.1 URL Input Row

A horizontal row containing a URL input field and a start button.

**Structure:**

```
[🔗 Paste story URL here...                              ] [▶ Start Crawl]
```

**Layout:** Flex row (`flex-col md:flex-row`), `gap-4`, `mb-8`.

| Element         | Specification                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| **URL Input**   | `type="url"`, full-width (`flex-1`). Placeholder: `"Paste story URL here..."`. Link icon (`link`) as left prefix.   |
| **Start Crawl** | Primary action button with `play_arrow` icon + label `"Start Crawl"`. Disabled / loading when crawl is in progress. |

### 2.2 URL Validation

Before starting a crawl, the URL must be validated:

| Check                   | Rule                                                                             | Error Message                                                          |
| ----------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Non-empty**           | URL field must not be blank                                                      | `"Please enter a URL"`                                                 |
| **Valid URL format**    | Must be a parseable URL                                                          | `"Please enter a valid URL"`                                           |
| **Supported source**    | URL hostname must match a supported crawler (e.g., `69shuba.com`, `uukanshu.cc`) | `"This source is not supported yet"`                                   |
| **Duplicate detection** | Check if `novels.source_url` already exists for this user                        | `"This novel is already in your library. Would you like to re-crawl?"` |

### 2.3 Supported Sources

Source detection is based on URL hostname matching:

| Source | Hostname Pattern | Crawler Class     |
| ------ | ---------------- | ----------------- |
| 69书吧 | `69shuba.com`    | `Shuba69Crawler`  |
| UU看书 | `uukanshu.cc`    | `UukanshuCrawler` |

> **Extensibility:** Additional crawlers can be added by creating new classes extending `BaseCrawler` and registering a hostname pattern.

---

## 3. Crawl Execution Engine

### 3.1 Crawl Workflow

Once a user clicks "Start Crawl", the following server-side workflow executes:

```
1. Validate URL & detect source
2. Fetch novel metadata (title, author, cover, description, total chapters)
3. Fetch chapter list (ordered index + titles + URLs, utilizing FileCache to save bandwidth)
4. Create/update `novels` row in database
5. Create `crawl_jobs` row with status = 'running'
6. For each chapter (concurrent, via AsyncGenerator streaming):
   a. Fetch chapter HTML (with anti-bot bypass strategy)
   b. Clean & normalize text content
   c. Insert `chapters` row
   d. Update `crawl_jobs` progress counters
   e. Emit real-time progress event to client
7. On completion: update `crawl_jobs.status` to 'completed'
8. On failure: update `crawl_jobs.status` to 'failed', log error
```

### 3.2 Anti-Bot Bypass Strategy (3-Level)

The `BaseCrawler.fetchHtml()` implements a tiered approach:

| Level | Method                      | Trigger                                            | Behavior                                                  |
| ----- | --------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| 1     | `got-scraping` with cookies | Default first attempt                              | Random user-agent rotation, cookie jar persistence        |
| 2     | Playwright headless browser | Cloudflare challenge detected, or 403/503 response | Launches headless Chromium, simulates scrolling, waits CF |
| 3     | Graceful failure            | All retries exhausted (max 3)                      | Log error, mark chapter as failed, continue to next       |

**Retry Strategy:** Exponential backoff (`2^attempt * 1000ms + random jitter`).

### 3.3 Text Cleaning Pipeline

After fetching each chapter, the `TextCleaner` performs a 3-step pipeline:

| Step | Layer              | Actions                                                                                          |
| ---- | ------------------ | ------------------------------------------------------------------------------------------------ |
| 1    | DOM Cleaning       | Remove `script`, `style`, ads, watermarks, hidden anti-copy spans. Convert `br`/`p` to newlines. |
| 2    | Pattern Cleaning   | Remove site-specific watermark patterns (domain promotions, memorization prompts).               |
| 3    | Text Normalization | Strip zero-width characters, normalize CRLF → LF, trim lines, collapse empty lines.              |

### 3.4 Rate Limiting & Anti-Bot Optimization

| Parameter          | Value                        | Purpose                                                |
| ------------------ | ---------------------------- | ------------------------------------------------------ |
| **Adaptive Delay** | +/- 30% of base delay        | Humanize request intervals dynamically                 |
| **Long Pause**     | 5% chance of 10-15s wait     | Simulate human reading breaks                          |
| **BackOff**        | Exponential on failure       | Prevent hammering on repeated failures                 |
| **Concurrency**    | Managed by `p-queue` (5 max) | Safe parallel processing without triggering DDoS flags |
| **Caching**        | Local `.cache/` FileCache    | Avoid re-fetching heavy chapter lists                  |
| **Connection**     | HTTP/2 Keep-Alive (`got`)    | Re-use connections to speed up chapter fetching        |

---

## 4. Crawl Status Panel

### 4.1 Structure

```
┌───────────────────────────────────────────────────────────┐
│  Crawl Status                     Successful  Failed  Total │
│  ● Bypassing Cloudflare...            142        3    1,542 │
│                                                             │
│  [████████░░░░░░░░░░░░░░░░░░░░]  progress bar              │
│                                                             │
│  ┌─ Terminal Log ─────────────────────────────────────────┐ │
│  │ [INFO] Initializing crawler for: https://...          │ │
│  │ [INFO] Fetching metadata... Success.                  │ │
│  │ [WARN] Cloudflare challenge detected...               │ │
│  │ [INFO] Bypass successful. Session cookies acquired.   │ │
│  │ [INFO] Discovered 1,542 chapters.                     │ │
│  │ [INFO] Crawling Chapter 1: The Awakening... Success.  │ │
│  │ [ERROR] Chapter 14: Failed (Timeout). Retrying...     │ │
│  │ [WARN] Rate limit approaching. Throttling to 1 req/s. │ │
│  │ ...                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Status Header

| Element            | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Section title**  | `"Crawl Status"` — `text-lg font-bold`                                                  |
| **Status message** | Dynamic text describing current phase (see 4.3). Color-coded by severity.               |
| **Stats counters** | Three columns aligned right: Successful, Failed, Total — each with label + bold number. |

### 4.3 Crawl Phases & Status Messages

| Phase                    | Message                                  | Color   | Icon                 |
| ------------------------ | ---------------------------------------- | ------- | -------------------- |
| **Initializing**         | `"Initializing crawler..."`              | Amber   | `refresh` (spinning) |
| **Fetching metadata**    | `"Fetching novel metadata..."`           | Amber   | `refresh` (spinning) |
| **Bypassing Cloudflare** | `"Bypassing Cloudflare..."`              | Amber   | `refresh` (spinning) |
| **Crawling chapters**    | `"Crawling chapters... (N/Total)"`       | Amber   | `refresh` (spinning) |
| **Throttling**           | `"Rate limited. Throttling requests..."` | Amber   | `refresh` (spinning) |
| **Completed**            | `"Crawl completed successfully!"`        | Emerald | `check_circle`       |
| **Failed**               | `"Crawl failed. See log for details."`   | Rose    | `error`              |
| **Partial**              | `"Completed with N errors."`             | Amber   | `warning`            |

### 4.4 Progress Bar

A segmented horizontal bar showing crawl completion:

| Segment             | Color          | Width Calculation                           |
| ------------------- | -------------- | ------------------------------------------- |
| **Success segment** | Emerald-500    | `(successful_count / total_chapters) * 100` |
| **Failed segment**  | Rose-500       | `(failed_count / total_chapters) * 100`     |
| **Remaining**       | Slate-100 (bg) | Remainder of the bar                        |

**Styling:** `h-2.5`, `rounded-full`, background `bg-slate-100`. Success segment: `rounded-l-full`.

### 4.5 Terminal Log

A console-style scrollable log displaying real-time crawl events:

- **Container:** Dark background (`bg-slate-900`), `rounded-xl`, `p-4`, `h-48`, `overflow-y-auto`.
- **Font:** Monospace (`font-mono`), `text-xs`, base color `text-slate-300`.
- **Auto-scroll:** New entries appear at the bottom; container auto-scrolls to latest entry.

**Log entry format:** `[LEVEL] Message text`

| Log Level | Color       | Usage                                       |
| --------- | ----------- | ------------------------------------------- |
| `[INFO]`  | Emerald-400 | Successful operations, progress updates     |
| `[WARN]`  | Amber-400   | Cloudflare detected, rate limits, non-fatal |
| `[ERROR]` | Rose-400    | Failed chapters, timeouts, critical errors  |

---

## 5. Novel Metadata Sidebar

### 5.1 Structure

Positioned as the left column in a 3-column grid (`lg:col-span-1`). Sticky positioned (`sticky top-6`).

```
┌─────────────────────────────┐
│                             │
│      [Cover Image]          │
│      aspect-[2/3]           │
│                             │
│  Novel Title                │
│                             │
│  ✦ Author     HeavenlySword │
│  🔗 Source     example.com  │
│  📖 Chapters   1,542        │
│  🕐 Updated    Oct 24, 2023 │
│                             │
│  Description text (4-line   │
│  clamp)...                  │
└─────────────────────────────┘
```

### 5.2 Data Mapping

| UI Element     | Source                                                    | Format / Style                                              |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| Cover Image    | `novels.cover_url`                                        | `aspect-[2/3]`, `rounded-xl`, full-width, `border`, shadow  |
| Title          | `novels.title_translated ?? novels.title_raw`             | `text-xl font-bold`, slate-900                              |
| Author         | `novels.author_translated ?? novels.author_raw`           | Metadata row with `person` icon                             |
| Source         | `novels.source_origin`                                    | Metadata row with `link` icon, clickable, primary color     |
| Total Chapters | `novels.total_chapters`                                   | Metadata row with `menu_book` icon, formatted with commas   |
| Last Update    | `novels.last_updated_at`                                  | Metadata row with `update` icon, formatted as date          |
| Description    | `novels.description_translated ?? novels.description_raw` | `text-sm text-slate-500`, `line-clamp-4`, `leading-relaxed` |

### 5.3 Metadata Rows

Each metadata row follows a consistent pattern:

```
[Icon + Label]                      [Value]
```

- **Layout:** `flex justify-between items-center`, `border-b border-slate-50`, `pb-2`.
- **Label:** `text-sm font-medium text-slate-500`, with Material icon `text-[16px]` + `gap-1.5`.
- **Value:** `text-sm text-slate-900` (or `text-primary` for links).

### 5.4 Visibility

The sidebar only appears **after novel metadata has been successfully fetched**. Before that, the content area shows only the crawl status panel at full width.

---

## 6. Crawled Chapters List

### 6.1 Structure

Positioned as the right column in a 3-column grid (`lg:col-span-2`). Fixed height container (`h-[800px]`) with internal scrolling.

```
┌────────────────────────────────────────────────────┐
│  Crawled Chapters                    Showing latest │
├────────────────────────────────────────────────────┤
│  Chapter 145: The Dragon's Wrath                   │
│  /book/supreme-dragon/chapter-145   ✅ Success  Now │
│                                                    │
│  Chapter 144: Heavenly Court's Envoy               │
│  /book/supreme-dragon/chapter-144   ✅ Success  2s  │
│                                                    │
│  Chapter 143: Broken Core                          │
│  /book/supreme-dragon/chapter-143   ❌ Failed   5s  │
│                                                    │
│  ...                                               │
└────────────────────────────────────────────────────┘
```

### 6.2 Header

- **Title:** `"Crawled Chapters"` — `text-lg font-bold`.
- **Subtitle:** `"Showing latest"` — `text-sm font-medium text-slate-500`.
- **Position:** Sticky at top of the scrollable container (`sticky top-0`, white background, `z-10`).

### 6.3 Chapter Row

Each row represents one crawled chapter result.

| Element       | Source                                            | Style / Format                                                |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Chapter title | `chapters.title_translated ?? chapters.title_raw` | `text-sm font-semibold`, slate-900, truncated                 |
| Chapter URL   | Relative path from the source URL                 | `text-xs text-slate-500`, truncated, with `link` icon prefix  |
| Status badge  | Crawl result for this chapter                     | Pill badge (see 6.4)                                          |
| Timestamp     | Time since crawled                                | `text-xs text-slate-400`, right-aligned, fixed width (`w-16`) |

### 6.4 Status Badges

| Status      | Background      | Text Color         | Icon           | Label       |
| ----------- | --------------- | ------------------ | -------------- | ----------- |
| **Success** | `bg-emerald-50` | `text-emerald-700` | `check_circle` | `"Success"` |
| **Failed**  | `bg-rose-50`    | `text-rose-700`    | `error`        | `"Failed"`  |
| **Pending** | `bg-amber-50`   | `text-amber-700`   | `schedule`     | `"Pending"` |

**Badge styling:** `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold`.

### 6.5 Row Visual States

| State           | Visual Treatment                                                 |
| --------------- | ---------------------------------------------------------------- |
| **Success row** | Default white background                                         |
| **Failed row**  | `bg-rose-50/30` tint, becomes `bg-rose-50/50` on hover           |
| **Hover**       | `bg-slate-50` background wash. Rounded corners (`rounded-xl`).   |
| **Separator**   | `border-b border-slate-50` between rows, last row has no border. |

### 6.6 Sort Order

Chapters are displayed in **reverse chronological crawl order** (most recently crawled at the top). This makes the list act as a live feed during crawling.

### 6.7 Re-Crawl Failed Chapters

Failed chapters can be retried:

| Action               | Trigger                       | Behavior                                         |
| -------------------- | ----------------------------- | ------------------------------------------------ |
| **Retry single**     | Click on a failed chapter row | Re-attempt fetching that specific chapter        |
| **Retry all failed** | Button in status panel        | Re-queue all failed chapters for another attempt |

---

## 7. Global Header (Shared Component)

The global header is identical to other pages. See Library Page SPEC for full documentation.

### 7.1 Active State

On the Crawler page, the `"Crawler"` nav link uses `text-slate-900 font-semibold` to indicate the active page.

---

## 8. Data Layer

### 8.1 Database Tables

#### 8.1.1 Existing Tables Used

| Table      | Purpose                                          |
| ---------- | ------------------------------------------------ |
| `novels`   | Stores novel metadata fetched by the crawler     |
| `chapters` | Stores individual chapter content after crawling |

#### 8.1.2 New Table: `crawl_jobs`

This table tracks the status and progress of each crawl operation.

```sql
create table crawl_jobs (
  id uuid default gen_random_uuid() primary key,

  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,

  source_url text not null,

  status text not null default 'pending',
  -- Allowed values: 'pending', 'running', 'completed', 'failed', 'cancelled'

  total_chapters integer default 0,
  successful_chapters integer default 0,
  failed_chapters integer default 0,

  error_message text,

  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_crawl_jobs_user_id on crawl_jobs(user_id);
create index idx_crawl_jobs_novel_id on crawl_jobs(novel_id);

create trigger trg_crawl_jobs_updated_at
before update on crawl_jobs
for each row execute function update_updated_at_column();
```

### 8.2 API Endpoints

#### 8.2.1 Crawl Operations

| Method | Endpoint                   | Description                                  |
| ------ | -------------------------- | -------------------------------------------- |
| `POST` | `/api/crawl`               | Validate URL, start crawl job, return job ID |
| `GET`  | `/api/crawl/:jobId`        | Get crawl job status and progress            |
| `GET`  | `/api/crawl/:jobId/logs`   | Get crawl log entries (for terminal display) |
| `POST` | `/api/crawl/:jobId/retry`  | Retry failed chapters for a given job        |
| `POST` | `/api/crawl/:jobId/cancel` | Cancel an in-progress crawl                  |

#### 8.2.2 POST `/api/crawl` — Start Crawl

**Request Body:**

```ts
interface StartCrawlRequest {
  url: string; // The source novel URL
}
```

**Response (201 Created):**

```ts
interface StartCrawlResponse {
  job_id: string;
  novel: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    description: string;
    total_chapters: number;
    source_url: string;
    source_origin: string;
    last_updated_at: string | null;
  };
}
```

**Error Responses:**

| Status | Condition                 | Body                                          |
| ------ | ------------------------- | --------------------------------------------- |
| 400    | Invalid URL               | `{ error: "Invalid URL format" }`             |
| 400    | Unsupported source        | `{ error: "Source not supported" }`           |
| 409    | Crawl already in progress | `{ error: "A crawl is already running" }`     |
| 500    | Metadata fetch failed     | `{ error: "Failed to fetch novel metadata" }` |

#### 8.2.3 GET `/api/crawl/:jobId` — Crawl Status

**Response:**

```ts
interface CrawlJobStatus {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  novel_id: string;
  source_url: string;
  total_chapters: number;
  successful_chapters: number;
  failed_chapters: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}
```

#### 8.2.4 GET `/api/crawl/:jobId/logs` — Crawl Logs

**Response:**

```ts
interface CrawlLogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

interface CrawlLogsResponse {
  logs: CrawlLogEntry[];
}
```

#### 8.2.5 Crawl Progress — Real-Time Updates

The client receives real-time crawl progress via one of these mechanisms:

| Method                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| **Polling**                  | Client polls `GET /api/crawl/:jobId` every 2-3 seconds |
| **Server-Sent Events (SSE)** | `GET /api/crawl/:jobId/stream` for live event stream   |

**SSE Event Types:**

```ts
type CrawlEvent =
  | { type: "status"; data: { phase: string; message: string } }
  | {
      type: "progress";
      data: {
        successful: number;
        failed: number;
        total: number;
        current_chapter: string;
      };
    }
  | { type: "log"; data: CrawlLogEntry }
  | { type: "metadata"; data: NovelMetadata }
  | {
      type: "chapter_result";
      data: {
        chapter_index: number;
        title: string;
        url: string;
        status: "success" | "failed";
        error?: string;
      };
    }
  | { type: "completed"; data: { successful: number; failed: number } }
  | { type: "error"; data: { message: string } };
```

---

## 9. State Machine

### 9.1 Page States

| State             | URL Input | Start Button | Status Panel | Sidebar | Chapters List |
| ----------------- | --------- | ------------ | ------------ | ------- | ------------- |
| **Idle**          | Enabled   | Enabled      | Hidden       | Hidden  | Hidden        |
| **Validating**    | Disabled  | Loading      | Hidden       | Hidden  | Hidden        |
| **Fetching Meta** | Disabled  | Loading      | Visible      | Hidden  | Hidden        |
| **Crawling**      | Disabled  | Disabled     | Visible      | Visible | Visible       |
| **Completed**     | Enabled   | Enabled      | Visible      | Visible | Visible       |
| **Failed**        | Enabled   | Enabled      | Visible      | Partial | Partial       |

### 9.2 State Transitions

```
Idle → Validating → Fetching Meta → Crawling → Completed
                 ↓                        ↓
              (error)                  Failed
                 ↓                        ↓
               Idle                    Idle (retry possible)
```

---

## 10. Empty & Error States

| Condition                 | Display                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **No crawl started**      | Only URL input visible. Status panel, sidebar, chapters list are hidden.             |
| **Metadata fetch failed** | Status panel shows error. No sidebar or chapters list. "Try again" action available. |
| **All chapters failed**   | Status panel shows error. Chapters list shows all entries with "Failed" badges.      |
| **Unsupported URL**       | Inline error below URL input. Suggested list of supported sources.                   |

---

## 11. Responsive Behavior

| Breakpoint                | Behavior                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `< 640px` (mobile)        | Single column layout. URL input and button stack vertically. Sidebar stacks above chapters list. Stats counters wrap. Terminal log reduced height. |
| `640px – 1023px` (tablet) | URL input + button in row. Content still single column. Stats in row.                                                                              |
| `≥ 1024px` (desktop)      | Full 3-column grid: 1 col sidebar + 2 col chapters list. Side-by-side layout.                                                                      |

---

## 12. User Flows

### 12.1 Crawl a New Novel

1. User navigates to `/crawler`.
2. User pastes a novel URL (e.g., `https://www.69shuba.com/book/12345.htm`).
3. User clicks "Start Crawl".
4. System validates URL and identifies source as `Shuba69Crawler`.
5. System fetches novel metadata → sidebar populates with cover, title, author, etc.
6. System discovers chapter list → total count displays in status panel.
7. System begins crawling chapters sequentially.
8. Terminal log scrolls with real-time `[INFO]`, `[WARN]`, `[ERROR]` messages.
9. Progress bar and counters update live.
10. Crawled chapters appear in the chapters list (newest first).
11. On completion, status shows "Crawl completed successfully!" in green.
12. Novel is automatically added to the user's library with `reading_status = 'reading'`.

### 12.2 Handle Cloudflare Challenge

1. During crawling, `BaseCrawler.fetchHtml()` detects a Cloudflare challenge page.
2. Terminal log shows `[WARN] Cloudflare challenge detected. Initiating bypass...`.
3. Status message updates to `"Bypassing Cloudflare..."`.
4. System switches to Playwright headless browser and waits for challenge to clear.
5. Terminal log shows `[INFO] Bypass successful. Session cookies acquired.`.
6. Crawling resumes with acquired session cookies.

### 12.3 Retry Failed Chapters

1. After crawl completes with some failures, user sees failed chapter rows in red.
2. User can click a failed row to retry that individual chapter.
3. Or user clicks "Retry Failed" button in the status panel to retry all failed chapters.
4. Re-crawled chapters update their status badges from "Failed" to "Success" or remain "Failed".

### 12.4 Cancel In-Progress Crawl

1. During an active crawl, a "Cancel" button appears alongside the status.
2. User clicks "Cancel".
3. System sends `POST /api/crawl/:jobId/cancel`.
4. Crawl stops after completing the current chapter.
5. Status updates to show partial completion stats.
