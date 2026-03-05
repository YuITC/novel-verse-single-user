# Character Chat — Functional Specification

> **Route:** `/ai/character-chat`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Allow users to converse with AI-powered representations of novel characters. Characters respond in-character, grounded exclusively in novel content up to a user-configurable chapter limit, preventing spoilers.

---

## 1. Page-Level Structure

The Character Chat page uses a **three-panel workspace** layout:

| Panel                         | Width    | Purpose                                                      |
| ----------------------------- | -------- | ------------------------------------------------------------ |
| **Left Sidebar**              | `w-80`   | Novel selection, character selection, knowledge range, reset |
| **Main Chat Area**            | `flex-1` | Chat header, message stream, input bar                       |
| **Right Context Panel** (≥lg) | `w-80`   | Character lore, current world state, key relationships       |

### 1.1 Panel Visibility

| Breakpoint | Left Sidebar    | Main Area  | Right Panel                            |
| ---------- | --------------- | ---------- | -------------------------------------- |
| `< lg`     | Hidden / toggle | Full-width | Hidden / toggle via `info` icon button |
| `≥ lg`     | Visible         | Flex-1     | Visible                                |

---

## 2. Left Sidebar — Configuration

### 2.1 Select Novel

- **Label:** `"Select Novel"` with `book` icon (primary color).
- **Input:** `<select>` dropdown, full-width.
- **Data source:** All novels in the user's library (`user_novels` where `user_id = currentUser`), joined to `novels` for display.
- **Display:** `novels.title_translated ?? novels.title_raw`.
- **Default:** The first novel in the library, or the novel the user navigated from.
- **Behavior:** Changing the novel reloads the character list and resets the chat.

### 2.2 Select Character

- **Label:** `"Select Character"` with `person` icon (primary color).
- **Input:** `<select>` dropdown, full-width.
- **Data source:** AI-extracted characters for the selected novel (`characters` table, filtered by `novel_id`, ordered by `importance_rank` or `first_appearance_chapter`).
- **Display:** Character name.

#### 2.2.1 Character Portrait Card

Below the dropdown, a tall portrait card previews the selected character:

- **Container:** Full-width, `aspect-[3/4]`, `rounded-2xl`, `bg-slate-100`, `border border-slate-200`, `overflow-hidden`, `shadow-sm`.
- **Image:** `object-cover`, full fill. Source: `characters.avatar_url` (AI-generated or placeholder).
- **Overlay gradient:** `absolute bottom-0 inset-x-0`, `bg-gradient-to-t from-black/80 via-black/40 to-transparent`, `p-4`.
  - **Name:** `text-white font-semibold`.
  - **Title/Role:** `text-slate-300 text-xs`.

### 2.3 Chapter Knowledge Slider

Controls the **spoiler boundary** — the character will only know plot events up to (and including) the specified chapter.

- **Label:** `"Chapter Knowledge"` with `tune` icon (primary color).
- **Explanation text:** `"Set the chapter limit to avoid spoilers. The character will only know events up to this point."` — `text-xs text-slate-500`.
- **Container:** `bg-slate-50 p-4 rounded-xl border border-slate-100`.

| Element           | Specification                                                                       |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Current label** | `"Current:"` label + chapter number in primary color (e.g., `"Chapter 89"`)         |
| **Range input**   | `<input type="range">`, `min="1"`, `max="{novel.total_chapters}"`, `accent-primary` |
| **Range labels**  | `"Ch. 1"` (left) and `"Ch. {max}"` (right), `text-[10px] text-slate-400`            |

**Behavior:**

- Changing the slider value updates the knowledge cutoff.
- The chat session resets after confirming the change (to prevent inconsistent character knowledge).
- A "Knowledge synced to Chapter N" pill appears at the top of the chat area.

### 2.4 Reset Chat Button

- **Label:** `"Reset Chat"` with `refresh` icon.
- **Style:** Full-width, dark button (`bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl shadow-sm`).
- **Behavior:** Clears the conversation history for the current character/chapter combination. The character sends a new greeting message.

---

## 3. Main Chat Area

### 3.1 Chat Header (Sticky)

A sticky header bar at the top of the main area:

- **Container:** `bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm`.
- **Left section:**
  - **Character avatar:** `w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm`.
  - **Character name:** `text-lg font-bold text-slate-900`.
  - **Novel title:** `text-xs text-slate-500 font-medium`.
  - **Vertical divider:** `h-8 w-px bg-slate-200 mx-2`.
  - **Personality trait tags:** Array of pill badges — `px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] rounded-full font-medium`.
    - Source: `characters.personality_traits` (array, max 3–4 displayed).
- **Right section (< lg only):** An `info` icon button to toggle the right context panel on mobile.

### 3.2 Message Stream

