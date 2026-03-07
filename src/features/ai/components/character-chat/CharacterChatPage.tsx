"use client";

import { useEffect, useRef, useState } from "react";
import { aiApi } from "../../api/aiApi";
import type {
  NovelOption,
  Character,
  CharacterState,
  ChatSession,
  ChatMessage,
} from "../../types";
import { NovelSelector } from "../shared/NovelSelector";
import { KnowledgeSlider } from "../shared/KnowledgeSlider";

// ============================================================================
// CharacterChatPage
// ============================================================================

export function CharacterChatPage() {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [selectedNovel, setSelectedNovel] = useState<NovelOption | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [characterState, setCharacterState] = useState<CharacterState | null>(
    null,
  );
  const [knowledgeLimit, setKnowledgeLimit] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // Fetch characters when novel changes
  useEffect(() => {
    if (!selectedNovelId) return;
    setLoadingCharacters(true);
    setSelectedCharacter(null);
    setSession(null);
    setMessages([]);
    setCharacterState(null);

    aiApi
      .getCharacters(selectedNovelId)
      .then((data) => {
        setCharacters(data);
        setLoadingCharacters(false);
      })
      .catch(() => setLoadingCharacters(false));
  }, [selectedNovelId]);

  // Fetch character state when character or knowledge limit changes
  useEffect(() => {
    if (!selectedCharacter) return;
    aiApi
      .getCharacterState(selectedCharacter.id, knowledgeLimit)
      .then(setCharacterState)
      .catch(() => setCharacterState(null));
  }, [selectedCharacter, knowledgeLimit]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleNovelChange = (novelId: string, novel: NovelOption) => {
    setSelectedNovelId(novelId);
    setSelectedNovel(novel);
    setKnowledgeLimit(novel.total_chapters || 1);
  };

  const handleCharacterSelect = async (character: Character) => {
    setSelectedCharacter(character);
    setLoading(true);
    setMessages([]);
    setSession(null);

    try {
      const newSession = await aiApi.createChatSession(
        character.id,
        selectedNovelId,
        knowledgeLimit,
      );
      setSession(newSession);
      const existingMessages = await aiApi.getChatMessages(newSession.id);
      setMessages(existingMessages);
    } catch (err) {
      console.error("Failed to create chat session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!session || !inputValue.trim() || sendingMessage) return;

    const content = inputValue.trim();
    setInputValue("");
    setSendingMessage(true);

    // Optimistic user message
    const optimisticUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      role: "user",
      content,
      rating: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const { user_message, assistant_message } = await aiApi.sendChatMessage(
        session.id,
        content,
      );
      // Replace optimistic message with real ones
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserMsg.id),
        user_message,
        assistant_message,
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
      setInputValue(content);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRate = async (
    messageId: string,
    rating: "positive" | "negative",
  ) => {
    try {
      await aiApi.rateChatMessage(messageId, rating);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m)),
      );
    } catch (err) {
      console.error("Failed to rate message:", err);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  };

  const handleResetChat = async () => {
    if (!session) return;
    try {
      await aiApi.deleteChatSession(session.id);
      setSession(null);
      setMessages([]);
      if (selectedCharacter) {
        handleCharacterSelect(selectedCharacter);
      }
    } catch (err) {
      console.error("Failed to reset chat:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --------------------------------------------------------------------------
  // Render Helpers
  // --------------------------------------------------------------------------

  const totalChapters = selectedNovel?.total_chapters || 1;

  const renderCharacterCard = (character: Character) => {
    const isSelected = selectedCharacter?.id === character.id;
    return (
      <button
        key={character.id}
        onClick={() => handleCharacterSelect(character)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
          isSelected
            ? "bg-primary/10 border border-primary/30 shadow-sm"
            : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm"
        }`}
      >
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {character.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.avatar_url}
              alt={character.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-xl">
              person
            </span>
          )}
        </div>
        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {character.name}
          </p>
          {character.role && (
            <p className="text-xs text-slate-500 truncate capitalize">
              {character.role}
            </p>
          )}
        </div>
      </button>
    );
  };

  // --------------------------------------------------------------------------
  // JSX
  // --------------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 animate-in fade-in duration-500 max-w-[1300px] mx-auto w-full">
      {/* ================================================================== */}
      {/* LEFT SIDEBAR                                                       */}
      {/* ================================================================== */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-slate-200 bg-white p-5 gap-5 overflow-y-auto">
        {/* Novel Selector */}
        <NovelSelector
          value={selectedNovelId}
          onChange={handleNovelChange}
          label="Novel"
        />

        {/* Character Selector */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Characters
          </label>
          {loadingCharacters ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[60px] bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : characters.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              {selectedNovelId
                ? "No characters found for this novel."
                : "Select a novel to see characters."}
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {characters.map(renderCharacterCard)}
            </div>
          )}
        </div>

        {/* Knowledge Slider */}
        {selectedNovelId && (
          <KnowledgeSlider
            value={knowledgeLimit}
            max={totalChapters}
            onChange={setKnowledgeLimit}
            label="Knowledge Limit"
            description="AI will only use knowledge up to this chapter to avoid spoilers."
          />
        )}

        {/* Reset Chat Button */}
        {session && (
          <button
            onClick={handleResetChat}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Reset Chat
          </button>
        )}
      </aside>

      {/* ================================================================== */}
      {/* MAIN CHAT AREA                                                     */}
      {/* ================================================================== */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedCharacter ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Character Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedCharacter.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedCharacter.avatar_url}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-lg">
                      person
                    </span>
                  )}
                </div>
                {/* Character Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {selectedCharacter.name}
                  </h2>
                  {selectedCharacter.personality_traits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedCharacter.personality_traits
                        .slice(0, 4)
                        .map((trait) => (
                          <span
                            key={trait}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          >
                            {trait}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                {/* Knowledge Sync Pill */}
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-100">
                  <span className="material-symbols-outlined text-sm">
                    sync
                  </span>
                  Knowledge synced to Chapter {knowledgeLimit}
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <span className="material-symbols-outlined text-3xl animate-spin">
                      progress_activity
                    </span>
                    <span className="text-sm">Loading conversation...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-primary">
                      forum
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Start a Conversation
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Send a message to begin chatting with{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedCharacter.name}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Assistant Message */}
                    {msg.role === "assistant" && (
                      <div className="flex gap-3 max-w-[75%]">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                          {selectedCharacter.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selectedCharacter.avatar_url}
                              alt={selectedCharacter.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-sm">
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            {selectedCharacter.name}
                          </p>
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          {/* Feedback Buttons */}
                          <div className="flex items-center gap-1 mt-1.5 ml-1">
                            <button
                              onClick={() => handleRate(msg.id, "positive")}
                              className={`p-1 rounded-md transition-colors ${
                                msg.rating === "positive"
                                  ? "text-primary bg-primary/10"
                                  : "text-slate-400 hover:text-primary hover:bg-primary/5"
                              }`}
                              title="Good response"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                thumb_up
                              </span>
                            </button>
                            <button
                              onClick={() => handleRate(msg.id, "negative")}
                              className={`p-1 rounded-md transition-colors ${
                                msg.rating === "negative"
                                  ? "text-rose-500 bg-rose-50"
                                  : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                              }`}
                              title="Bad response"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                thumb_down
                              </span>
                            </button>
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Copy message"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                content_copy
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User Message */}
                    {msg.role === "user" && (
                      <div className="max-w-[75%]">
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-none px-5 py-3 shadow-sm">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[75%]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm">
                        person
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        {selectedCharacter.name}
                      </p>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                        <div className="flex gap-1.5 items-center py-1">
                          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="px-6 pb-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-sm">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedCharacter.name}...`}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none px-3 py-2.5 max-h-32"
                  />
                  {/* Regenerate */}
                  {messages.length > 0 && (
                    <button
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                      title="Regenerate last response"
                    >
                      <span className="material-symbols-outlined text-xl">
                        refresh
                      </span>
                    </button>
                  )}
                  {/* Send */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || sendingMessage}
                    className="p-2 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <span className="material-symbols-outlined text-xl">
                      send
                    </span>
                  </button>
                </div>
              </div>
              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center mt-2">
                AI responses are generated based on novel content and may not
                perfectly reflect the character. Powered by LLM.
              </p>
            </div>
          </>
        ) : (
          /* Empty State - No Character Selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-primary">
                forum
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Character Chat
            </h2>
            <p className="text-sm text-slate-500 max-w-md">
              Select a novel and character from the sidebar to start a
              conversation. The AI will roleplay as the character, using
              knowledge up to your selected chapter.
            </p>
          </div>
        )}
      </main>

      {/* ================================================================== */}
      {/* RIGHT PANEL - Character Lore & Context                             */}
      {/* ================================================================== */}
      <aside className="hidden lg:flex flex-col w-80 border-l border-slate-200 bg-white p-5 gap-5 overflow-y-auto">
        {selectedCharacter ? (
          <>
            {/* Panel Title */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary">
                auto_stories
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Character Lore & Context
              </h3>
            </div>

            {/* Biography Section */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Biography
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedCharacter.biography || "No biography available."}
                </p>
              </div>
            </div>

            {/* Speech Patterns */}
            {selectedCharacter.speech_patterns && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Speech Patterns
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    &quot;{selectedCharacter.speech_patterns}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Current World State */}
            {characterState && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Current World State
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  {/* Location */}
                  {characterState.location && (
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">
                        location_on
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Location
                        </p>
                        <p className="text-sm text-slate-700">
                          {characterState.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Power Level */}
                  {characterState.power_level && (
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">
                        bolt
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Power Level
                        </p>
                        <p className="text-sm text-slate-700">
                          {characterState.power_level}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Key Items */}
                  {characterState.key_items &&
                    characterState.key_items.length > 0 && (
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">
                          inventory_2
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Key Items
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {characterState.key_items.map((item) => (
                              <span
                                key={item}
                                className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Faction */}
                  {characterState.faction && (
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">
                        diversity_3
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Faction
                        </p>
                        <p className="text-sm text-slate-700">
                          {characterState.faction}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {characterState.status && (
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">
                        info
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Status
                        </p>
                        <p className="text-sm text-slate-700">
                          {characterState.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Relationships */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Key Relationships
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {characters.length > 1 ? (
                  <div className="space-y-2.5">
                    {characters
                      .filter((c) => c.id !== selectedCharacter.id)
                      .slice(0, 5)
                      .map((c) => (
                        <div key={c.id} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {c.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.avatar_url}
                                alt={c.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-primary text-xs">
                                person
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {c.name}
                            </p>
                            {c.role && (
                              <p className="text-[11px] text-slate-400 capitalize">
                                {c.role}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-2">
                    No other characters found.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-3xl text-slate-200 mb-3">
              auto_stories
            </span>
            <p className="text-sm text-slate-400">
              Select a character to view their lore and context.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
