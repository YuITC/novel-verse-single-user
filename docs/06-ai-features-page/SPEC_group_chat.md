# Group Chat — Functional Specification

> **Route:** `/ai/group-chat`
> **Auth:** Protected — requires authenticated user via Supabase Auth.
> **Purpose:** Create AI-powered group conversations between multiple novel characters — even from different novels. Characters respond autonomously in an "Auto-Chat" mode, interacting with each other within a user-defined scenario. Users can intervene, edit messages, or steer the narrative.

---

## 1. Page-Level Structure

The Group Chat page uses a **three-panel workspace** layout:

| Panel                   | Width    | Purpose                                              |
| ----------------------- | -------- | ---------------------------------------------------- |
| **Left Sidebar**        | `w-80`   | Group management, character roster, scenario context |
| **Main Chat Area**      | `flex-1` | Group header, message stream, input bar              |
| **Right Context Panel** | `w-72`   | Knowledge limits per character, memory log           |

---

## 2. Left Sidebar — Group Management

### 2.1 Panel Header

- **Title:** `"Group Management"` — `font-bold text-lg`.

### 2.2 Character Search / Add

- **Input:** Search field with `search` icon — `"Add Character..."` placeholder.
- **Behavior:** Typing filters available characters across all novels in the user's library. Selecting a character adds them to the Active Members list.

### 2.3 Active Members List

- **Label:** `"ACTIVE MEMBERS (N)"` — `text-xs font-semibold text-slate-500 uppercase tracking-wider`.
- **Each member row:**

| Element          | Specification                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Avatar**       | `w-8 h-8 rounded-full bg-{color}-100`, displaying initials in `text-{color}-600 font-bold text-xs` |
| **Name**         | `text-sm font-medium leading-none`                                                                 |
| **Source novel** | `text-[10px] text-slate-500 mt-1` — shortened novel title                                          |
| **Remove btn**   | `close` icon, `text-slate-400 hover:text-red-500`                                                  |
| **Container**    | `p-2 rounded-lg bg-slate-50 border border-slate-100`                                               |

**Critical rules:**

- Minimum 2 characters required for group chat.
- Maximum 5 characters per group (to keep context window manageable).
- Characters from different novels can be mixed (cross-novel conversations).
- Each character is assigned a unique color for visual differentiation.

#### 2.3.1 Character Color Assignment

Colors are assigned sequentially from a fixed palette:

| Slot | Avatar BG        | Text Color    | Bubble style                                  |
| ---- | ---------------- | ------------- | --------------------------------------------- |
| 1    | `bg-blue-100`    | `blue-600`    | `bg-white` + `border border-slate-200`        |
| 2    | `bg-purple-100`  | `purple-600`  | `bg-slate-900` + `text-slate-200`             |
| 3    | `bg-emerald-100` | `emerald-600` | `bg-emerald-50` + `border border-emerald-100` |
| 4    | `bg-amber-100`   | `amber-600`   | `bg-amber-50` + `border border-amber-100`     |
| 5    | `bg-rose-100`    | `rose-600`    | `bg-rose-50` + `border border-rose-100`       |

### 2.4 Scenario Context

- **Label:** `"SCENARIO CONTEXT"` — uppercase section header.
- **Textarea:** `h-32`, `bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm resize-none`.
- **Placeholder:** `"Define the context of the conversation... e.g., 'A tense standoff at the tavern'"`.
- **Purpose:** The scenario is injected into all characters' system prompts to ground the conversation in a shared context.
- **Update button:** `"Update Scenario"` — `w-full bg-slate-900 text-white font-medium py-2 rounded-lg hover:bg-slate-800 text-sm`.

**Behavior:**

- The scenario serves as the "stage direction" for the AI characters.
- Updating the scenario mid-conversation recalibrates character responses but does NOT reset the chat.

---

## 3. Main Chat Area

### 3.1 Group Header

A fixed header bar at the top of the chat area:

- **Container:** `h-16 bg-white border-b border-slate-200 px-6 shadow-sm z-10`.
- **Left section:**
  - **Stacked avatars:** Up to 5 character circles in a `-space-x-2` stack, each `w-8 h-8 rounded-full border-2 border-white`, with descending z-index.
  - **Group title:** `font-bold text-slate-900 text-sm` — derived from scenario context or user-defined.
  - **Status indicator:** Green dot (`w-1.5 h-1.5 rounded-full bg-green-500`) + text `"AI Auto-Chat Paused"` or `"Auto-Chat Active"` — `text-xs text-slate-500`.
- **Right section:**
  - **Resume/Pause Auto button:** `bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm`.
    - When paused: `play_arrow` icon + `"Resume Auto"`.
    - When active: `pause` icon + `"Pause Auto"`.
  - **More options button:** `more_vert` icon, `p-2 rounded-full`.

### 3.2 Auto-Chat Mode

