# Story Q&A — Functional Specification

> **Route:** `/ai/story-qa`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** A RAG-powered question-answering interface that lets users ask natural language questions about a novel's plot, characters, lore, and world-building. Answers are grounded in the actual novel text with cited chapter references, limited to a user-configurable chapter range to prevent spoilers.

---

## 1. Page-Level Structure

The Story Q&A page uses a **three-panel workspace** layout:

| Panel                         | Width    | Purpose                                             |
| ----------------------------- | -------- | --------------------------------------------------- |
| **Left Sidebar**              | `w-80`   | Novel selection, knowledge slider, question history |
| **Main Q&A Area**             | `flex-1` | Chat header, Q&A message stream, input bar          |
| **Right Context Panel** (≥xl) | `w-80`   | Quick context: current arc, relevant entities       |

### 1.1 Panel Visibility

| Breakpoint | Left Sidebar    | Main Area  | Right Panel |
| ---------- | --------------- | ---------- | ----------- |
| `< lg`     | Hidden / toggle | Full-width | Hidden      |
| `lg – <xl` | Visible         | Flex-1     | Hidden      |
| `≥ xl`     | Visible         | Flex-1     | Visible     |

---

## 2. Left Sidebar — Configuration & History

### 2.1 Back Navigation & Title

- **Back link:** `arrow_back` icon — `text-slate-400 hover:text-slate-900`, navigates to AI Features Hub.
- **Page title:** `"Story Q&A"` — `text-lg font-bold text-slate-900` with `psychology_alt` icon (primary color).

### 2.2 Target Novel Selection

- **Label:** `"Target Novel"` — `text-sm font-medium text-slate-700`.
- **Input:** `<select>` dropdown with custom appearance — `bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 font-medium`.
- **Custom dropdown chevron:** `expand_more` icon, absolutely positioned right.
- **Data source:** All novels in the user's library.
- **Behavior:** Changing the novel reloads the knowledge base context and clears the current Q&A session. History entries for the previous novel remain accessible.

### 2.3 Knowledge Base Slider

Controls the chapter limit for RAG retrieval — answers will only reference content up to this chapter.

- **Label:** `"Knowledge Base"` — `text-sm font-medium text-slate-700`.
- **Current value badge:** `text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md` — e.g., `"Up to Ch. 412"`.
- **Explanation:** `"Set limit to prevent future spoilers."` — `text-xs text-slate-500`.
- **Range input:** `<input type="range">`, `min="1"`, `max="{novel.total_chapters} (Latest)"`, `accent-primary`.
- **Range labels:** `"Ch. 1"` (left), `"Ch. {max} (Latest)"` (right) — `text-[10px] text-slate-400`.

**Behavior:**

- Changing the slider updates the retrieval boundary immediately.
- The chat header and disclaimer update to reflect the new limit.
- Previous Q&A messages remain visible but answers are NOT retroactively updated.

### 2.4 Question History

A chronological list of past questions, grouped by time:

- **Label:** `"HISTORY"` — `text-xs font-bold text-slate-400 uppercase tracking-wider`.
- **Each entry:**

| State        | Styling                                                                                 |
| ------------ | --------------------------------------------------------------------------------------- |
| **Active**   | `bg-primary/5 border border-primary/20 text-primary p-3 rounded-xl`                     |
| **Inactive** | `bg-white border border-slate-100 text-slate-700 p-3 rounded-xl hover:border-slate-300` |

- **Question text:** `text-sm font-medium line-clamp-1`.
- **Timestamp:** `schedule` icon + relative time (e.g., `"Just now"`, `"Yesterday"`, `"3 days ago"`) — `text-[10px] text-slate-400` (or `opacity-70` for active).

**Behavior:**

- Clicking a history entry scrolls to that Q&A exchange in the main area.
- History is persisted per novel per user.

---

## 3. Main Q&A Area

### 3.1 Chat Header (Sticky)

- **Container:** `h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-10`.
- **Left section:**
  - **Novel thumbnail:** `w-8 h-10 rounded shadow-sm` with gradient overlay (`bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80`).
  - **Novel title:** `text-base font-bold text-slate-900`.
  - **Knowledge status:** Active indicator — green dot (`w-1.5 h-1.5 rounded-full bg-emerald-500`) with `animate-ping` overlay + `"Knowledge citations active"` — `text-xs text-emerald-600 font-medium`.
- **Right section (< lg):** `menu` icon button for sidebar toggle.

### 3.2 Q&A Message Stream

Messages use a question-answer pattern rather than a conversational chat flow:

- **Container:** `flex-1 overflow-y-auto p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto`.

#### 3.2.1 User Question (Right-Aligned)

```
   [Question text]         ← right-aligned bubble
   You • 10:24 AM          ← timestamp
```

