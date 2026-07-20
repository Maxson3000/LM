import type { GalleryItem } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const MAX_ATTACHMENTS = 8;

export const STYLE_GALLERY: readonly GalleryItem[] = [
  { src: "/Galery/1.jpg", alt: "Уличный casual", tag: "Casual" },
  { src: "/Galery/2.jpg", alt: "Минимализм", tag: "Minimal" },
  { src: "/Galery/3.jpg", alt: "Летний образ", tag: "Summer" },
  { src: "/Galery/4.jpg", alt: "Деловой стиль", tag: "Smart" },
  { src: "/Galery/5.jpg", alt: "Вечерний look", tag: "Evening" },
  { src: "/Galery/6.jpg", alt: "Акцентные цвета", tag: "Bold" },
];

export const SUGGESTIONS: readonly string[] = [
  "Образ в стиле “old money”",
  "Sport‑chic на каждый день",
  "Минимализм + акцентный цвет",
  "Тёплая палитра под лето",
  "Образ для собеседования",
  "Вечерний casual без перегиба",
];

/**
 * Стадии генерации. `at` — сколько мс от начала запроса показывать эту подпись.
 * Пороги подобраны под реальные замеры: валидация ~3-8с, генерация ~20-30с.
 */
export const LOADING_STAGES: readonly { at: number; text: string }[] = [
  { at: 0, text: "Загружаем фото" },
  { at: 2_000, text: "Проверяем фото и запрос" },
  { at: 8_000, text: "Подбираем образ" },
  { at: 16_000, text: "Примеряем одежду" },
  { at: 30_000, text: "Наводим финальный лоск" },
];