The core differentiating feature: characters can converse autonomously.

**When Auto-Chat is active:**

1. The system selects the next character to speak (round-robin or contextually chosen).
2. The system generates that character's response using their personality, the scenario, and conversation history.
3. The message appears in the chat with a brief typing delay (1–3 seconds).
4. The cycle repeats until paused by the user.
5. Typical pace: one new message every 3–6 seconds.

**When Auto-Chat is paused:**

- No new AI messages are generated.
- The user can read, edit, delete, or intervene with their own messages.
- The pause button becomes "Resume Auto".

**Auto-pause triggers:**

- User sends a message (intervenes).
- User scrolls up in the chat (reading history).
- User clicks "Pause Auto".

### 3.3 Message Stream

The scrollable chat message area, following the same general structure as Character Chat but with multi-character differentiation:

- **Container:** `flex-1 overflow-y-auto p-6 flex flex-col gap-6`.
- **Max bubble width:** `max-w-3xl`.

#### 3.3.1 Character Messages

Each character has a distinct visual identity (see 2.3.1 Color Assignment). Messages follow a pattern:

**Left-aligned character (slots 1, 3, and odd numbers):**

```
[Avatar Initials] [Name]
                  [Message bubble — character-specific style]
                  [Edit/Delete buttons — on hover]
```

**Right-aligned character (slots 2, 4, and even numbers):**

```
                              [Name] [Avatar Initials]
         [Message bubble — character-specific style]
                              [Edit/Delete buttons — on hover]
```

| Element          | Specification                                                                    |
| ---------------- | -------------------------------------------------------------------------------- |
| **Avatar**       | `w-10 h-10 rounded-full bg-{color}-100 border-2 border-white` with bold initials |
| **Name**         | `text-xs font-medium text-slate-500`                                             |
| **Bubble shape** | Left: `rounded-2xl rounded-tl-sm`. Right: `rounded-2xl rounded-tr-sm`            |
| **Bubble style** | Per character color slot (see table in 2.3.1)                                    |
| **Text**         | `text-sm leading-relaxed` — color varies by bubble style                         |
| **Shadow**       | `shadow-sm`                                                                      |

#### 3.3.2 Edit/Delete Actions

On hover over any AI-generated message, action buttons appear:

- **Container:** `flex gap-2 mt-1 ml-1 opacity-0 hover:opacity-100 transition-opacity`.
- **Edit button:** `edit` icon + `"Edit"` — `text-xs text-slate-400 hover:text-primary`.
- **Delete button:** `delete` icon + `"Delete"` — `text-xs text-slate-400 hover:text-red-500`.

**Edit behavior:**

- Clicking "Edit" replaces the bubble content with an editable textarea.
- User can modify the character's dialogue.
- On save, the message updates and subsequent AI responses are regenerated.

**Delete behavior:**

- Removes the message from the chat.
- Subsequent context is adjusted (the deleted message is excluded from history).

### 3.4 Chat Input Bar

Fixed at the bottom of the main area:

- **Container:** `bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10`.
- **Inner layout:** `max-w-4xl mx-auto flex items-end gap-3`.

| Element            | Specification                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Regenerate btn** | `p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl` — `refresh` icon                   |
| **Textarea**       | `flex-1, bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm h-14 resize-none`        |
| **Placeholder**    | `"Intervene as the Author or ask a question to the group..."`                                            |
| **Send button**    | Inside textarea container, `absolute right-2 bottom-2`, `p-2 bg-primary text-white rounded-lg shadow-sm` |

**Disclaimer text:** `"AI Characters generate responses autonomously when 'Auto-Chat' is active. Intervening pauses the auto-chat."` — `text-[10px] text-slate-400`.

**Submit behavior:**

- Sending a message **automatically pauses** Auto-Chat.
- The user's message appears in the chat as an "Author intervention".
- All characters can see and respond to the user's message.
- Auto-Chat can be manually resumed after the intervention.

---

## 4. Right Context Panel

### 4.1 Panel Header

- `"Group Context"` — `font-bold text-sm text-slate-800`.
- Collapse button: `menu_open` icon — `text-slate-400 hover:text-slate-700`.

### 4.2 Knowledge Limits

Shows the chapter knowledge cutoff for each character in the group.

- **Label:** `"KNOWLEDGE LIMITS"` — uppercase header with `book` icon.
- **Per character:**
  - Character name: `text-xs font-medium text-slate-700`.
  - Chapter number: `text-primary font-medium text-xs`.
  - Progress bar: `h-1 bg-slate-200 rounded-full` with `bg-primary` fill proportional to `(character_knowledge_limit / novel.total_chapters)`.

**Behavior:**

