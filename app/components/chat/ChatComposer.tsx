"use client";

import { useRef } from "react";
import { MAX_ATTACHMENTS } from "../../lib/constants";
import { useChatActions, useChatState } from "./ChatProvider";

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
    <div className="shrink-0 border-t border-white/60 bg-white/55 px-4 py-4 backdrop-blur-xl sm:px-6">
      {attachments.length > 0 && (
        <div className="mx-auto mb-2 flex max-w-3xl flex-wrap items-center gap-2">
          {photoRemembered && (
            <span className="mr-1 text-xs text-slate-500">
              Работаю с этим фото — можно просто написать следующий запрос
            </span>
          )}
          {attachments.map((a, i) => (
            <div
              key={a.url}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-violet-100"
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
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-[11px] font-bold leading-none text-white shadow-sm transition hover:bg-slate-900"
              >
                ×
              </button>
            </div>
          ))}
          {atLimit && (
            <span className="text-xs text-slate-500">
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

      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={atLimit}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-slate-600 ring-1 ring-violet-100 transition hover:bg-white hover:text-slate-800 disabled:opacity-40"
          aria-label="Прикрепить фото"
          title={atLimit ? `Максимум ${MAX_ATTACHMENTS} фото` : "Прикрепить фото"}
        >
          📎
        </button>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-white/85 ring-1 ring-violet-100 transition focus-within:ring-2 focus-within:ring-rose-200">
            <div className="flex items-center gap-2 px-4 py-3">
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
                placeholder="Опиши желаемый образ…"
                className="h-6 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-[15px]"
              />
            </div>
          </div>
        </div>

        <button
          id="sendBtn"
          type="button"
          onClick={() => void send()}
          disabled={!canSend}
          className="h-11 shrink-0 rounded-2xl bg-gradient-to-r from-rose-400 to-violet-400 px-5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:from-rose-500 hover:to-violet-500 disabled:opacity-50"
        >
          {loading ? "…" : "Отправить"}
        </button>
      </div>
    </div>
  );
}
