"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { aiApi } from "../../api/aiApi";
import type {
  NovelOption,
  QASession,
  QAMessage,
  Citation,
  QAContextEntity,
  QuickContext,
} from "../../types";
import { NovelSelector } from "../shared/NovelSelector";
import { KnowledgeSlider } from "../shared/KnowledgeSlider";

// ============================================================================
// Helpers
// ============================================================================

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ============================================================================
// StoryQAPage
// ============================================================================

export function StoryQAPage() {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [selectedNovel, setSelectedNovel] = useState<NovelOption | null>(null);
  const [knowledgeLimit, setKnowledgeLimit] = useState(1);
  const [session, setSession] = useState<QASession | null>(null);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [quickContext, setQuickContext] = useState<QuickContext | null>(null);
  const [historyQuestions, setHistoryQuestions] = useState<
    { id: string; content: string; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // On novel change: create session, load history, load context
  useEffect(() => {
    if (!selectedNovelId || !selectedNovel) return;

    setSession(null);
    setMessages([]);
    setHistoryQuestions([]);
    setQuickContext(null);
    setKnowledgeLimit(selectedNovel.total_chapters || 1);

    const init = async () => {
      try {
        const [newSession, sessions] = await Promise.all([
          aiApi.createQASession(
            selectedNovelId,
            selectedNovel.total_chapters || 1,
          ),
          aiApi.getQASessions(selectedNovelId),
        ]);
        setSession(newSession);

        // Build history from existing sessions
        const history: { id: string; content: string; created_at: string }[] =
          [];
        for (const s of sessions) {
          const msgs = await aiApi.getQAMessages(s.id);
          const firstUserMsg = msgs.find((m) => m.role === "user");
          if (firstUserMsg) {
            history.push({
              id: s.id,
              content: firstUserMsg.content,
              created_at: s.created_at,
            });
          }
        }
        setHistoryQuestions(history);
      } catch (err) {
        console.error("Failed to initialize QA session:", err);
      }
    };

    init();
  }, [selectedNovelId, selectedNovel]);

  // Load quick context when novel or knowledge limit changes
  useEffect(() => {
    if (!selectedNovelId) return;
    aiApi
      .getQuickContext(selectedNovelId, knowledgeLimit)
      .then(setQuickContext)
      .catch(() => setQuickContext(null));
  }, [selectedNovelId, knowledgeLimit]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleNovelChange = (novelId: string, novel: NovelOption) => {
    setSelectedNovelId(novelId);
    setSelectedNovel(novel);
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      const msgs = await aiApi.getQAMessages(sessionId);
      setMessages(msgs);
      // Update active session reference
      const sessions = await aiApi.getQASessions(selectedNovelId);
      const target = sessions.find((s) => s.id === sessionId);
      if (target) setSession(target);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || !session || loading) return;

    const question = inputValue.trim();
    setInputValue("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const result = await aiApi.askQuestion(
        session.id,
        question,
        knowledgeLimit,
      );
      setMessages((prev) => [
        ...prev,
        result.user_message,
        result.assistant_message,
      ]);

      // Update history
      const alreadyInHistory = historyQuestions.some(
        (h) => h.id === session.id,
      );
      if (!alreadyInHistory) {
        setHistoryQuestions((prev) => [
          {
            id: session.id,
            content: question,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Failed to ask question:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  // --------------------------------------------------------------------------
  // Render Helpers
  // --------------------------------------------------------------------------

  const renderCitation = (citation: Citation, index: number) => {
    const isPrimary = citation.type === "primary";
    return (
      <span
        key={index}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium ${
          isPrimary
            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
            : "bg-slate-100 text-slate-600 border border-slate-200"
        }`}
      >
        <span className="material-symbols-outlined text-[13px]">
          {isPrimary ? "menu_book" : "history_edu"}
        </span>
        {citation.label}
      </span>
    );
  };

  const renderUserMessage = (msg: QAMessage) => (
    <div key={msg.id} className="flex flex-col items-end gap-1.5">
      <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-md shadow-primary/20 self-end max-w-[80%]">
        <p className="text-sm leading-relaxed">{msg.content}</p>
      </div>
      <span className="text-[10px] text-slate-400 pr-1">
        You &bull; {formatTime(msg.created_at)}
      </span>
    </div>
  );

  const renderAssistantMessage = (msg: QAMessage) => (
    <div key={msg.id} className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="material-symbols-outlined text-base text-indigo-600">
          robot_2
        </span>
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1.5 max-w-[80%]">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </p>

          {/* Citations */}
          {msg.citations && msg.citations.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-4 flex flex-wrap gap-2">
              {msg.citations.map((c, i) => renderCitation(c, i))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 pl-1">
          AI &bull; {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );

  const renderLoadingIndicator = () => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="material-symbols-outlined text-base text-indigo-600">
          robot_2
        </span>
      </div>
      <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className="text-xs text-slate-400">Searching knowledge base...</p>
      </div>
    </div>
  );

  const renderEntityAvatar = (entity: QAContextEntity) => {
    if (entity.type === "item") {
      return (
        <div className="w-9 h-9 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-base text-purple-500">
            local_fire_department
          </span>
        </div>
      );
    }

    const isAntagonist =
      entity.role?.toLowerCase().includes("antagonist") ||
      entity.role?.toLowerCase().includes("villain");

    return (
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAntagonist ? "bg-red-100" : "bg-slate-200"
        }`}
      >
        <span
          className={`text-xs font-bold ${
            isAntagonist ? "text-red-500" : "text-slate-600"
          }`}
        >
          {getInitials(entity.name)}
        </span>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-in fade-in duration-500 max-w-[1300px] mx-auto w-full border-x border-slate-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================== */}
      {/* Left Sidebar */}
      {/* ================================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Back link */}
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Back to AI Features
          </Link>

          {/* Title */}
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl text-primary">
              psychology_alt
            </span>
            <h1 className="text-lg font-bold text-slate-900">Story Q&A</h1>
          </div>

          {/* Novel Selector */}
          <NovelSelector
            value={selectedNovelId}
            onChange={handleNovelChange}
            label="Target Novel"
          />

          {/* Knowledge Slider */}
          {selectedNovel && (
            <KnowledgeSlider
              value={knowledgeLimit}
              max={selectedNovel.total_chapters || 1}
              onChange={setKnowledgeLimit}
              label="Knowledge Base"
              description="Limit AI knowledge to prevent spoilers"
            />
          )}

          {/* History */}
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
              History
            </h3>
            <div className="space-y-2">
              {historyQuestions.length === 0 && (
                <p className="text-xs text-slate-400">
                  No questions asked yet.
                </p>
              )}
              {historyQuestions.map((entry) => {
                const isActive = session?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleLoadSession(entry.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/5 border border-primary/20 text-primary"
                        : "bg-white border border-slate-100 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-medium line-clamp-1">
                      {entry.content}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="material-symbols-outlined text-[10px] text-slate-400">
                        schedule
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {relativeTime(entry.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* Main Q&A Area */}
      {/* ================================================================== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedNovel?.title || "Select a Novel"}
              </h2>
            </div>
          </div>

          {/* Knowledge citations status */}
          {session && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full block" />
                <span className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <span className="text-xs text-emerald-600">
                Knowledge citations active
              </span>
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Empty state */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-indigo-400">
                    psychology_alt
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Ask anything about the story
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Get answers about plot details, character motivations, lore,
                  and more — all backed by chapter citations.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) =>
              msg.role === "user"
                ? renderUserMessage(msg)
                : renderAssistantMessage(msg),
            )}

            {/* Loading */}
            {loading && renderLoadingIndicator()}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-2 flex items-end gap-1">
            {/* Attach button (future) */}
            <button
              className="p-3 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
              title="Attach (coming soon)"
              disabled
            >
              <span className="material-symbols-outlined text-xl">
                add_circle
              </span>
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTextareaInput();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the plot, lore, or characters..."
              className="flex-1 bg-transparent border-none text-slate-900 text-sm resize-none min-h-[56px] max-h-32 py-3 px-2 outline-none placeholder:text-slate-400"
              rows={1}
            />

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || loading || !session}
              className="p-3 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-md h-12 w-12 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-400 text-center mt-3 max-w-4xl mx-auto">
            AI responses may contain inaccuracies. Content is limited to Chapter{" "}
            {knowledgeLimit} to prevent spoilers.
          </p>
        </div>
      </main>

      {/* ================================================================== */}
      {/* Right Context Panel */}
      {/* ================================================================== */}
      <aside className="hidden xl:flex w-80 bg-white border-l border-slate-200 flex-col overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xl text-amber-500">
                auto_awesome
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Quick Context
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Based on your selected Chapter {knowledgeLimit}
            </p>
          </div>

          {/* Current Arc Card */}
          {quickContext?.current_arc && (
            <div>
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                Current Arc
              </h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {quickContext.current_arc.title}
                </h4>
                {quickContext.current_arc.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    {quickContext.current_arc.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="material-symbols-outlined text-[12px]">
                    book
                  </span>
                  Ch. {quickContext.current_arc.start_chapter} &ndash;{" "}
                  {quickContext.current_arc.end_chapter}
                </div>
              </div>
            </div>
          )}

          {/* Relevant Entities */}
          {quickContext?.entities && quickContext.entities.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                Relevant Entities
              </h3>
              <div className="space-y-3">
                {quickContext.entities.map((entity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {renderEntityAvatar(entity)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {entity.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {entity.role}
                        {entity.status ? ` \u00b7 ${entity.status}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty context state */}
          {!quickContext && selectedNovelId && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">
                auto_awesome
              </span>
              <p className="text-xs text-slate-400">
                Context will appear once you select a novel.
              </p>
            </div>
          )}

          {!selectedNovelId && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">
                auto_awesome
              </span>
              <p className="text-xs text-slate-400">
                Select a novel to view context.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
