const FEATURES = [
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
];

export function AboutSection() {
  return (
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
          {FEATURES.map((item) => (
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
  );
}
