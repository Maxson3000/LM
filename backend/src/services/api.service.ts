export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type ApiRequestInput = {
  baseUrl: string
  apiKey: string
  path: string
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  timeoutMs?: number
  retries?: number
}

const buildUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableStatus = (status: number): boolean => status === 429 || status >= 500

const DEFAULT_TIMEOUT_MS = 120_000
const DEFAULT_RETRIES = 2

export const apiRequest = async <T = unknown>(input: ApiRequestInput): Promise<T> => {
  const {
    baseUrl,
    apiKey,
    path,
    method = "GET",
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = input
  const url = buildUrl(baseUrl, path)

  const finalHeaders: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    ...headers,
  }
  if (body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json"
  }

  const payload =
    body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body)

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: payload,
        signal: controller.signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        if (isRetryableStatus(res.status) && attempt < retries) {
          await sleep(1000 * 2 ** attempt)
          continue
        }
        throw new Error(
          `API ${method} ${url} -> ${res.status}: ${errText.slice(0, 400)}`,
        )
      }

      const ct = res.headers.get("content-type") ?? ""
      if (ct.includes("application/json")) {
        return (await res.json()) as T
      }
      return (await res.text()) as T
    } catch (err) {
      const isHttpError = err instanceof Error && /^API\s/.test(err.message)
      if (isHttpError) throw err

      // Таймаут не повторяем: запрос тяжёлый (фото в base64), и три попытки
      // по timeoutMs превращают одну медленную генерацию в многоминутное ожидание.
      // Повторяем только сетевые сбои — они отваливаются быстро.
      const aborted = err instanceof Error && err.name === "AbortError"
      if (aborted) {
        throw new Error(`API ${method} ${url} -> timeout after ${timeoutMs}ms`)
      }
      if (attempt < retries) {
        await sleep(1000 * 2 ** attempt)
        continue
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }
}