| Element       | Specification                                                                     |
| ------------- | --------------------------------------------------------------------------------- |
| **Bubble**    | `bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-md shadow-primary/20` |
| **Alignment** | `self-end max-w-[80%]`                                                            |
| **Text**      | `text-sm`                                                                         |
| **Timestamp** | `"You • {time}"` — `text-[10px] text-slate-400 self-end mr-1`                     |

#### 3.2.2 AI Answer (Left-Aligned)

```
[AI Avatar] [Answer bubble with structured content]
            [Source citation chips]
            AI Assistant • 10:24 AM
```

| Element              | Specification                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Avatar**           | `w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 shadow-sm` with `robot_2` icon (indigo-600)   |
| **Bubble**           | `bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]` |
| **Text**             | `text-sm text-slate-800 leading-relaxed`                                                                   |
| **Entity highlight** | Key terms inline: `font-semibold text-primary` — e.g., "Heavenly Void Cauldron"                            |
| **Paragraph gap**    | `mb-4` between paragraphs, `mb-5` before citations                                                         |
| **Timestamp**        | `"AI Assistant • {time}"` — `text-[10px] text-slate-400 ml-1`                                              |

#### 3.2.3 Source Citation Chips

Below the answer text, separated by a `border-t border-slate-100 pt-4`:

| Chip Type          | Styling                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Primary source** | `bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 text-[11px] font-medium` with `menu_book` icon |
| **Reference**      | `bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium` with `history_edu` icon |

- **Hover:** Background darkens slightly, `cursor-pointer transition-colors`.
- **Click behavior:** Clicking a citation chip navigates to the Reader page at the referenced chapter and paragraph (deep-link).
- **Format:** `"Source: Chapter {N}, Paragraph {M}"` or `"Reference: Chapter {N} ({context})"`.

#### 3.2.4 Loading State

While the AI is searching and generating:

```
[AI Avatar] [Loading bubble]
```

- **Bubble content:** Three bouncing dots + italic text.
- **Dots:** `w-2 h-2 bg-slate-300 rounded-full animate-bounce` with staggered delays (`0s`, `0.2s`, `0.4s`).
- **Text:** `"Searching knowledge base..."` — `text-slate-500 italic text-sm`.

### 3.3 Q&A Input Bar

Fixed at the bottom of the main area:

- **Container:** `p-6 bg-white border-t border-slate-200`.
- **Inner container:** `max-w-4xl mx-auto`, `bg-white border border-slate-200 rounded-2xl shadow-sm p-2`.
- **Focus state:** `border-primary ring-1 ring-primary`.

| Element         | Specification                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Attach btn**  | `add_circle` icon — `p-3 text-slate-400 hover:text-primary rounded-xl hover:bg-slate-50`. Future use: attach images/references. |
| **Textarea**    | `bg-transparent border-none text-slate-900 text-sm focus:ring-0 resize-none min-h-[56px] max-h-32`                              |
| **Placeholder** | `"Ask a question about the plot, lore, or characters..."`                                                                       |
| **Send button** | `p-3 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-md`, `h-12 w-12`, `send` icon                                  |

**Disclaimer text:** `"AI responses may contain inaccuracies. Content is limited to Chapter {N} to prevent spoilers."` — `text-[11px] text-slate-400`, centered below input.

---

## 4. Right Context Panel — Quick Context

Provides at-a-glance context about the current story state, automatically populated based on the selected chapter range.

### 4.1 Panel Header

- **Icon + title:** `auto_awesome` (amber-500) + `"Quick Context"` — `text-sm font-bold text-slate-900`.
- **Subtitle:** `"Based on your selected Chapter {N}"` — `text-xs text-slate-500`.
- **Container:** `p-6 border-b border-slate-200/60 bg-white`.

### 4.2 Current Arc

- **Label:** `"CURRENT ARC"` — uppercase section header.
- **Card:** `bg-white p-4 rounded-xl border border-slate-200 shadow-sm`.
  - **Arc title:** `font-bold text-slate-800 text-sm`.
  - **Description:** `text-xs text-slate-600 leading-relaxed`.
  - **Chapter range badge:** `text-[10px] font-medium text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded` with `format_list_numbered` icon.

**Data source:** `story_arcs` table — AI-extracted narrative arcs with chapter ranges. The arc containing the selected chapter is displayed.

### 4.3 Relevant Entities

Shows characters, antagonists, and items relevant to the current Q&A context.

- **Label:** `"RELEVANT ENTITIES"` — uppercase section header.
- **Each entity card:** `bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3`.

**Entity types:**

| Type              | Avatar style                                                         | Example                                                      |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Character**     | `w-8 h-8 rounded-full bg-slate-200` with initials                    | "Lin Fan — Protagonist • Nascent Soul Stage"                 |
| **Antagonist**    | `w-8 h-8 rounded-full bg-red-100` with initials in `text-red-500`    | "Blood Demon Patriarch — Main Antagonist • Sealed"           |
| **Item/Artifact** | `w-8 h-8 rounded-md bg-purple-100` with `local_fire_department` icon | "Heavenly Void Cauldron — Divine Artifact • Alchemy/Storage" |

