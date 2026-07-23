"use client";

import Image from "next/image";
import { useChatActions } from "./chat/ChatProvider";
import { STYLE_GALLERY } from "../lib/constants";

const scrollToChat = () => window.scrollTo({ top: 0, behavior: "smooth" });

function TryOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function StyleGallery() {
  const { addReference, setInput } = useChatActions();

  const tryOn = (item: (typeof STYLE_GALLERY)[number]) => {
    // Референс уходит в чат сообщением — бэкенд подхватит его как стиль
    // (referenceText) для генерации. Плюс сеем запрос на примерку.
    addReference(item);
    setInput("Примерь этот образ на меня");
    scrollToChat();
    document.getElementById("messageInput")?.focus();
  };

  return (
    <section className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-lm-text sm:text-3xl">
            Референсы для вдохновения
          </h2>
          <p className="mt-2 text-lm-muted">
            Выбери образ и примерь его на себя — добавь своё фото в чате.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {STYLE_GALLERY.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => tryOn(item)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-lm-line bg-white text-left shadow-sm transition hover:border-lm-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lm-rose"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  priority={i < 2}
                />
                <div className="absolute inset-0 grid place-items-center bg-slate-900/30 opacity-0 transition group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-lm-text shadow-sm">
                    <span className="text-lm-rose-ink">
                      <TryOnIcon />
                    </span>
                    Примерить на себя
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-xs font-medium text-lm-muted">
                  {item.alt}
                </span>
                <span className="rounded-full bg-lm-rose-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lm-rose-ink">
                  {item.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
