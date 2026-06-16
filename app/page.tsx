"use client";

import { useMemo, useRef, useState } from "react";

const STYLE_GALLERY = [
  { src: "/Galery/1.jpg", alt: "Уличный casual", tag: "Casual" },
  { src: "/Galery/2.jpg", alt: "Минимализм", tag: "Minimal" },
  { src: "/Galery/3.jpg", alt: "Летний образ", tag: "Summer" },
  { src: "/Galery/4.jpg", alt: "Деловой стиль", tag: "Smart" },
  { src: "/Galery/5.jpg", alt: "Вечерний look", tag: "Evening" },
  { src: "/Galery/6.jpg", alt: "Акцентные цвета", tag: "Bold" },
];

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; text: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function LookChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  function scrollToBottom() {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: uid(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      const data = (await res.json()) as { body?: string };

      const botMsg: Msg = {
        id: uid(),
        role: "assistant",
        text: `Бот: ${data.body ?? "нет ответа"}`,
      };

      setMessages((m) => [...m, botMsg]);
      scrollToBottom();
    } catch {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", text: "Бот: ошибка соединения" },
      ]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-1 rounded-[22px] bg-gradient-to-r from-rose-200/70 via-violet-200/70 to-sky-200/70 blur-xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white/70 shadow-xl shadow-violet-200/40 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/60 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Создай образ за минуту</p>
            <p className="truncate text-xs text-slate-500">
              Тестовый чат: ответы приходят через fetch
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMessages([])}
            className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-violet-100 transition hover:bg-white"
          >
            Очистить
          </button>
        </div>

        <div className="h-[360px] overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-violet-100 ring-1 ring-white/70">
                <span className="text-xl" aria-hidden>
                  ✨
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Сообщений пока нет</p>
              <p className="mt-1 text-xs text-slate-500">
                Напиши что-нибудь и нажми «Отправить»
              </p>

              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {[
                  "Образ в стиле “old money”",
                  "Sport‑chic на каждый день",
                  "Минимализм + акцентный цвет",
                  "Тёплая палитра под лето",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-left text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-rose-400 to-violet-400 text-white shadow-sm"
                      : "mr-auto bg-white text-slate-700 ring-1 ring-violet-100",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/60 bg-white/55 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-600 ring-1 ring-violet-100 transition hover:bg-white hover:text-slate-800"
              aria-label="Прикрепить фото"
              title="Прикрепить фото"
            >
              📎
            </button>

            <div className="flex-1">
              <div className="rounded-2xl bg-white/85 ring-1 ring-violet-100 transition focus-within:ring-2 focus-within:ring-rose-200">
                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    type="text"
                    placeholder="Опиши желаемый образ…"
                    className="h-6 w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Enter — отправить. Ответ берём с jsonplaceholder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className="h-11 rounded-2xl bg-gradient-to-r from-rose-400 to-violet-400 px-4 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:from-rose-500 hover:to-violet-500 disabled:opacity-50"
            >
              {loading ? "..." : "Отправить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="lm-page-bg relative min-h-full flex-1 text-lm-text">
      <header className="relative z-10 overflow-hidden">
        <div className="pointer-events-none absolute right-10 top-24 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-10 lg:px-14 lg:pb-20 lg:pt-12">
          <div className="mb-10 flex items-center justify-between">
            <span className="text-sm font-semibold text-lm-coral">LookMAX</span>
            <a
              href="#about"
              className="text-sm font-medium text-lm-muted transition hover:text-lm-coral"
            >
              О сервисе
            </a>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
            <div className="pt-2">
              <p className="mb-3 inline-block rounded-full bg-lm-lavender px-4 py-1 text-sm font-medium text-violet-800">
                Твой ИИ-стилист
              </p>

              <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight">
                <span className="text-lm-text">Look</span>
                <span className="bg-gradient-to-r from-lm-coral to-violet-500 bg-clip-text text-transparent">
                  MAX
                </span>
              </h1>

              <p className="mt-4 max-w-md text-lg leading-relaxed text-lm-muted">
                Один чат — один образ. Напиши задачу и при желании прикрепи фото.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { t: "Офис", d: "строго, но современно" },
                  { t: "Свидание", d: "мягко и уверенно" },
                  { t: "Прогулка", d: "комфорт + стиль" },
                  { t: "Вечер", d: "акцентные детали" },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-md"
                  >
                    <p className="text-sm font-semibold text-slate-700">{x.t}</p>
                    <p className="mt-1 text-xs text-slate-500">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <LookChatDemo />
          </div>
        </div>
      </header>

      <section
        id="about"
        className="relative z-10 border-t border-white/50 bg-white/40 py-16 backdrop-blur-sm sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-lm-text sm:text-3xl">
              Что такое LookMAX?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-lm-muted sm:text-lg">
              LookMAX — первый ИИ помощник в России для тех кто любит стиль во всех
              его проявлениях. Покажите нам как вы выглядите, а мы составим вам
              образ в зависимости от вашего пола, оттенка кожи, цвета волос и даже
              самых малейших особенностей вашего тела.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Загрузи фото",
                text: "ИИ учитывает пропорции, оттенок кожи и то, что уже есть в гардеробе.",
              },
              {
                title: "Опиши образ",
                text: "Свидание, офис, отпуск — напиши своими словами, как в сообщении другу.",
              },
              {
                title: "Получи look",
                text: "Конкретные идеи, которые можно сразу повторить в магазине или из своих вещей.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-md"
              >
                <h3 className="font-semibold text-lm-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lm-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 bg-gradient-to-b from-transparent via-violet-50/40 to-rose-50/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-lm-text sm:text-3xl">
                Вдохновение и референсы для тебя
              </h2>
              <p className="mt-2 max-w-xl text-lm-muted">
                Так могут выглядеть твои образы — смело, аккуратно и по ситуации.
              </p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-violet-400 px-5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:from-rose-500 hover:to-violet-500"
            >
              Попробовать
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {STYLE_GALLERY.map((item) => (
              <figure
                key={item.src}
                className="group overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-md shadow-violet-100/40 backdrop-blur-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <figcaption className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-medium text-lm-muted">{item.alt}</span>
                  <span className="rounded-full bg-lm-lavender px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                    {item.tag}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/60 bg-white/50 py-8 text-center text-sm text-lm-muted backdrop-blur-md">
        LookMAX · ИИ помощник
      </footer>
    </div>
  );
}