# NovelVerse - Project Master Specification

## 1. Project Overview

**NovelVerse** is a personal, single-user novel reading and management system deeply integrated with AI.

### 1.1 Core Philosophy

- **Single-User Focus:** Designed exclusively for one user. There are no community features, social sharing, or multi-tenant architectures. The user retains complete control over their data and infrastructure.
- **Aesthetic:** A clean, calm, and "bookish" interface for reading (using Linen, Amethyst, and Snow colors), contrasted with bright, tool-forward, and colorful interfaces for the AI feature suite.
- **Self-Hosted:** The user is responsible for cloning the repository, setting up their Supabase instance, configuring OpenRouter API keys, and deploying the frontend to Vercel.

## 2. System Architecture & Tech Stack

### 2.1 Frontend

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Material Symbols

### 2.2 Backend & Infrastructure

- **Database:** Supabase (PostgreSQL) with `pgvector` for AI embeddings
- **Authentication:** Supabase Auth (configured for a single explicit user)
- **Storage:** Supabase Storage (for novel covers and visual assets)
- **Security:** Row-Level Security (RLS) enabled on all tables
- **Deployment:** Vercel

### 2.3 AI Integration

- **Platform:** OpenRouter API
- **LLM Models:**
  - `qwen/qwen3-next-80b-a3b-instruct`
  - `z-ai/glm-4.5-air`
  - `meta-llama/llama-3.3-70b-instruct`
- **Embedding Model:** `baai/bge-m3`

## 3. Data Architecture (High-Level)

The system relies on a relational database structure extended with vector support for RAG (Retrieval-Augmented Generation) and AI features.

- **Core Content:** `novels`, `chapters`, `reading_preferences`
- **Ingestion/Crawling:** `crawl_jobs`
- **RAG & Knowledge:** `novel_chunks`, `concept_entries`, `concept_evidence`
- **Entities & Relationships:** `characters`, `character_states`, `character_relationships`, `timeline_events`
- **Conversations:** `chat_sessions`, `chat_messages`, `group_chat_sessions`, `group_chat_members`, `group_chat_messages`, `group_chat_memory`, `qa_sessions`, `qa_messages`

## 4. Core Features & Pages

### 4.1 Library (`/library`)

The user's personal hub for managing their collection.

- **Design:** Clean, airy, paper-on-linen aesthetic.
- **Features:**
  - Tabbed interface for Novels, Collections, and Bookmarks.
  - Grid layout for novel cards and collection folders.
  - Global search and filtering capabilities.

### 4.2 Reader (`/reader`)

A dedicated, immersive environment for consuming content.

- **Design:** Editorial-grade details page and a distraction-free reading mode.
- **Features:**
  - _Novel Details:_ Displays synopsis, metadata, and a navigable chapter list.
  - _Reader Mode:_ Customizable typography, margins, and themes (Light, Sepia, Dark). Tracks reading progress and saves user preferences.

### 4.3 Explore (`/explore`)

A catalog-style page for discovering new content (from external sources or local database search).

- **Design:** Organized, bookshop-catalog feel.
- **Features:** Advanced filter panel (genres, status, sorting) and a paginated grid of results.

### 4.4 Uploader (`/uploader`)

A workspace for creators to write, edit, and publish their own novels.

- **Design:** Minimalist, calm, focus-oriented UI.
- **Features:**
  - Story metadata management (cover upload, title, synopsis, tags).
  - Rich text chapter editor with word count analytics and draft/publish states.

### 4.5 Crawler (`/crawler`)

A technical utility dashboard for scraping novel content from external websites.

- **Design:** Utilitarian, dashboard-like, balancing light UI with a technical terminal output.
- **Features:** URL input, crawl status tracking (progress bar), real-time terminal log mapping to backend processes, and anti-bot handling strategies.

## 5. AI Features (`/ai/*`)

The AI suite acts as a set of analytical and interactive tools to deepen engagement with the novel's lore. These pages share a standard **Three-Panel Layout** (Sidebar for configs, Main Area for interaction, Right Panel for context/details) and utilize vibrant accent colors to distinguish them from the core reading experience.

### 5.1 Character Chat (`/ai/character-chat`)

- **Purpose:** 1-on-1 conversations with AI representations of characters.
- **Key Feature:** _Chapter Knowledge Slider_ limits the AI's context to avoid spoilers based on the user's reading progress.
- **Accent Color:** Royal Amethyst (Purple).

### 5.2 Group Chat (`/ai/group-chat`)

- **Purpose:** Dynamic, multi-character interactions within specific scenarios.
- **Key Feature:** _Auto-Chat Mode_ allows the AI characters to autonomously converse with each other based on a predefined context and intelligent turn-taking logic.
- **Accent Color:** Verdant Emerald (Green).

### 5.3 Story Q&A (`/ai/story-qa`)

- **Purpose:** RAG-powered query system for the novel's text.
- **Key Feature:** Provides specific, grounded answers with _Source Citations_ linking back to exact passages in the text.
- **Accent Color:** Deep Indigo (Blue).

### 5.4 Relationship Graph (`/ai/relationship-graph`)

- **Purpose:** Interactive visualization of how characters connect to one another.
- **Key Feature:** _Timeline Range Slider_ dynamically updates the graph to show how relationships evolve over specific story arcs.
- **Accent Color:** Ocean Blue (Cyan/Blue).

### 5.5 Event Timeline (`/ai/event-timeline`)

- **Purpose:** Chronological mapping of major story events.
- **Key Feature:** Categorized event nodes plotted along a horizontal timeline, linked to overarching _Story Arcs_, with a minimap for easy navigation.
- **Accent Color:** Warm Amber (Orange/Yellow).

### 5.6 Concept Index (`/ai/concept-index`)

- **Purpose:** A structured, wiki-like encyclopedia of terms, locations, and magical systems.
- **Key Feature:** Master-detail view displaying AI-extracted lore alongside the _Source Evidence_ used to generate the definition.
- **Accent Color:** Coral Rose (Red/Pink).

---

_This document serves as the master specification for NovelVerse. For detailed component breakdowns, API definitions, and UI states, refer to the individual `SPEC.md` and `DESIGN.md` files within the `docs/` directories._
