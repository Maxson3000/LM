import { ColorTypeQuiz } from "./ColorTypeQuiz";

export function ColorTypeSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lm-rose-ink">
            Тест
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-lm-text sm:text-3xl">
            Какие цвета тебе идут?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Пройди короткий тест на цветотип — и получи палитру своих цветов и образ под неё.
          </p>
        </div>

        <ColorTypeQuiz />
      </div>
    </section>
  );
}
