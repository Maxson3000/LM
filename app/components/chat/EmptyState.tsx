"use client";

import { SUGGESTIONS } from "../../lib/constants";
import { useChatActions } from "./ChatProvider";

export function EmptyState() {
  const { setInput } = useChatActions();

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-violet-100 ring-1 ring-white/70">
        <span className="text-2xl" aria-hidden>
          ✨
        </span>
      </div>
      <p className="text-base font-semibold text-slate-700 sm:text-lg">
        С чего начнём?
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Напиши запрос внизу или выбери референс в галерее
      </p>

      <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setInput(s)}
            className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-left text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white sm:text-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
