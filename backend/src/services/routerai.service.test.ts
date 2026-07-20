import sharp from "sharp"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Модели-заглушки: сеть не трогаем, проверяем логику вокруг неё.
const chatCompletions = vi.fn()
const generateImage = vi.fn()

vi.mock("../config/fetch-routerai.js", () => ({
  chatCompletions: (...a: unknown[]) => chatCompletions(...a),
  generateImage: (...a: unknown[]) => generateImage(...a),
}))
vi.mock("../config/env.js", () => ({
  config: {
    routerai: {
      apiKey: "test-key",
      baseUrl: "https://api.test/v1",
      validationModel: "test/validator",
      generationModel: "test/generator",
    },
  },
}))

const { validateRequest, generateDressedImage, adviseOutfit } = await import(
  "./routerai.service.js"
)

const makePhoto = async (width: number, height: number) =>
  ({
    buffer: await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 120, g: 100, b: 90 },
      },
    })
      .jpeg()
      .toBuffer(),
    mimetype: "image/jpeg",
    originalname: "photo.jpg",
  }) as Express.Multer.File

const validatorReplies = (content: string) =>
  chatCompletions.mockResolvedValue({ choices: [{ message: { content } }] })

/** Достаёт data-URL'ы картинок из аргументов вызова chatCompletions. */
const sentImageUrls = (): string[] => {
  const messages = chatCompletions.mock.calls[0]![1] as {
    content: { type: string; image_url?: { url: string } }[]
  }[]
  return messages[0]!.content
    .filter((p) => p.type === "image_url")
    .map((p) => p.image_url!.url)
}

const decodeSent = async (url: string) =>
  sharp(Buffer.from(url.split(",")[1]!, "base64")).metadata()

beforeEach(() => {
  chatCompletions.mockReset()
  generateImage.mockReset()
})
afterEach(() => vi.restoreAllMocks())

describe("validateRequest", () => {
  it("без фото не ходит в модель вообще", async () => {
    const res = await validateRequest("деловой костюм", [])

    expect(res.ok).toBe(false)
    expect(chatCompletions).not.toHaveBeenCalled()
  })

  // Исходный баг: фото с телефона (4032x3024, ~8MB) уходило в base64 как есть,
  // запрос зависал и падал по таймауту.
  it("ужимает большое фото до 1536px перед отправкой", async () => {
    validatorReplies('{"ok": true, "reason": ""}')

    await validateRequest("деловой костюм", [await makePhoto(4032, 3024)])

    const meta = await decodeSent(sentImageUrls()[0]!)
    expect(Math.max(meta.width!, meta.height!)).toBe(1536)
  })

  it("не растягивает фото меньше лимита", async () => {
    validatorReplies('{"ok": true, "reason": ""}')

    await validateRequest("деловой костюм", [await makePhoto(600, 800)])

    const meta = await decodeSent(sentImageUrls()[0]!)
    expect([meta.width, meta.height]).toEqual([600, 800])
  })

  it("шлёт все фото: человека и референсы", async () => {
    validatorReplies('{"ok": true, "reason": ""}')

    await validateRequest("образ", [
      await makePhoto(400, 500),
      await makePhoto(400, 500),
      await makePhoto(400, 500),
    ])

    expect(sentImageUrls()).toHaveLength(3)
  })

  it("разбирает JSON модели с normalizedText и generationPrompt", async () => {
    validatorReplies(
      '{"ok": true, "reason": "", "normalizedText": "деловой", "generationPrompt": "Отредактируй это фото: замени одежду на костюм"}',
    )

    const res = await validateRequest("деловой", [await makePhoto(400, 500)])

    expect(res.ok).toBe(true)
    expect(res.normalizedText).toBe("деловой")
    expect(res.generationPrompt).toContain("Отредактируй")
  })

  it("вытаскивает JSON из markdown-обёртки", async () => {
    validatorReplies('```json\n{"ok": true, "reason": ""}\n```')

    expect((await validateRequest("образ", [await makePhoto(400, 500)])).ok).toBe(
      true,
    )
  })

  it("отказ модели пробрасывает вместе с причиной", async () => {
    validatorReplies('{"ok": false, "reason": "на фото нет человека"}')

    const res = await validateRequest("образ", [await makePhoto(400, 500)])

    expect(res.ok).toBe(false)
    expect(res.reason).toBe("на фото нет человека")
  })

  it("на мусор вместо JSON не падает и не пропускает запрос", async () => {
    validatorReplies("я не смог разобрать этот запрос")

    const res = await validateRequest("образ", [await makePhoto(400, 500)])

    expect(res.ok).toBe(false)
    expect(res.reason.length).toBeGreaterThan(0)
  })

  it("не пропускает ok=true, пришедший строкой", async () => {
    validatorReplies('{"ok": "true", "reason": ""}')

    expect((await validateRequest("образ", [await makePhoto(400, 500)])).ok).toBe(
      false,
    )
  })

  it("разбирает intent=advice", async () => {
    validatorReplies('{"ok": true, "reason": "", "intent": "advice"}')

    const res = await validateRequest("что мне пойдёт?", [await makePhoto(400, 500)])

    expect(res.ok).toBe(true)
    expect(res.intent).toBe("advice")
  })

  it("intent по умолчанию tryon: отсутствует или мусорный", async () => {
    validatorReplies('{"ok": true, "reason": ""}')
    expect(
      (await validateRequest("образ", [await makePhoto(400, 500)])).intent,
    ).toBe("tryon")

    chatCompletions.mockReset()
    validatorReplies('{"ok": true, "reason": "", "intent": "banana"}')
    expect(
      (await validateRequest("образ", [await makePhoto(400, 500)])).intent,
    ).toBe("tryon")
  })
})

