/**
 * Тест на цветотип: классическая система 4 сезонов по двум осям —
 * подтон (тёплый/холодный) и глубина (светлый/глубокий).
 *
 *   тёплый + светлый  → Весна
 *   тёплый + глубокий → Осень
 *   холодный + светлый  → Лето
 *   холодный + глубокий → Зима
 *
 * Всё считается детерминированно, без модели и без сети — это бесплатный
 * крючок-в-воронку. Логика (scoreColorType) — чистая и покрыта тестами.
 */

export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

/** Баллы по осям, которые набирает вариант ответа. */
export type AxisScore = {
  warm?: number;
  cool?: number;
  light?: number;
  deep?: number;
};

export type QuizOption = { label: string; score: AxisScore };
export type QuizQuestion = { id: string; title: string; options: QuizOption[] };

export type Season = {
  key: SeasonKey;
  name: string;
  undertone: string;
  vibe: string;
  /** Палитра «твоих цветов», hex. */
  palette: string[];
  good: string;
  avoid: string;
  /** Затравка запроса для чата по кнопке «подобрать образ в этой палитре». */
  promptSeed: string;
};

/**
 * Вопросы. Первые четыре определяют подтон (он важнее и капризнее),
 * последние два — глубину. Так обе оси всегда получают сигнал.
 */
export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "veins",
    title: "Какого цвета вены на внутренней стороне запястья?",
    options: [
      { label: "Зеленоватые", score: { warm: 2 } },
      { label: "Синие или фиолетовые", score: { cool: 2 } },
      { label: "Трудно сказать, смешанные", score: { warm: 1, cool: 1 } },
    ],
  },
  {
    id: "metal",
    title: "Какие украшения тебя больше красят?",
    options: [
      { label: "Золото — кожа теплеет", score: { warm: 2 } },
      { label: "Серебро — лицо свежее", score: { cool: 2 } },
      { label: "Одинаково", score: { warm: 1, cool: 1 } },
    ],
  },
  {
    id: "sun",
    title: "Как кожа реагирует на солнце?",
    options: [
      { label: "Быстро загораю, оттенок золотистый", score: { warm: 2 } },
      { label: "Сначала краснею, загар ложится с трудом", score: { cool: 2 } },
      { label: "По-разному", score: { warm: 1, cool: 1 } },
    ],
  },
  {
    id: "hair",
    title: "Натуральный цвет волос (до окрашиваний)?",
    options: [
      {
        label: "Тёплый: медный, золотистый, тёплый каштан, пшеничный",
        score: { warm: 2 },
      },
      {
        label: "Холодный: пепельный, платиновый, иссиня-чёрный",
        score: { cool: 2 },
      },
      { label: "Нейтральный или не знаю", score: { warm: 1, cool: 1 } },
    ],
  },
  {
    id: "depth",
    title: "Как бы ты описал(а) свою внешность в целом?",
    options: [
      {
        label: "Светлая и мягкая: светлые волосы и глаза, низкий контраст",
        score: { light: 2 },
      },
      {
        label: "Тёмная и контрастная: тёмные волосы заметно ярче кожи",
        score: { deep: 2 },
      },
      { label: "Средняя", score: { light: 1, deep: 1 } },
    ],
  },
  {
    id: "colors",
    title: "Какие оттенки одежды тебя оживляют?",
    options: [
      { label: "Пастельные, припылённые, мягкие", score: { light: 2 } },
      { label: "Насыщенные, глубокие, яркие", score: { deep: 2 } },
      { label: "Нейтральные, базовые", score: { light: 1, deep: 1 } },
    ],
  },
];

export const SEASONS: Record<SeasonKey, Season> = {
  spring: {
    key: "spring",
    name: "Тёплая весна",
    undertone: "тёплый светлый подтон",
    vibe: "Тебе идут тёплые, светлые и ясные краски — они добавляют лицу свежести. Тёмные и мрачные оттенки, наоборот, утяжеляют.",
    palette: ["#ff8c69", "#ffb84d", "#f4c95d", "#a8c66c", "#4fc0b0", "#e8a87c", "#fbe7c6"],
    good: "коралл, тёплый жёлтый, персик, тёплая зелень, бирюза",
    avoid: "чёрный, тёмно-бордовый, холодный серый",
    promptSeed:
      "Подбери образ в тёплой весенней палитре: коралл, персик, тёплый жёлтый, светлая бирюза",
  },
  summer: {
    key: "summer",
    name: "Холодное лето",
    undertone: "холодный светлый подтон",
    vibe: "Тебе к лицу прохладные, припылённые, мягкие оттенки — они делают образ гармоничным. Яркое и тёплое смотрится грубовато.",
    palette: ["#e7a9c0", "#b7a9d6", "#9db4ce", "#a8cbb7", "#c9b6d8", "#8296b0", "#d8c2cb"],
    good: "пудровый розовый, лаванда, серо-голубой, мята, сирень",
    avoid: "оранжевый, горчичный, тёплый беж, чёрный у лица",
    promptSeed:
      "Подбери образ в холодной летней палитре: пудровый розовый, лаванда, серо-голубой, мята",
  },
  autumn: {
    key: "autumn",
    name: "Тёплая осень",
    undertone: "тёплый глубокий подтон",
    vibe: "Тебе идут глубокие, приглушённые, землистые оттенки — они делают кожу сияющей. Холодный неон и чёрный у лица, наоборот, гасят.",
    palette: ["#c56b4e", "#c99a3b", "#7c7a3f", "#a6532e", "#2e6e6a", "#6e4b34", "#ead9b8"],
    good: "терракота, олива, горчичный, тёплый беж, ржавый",
    avoid: "чёрный, фуксия, ледяной голубой",
    promptSeed:
      "Подбери образ в тёплой осенней палитре: терракота, олива, горчичный, тёплый беж",
  },
  winter: {
    key: "winter",
    name: "Холодная зима",
    undertone: "холодный глубокий подтон",
    vibe: "Тебе к лицу чистые, контрастные и насыщенные цвета — они держат яркую внешность. Приглушённое и тёплое тебя бледнит.",
    palette: ["#1f2937", "#f5f5f7", "#2557d6", "#0e8f6e", "#d6247a", "#7fd3e8", "#b0184a"],
    good: "чёрный, чистый белый, ярко-синий, изумруд, фуксия",
    avoid: "горчичный, терракота, тёплый беж, припылённые тона",
    promptSeed:
      "Подбери образ в холодной зимней палитре: чёрный, чистый белый, ярко-синий, изумруд",
  },
};

/**
 * Считает цветотип по выбранным вариантам (answers[i] — индекс варианта в
 * QUESTIONS[i]). Некорректные/неполные индексы просто игнорируются.
 *
 * Ничьи разрешаются детерминированно: подтон → тёплый, глубина → светлый
 * (то есть при полностью нейтральных ответах результат — «Тёплая весна»).
 */
export const scoreColorType = (answers: readonly number[]): SeasonKey => {
  const total = { warm: 0, cool: 0, light: 0, deep: 0 };

  QUESTIONS.forEach((question, i) => {
    const option = question.options[answers[i] ?? -1];
    if (!option) return;
    total.warm += option.score.warm ?? 0;
    total.cool += option.score.cool ?? 0;
    total.light += option.score.light ?? 0;
    total.deep += option.score.deep ?? 0;
  });

  const isWarm = total.warm >= total.cool;
  const isLight = total.light >= total.deep;

  if (isWarm) return isLight ? "spring" : "autumn";
  return isLight ? "summer" : "winter";
};
