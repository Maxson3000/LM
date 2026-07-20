"use client";

import Image from "next/image";
import { useChatActions } from "./chat/ChatProvider";
import { STYLE_GALLERY } from "../lib/constants";

const scrollToChat = () => window.scrollTo({ top: 0, behavior: "smooth" });

export function StyleGallery() {
  const { addReference } = useChatActions();

  return (
    <section className="relative z-10 bg-gradient-to-b from-transparent via-violet-50/40 to-rose-50/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-lm-text sm:text-3xl">
              Вдохновение и референсы для тебя
            </h2>
            <p className="mt-2 max-w-xl text-lm-muted">
              Нажми на референс — он появится в чате
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToChat}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-violet-400 px-5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:from-rose-500 hover:to-violet-500"
          >
            К чату ↑
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {STYLE_GALLERY.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => {
                addReference(item);
                scrollToChat();
              }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/70 bg-white/80 text-left shadow-md shadow-violet-100/40 backdrop-blur-sm transition hover:ring-2 hover:ring-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
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
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-xs font-medium text-lm-muted">
                  {item.alt}
                </span>
                <span className="rounded-full bg-lm-lavender px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
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