The scrollable chat message area:

- **Container:** `flex-1 overflow-y-auto p-6 flex flex-col gap-6`.
- **Max bubble width:** `max-w-3xl`.

#### 3.2.1 Knowledge Sync Pill

At the start of the conversation, a centered pill shows:

- `"Knowledge synced to Chapter {N}"` — `px-3 py-1 bg-slate-200/50 text-slate-500 text-xs rounded-full`.

#### 3.2.2 Character Message (AI — Left-Aligned)

```
[Avatar] [Name]
         [Message bubble]
         [Feedback buttons]
```

| Element          | Specification                                                                          |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Avatar**       | `w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0 mt-1`         |
| **Name**         | `text-xs font-semibold text-slate-700 ml-1`                                            |
| **Bubble**       | `bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm`     |
| **Text**         | `text-sm text-slate-700 leading-relaxed`                                               |
| **Feedback row** | Three icon buttons below the bubble: 👍 `thumb_up`, 👎 `thumb_down`, 📋 `content_copy` |

**Feedback buttons behavior:**

- `thumb_up` → hover: `text-primary`. Click logs positive rating.
- `thumb_down` → hover: `text-rose-500`. Click logs negative rating.
- `content_copy` → hover: `text-slate-700`. Click copies message text to clipboard.
- Default color: `text-slate-400`.

#### 3.2.3 User Message (Right-Aligned)

```
                   [Name] [Avatar]
         [Message bubble]
```

| Element    | Specification                                                                            |
| ---------- | ---------------------------------------------------------------------------------------- |
| **Avatar** | `w-8 h-8 rounded-full bg-slate-200 border border-slate-300` with `person` icon centered  |
| **Name**   | `"You"` — `text-xs font-semibold text-slate-700 mr-1`, right-aligned                     |
| **Bubble** | `bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-none px-5 py-3 shadow-sm` |
| **Text**   | `text-sm text-slate-800 leading-relaxed`                                                 |

### 3.3 Chat Input Bar

Fixed at the bottom of the main area:

- **Outer container:** `p-4 bg-white border-t border-slate-200`.
- **Inner container:** `max-w-4xl mx-auto`, flex row, `bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-sm`.
- **Focus state:** `border-primary ring-1 ring-primary`.

| Element            | Specification                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Textarea**       | `bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-700 scrollbar-hide`, `min-h-[44px] max-h-32`, auto-expanding rows |
| **Placeholder**    | `"Message {character_name}..."` — e.g., `"Message Lin Fan..."`                                                                            |
| **Regenerate btn** | `p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl` — `autorenew` icon                                                |
| **Send btn**       | `p-2 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm` — `send` icon                                                        |

**Disclaimer text:** Centered below input — `"AI-generated character responses. May not be strictly canon."` — `text-[10px] text-slate-400`.

**Submit behavior:**

- Enter key sends message (Shift+Enter for newline).
- Send button is disabled when textarea is empty.
- After sending, the textarea clears and a loading indicator appears while the AI generates a response.

---

## 4. Right Context Panel — Character Lore & Context

### 4.1 Panel Header

- `"Character Lore & Context"` — `text-base font-bold text-slate-900`, with `local_library` icon (primary color).

### 4.2 Biography Section

- **Label:** `"BIOGRAPHY"` — uppercase section header style.
- **Content:** Character biography text from `characters.biography`.
- **Container:** `bg-slate-50 p-3 rounded-xl border border-slate-100`.
- **Text:** `text-sm text-slate-600 leading-relaxed`.

### 4.3 Current World State

Shows the character's situation at the selected chapter.

- **Label:** `"CURRENT WORLD STATE"` with a chapter badge: `bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px]`, showing `"Ch. {N}"`.
- **Items:** A vertical list of info cards, each showing:

| Item            | Icon                        | Icon Color |
| --------------- | --------------------------- | ---------- |
| **Location**    | `location_city`             | Amber-500  |
| **Power Level** | `swords` (contextual label) | Rose-500   |
| **Key Items**   | `inventory_2`               | Indigo-500 |

Each item card:

- **Container:** `bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex gap-3 items-start`.
- **Icon:** `text-lg flex-shrink-0 mt-0.5`.
- **Label:** `font-semibold text-xs`.
- **Value:** `text-sm text-slate-700`.

**Data source:** `character_states` table (keyed by `character_id` + `chapter_number`), containing location, attributes, and key items at each chapter checkpoint. These are AI-generated during novel ingestion.

### 4.4 Key Relationships

Shows the character's relationships (filtered to the selected chapter).