- Knowledge limits are set when adding characters to the group.
- Each character can have a different knowledge limit (from their own novel's perspective).
- Can be adjusted via clicking the character entry to reveal a slider.

### 4.3 Memory Log

An AI-generated running summary of key events in the conversation:

- **Label:** `"MEMORY LOG"` — uppercase header with `memory` icon.
- **Layout:** Vertical timeline with a left border line.
- **Container:** `relative pl-3 border-l-2 border-slate-100`.

**Each memory entry:**

| Element    | Specification                                                      |
| ---------- | ------------------------------------------------------------------ |
| **Dot**    | `absolute -left-[17px] w-2.5 h-2.5 rounded-full ring-4 ring-white` |
| **Color**  | Primary (`bg-primary`) for latest, `bg-slate-300` for older        |
| **Title**  | `text-xs font-medium text-slate-700`                               |
| **Detail** | `text-[10px] text-slate-500`                                       |

**Data source:** The AI periodically summarizes the conversation into key turning points. This runs server-side as a background LLM call after every 5–8 messages.

---

## 5. AI Group Chat Engine — Backend Logic

### 5.1 Multi-Character System Prompts

Each character in the group receives their own system prompt:

```
System Prompt for {character_name}:
  You are {character_name} from "{novel_title}".

  PERSONALITY: {traits[]}
  KNOWLEDGE LIMIT: Events up to Chapter {knowledge_limit} of your novel.

  SCENARIO: {scenario_context}

  OTHER PARTICIPANTS:
  - {other_char_1} from "{novel_1}" (brief description)
  - {other_char_2} from "{novel_2}" (brief description)

  INSTRUCTIONS:
  - Stay in character. Respond to what others say based on your personality.
  - You may agree, disagree, challenge, or ally with other characters.
  - Use action text in *asterisks* for physical actions.
  - Keep responses to 2-4 sentences to maintain conversational pacing.
  - Reference events from your novel only within your knowledge limit.
```

### 5.2 Turn Selection Algorithm

When Auto-Chat is active, the system selects which character speaks next:

1. **Recency bias avoidance:** Don't select a character who just spoke.
2. **Contextual relevance:** Use a lightweight LLM call to determine which character is most likely to respond, given the last message.
3. **Round-robin fallback:** If no clear contextual winner, cycle through characters.
4. **User intervention priority:** If the user sent the last message, the most relevant character responds first.

### 5.3 Memory Summarization

After every 5–8 messages, a background LLM call generates a memory log entry:

```
Given this conversation segment, summarize the key event or turning point in 1-2 sentences.
Title it with a short label (3-5 words).

Conversation:
{recent_messages}
```

### 5.4 Auto-Chat Throttling

| Parameter       | Value                                            |
| --------------- | ------------------------------------------------ |
| **Delay**       | 3–6 second pause between auto-generated messages |
| **Max session** | 50 auto-messages before auto-pause               |
| **Max total**   | 200 messages per session                         |
| **Rate limit**  | Standard API rate limits apply                   |

---

## 6. Data Layer

### 6.1 Database Tables

#### 6.1.1 New Tables Required

**`group_chat_sessions`** — Group conversation sessions:

```sql
create table group_chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  title text, -- user-defined or auto-generated
  scenario_context text, -- the shared scenario
  auto_chat_active boolean default false,

  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create index idx_group_chat_sessions_user_id on group_chat_sessions(user_id);
```

**`group_chat_members`** — Characters in a group session:

```sql
create table group_chat_members (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,
  character_id uuid references characters(id) on delete cascade not null,
  novel_id uuid references novels(id) on delete cascade not null,

  knowledge_limit integer not null, -- chapter cutoff for this character
  color_slot integer not null, -- 1-5, determines visual style
  display_order integer not null,

  unique(session_id, character_id)
);
```

**`group_chat_messages`** — Messages in group chat:

```sql
create table group_chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,

  sender_type text not null, -- 'character' | 'user'
  character_id uuid references characters(id), -- null if sender_type = 'user'
  content text not null,
  is_auto_generated boolean default false,
  is_edited boolean default false,

  created_at timestamptz default timezone('utc', now()) not null
);

create index idx_group_chat_messages_session_id on group_chat_messages(session_id);
```

**`group_chat_memory`** — AI-summarized memory entries:

```sql
create table group_chat_memory (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references group_chat_sessions(id) on delete cascade not null,

  title text not null, -- e.g., "Artifact Discovered"
  summary text not null, -- e.g., "Group converged on a glowing cube..."
  message_range_start uuid references group_chat_messages(id),
  message_range_end uuid references group_chat_messages(id),

  created_at timestamptz default timezone('utc', now()) not null
);
```

### 6.2 API Endpoints

| Method   | Endpoint                                          | Description                               |
| -------- | ------------------------------------------------- | ----------------------------------------- |
| `POST`   | `/api/ai/group-chat/sessions`                     | Create new group session                  |
| `GET`    | `/api/ai/group-chat/sessions/:id`                 | Get session details                       |
| `PATCH`  | `/api/ai/group-chat/sessions/:id`                 | Update scenario context                   |
| `POST`   | `/api/ai/group-chat/sessions/:id/members`         | Add character to group                    |
| `DELETE` | `/api/ai/group-chat/sessions/:id/members/:charId` | Remove character from group               |
| `GET`    | `/api/ai/group-chat/sessions/:id/messages`        | Get message history                       |
| `POST`   | `/api/ai/group-chat/sessions/:id/messages`        | Send user message (auto-pauses auto-chat) |
| `POST`   | `/api/ai/group-chat/sessions/:id/auto-chat`       | Start/pause auto-chat                     |
| `POST`   | `/api/ai/group-chat/sessions/:id/generate`        | Generate next auto-chat message           |
| `PATCH`  | `/api/ai/group-chat/messages/:id`                 | Edit a message                            |
| `DELETE` | `/api/ai/group-chat/messages/:id`                 | Delete a message                          |
| `GET`    | `/api/ai/group-chat/sessions/:id/memory`          | Get memory log entries                    |

#### 6.2.1 POST `/api/ai/group-chat/sessions/:id/auto-chat` — Toggle Auto-Chat

**Request Body:**

```ts
interface ToggleAutoChatRequest {
  active: boolean;
}
```

**Response (200 OK):**

```ts
interface ToggleAutoChatResponse {
  auto_chat_active: boolean;
  status: "started" | "paused";
}
```

When `active: true`, the server starts a polling loop that:

1. Selects the next character to speak.
2. Generates their response.
3. Pushes the message to the client via SSE or WebSocket.
4. Waits 3–6 seconds.
5. Repeats until paused or max limit reached.

---

## 7. State Machine

| State                 | Sidebar       | Chat Header    | Messages    | Input Bar | Context Panel   |
| --------------------- | ------------- | -------------- | ----------- | --------- | --------------- |
| **Setup (< 2 chars)** | Add members   | Placeholder    | Empty       | Disabled  | Empty           |
| **Ready (≥ 2 chars)** | Members shown | Populated      | Empty       | Enabled   | Knowledge shown |
| **Auto-Chat Active**  | Members shown | "Active" badge | Streaming   | Enabled\* | Updating        |
| **Auto-Chat Paused**  | Members shown | "Paused" badge | Static      | Enabled   | Static          |
| **User Intervening**  | Members shown | "Paused" badge | User typing | Enabled   | Static          |
| **Error**             | Members shown | Error badge    | Error toast | Enabled   | Static          |

\*Input is enabled during auto-chat; sending a message pauses it.

---

## 8. User Flows

### 8.1 Create a Group Chat

1. User navigates to `/ai/group-chat`.
2. User searches and adds 2+ characters from the search field.
3. User writes a scenario context.
4. User clicks "Update Scenario".
5. Chat becomes ready.

### 8.2 Start Auto-Chat

1. User clicks "Resume Auto" button in the header.
2. The first character responds to the scenario.
3. Other characters take turns responding autonomously.
4. Memory log updates as key events occur.
5. User watches the conversation unfold.

### 8.3 Intervene in Conversation

1. User types a message during auto-chat (or after pausing).
2. Auto-chat pauses automatically.
3. The user's message appears as "Author intervention".
4. Characters respond to the user's input.
5. User can resume auto-chat after intervention.

### 8.4 Edit a Character's Message

1. User hovers over a character message → Edit/Delete buttons appear.
2. User clicks "Edit".
3. Bubble becomes an editable textarea.
4. User modifies the dialogue and saves.
5. The message updates. If auto-chat continues, subsequent responses account for the edit.

### 8.5 Remove a Character

1. User clicks the `×` button on a member in the sidebar.
2. Character is removed from the group.
3. Their future messages are no longer generated.
4. Existing messages remain in history.

---

## 9. Responsive Behavior

| Breakpoint | Behavior                                                        |
| ---------- | --------------------------------------------------------------- |
| `< md`     | Only main chat visible. Sidebar and context panel behind toggle |
| `md – <lg` | Left sidebar visible. Context panel behind toggle               |
| `≥ lg`     | Full three-panel layout                                         |

---

## 10. Error States

| Condition                       | Display                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| **Fewer than 2 characters**     | "Add at least 2 characters to start the group chat"                |
| **Character not found**         | Search returns "No characters found" with suggestion to add novels |
| **Auto-chat generation failed** | Toast error. Auto-chat pauses automatically. Retry available       |
| **Max messages reached**        | "Session limit reached. Start a new group chat."                   |
| **Network interruption**        | Auto-chat pauses. Toast notification. Resume available             |

---

## 11. Global Header

Standard shared header (see Library SPEC). Active nav link: `"AI Features"` — `text-slate-900 text-sm font-semibold`.
