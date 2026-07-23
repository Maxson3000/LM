"use client";

import { useLoadingMessages } from "../../hooks/useLoadingMessages";

const DOTS = [0, 1, 2];

export function LoadingIndicator() {
  const message = useLoadingMessages();

  return (
    <div className="mr-auto max-w-[85%] rounded-2xl border border-lm-line bg-white px-4 py-3">
      <div
        className="flex items-center gap-2.5"
        role="status"
        aria-live="polite"
      >
        <span className="flex items-center gap-1.5" aria-hidden>
          {DOTS.map((i) => (
            <span
              key={i}
              className="lm-dot h-1.5 w-1.5 rounded-full bg-slate-400"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        <span
          key={message}
          className="lm-stage text-sm text-slate-500"
        >
          {message}
        </span>
      </div>
    </div>
  );
}