- **Label:** `"KEY RELATIONSHIPS"` — uppercase section header style.
- **Each entry:**
  - **Avatar circle:** `w-8 h-8 rounded-full bg-{color}-100`, displaying initials in `text-{color}-600 font-bold text-xs`.
  - **Name:** `text-sm font-semibold text-slate-800`.
  - **Role:** `text-[10px] text-slate-500` — e.g., "Antagonist / Suspect", "Junior Sister".
  - **Relationship badge:** `px-2 py-0.5 bg-{type-color}-50 text-{type-color}-600 text-[10px] rounded border border-{type-color}-100 font-medium`.

| Relationship Type | Badge Color | Examples       |
| ----------------- | ----------- | -------------- |
| Hostile           | Red         | Enemy, Rival   |
| Ally              | Emerald     | Friend, Mentor |
| Romantic          | Pink        | Love interest  |
| Neutral           | Slate       | Acquaintance   |

**Data source:** `character_relationships` table (or the Relationship Graph data), filtered by `chapter_number <= knowledge_limit`.

---

## 5. AI Chat Engine — Backend Logic

### 5.1 System Prompt Construction

When a user starts a chat or sends a message, the system constructs a prompt:

```
System Prompt:
  You are {character_name} from the novel "{novel_title}".

  PERSONALITY TRAITS: {traits[]}
  BIOGRAPHY: {biography}

  CURRENT STATE (as of Chapter {chapter_limit}):
  - Location: {location}
  - Power Level: {power_level}
  - Key Items: {items}

  KNOWLEDGE BOUNDARY: You only know events up to Chapter {chapter_limit}.
  You MUST NOT reference or hint at events after this chapter.
  If asked about future events, respond as if you genuinely don't know.

  SPEECH STYLE: {speech_patterns}
  - Use action text in *italics* for physical actions and expressions.
  - Stay in character at all times.
  - Respond conversationally, not as an AI.
```

### 5.2 RAG Context Injection

For each user message, the system retrieves relevant novel context:

1. **Embed** the user's message using the same embedding model as the novel content.
2. **Search** the vector store for relevant chunks from the novel, filtered by `chapter_number <= knowledge_limit`.
3. **Inject** the top-K retrieved passages (K=3–5) into the prompt as additional context.
4. **Generate** the character's response using the LLM with the full context chain.

### 5.3 Conversation Memory

- The conversation history is maintained in-memory per session.
- The last N messages (N=10–20) are included in the prompt to maintain conversational coherence.
- Older messages are summarized by the LLM to stay within context window limits.

### 5.4 Response Generation

| Parameter       | Value                                      |
| --------------- | ------------------------------------------ |
| **Model**       | Configurable (e.g., GPT-4o, Claude Sonnet) |
| **Temperature** | 0.7–0.9 (creative but grounded)            |
| **Max tokens**  | 500–800 per response                       |
| **Stop tokens** | None (let model finish naturally)          |

### 5.5 Feedback Loop

User feedback (👍/👎) is logged to improve future responses:

```ts
interface ChatFeedback {
  message_id: string;
  session_id: string;
  character_id: string;
  novel_id: string;
  rating: "positive" | "negative";
  created_at: string;
}
```

---

## 6. Data Layer

### 6.1 Database Tables

#### 6.1.1 New Tables Required

**`characters`** — AI-extracted character profiles:

```sql
create table characters (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,

  name text not null,
  name_translated text,
  role text, -- 'protagonist', 'antagonist', 'supporting', 'minor'
  biography text,
  personality_traits text[], -- e.g., ['Arrogant', 'Strategic', 'Protective']
  speech_patterns text, -- LLM-derived stylistic notes
  avatar_url text,
  first_appearance_chapter integer,
  importance_rank integer, -- 1 = most important

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_characters_novel_id on characters(novel_id);
```

**`character_states`** — Snapshot of a character's state at checkpoints:

```sql
create table character_states (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references characters(id) on delete cascade not null,
  chapter_number integer not null,

  location text,
  power_level text, -- e.g., "Foundation Establishment, 4th Stage"
  key_items text[], -- e.g., ['Broken Heavenly Void Cauldron']
  faction text, -- e.g., "Azure Dragon Sect"
  status text, -- e.g., "Active", "Sealed", "Deceased"

  created_at timestamptz default timezone('utc', now()) not null,

  unique(character_id, chapter_number)
);
```

**`chat_sessions`** — Conversation sessions:

```sql
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  character_id uuid references characters(id) on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,
  knowledge_limit integer not null, -- chapter cutoff

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_chat_sessions_user_id on chat_sessions(user_id);
```

**`chat_messages`** — Individual messages:

```sql
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,

  role text not null, -- 'user' | 'assistant'
  content text not null,
  rating text, -- 'positive' | 'negative' | null

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_chat_messages_session_id on chat_messages(session_id);
```

### 6.2 API Endpoints

