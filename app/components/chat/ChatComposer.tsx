"use client";

import { useRef } from "react";
import { MAX_ATTACHMENTS } from "../../lib/constants";
import { useChatActions, useChatState } from "./ChatProvider";

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[18px] w-[18px]">
      <path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 1 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function ChatComposer() {
  const { input, attachments, canSend, loading, atLimit, photoRemembered } =
    useChatState();
  const { setInput, addFiles, removeAttachment, send } = useChatActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="shrink-0 border-t border-lm-line bg-white px-4 py-3.5 sm:px-6">
      {attachments.length > 0 && (
        <div className="mx-auto mb-2.5 flex max-w-3xl flex-wrap items-center gap-2">
          {photoRemembered && (
            <span className="mr-1 text-xs text-lm-muted">
              Работаю с этим фото — можно просто написать следующий запрос
            </span>
          )}
          {attachments.map((a, i) => (
            <div
              key={a.url}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-lm-line"
            >
              {/* blob-превью локального файла — next/image неприменим */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                aria-label={`Удалить ${a.file.name}`}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-900/80 text-[11px] font-bold leading-none text-white transition hover:bg-slate-900"
              >
                ×
              </button>
            </div>
          ))}
          {atLimit && (
            <span className="text-xs text-lm-muted">
              Максимум {MAX_ATTACHMENTS} фото
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={atLimit}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lm-line text-slate-600 transition hover:bg-lm-rose-softer hover:text-lm-rose-ink disabled:opacity-40"
          aria-label="Прикрепить фото"
          title={atLimit ? `Максимум ${MAX_ATTACHMENTS} фото` : "Прикрепить фото"}
        >
          <ClipIcon />
        </button>

        <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-lm-line-strong bg-white px-4 transition focus-within:border-lm-rose focus-within:ring-2 focus-within:ring-lm-rose-soft">
          <input
            id="messageInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            type="text"
            placeholder="Опиши образ или прикрепи фото…"
            className="w-full bg-transparent text-sm text-lm-text outline-none placeholder:text-lm-muted sm:text-[15px]"
          />
        </div>

        <button
          id="sendBtn"
          type="button"
          onClick={() => void send()}
          disabled={!canSend}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-lm-rose px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-lm-rose-ink disabled:opacity-50 sm:px-5"
        >
          {loading ? "…" : "Отправить"}
          {!loading && <SendIcon />}
        </button>
      </div>
    </div>
  );
}
