import { describe, expect, it } from "vitest";
import { QUESTIONS, SEASONS, scoreColorType } from "./colortype";

// Индексы вариантов в каждом вопросе (см. QUESTIONS):
// вопросы 0-3 (подтон): 0=тёплый, 1=холодный, 2=нейтр
// вопросы 4-5 (глубина): 0=светлый, 1=глубокий, 2=средн
const WARM = 0;
const COOL = 1;
const NEUTRAL = 2;
const LIGHT = 0;
const DEEP = 1;

describe("scoreColorType — четыре чистых профиля", () => {
  it("тёплый + светлый → Весна", () => {
    expect(scoreColorType([WARM, WARM, WARM, WARM, LIGHT, LIGHT])).toBe("spring");
  });

  it("тёплый + глубокий → Осень", () => {
    expect(scoreColorType([WARM, WARM, WARM, WARM, DEEP, DEEP])).toBe("autumn");
  });

  it("холодный + светлый → Лето", () => {
    expect(scoreColorType([COOL, COOL, COOL, COOL, LIGHT, LIGHT])).toBe("summer");
  });

  it("холодный + глубокий → Зима", () => {
    expect(scoreColorType([COOL, COOL, COOL, COOL, DEEP, DEEP])).toBe("winter");
  });
});

describe("scoreColorType — смешанные ответы решает большинство", () => {
  it("перевес тёплого + глубина → Осень", () => {
    // 3 тёплых, 1 холодный по подтону; глубокий по глубине
    expect(scoreColorType([WARM, WARM, WARM, COOL, DEEP, DEEP])).toBe("autumn");
  });

  it("перевес холодного + светлый → Лето", () => {
    expect(scoreColorType([COOL, COOL, COOL, WARM, LIGHT, NEUTRAL])).toBe("summer");
  });
});

describe("scoreColorType — ничьи разрешаются детерминированно", () => {
  it("полностью нейтральные ответы → Весна (тёплый+светлый по умолчанию)", () => {
    expect(scoreColorType([NEUTRAL, NEUTRAL, NEUTRAL, NEUTRAL, NEUTRAL, NEUTRAL])).toBe(
      "spring",
    );
  });

  it("ровный подтон, перевес глубины → Осень (подтон→тёплый)", () => {
    // подтон 2 тёплых + 2 холодных = ничья → тёплый; глубина глубокая
    expect(scoreColorType([WARM, WARM, COOL, COOL, DEEP, DEEP])).toBe("autumn");
  });
});

describe("scoreColorType — устойчивость", () => {
  it("пустой массив → дефолт Весна, без падения", () => {
    expect(scoreColorType([])).toBe("spring");
  });

  it("индексы вне диапазона игнорируются", () => {
    expect(scoreColorType([99, -1, WARM, WARM, DEEP, DEEP])).toBe("autumn");
  });

  it("лишние ответы сверх числа вопросов не ломают подсчёт", () => {
    const answers = [COOL, COOL, COOL, COOL, DEEP, DEEP, 0, 1, 0];
    expect(scoreColorType(answers)).toBe("winter");
  });
});

describe("данные согласованы", () => {
  it("6 вопросов, у каждого 3 варианта", () => {
    expect(QUESTIONS).toHaveLength(6);
    for (const q of QUESTIONS) expect(q.options).toHaveLength(3);
  });

  it("у каждого сезона непустая палитра и затравка для чата", () => {
    for (const key of ["spring", "summer", "autumn", "winter"] as const) {
      const s = SEASONS[key];
      expect(s.palette.length).toBeGreaterThanOrEqual(5);
      expect(s.promptSeed.length).toBeGreaterThan(20);
      // все цвета — валидный hex
      for (const c of s.palette) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
