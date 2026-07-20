/**
 * Поисковые ссылки на маркетплейсы.
 *
 * Намеренно НЕ ссылки на конкретные товары: LLM не знает реальных артикулов и
 * выдумывает URL. Поисковая выдача по хорошему запросу работает всегда и не
 * требует партнёрских API.
 */

export type MarketLink = { market: string; url: string }

export type ProductSuggestion = {
  title: string
  links: MarketLink[]
}

export const buildSearchLinks = (query: string): MarketLink[] => {
  const q = query.trim()
  if (q.length === 0) return []
  return [
    {
      market: "Wildberries",
      url: `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(q)}`,
    },
    {
      market: "Ozon",
      url: `https://www.ozon.ru/search/?text=${encodeURIComponent(q)}`,
    },
  ]
}