describe("adviseOutfit", () => {
  const stylistReplies = (content: string) =>
    chatCompletions.mockResolvedValue({ choices: [{ message: { content } }] })

  it("разбирает советы и список вещей", async () => {
    stylistReplies(
      JSON.stringify({
        advice: "Вам идут тёплые оттенки.",
        items: [
          { title: "Льняная рубашка", query: "рубашка льняная бежевая мужская" },
          { title: "Чиносы", query: "чиносы бежевые мужские" },
        ],
      }),
    )

    const res = await adviseOutfit(await makePhoto(400, 500), "что мне пойдёт?")

    expect(res.text).toBe("Вам идут тёплые оттенки.")
    expect(res.items).toEqual([
      { title: "Льняная рубашка", query: "рубашка льняная бежевая мужская" },
      { title: "Чиносы", query: "чиносы бежевые мужские" },
    ])
  })

  it("отбрасывает битые элементы items, не роняя остальное", async () => {
    stylistReplies(
      JSON.stringify({
        advice: "Совет.",
        items: [
          { title: "Рубашка", query: "рубашка" },
          { title: 42 }, // мусор
          "строка", // мусор
          { query: "без названия" }, // мусор
        ],
      }),
    )

    const res = await adviseOutfit(await makePhoto(400, 500), "подбери")

    expect(res.items).toEqual([{ title: "Рубашка", query: "рубашка" }])
  })

  it("на не-JSON отдаёт сырой текст без items, а не ошибку", async () => {
    stylistReplies("Вам подойдут пастельные тона и прямой крой.")

    const res = await adviseOutfit(await makePhoto(400, 500), "подбери")

    expect(res.text).toBe("Вам подойдут пастельные тона и прямой крой.")
    expect(res.items).toEqual([])
  })

  it("передаёт фото в модель", async () => {
    stylistReplies('{"advice": "ок", "items": []}')

    await adviseOutfit(await makePhoto(400, 500), "подбери")

    const messages = chatCompletions.mock.calls[0]![1] as {
      content: { type: string }[]
    }[]
    expect(
      messages[0]!.content.filter((p) => p.type === "image_url"),
    ).toHaveLength(1)
  })

  it("разбирает generationPrompt для примерки главного образа", async () => {
    stylistReplies(
      JSON.stringify({
        advice: "Совет.",
        items: [{ title: "Рубашка", query: "рубашка" }],
        generationPrompt:
          "Отредактируй это фото: замени одежду человека на бежевые чиносы, белую льняную рубашку и коричневые лоферы",
      }),
    )

    const res = await adviseOutfit(await makePhoto(400, 500), "на свидание")

    expect(res.generationPrompt).toContain("Отредактируй это фото")
    expect(res.generationPrompt).toContain("чиносы")
  })

  it("игнорирует слишком короткий generationPrompt", async () => {
    stylistReplies(
      JSON.stringify({ advice: "Совет.", items: [], generationPrompt: "костюм" }),
    )

    const res = await adviseOutfit(await makePhoto(400, 500), "подбери")

    expect(res.generationPrompt).toBeUndefined()
  })

  it("без generationPrompt в ответе — поле undefined, остальное на месте", async () => {
    stylistReplies('{"advice": "Совет.", "items": []}')

    const res = await adviseOutfit(await makePhoto(400, 500), "подбери")

    expect(res.text).toBe("Совет.")
    expect(res.generationPrompt).toBeUndefined()
  })
})

