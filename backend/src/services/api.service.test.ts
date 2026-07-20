import { afterEach, describe, expect, it, vi } from "vitest"
import { apiRequest } from "./api.service.js"

const jsonRes = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })

const base = { baseUrl: "https://api.test/v1", apiKey: "k", path: "/chat" }

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("apiRequest", () => {
  it("склеивает URL без задвоения слэшей", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes(200, { ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiRequest({ ...base, baseUrl: "https://api.test/v1/", path: "/chat" })

    expect(fetchMock.mock.calls[0]![0]).toBe("https://api.test/v1/chat")
  })

  it("подставляет Bearer и Content-Type для POST с телом", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes(200, {}))
    vi.stubGlobal("fetch", fetchMock)

    await apiRequest({ ...base, method: "POST", body: { a: 1 } })

    const init = fetchMock.mock.calls[0]![1]
    expect(init.headers.Authorization).toBe("Bearer k")
    expect(init.headers["Content-Type"]).toBe("application/json")
    expect(init.body).toBe('{"a":1}')
  })

  it("повторяет 500 и возвращает результат удачной попытки", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonRes(500, { e: "boom" }))
      .mockResolvedValueOnce(jsonRes(200, { ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const res = await apiRequest({ ...base, retries: 1 })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(res).toEqual({ ok: true })
  })

  it("повторяет 429", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonRes(429, {}))
      .mockResolvedValueOnce(jsonRes(200, { ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiRequest({ ...base, retries: 1 })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  // 402 = пустой баланс RouterAI. Повторять бессмысленно: деньги не появятся,
  // а пользователь ждёт втрое дольше.
  it("НЕ повторяет 402 и отдаёт статус в тексте ошибки", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonRes(402, { error: "Недостаточно средств" }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(apiRequest({ ...base, retries: 2 })).rejects.toThrow(/402/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("НЕ повторяет 400", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes(400, {}))
    vi.stubGlobal("fetch", fetchMock)

    await expect(apiRequest({ ...base, retries: 2 })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  // Регрессия: таймаут повторялся наравне с сетевым сбоем, и 120с x 3 попытки
  // превращались в многоминутное ожидание вместо честной ошибки.
  it("НЕ повторяет таймаут — одна попытка и понятная ошибка", async () => {
    const fetchMock = vi.fn(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          )
        }),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiRequest({ ...base, timeoutMs: 30, retries: 2 }),
    ).rejects.toThrow(/timeout after 30ms/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("повторяет сетевой сбой — он отваливается быстро", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonRes(200, { ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const res = await apiRequest({ ...base, retries: 1 })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(res).toEqual({ ok: true })
  })

  it("отдаёт текст, если ответ не JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("plain", { status: 200 })),
    )

    expect(await apiRequest({ ...base })).toBe("plain")
  })
})