- **Name:** `font-bold text-slate-800 text-xs`.
- **Subtitle:** `text-[10px] text-slate-500` — role + status/level.

**Data source:** Entities are dynamically populated from the RAG retrieval results. When the AI answers a question, relevant entities from the retrieved chunks are extracted and displayed.

---

## 5. AI Q&A Engine — Backend Logic

### 5.1 RAG Pipeline

The Story Q&A feature is a **production RAG (Retrieval-Augmented Generation)** system:

```
User Question ──→ [Embed] ──→ [Vector Search] ──→ [Rerank] ──→ [Generate + Cite]
                      │              │                               │
                      ▼              ▼                               ▼
                  Embedding    Vector DB            LLM with context +
                   Model     (chapter-filtered)     citation instructions
```

### 5.2 Document Ingestion (Pre-processing)

Novel chapters are pre-processed and indexed when added to the system:

| Step          | Description                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Chunking**  | Each chapter is split into semantic chunks (paragraph-level, ~200-500 tokens)                      |
| **Metadata**  | Each chunk is tagged with: `novel_id`, `chapter_number`, `paragraph_index`, `character_mentions[]` |
| **Embedding** | Each chunk is embedded using the embedding model                                                   |
| **Storage**   | Embeddings stored in vector database (pgvector or dedicated vector store)                          |

### 5.3 Retrieval Strategy

For each user question:

1. **Embed** the question.
2. **Vector search** with metadata filter: `chapter_number <= knowledge_limit AND novel_id = selected_novel`.
3. **Retrieve** top-K candidates (K=10).
4. **Rerank** using a cross-encoder model or LLM-based reranking to get top-5 most relevant chunks.
5. **Entity extraction:** From the top-5 chunks, extract mentioned characters and items for the context panel.

### 5.4 Answer Generation Prompt

```
System Prompt:
  You are a knowledgeable assistant for the web novel "{novel_title}".

  RULES:
  1. Answer ONLY based on the provided context passages.
  2. If the context doesn't contain the answer, say "I don't have enough
     information from the available chapters to answer that."
  3. NEVER reveal events beyond Chapter {knowledge_limit}.
  4. Cite your sources using [Chapter X, Paragraph Y] format.
  5. Highlight key entity names for visual emphasis.
  6. Be thorough but concise (2-4 paragraphs maximum).

  CONTEXT PASSAGES:
  ---
  [Chapter {N}, Paragraph {M}]: "{chunk_text}"
  [Chapter {N2}, Paragraph {M2}]: "{chunk_text_2}"
  ...
  ---

  Question: {user_question}
```

### 5.5 Citation Extraction

From the LLM response, extract citation references:

1. **Parse** `[Chapter X, Paragraph Y]` patterns from the generated text.
2. **Classify** as primary source (directly answers the question) or reference (provides context).
3. **Create** citation chip objects with chapter/paragraph numbers and brief labels.
4. **Strip** inline citations from the visible text and render them as chips below the answer.

### 5.6 Response Parameters

| Parameter       | Value                               |
| --------------- | ----------------------------------- |
| **Model**       | Configurable (e.g., GPT-4o, Claude) |
| **Temperature** | 0.3 (factual, grounded)             |
| **Max tokens**  | 800–1200 per answer                 |
| **Retrieval K** | 10 candidates → 5 after reranking   |

---

## 6. Data Layer

### 6.1 Database Tables

#### 6.1.1 New Tables Required

**`novel_chunks`** — Indexed novel content for RAG retrieval:

