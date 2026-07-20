import { beforeEach, describe, expect, it, vi } from "vitest"

// Заглушки для сервисов: проверяем маршрутизацию chat.service, а не сами модели.
const validateRequest = vi.fn()
const adviseOutfit = vi.fn()
const generateDressedImage = vi.fn()
const isConfigured = vi.fn(() => true)

vi.mock("../../services/routerai.service.js", () => ({
  validateRequest: (...a: unknown[]) => validateRequest(...a),
  adviseOutfit: (...a: unknown[]) => adviseOutfit(...a),
  generateDressedImage: (...a: unknown[]) => generateDressedImage(...a),
  isConfigured: () => isConfigured(),
}))

const { chatService } = await import("./chat.service.js")

const fakeFile = () => ({ buffer: Buffer.from("x") }) as Express.Multer.File
const input = (text: string) => ({
  text,
  rawMessages: "[]",
  files: [fakeFile()],
})

beforeEach(() => {
  validateRequest.mockReset()
  adviseOutfit.mockReset()
  generateDressedImage.mockReset()
  isConfigured.mockReturnValue(true)
})

describe("chatService.process — маршрутизация", () => {
  it("без фото не зовёт модель и просит фото", async () => {
    const res = await chatService.process({ text: "костюм", rawMessages: "[]", files: [] })

    expect(res.image).toBeNull()
    expect(res.text).toMatch(/фотографию/i)
    expect(validateRequest).not.toHaveBeenCalled()
  })

  it("отказ валидатора отдаёт причину, без генерации", async () => {
    validateRequest.mockResolvedValue({ ok: false, reason: "нет человека", intent: "tryon" })

    const res = await chatService.process(input("что-то"))

    expect(res.text).toContain("нет человека")
    expect(generateDressedImage).not.toHaveBeenCalled()
    expect(adviseOutfit).not.toHaveBeenCalled()
  })
})

describe("chatService.process — примерка (tryon)", () => {
  it("генерит образ и возвращает картинку", async () => {
    validateRequest.mockResolvedValue({
      ok: true,
      reason: "",
      intent: "tryon",
      generationPrompt: "Отредактируй это фото...",
    })
    generateDressedImage.mockResolvedValue({ text: "", imageBuffer: Buffer.from("img") })

    const res = await chatService.process(input("деловой костюм"))

    expect(res.image).toBeInstanceOf(Buffer)
    expect(adviseOutfit).not.toHaveBeenCalled()
  })
})

describe("chatService.process — подбор (advice)", () => {
  const advice = {
    text: "Вам идут тёплые тона.",
    items: [
      { title: "Чиносы", query: "чиносы бежевые мужские" },
      { title: "Рубашка", query: "рубашка льняная белая мужская" },
    ],
    generationPrompt: "Отредактируй это фото: замени одежду на чиносы и рубашку",
  }

  it("рисует главный образ И возвращает совет + ссылки", async () => {
    validateRequest.mockResolvedValue({ ok: true, reason: "", intent: "advice" })
    adviseOutfit.mockResolvedValue(advice)
    generateDressedImage.mockResolvedValue({ text: "", imageBuffer: Buffer.from("look") })

    const res = await chatService.process(input("что мне пойдёт?"))

    // картинка сгенерилась из промпта стилиста
    expect(generateDressedImage).toHaveBeenCalledOnce()
    expect(generateDressedImage.mock.calls[0]![3]).toBe(advice.generationPrompt)
    expect(res.image).toBeInstanceOf(Buffer)
    // совет и ссылки на месте
    expect(res.text).toBe("Вам идут тёплые тона.")
    expect(res.products).toHaveLength(2)
    expect(res.products![0]!.links.length).toBeGreaterThan(0)
  })

  it("если генерация картинки не удалась — совет и ссылки всё равно уходят", async () => {
    validateRequest.mockResolvedValue({ ok: true, reason: "", intent: "advice" })
    adviseOutfit.mockResolvedValue(advice)
    generateDressedImage.mockResolvedValue({ text: "", imageBuffer: null })

    const res = await chatService.process(input("подбери"))

    expect(res.image).toBeNull()
    expect(res.text).toBe("Вам идут тёплые тона.")
    expect(res.products).toHaveLength(2)
  })

  it("нет generationPrompt — генерацию не зовём, отдаём текст и ссылки", async () => {
    validateRequest.mockResolvedValue({ ok: true, reason: "", intent: "advice" })
    adviseOutfit.mockResolvedValue({ ...advice, generationPrompt: undefined })

    const res = await chatService.process(input("подбери"))

    expect(generateDressedImage).not.toHaveBeenCalled()
    expect(res.image).toBeNull()
    expect(res.products).toHaveLength(2)
  })
})
