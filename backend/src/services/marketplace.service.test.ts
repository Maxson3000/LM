import { describe, expect, it } from "vitest"
import { buildSearchLinks } from "./marketplace.service.js"

describe("buildSearchLinks", () => {
  it("собирает ссылки на WB и Ozon с закодированным запросом", () => {
    const links = buildSearchLinks("белая льняная рубашка мужская")

    expect(links).toHaveLength(2)
    const wb = links.find((l) => l.market === "Wildberries")!
    const ozon = links.find((l) => l.market === "Ozon")!
    // Кириллица и пробелы обязаны быть закодированы — иначе URL битый
    expect(wb.url).toBe(
      "https://www.wildberries.ru/catalog/0/search.aspx?search=%D0%B1%D0%B5%D0%BB%D0%B0%D1%8F%20%D0%BB%D1%8C%D0%BD%D1%8F%D0%BD%D0%B0%D1%8F%20%D1%80%D1%83%D0%B1%D0%B0%D1%88%D0%BA%D0%B0%20%D0%BC%D1%83%D0%B6%D1%81%D0%BA%D0%B0%D1%8F",
    )
    expect(ozon.url).toContain("https://www.ozon.ru/search/?text=")
    expect(ozon.url).not.toContain(" ")
  })

  it("экранирует спецсимволы, ломающие URL", () => {
    const [wb] = buildSearchLinks("джинсы & рубашка #1 100%")
    expect(wb!.url).not.toMatch(/[&#% ]([^0-9A-F]|$)/i)
    expect(wb!.url).toContain("%26") // &
    expect(wb!.url).toContain("%23") // #
  })

  it("пустой и пробельный запрос -> ссылок нет", () => {
    expect(buildSearchLinks("")).toEqual([])
    expect(buildSearchLinks("   ")).toEqual([])
  })

  it("обрезает крайние пробелы запроса", () => {
    const [wb] = buildSearchLinks("  пальто  ")
    expect(wb!.url.endsWith("search=%D0%BF%D0%B0%D0%BB%D1%8C%D1%82%D0%BE")).toBe(true)
  })
})
