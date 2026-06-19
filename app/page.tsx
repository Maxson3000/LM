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
type Msg = {
  id: string;
  role: Role;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type GalleryItem = (typeof STYLE_GALLERY)[number];

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type LookChatProps = {
  messages: Msg[];
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  onAddReference: (item: GalleryItem) => void;
};

function LookChatDemo({ messages, setMessages, onAddReference }: LookChatProps) {
  const [input, setInput] = useState("");
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

  const suggestions = [
    "Образ в стиле “old money”",
    "Sport‑chic на каждый день",
    "Минимализм + акцентный цвет",
    "Тёплая палитра под лето",
    "Образ для собеседования",
    "Вечерний casual без перегиба",
  ];

  return (
    <div id="chat" className="relative flex min-h-[calc(100vh-7rem)] flex-col sm:min-h-[calc(100vh-6rem)]">
      <div className="pointer-events-none absolute -inset-1 rounded-[22px] bg-gradient-to-r from-rose-200/70 via-violet-200/70 to-sky-200/70 blur-xl" />

      <div className="relative flex min-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/75 shadow-xl shadow-violet-200/40 backdrop-blur-xl sm:min-h-[calc(100vh-6rem)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/60 px-4 py-3 sm:px-6 sm:py-4">
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
            onClick={() => setMessages([])}
            className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-violet-100 transition hover:bg-white sm:text-xs"
          >
            Новый чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {messages.length === 0 ? (
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
                {suggestions.map((s) => (
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
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "max-w-[85%] overflow-hidden rounded-2xl text-sm leading-relaxed sm:text-[15px]",
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-rose-400 to-violet-400 text-white shadow-sm"
                      : "mr-auto bg-white text-slate-700 ring-1 ring-violet-100",
                  ].join(" ")}
                >
                  {m.imageSrc && (
                    <div className="p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imageSrc}
                        alt={m.imageAlt ?? "Референс"}
                        className="max-h-56 w-full rounded-xl object-cover"
                      />
                    </div>
                  )}
                  {m.text && (
                    <p className="px-4 py-2.5">{m.text}</p>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm text-slate-500 ring-1 ring-violet-100">
                  ...
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/60 bg-white/55 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-slate-600 ring-1 ring-violet-100 transition hover:bg-white hover:text-slate-800"
              aria-label="Прикрепить фото"
              title="Прикрепить фото"
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
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    type="text"
                    placeholder="Опиши желаемый образ…"
                    className="h-6 w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none sm:text-[15px]"
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
              {loading ? "..." : "Отправить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);

  function addReferenceToChat(item: GalleryItem) {
    const refMsg: Msg = {
      id: uid(),
      role: "user",
      text: `Референс: ${item.alt} (${item.tag})`,
      imageSrc: item.src,
      imageAlt: item.alt,
    };

    setMessages((m) => [...m, refMsg]);

    // прокрутка к чату, чтобы пользователь увидел добавленный референс
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="lm-page-bg relative min-h-full flex-1 text-lm-text">
      <section className="relative z-10 min-h-screen">
        <div className="pointer-events-none absolute right-10 top-24 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-1/3 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                <span className="text-lm-text">Look</span>
                <span className="bg-gradient-to-r from-lm-coral to-violet-500 bg-clip-text text-transparent">
                  MAX
                </span>
              </h1>
              <span className="hidden rounded-full bg-lm-lavender px-3 py-1 text-xs font-medium text-violet-800 sm:inline">
                ИИ-стилист
              </span>
            </div>

            <a
              href="#about"
              className="shrink-0 text-sm font-medium text-lm-muted transition hover:text-lm-coral"
            >
              О сервисе ↓
            </a>
          </div>

          <LookChatDemo
            messages={messages}
            setMessages={setMessages}
            onAddReference={addReferenceToChat}
          />
        </div>
      </section>

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
                Нажми на референс — он появится в чате
              </p>
            </div>
            <a
              href="#chat"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-violet-400 px-5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:from-rose-500 hover:to-violet-500"
            >
              К чату ↑
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {STYLE_GALLERY.map((item) => (
              <button
                key={item.src}
                type="button"
                onClick={() => addReferenceToChat(item)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/70 bg-white/80 text-left shadow-md shadow-violet-100/40 backdrop-blur-sm transition hover:ring-2 hover:ring-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-medium text-lm-muted">{item.alt}</span>
                  <span className="rounded-full bg-lm-lavender px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                    {item.tag}
                  </span>
                </div>
              </button>
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