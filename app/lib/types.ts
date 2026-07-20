export type Role = "user" | "assistant";

export type MarketLink = { market: string; url: string };

/** Вещь из подбора стилиста со ссылками на поиск по маркетплейсам. */
export type ProductSuggestion = {
  title: string;
  links: MarketLink[];
};

export type Msg = {
  id: string;
  role: Role;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
  products?: ProductSuggestion[];
};

export type Attachment = {
  file: File;
  url: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  tag: string;
};

/** Ответ бэкенда на POST /api/chat */
export type ChatResponse = {
  text?: string;
  image?: string | null;
  products?: ProductSuggestion[];
};
