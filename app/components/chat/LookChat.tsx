"use client";

import { useEffect, useRef } from "react";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage } from "./ChatMessage";
import { useChatState } from "./ChatProvider";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="h-[18px] w-[18px]">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function LookChat({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { messages, loading, conversations, activeId } = useChatState();
  const title = conversations.find((c) => c.id === activeId)?.title ?? "Новый чат";
  const endRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка вниз при новом сообщении и при появлении индикатора.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  return (
    <div id="chat" className="flex h-full min-w-0 flex-col bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-lm-line px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Показать список чатов"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-lm-line text-slate-600 transition hover:bg-lm-rose-softer hover:text-lm-rose-ink md:hidden"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-lm-text">
            {title}
          </h2>
          <p className="truncate text-xs text-lm-muted">
            Примерка образа или подбор от стилиста
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {messages.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m) => (
              <ChatMessage key={m.id} msg={m} />
            ))}
            {loading && <LoadingIndicator />}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <ChatComposer />
    </div>
  );
}
