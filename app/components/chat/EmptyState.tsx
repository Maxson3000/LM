"use client";

import { useChatActions } from "./ChatProvider";

function HangerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" className="h-[21px] w-[21px]">
      <path d="M12 3a2 2 0 0 0-1 3.7L3.5 12 3 20h18l-.5-8-7.5-5.3A2 2 0 0 0 12 3z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[21px] w-[21px]">
      <path d="M12 3l1.6 3.9L18 8l-3.3 2.9L15.5 15 12 12.8 8.5 15l.8-4.1L6 8l4.4-1.1z" />
      <path d="M5 19l1.2-2.5M19 19l-1.2-2.5" />
    </svg>
  );
}

type Mode = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  chips: string[];
};

const MODES: Mode[] = [
  {
    icon: <HangerIcon />,
    title: "Примерить образ",
    desc: "Назови вещь или стиль — покажем прямо на твоём фото, сохранив позу и фон.",
    chips: ["примерь деловой костюм", "одень в тотал-блэк"],
  },
  {
    icon: <SparkleIcon />,
    title: "Подобрать под внешность",
    desc: "Стилист учтёт цветотип и фигуру, соберёт образ и даст ссылки, где купить вещи.",
    chips: ["что мне пойдёт?", "собери образ на осень"],
  },
];

export function EmptyState() {
  const { setInput } = useChatActions();

  const pick = (text: string) => {
    setInput(text);
    document.getElementById("messageInput")?.focus();
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-6">
      <div className="mb-7 text-center">
        <p className="text-lg font-bold tracking-tight text-lm-text sm:text-[22px]">
          С чего начнём?
        </p>
        <p className="mt-2 text-sm text-slate-500">
          LookMAX умеет две вещи — выбери, что нужно сейчас.
        </p>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <div
            key={mode.title}
            className="flex flex-col gap-2.5 rounded-2xl border border-lm-line bg-white p-5 transition hover:border-lm-rose hover:shadow-md hover:shadow-violet-100/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lm-rose-soft text-lm-rose-ink">
              {mode.icon}
            </span>
            <h3 className="text-[15.5px] font-semibold tracking-tight text-lm-text">
              {mode.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-slate-600">
              {mode.desc}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {mode.chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => pick(chip)}
                  className="rounded-full border border-lm-line bg-lm-rose-softer px-3 py-1.5 text-[12.5px] text-slate-600 transition hover:border-lm-rose hover:bg-lm-rose-soft hover:text-lm-text"
                >
                  «{chip}»
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