| Method   | Endpoint                              | Description                               |
| -------- | ------------------------------------- | ----------------------------------------- |
| `GET`    | `/api/ai/characters?novel_id={id}`    | List characters for a novel               |
| `GET`    | `/api/ai/characters/:id/state?ch={n}` | Get character state at a specific chapter |
| `POST`   | `/api/ai/chat/sessions`               | Create a new chat session                 |
| `GET`    | `/api/ai/chat/sessions/:id/messages`  | Get messages for a session                |
| `POST`   | `/api/ai/chat/sessions/:id/messages`  | Send a message and receive AI response    |
| `POST`   | `/api/ai/chat/messages/:id/feedback`  | Submit feedback (👍/👎) for a message     |
| `DELETE` | `/api/ai/chat/sessions/:id`           | Reset/delete a chat session               |

#### 6.2.1 POST `/api/ai/chat/sessions/:id/messages` — Send Message

**Request Body:**

```ts
interface SendMessageRequest {
  content: string;
}
```

**Response (200 OK):**

```ts
interface SendMessageResponse {
  user_message: {
    id: string;
    role: "user";
    content: string;
    created_at: string;
  };
  assistant_message: {
    id: string;
    role: "assistant";
    content: string;
    created_at: string;
  };
}
```

**Response (streaming alternative):**
The response can be streamed using Server-Sent Events for a typewriter effect, delivering tokens incrementally.

---

## 7. State Machine

### 7.1 Page States

| State                 | Sidebar  | Chat Header | Messages                    | Input Bar | Context Panel |
| --------------------- | -------- | ----------- | --------------------------- | --------- | ------------- |
| **Loading**           | Skeleton | Skeleton    | Skeleton                    | Disabled  | Skeleton      |
| **No novel selected** | Visible  | Placeholder | Empty                       | Disabled  | Empty         |
| **Ready (no msgs)**   | Visible  | Populated   | Empty + greeting            | Enabled   | Populated     |
| **Chatting**          | Visible  | Populated   | Messages                    | Enabled   | Populated     |
| **AI generating**     | Visible  | Populated   | Messages + typing indicator | Disabled  | Populated     |
| **Error**             | Visible  | Populated   | Error toast                 | Enabled   | Populated     |

### 7.2 AI Typing Indicator

While the AI is generating a response:

- A character message bubble appears with three bouncing dots animation.
- The send button and regenerate button are disabled.
- Duration: typically 2–8 seconds depending on model and context length.

---

## 8. User Flows

### 8.1 Start a New Conversation

1. User navigates to `/ai/character-chat` (or clicks from hub).
2. Left sidebar loads the user's novels in the dropdown.
3. User selects a novel → character dropdown populates.
4. User selects a character → portrait card, trait tags, and context panel populate.
5. User adjusts the knowledge slider (optional).
6. Chat area shows "Knowledge synced to Chapter N" pill.
7. Character sends an initial greeting message in-character.
8. User types and sends a message.
9. AI typing indicator appears → character responds in-character.

### 8.2 Change Character Mid-Session

1. User selects a different character from the dropdown.
2. System prompts: "Switching character will reset the chat. Continue?"
3. On confirm: chat clears, new character greeting appears.

### 8.3 Adjust Knowledge Limit

1. User drags the chapter slider to a new value.
2. System prompts: "Changing knowledge limit will reset the chat. Continue?"
3. On confirm: chat clears, knowledge sync pill updates.

### 8.4 Regenerate Last Response

1. User clicks the `autorenew` (regenerate) button.
2. The last AI message is removed.
3. A new response is generated with a slightly varied temperature.
4. The new message replaces the old one.

### 8.5 Reset Chat

1. User clicks "Reset Chat" button in sidebar.
2. All messages are cleared.
3. Character sends a fresh greeting.
4. Session record may be soft-deleted or a new session created.

---

## 9. Responsive Behavior

| Breakpoint | Behavior                                                                |
| ---------- | ----------------------------------------------------------------------- |
| `< md`     | Only main chat visible. Sidebar and context panel behind toggle buttons |
| `md – <lg` | Left sidebar visible. Context panel behind toggle                       |
| `≥ lg`     | Full three-panel layout                                                 |

---

## 10. Error States

| Condition                   | Display                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| **No novels in library**    | Sidebar shows message: "Add a novel to your library first" with link          |
| **No characters extracted** | Character dropdown disabled. Message: "Characters haven't been extracted yet" |
| **AI generation failed**    | Error message in chat area. Retry button available                            |
| **Network error**           | Toast notification. Message stays in input for retry                          |
| **Rate limit hit**          | Toast: "Please wait a moment before sending another message"                  |

---

## 11. Global Header

Standard shared header (see Library SPEC). Active nav link: `"AI Features"` — `text-primary text-sm font-semibold`.
