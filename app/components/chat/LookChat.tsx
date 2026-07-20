"use client";

import { useEffect, useRef } from "react";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage } from "./ChatMessage";
import { useChatActions, useChatState } from "./ChatProvider";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";

export function LookChat() {
  const { messages, loading } = useChatState();
  const { reset } = useChatActions();
  const endRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка вниз при новом сообщении и при появлении индикатора.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  return (
    <div
      id="chat"
      className="relative flex min-h-[calc(100vh-7rem)] flex-col sm:min-h-[calc(100vh-6rem)]"
    >
      <div className="pointer-events-none absolute -inset-1 rounded-[22px] bg-gradient-to-r from-rose-200/70 via-violet-200/70 to-sky-200/70 blur-xl" />

      <div className="relative flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/75 shadow-xl shadow-violet-200/40 backdrop-blur-xl sm:min-h-[calc(100vh-6rem)]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/60 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 sm:text-base">
              ИИ-стилист LookMAX
            </p>
            <p className="truncate text-xs text-slate-500">
              Опиши образ · прикрепи фото · получи рекомендации
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            disabled={messages.length === 0 && !loading}
            className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-violet-100 transition hover:bg-white disabled:opacity-40 sm:text-xs"
          >
            Новый чат
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
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
    </div>
  );
}