```sql
create table novel_chunks (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,
  chapter_number integer not null,

  content text not null,
  paragraph_index integer not null,
  token_count integer,
  character_mentions text[], -- entity names found in chunk

  embedding vector(1536), -- pgvector column

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_novel_chunks_novel_chapter on novel_chunks(novel_id, chapter_number);
create index idx_novel_chunks_embedding on novel_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

**`story_arcs`** — AI-extracted narrative arcs:

```sql
create table story_arcs (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  title text not null,
  description text,
  start_chapter integer not null,
  end_chapter integer not null,
  arc_order integer not null,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_story_arcs_novel_id on story_arcs(novel_id);
```

**`qa_sessions`** — Q&A conversation sessions:

```sql
create table qa_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  knowledge_limit integer not null,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);
```

**`qa_messages`** — Q&A exchanges:

```sql
create table qa_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references qa_sessions(id) on delete cascade not null,

  role text not null, -- 'user' | 'assistant'
  content text not null,
  citations jsonb, -- [{chapter: 412, paragraph: 8, type: 'primary', label: '...'}, ...]
  retrieved_chunk_ids uuid[], -- references to novel_chunks used

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_qa_messages_session_id on qa_messages(session_id);
```

### 6.2 API Endpoints

| Method | Endpoint                                  | Description                                         |
| ------ | ----------------------------------------- | --------------------------------------------------- |
| `POST` | `/api/ai/qa/sessions`                     | Create new Q&A session                              |
| `GET`  | `/api/ai/qa/sessions?novel_id={id}`       | List Q&A sessions (history) for a novel             |
| `GET`  | `/api/ai/qa/sessions/:id/messages`        | Get Q&A messages for a session                      |
| `POST` | `/api/ai/qa/sessions/:id/ask`             | Ask a question and receive AI answer with citations |
| `GET`  | `/api/ai/qa/context?novel_id={id}&ch={n}` | Get quick context (current arc, entities)           |

#### 6.2.1 POST `/api/ai/qa/sessions/:id/ask` — Ask Question

**Request Body:**

```ts
interface AskQuestionRequest {
  question: string;
  knowledge_limit: number; // chapter cutoff
}
```

**Response (200 OK):**

```ts
interface AskQuestionResponse {
  question: {
    id: string;
    content: string;
    created_at: string;
  };
  answer: {
    id: string;
    content: string; // clean text without inline citations
    citations: Citation[];
    entities: Entity[]; // for context panel
    created_at: string;
  };
}

interface Citation {
  chapter: number;
  paragraph: number;
  type: "primary" | "reference";
  label: string; // e.g., "Battle begins"
  chunk_id: string;
}

interface Entity {
  name: string;
  type: "character" | "item" | "location";
  role: string; // e.g., "Protagonist"
  status: string; // e.g., "Nascent Soul Stage"
  avatar_color: string;
}
```

**Response (streaming alternative):**
The answer can be streamed token-by-token via SSE. Citations are appended as a final event.

---

## 7. State Machine

| State               | Sidebar  | Chat Header | Messages           | Input Bar | Context Panel  |
| ------------------- | -------- | ----------- | ------------------ | --------- | -------------- |
| **Loading**         | Skeleton | Skeleton    | Empty              | Disabled  | Skeleton       |
| **Ready (empty)**   | Visible  | Populated   | Empty              | Enabled   | Arc shown      |
| **Question sent**   | Visible  | Populated   | Question + loading | Disabled  | Updating       |
| **Answer received** | Visible  | Populated   | Q&A pairs          | Enabled   | Entities shown |
| **Error**           | Visible  | Populated   | Error message      | Enabled   | Unchanged      |

---

## 8. User Flows

### 8.1 Ask a Question

1. User navigates to `/ai/story-qa`.
2. User selects a novel and adjusts the knowledge slider.
3. User types a question: "What happened to the Heavenly Void Cauldron?"
4. User clicks Send.
5. Loading animation appears ("Searching knowledge base...").
6. AI answer appears with inline entity highlights and source citation chips.
7. Right panel updates with relevant entities.
8. Question appears in the History sidebar marked as "Just now".

### 8.2 Browse History

1. User sees past questions listed in the sidebar.
2. User clicks on a previous question.
3. Chat scrolls to that Q&A exchange.
4. Context panel updates to reflect that question's entities.

### 8.3 Click a Citation

1. User reads an answer with citation chips.
2. User clicks `"Source: Chapter 412, Paragraph 8"`.
3. App navigates to the Reader page at Chapter 412, scrolled to Paragraph 8, with the passage highlighted.

### 8.4 Change Knowledge Limit

1. User slides the knowledge slider to a higher chapter.
2. Disclaimer updates: "Content is limited to Chapter {N}".
3. User's next question will use the new retrieval boundary.
4. Previous Q&A exchanges remain unchanged.

---

## 9. Responsive Behavior

| Breakpoint | Behavior                                                 |
| ---------- | -------------------------------------------------------- |
| `< lg`     | Only main Q&A area visible. Sidebar behind `menu` toggle |
| `lg – <xl` | Left sidebar visible. Context panel hidden               |
| `≥ xl`     | Full three-panel layout                                  |

---

## 10. Error States

| Condition                     | Display                                                                     |
| ----------------------------- | --------------------------------------------------------------------------- |
| **No novels in library**      | "Add a novel to your library to start asking questions"                     |
| **Novel not indexed**         | "This novel hasn't been processed for Q&A yet. Processing now..."           |
| **No relevant context found** | AI responds: "I don't have enough information from the available chapters." |
| **AI generation failed**      | Error toast with retry button                                               |
| **Rate limit hit**            | Toast: "Please wait a moment before asking another question"                |

---

## 11. Global Header

Standard shared header (see Library SPEC). Active nav link: `"AI Features"` — `text-primary text-sm font-semibold`.
