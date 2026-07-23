"use client";

import { useState } from "react";
import {
  QUESTIONS,
  SEASONS,
  scoreColorType,
  type Season,
} from "../../lib/colortype";
import { useChatActions } from "../chat/ChatProvider";

type Step = "intro" | number | "result";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

function IntroCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-6 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lm-rose-ink">
        Бесплатно · без фото · 1 минута
      </p>
      <h3 className="mt-2 text-xl font-bold tracking-tight text-lm-text sm:text-[22px]">
        Узнай свой цветотип
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Шесть вопросов о внешности — соберём палитру, которая тебе идёт, и образ под неё.
      </p>
      <div className="mt-4 flex gap-4 text-[12.5px] text-slate-400">
        <span><b className="font-bold tabular-nums text-slate-600">6</b> вопросов</span>
        <span><b className="font-bold tabular-nums text-slate-600">~60</b> секунд</span>
        <span><b className="font-bold tabular-nums text-slate-600">4</b> цветотипа</span>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-lm-rose px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-lm-rose-ink"
      >
        Пройти тест
        <ArrowIcon />
      </button>
    </div>
  );
}

function QuestionCard({
  index,
  onAnswer,
  onBack,
}: {
  index: number;
  onAnswer: (optionIndex: number) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[index]!;
  const progress = ((index + 1) / QUESTIONS.length) * 100;

  return (
    <div className="p-6 sm:p-7">
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold tracking-wide text-slate-400">
        <span>Вопрос {index + 1} из {QUESTIONS.length}</span>
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 transition hover:text-lm-rose-ink"
        >
          Назад
        </button>
      </div>
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-lm-rose-soft">
        <div
          className="h-full rounded-full bg-lm-rose transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="mb-4 text-base font-semibold tracking-tight text-lm-text">
        {question.title}
      </h3>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option, i) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onAnswer(i)}
            className="flex items-center gap-3 rounded-xl border border-lm-line-strong bg-white px-3.5 py-3 text-left text-sm text-lm-text transition hover:border-lm-rose hover:bg-lm-rose-softer"
          >
            <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-lm-line-strong" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  season,
  onRestart,
}: {
  season: Season;
  onRestart: () => void;
}) {
  const { setInput } = useChatActions();

  const tryPalette = () => {
    setInput(season.promptSeed);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("messageInput")?.focus();
  };

  const share = async () => {
    const text = `Мой цветотип — ${season.name}. Узнай свой на LookMAX.`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "LookMAX", text, url });
        return;
      } catch {
        // пользователь отменил шеринг — молча выходим
        return;
      }
    }
    // Фолбэк для десктопа: шеринг в Telegram
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tg, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="lm-stage p-6 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Твой цветотип
      </p>
      <h3 className="mt-1.5 text-[26px] font-bold tracking-tight text-lm-text">
        {season.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{season.vibe}</p>

      <div
        className="my-5 flex overflow-hidden rounded-xl border border-lm-line"
        role="img"
        aria-label={`Палитра: ${season.good}`}
      >
        {season.palette.map((hex) => (
          <span key={hex} className="h-[54px] flex-1" style={{ background: hex }} />
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-1.5 text-[13.5px] text-slate-600">
        <p><span className="font-bold text-emerald-600">+</span> {season.good}</p>
        <p><span className="font-bold text-lm-rose-ink">–</span> {season.avoid}</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={tryPalette}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-lm-rose px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-lm-rose-ink"
          style={{ minWidth: "190px" }}
        >
          <ArrowIcon />
          Подобрать образ в этой палитре
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-xl border border-lm-line-strong bg-white px-4 py-3 text-sm font-semibold text-lm-text transition hover:border-lm-rose hover:text-lm-rose-ink"
        >
          <ShareIcon />
          Поделиться
        </button>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-4 text-xs font-medium text-slate-400 transition hover:text-lm-rose-ink"
      >
        Пройти заново
      </button>
    </div>
  );
}

export function ColorTypeQuiz() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<number[]>([]);

  const answer = (optionIndex: number) => {
    if (typeof step !== "number") return;
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);
    setStep(step + 1 >= QUESTIONS.length ? "result" : step + 1);
  };

  const back = () => {
    if (step === 0) setStep("intro");
    else if (typeof step === "number") setStep(step - 1);
  };

  const restart = () => {
    setAnswers([]);
    setStep("intro");
  };

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-lm-line bg-white shadow-md shadow-violet-100/40">
      {step === "intro" && <IntroCard onStart={() => setStep(0)} />}
      {typeof step === "number" && (
        <QuestionCard index={step} onAnswer={answer} onBack={back} />
      )}
      {step === "result" && (
        <ResultCard season={SEASONS[scoreColorType(answers)]} onRestart={restart} />
      )}
    </div>
  );
}
