"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { aiApi } from "../../api/aiApi";
import {
  GROUP_CHAT_COLOR_SLOTS,
  type Character,
  type GroupChatSession,
  type GroupChatMember,
  type GroupChatMessage,
  type GroupChatMemory,
  type NovelOption,
} from "../../types";

// ============================================================================
// Helpers
// ============================================================================

function getColorSlot(slot: number) {
  return (
    GROUP_CHAT_COLOR_SLOTS.find((s) => s.slot === slot) ??
    GROUP_CHAT_COLOR_SLOTS[0]
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function randomDelay() {
  return Math.floor(Math.random() * 3000) + 3000; // 3-6 seconds
}

// ============================================================================
// Component
// ============================================================================

export function GroupChatPage() {
  // ---- Core state ----
  const [session, setSession] = useState<GroupChatSession | null>(null);
  const [members, setMembers] = useState<GroupChatMember[]>([]);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [memories, setMemories] = useState<GroupChatMemory[]>([]);
  const [isAutoActive, setIsAutoActive] = useState(false);

  // ---- Sidebar state ----
  const [scenario, setScenario] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    (Character & { novelTitle: string })[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // ---- Input state ----
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ---- Edit state ----
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // ---- Hover state ----
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  // ---- Refs ----
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isGeneratingRef = useRef(false);

  // ---- Scroll to bottom ----
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---- Initialize session ----
  useEffect(() => {
    const init = async () => {
      try {
        const s = await aiApi.createGroupSession("New Group Chat", "");
        setSession(s);
      } catch (err) {
        console.error("Failed to create group session:", err);
      }
    };
    init();
  }, []);

  // ---- Load session data when session changes ----
  useEffect(() => {
    if (!session) return;
    const load = async () => {
      try {
        const [m, msgs, mem] = await Promise.all([
          aiApi.getGroupMembers(session.id),
          aiApi.getGroupMessages(session.id),
          aiApi.getGroupMemory(session.id),
        ]);
        setMembers(m);
        setMessages(msgs);
        setMemories(mem);
        setScenario(session.scenario_context ?? "");
        setIsAutoActive(session.auto_chat_active);
      } catch (err) {
        console.error("Failed to load group data:", err);
      }
    };
    load();
  }, [session]);

  // ---- Auto-chat logic ----
  useEffect(() => {
    if (isAutoActive && session && members.length >= 2) {
      autoTimerRef.current = setInterval(async () => {
        if (isGeneratingRef.current) return;
        isGeneratingRef.current = true;
        try {
          const msg = await aiApi.generateGroupMessage(session.id);
          setMessages((prev) => [...prev, msg]);
        } catch (err) {
          console.error("Auto-generate failed:", err);
        } finally {
          isGeneratingRef.current = false;
        }
      }, randomDelay());
    }

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isAutoActive, session, members.length]);

  // ---- Character search ----
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const novels: NovelOption[] = await aiApi.getNovels();
        const allResults: (Character & { novelTitle: string })[] = [];

        for (const novel of novels) {
          const chars = await aiApi.getCharacters(novel.id);
          const matching = chars.filter(
            (c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.name_translated &&
                c.name_translated
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())),
          );
          for (const ch of matching) {
            allResults.push({ ...ch, novelTitle: novel.title });
          }
        }

        setSearchResults(allResults);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // ---- Actions ----
  const handleToggleAuto = async () => {
    if (!session) return;
    try {
      const result = await aiApi.toggleAutoChat(session.id, !isAutoActive);
      setIsAutoActive(result.auto_chat_active);
    } catch (err) {
      console.error("Toggle auto failed:", err);
    }
  };

  const handleAddMember = async (char: Character & { novelTitle: string }) => {
    if (!session) return;
    if (members.length >= 5) return;
    if (members.some((m) => m.character_id === char.id)) return;

    const usedSlots = members.map((m) => m.color_slot);
    const nextSlot = [1, 2, 3, 4, 5].find((s) => !usedSlots.includes(s)) ?? 1;
    const nextOrder = members.length + 1;

    try {
      const member = await aiApi.addGroupMember(
        session.id,
        char.id,
        char.novel_id,
        char.first_appearance_chapter ?? 100,
        nextSlot,
        nextOrder,
      );
      // Attach the character info
      member.character = char;
      setMembers((prev) => [...prev, member]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Add member failed:", err);
    }
  };

  const handleRemoveMember = async (characterId: string) => {
    if (!session) return;
    try {
      await aiApi.removeGroupMember(session.id, characterId);
      setMembers((prev) => prev.filter((m) => m.character_id !== characterId));
    } catch (err) {
      console.error("Remove member failed:", err);
    }
  };

  const handleUpdateScenario = async () => {
    if (!session) return;
    try {
      await aiApi.updateGroupScenario(session.id, scenario);
    } catch (err) {
      console.error("Update scenario failed:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!session || !inputText.trim() || isSending) return;

    // Pause auto-chat when user sends a message
    if (isAutoActive) {
      try {
        await aiApi.toggleAutoChat(session.id, false);
        setIsAutoActive(false);
      } catch {
        /* noop */
      }
    }

    setIsSending(true);
    try {
      const msg = await aiApi.sendGroupMessage(session.id, inputText.trim());
      setMessages((prev) => [...prev, msg]);
      setInputText("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;
    try {
      await aiApi.editGroupMessage(messageId, editText.trim());
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: editText.trim(), is_edited: true }
            : m,
        ),
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await aiApi.deleteGroupMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ---- Helpers for rendering ----
  const getMemberByCharacterId = (charId: string | null) =>
    members.find((m) => m.character_id === charId);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="flex h-full bg-slate-50 max-w-[1300px] mx-auto w-full border-x border-slate-200">
      {/* ==================================================================
          LEFT SIDEBAR
      ================================================================== */}
      <aside className="hidden lg:flex w-80 flex-col bg-white border-r border-slate-200 overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              groups
            </span>
            Group Management
          </h2>
        </div>

        {/* Character Search */}
        <div className="p-4 border-b border-slate-100">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
            Add Character
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters across novels..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {isSearching && (
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg animate-spin">
                progress_activity
              </span>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchResults.map((char) => {
                const alreadyAdded = members.some(
                  (m) => m.character_id === char.id,
                );
                return (
                  <button
                    key={char.id}
                    disabled={alreadyAdded || members.length >= 5}
                    onClick={() => handleAddMember(char)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {getInitials(char.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {char.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {char.novelTitle}
                      </p>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-xs text-slate-400">Added</span>
                    ) : (
                      <span className="material-symbols-outlined text-primary text-lg">
                        add_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Members */}
        <div className="p-4 border-b border-slate-100 flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Active Members</span>
            <span className="text-slate-400">{members.length}/5</span>
          </label>

          {members.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No characters added yet. Search above to add members.
            </p>
          )}

          <div className="space-y-2">
            {members.map((member) => {
              const color = getColorSlot(member.color_slot);
              const name =
                member.character?.name ??
                `Character ${member.character_id.slice(0, 6)}`;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color.avatarBg} ${color.textColor}`}
                  >
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Slot {member.color_slot}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.character_id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove member"
                  >
                    <span className="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">
                      close
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario Context */}
        <div className="p-4">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
            Scenario Context
          </label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            rows={4}
            placeholder="Describe the scenario, setting, or situation for this group conversation..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            onClick={handleUpdateScenario}
            className="mt-2 w-full bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">update</span>
            Update Scenario
          </button>
        </div>
      </aside>

      {/* ==================================================================
          MAIN CHAT AREA
      ================================================================== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Group Header */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 shadow-sm z-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Stacked Avatars */}
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member) => {
                const color = getColorSlot(member.color_slot);
                const name =
                  member.character?.name ??
                  `C${member.character_id.slice(0, 2)}`;
                return (
                  <div
                    key={member.id}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white ${color.avatarBg} ${color.textColor}`}
                    title={name}
                  >
                    {getInitials(name)}
                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    group_add
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">
                Group Chat
              </h1>
              <p className="text-xs text-slate-400">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Auto-chat toggle */}
          <button
            onClick={handleToggleAuto}
            disabled={members.length < 2}
            className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">
              {isAutoActive ? "pause" : "play_arrow"}
            </span>
            {isAutoActive ? "Pause Auto" : "Resume Auto"}
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">
                forum
              </span>
              <p className="text-sm text-slate-400">
                No messages yet. Add characters and start the conversation!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender_type === "user";
            const member = getMemberByCharacterId(msg.character_id);
            const color = member
              ? getColorSlot(member.color_slot)
              : getColorSlot(1);
            const isLeft = isUser
              ? false
              : member
                ? member.color_slot % 2 !== 0
                : true;
            const charName =
              member?.character?.name ?? (isUser ? "You" : "Character");

            return (
              <div
                key={msg.id}
                className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                <div
                  className={`flex gap-2.5 max-w-[70%] ${
                    isLeft ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  {!isUser && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${color.avatarBg} ${color.textColor}`}
                    >
                      {getInitials(charName)}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className="space-y-1">
                    {/* Sender label */}
                    <p
                      className={`text-xs font-medium ${
                        isLeft ? "text-left" : "text-right"
                      } ${isUser ? "text-indigo-500" : "text-slate-500"}`}
                    >
                      {isUser ? "Author intervention" : charName}
                      {msg.is_edited && (
                        <span className="text-slate-400 ml-1">(edited)</span>
                      )}
                    </p>

                    <div className="relative">
                      {editingId === msg.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMessage(msg.id)}
                              className="text-xs bg-primary text-white px-3 py-1 rounded-md"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                              className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isUser
                              ? "bg-indigo-50 border border-indigo-100 text-indigo-800"
                              : `${color.bubbleBg} ${color.bubbleBorder} ${color.bubbleText}`
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* Edit / Delete on hover (AI messages only) */}
                      {!isUser &&
                        hoveredMsgId === msg.id &&
                        editingId !== msg.id && (
                          <div
                            className={`absolute top-0 ${
                              isLeft ? "-right-16" : "-left-16"
                            } flex flex-col gap-1`}
                          >
                            <button
                              onClick={() => {
                                setEditingId(msg.id);
                                setEditText(msg.content);
                              }}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-slate-400 text-sm">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-red-50"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-slate-400 hover:text-red-500 text-sm">
                                delete
                              </span>
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 mt-1">
                      <span className="material-symbols-outlined text-base">
                        person
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Intervene as the Author or ask a question to the group..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">
                {isSending ? "progress_activity" : "send"}
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            AI Characters generate responses autonomously when
            &quot;Auto-Chat&quot; is active.
          </p>
        </div>
      </main>

      {/* ==================================================================
          RIGHT PANEL
      ================================================================== */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-l border-slate-200 overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              info
            </span>
            Group Context
          </h2>
        </div>

        {/* Knowledge Limits */}
        <div className="p-4 border-b border-slate-100">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">
            Knowledge Limits
          </label>

          {members.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No members to display.
            </p>
          )}

          <div className="space-y-3">
            {members.map((member) => {
              const color = getColorSlot(member.color_slot);
              const name =
                member.character?.name ??
                `Character ${member.character_id.slice(0, 6)}`;
              const maxChapters = member.character?.first_appearance_chapter
                ? Math.max(member.knowledge_limit, 100)
                : 100;
              const pct = Math.min(
                (member.knowledge_limit / maxChapters) * 100,
                100,
              );

              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${color.avatarBg} ${color.textColor}`}
                      >
                        {getInitials(name)}
                      </div>
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                        {name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Ch. {member.knowledge_limit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.avatarBg.replace("100", "400")}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory Log */}
        <div className="p-4 flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">
            Memory Log
          </label>

          {memories.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No memory entries yet.
            </p>
          )}

          <div className="relative border-l-2 border-slate-100 pl-4 space-y-4">
            {memories.map((mem, idx) => {
              const isLatest = idx === memories.length - 1;
              return (
                <div key={mem.id} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      isLatest ? "bg-primary" : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      {mem.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {mem.summary}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(mem.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
