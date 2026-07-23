const FEATURES = [
  {
    title: "Загрузи фото",
    text: "Одно фото по пояс или в полный рост. Поза и фон сохранятся.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-8 8" />
      </svg>
    ),
  },
  {
    title: "Примерь или спроси совет",
    text: "Назови вещь для примерки или спроси, что тебе идёт по внешности.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Получи образ и ссылки",
    text: "Готовый образ на тебе и ссылки, где купить вещи на маркетплейсах.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
        <div className="rounded-2xl border border-lm-line bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-lm-text sm:text-3xl">
            Что такое LookMAX?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            LookMAX — ИИ-стилист, который показывает одежду прямо на твоём фото и
            подбирает образ под твою внешность: цветотип, фигуру, повод. От
            «примерь костюм» до «что мне купить» — в одном чате.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-lm-line bg-lm-rose-softer p-5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-lm-line bg-white text-lm-rose-ink">
                  {item.icon}
                </span>
                <h3 className="mt-3 text-[14.5px] font-semibold text-lm-text">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
