"use client";

import { useChatActions, useChatState } from "./ChatProvider";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[15px] w-[15px] shrink-0">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </svg>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { conversations, activeId } = useChatState();
  const { newConversation, selectConversation, deleteConversation } =
    useChatActions();

  return (
    <div className="flex h-full flex-col bg-lm-rose-softer">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-lm-text">Look</span>
          <span className="bg-gradient-to-r from-lm-coral to-violet-500 bg-clip-text text-transparent">
            MAX
          </span>
        </span>
        <span className="ml-auto rounded-full border border-lm-line-strong px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lm-muted">
          ИИ-стилист
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          newConversation();
          onNavigate?.();
        }}
        className="mx-3 mb-1.5 flex items-center justify-center gap-2 rounded-[10px] bg-lm-rose px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-lm-rose-ink"
      >
        <PlusIcon />
        Новый чат
      </button>

      <p className="px-5 pb-1.5 pt-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-lm-muted">
        История
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <div
              key={c.id}
              className={[
                "group mt-0.5 flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] transition",
                active
                  ? "bg-lm-rose-soft font-medium text-lm-text"
                  : "text-slate-600 hover:bg-lm-rose-softer hover:text-lm-text",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => {
                  selectConversation(c.id);
                  onNavigate?.();
                }}
                className={[
                  "flex min-w-0 flex-1 items-center gap-2.5 text-left",
                  active ? "text-lm-rose-ink" : "",
                ].join(" ")}
              >
                <ChatIcon />
                <span className="truncate text-lm-text">{c.title}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteConversation(c.id)}
                aria-label={`Удалить чат «${c.title}»`}
                className="shrink-0 rounded-md p-1 text-lm-muted opacity-0 transition hover:bg-white hover:text-lm-rose-ink focus-visible:opacity-100 group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 border-t border-lm-line px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-rose-200 to-violet-200 text-xs font-bold text-rose-900">
          Я
        </span>
        <div className="leading-tight">
          <p className="text-[12.5px] font-semibold text-lm-text">Гость</p>
          <p className="text-[11px] text-lm-muted">Бесплатный план</p>
        </div>
      </div>
    </div>
  );
}