describe("generateDressedImage", () => {
  const okImage = async () => ({
    data: [
      {
        b64_json: (await sharp({
          create: {
            width: 64,
            height: 64,
            channels: 3,
            background: { r: 1, g: 2, b: 3 },
          },
        })
          .jpeg()
          .toBuffer()) .toString("base64"),
      },
    ],
  })

  const promptSentToModel = (): string =>
    generateImage.mock.calls[0]![1] as string

  // Суть фикса «фото должно остаться тем же»: без этой оговорки модель рисует
  // новое фото, и уезжают поза, ракурс и фон.
  it("всегда дописывает оговорку о сохранении оригинала", async () => {
    generateImage.mockResolvedValue(await okImage())

    await generateDressedImage(await makePhoto(400, 500), "деловой костюм")

    const prompt = promptSentToModel()
    expect(prompt).toMatch(/Сохрани без единого изменения/)
    expect(prompt).toMatch(/поз/i)
    expect(prompt).toMatch(/ракурс/i)
    expect(prompt).toMatch(/фон/i)
  })

  it("дописывает оговорку и поверх готового промпта от валидатора", async () => {
    generateImage.mockResolvedValue(await okImage())

    await generateDressedImage(
      await makePhoto(400, 500),
      "",
      undefined,
      "Отредактируй это фото: замени одежду человека на классический тёмно-синий костюм и белую рубашку",
    )

    const prompt = promptSentToModel()
    expect(prompt).toContain("тёмно-синий костюм")
    expect(prompt).toMatch(/Сохрани без единого изменения/)
  })

  it("промпт-редактирование, а не генерация нового фото", async () => {
    generateImage.mockResolvedValue(await okImage())

    await generateDressedImage(await makePhoto(400, 500), "деловой костюм")

    const prompt = promptSentToModel()
    expect(prompt).toMatch(/^Отредактируй/)
    expect(prompt).not.toMatch(/Сгенерируй фотореалистичное/)
  })

  it("слишком короткий промпт валидатора игнорируется в пользу шаблона", async () => {
    generateImage.mockResolvedValue(await okImage())

    await generateDressedImage(
      await makePhoto(400, 500),
      "вечернее платье",
      undefined,
      "костюм",
    )

    expect(promptSentToModel()).toContain("вечернее платье")
  })

  it("если модель не вернула картинку — отдаёт null, а не падает", async () => {
    generateImage.mockResolvedValue({ data: [] })

    const res = await generateDressedImage(await makePhoto(400, 500), "костюм")

    expect(res.imageBuffer).toBeNull()
  })

  it("возвращает картинку как JPEG-буфер", async () => {
    generateImage.mockResolvedValue(await okImage())

    const res = await generateDressedImage(await makePhoto(400, 500), "костюм")

    expect(res.imageBuffer).toBeInstanceOf(Buffer)
    expect((await sharp(res.imageBuffer!).metadata()).format).toBe("jpeg")
  })
})
