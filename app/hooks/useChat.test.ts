import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendChatRequest = vi.fn();
vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return { ...actual, sendChatRequest: (...a: unknown[]) => sendChatRequest(...a) };
});

import { ChatApiError } from "../lib/api";
import { MAX_ATTACHMENTS } from "../lib/constants";
import { useChat } from "./useChat";

let counter = 0;
beforeEach(() => {
  counter = 0;
  sendChatRequest.mockReset();
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: () => `blob:test/${counter++}`,
    revokeObjectURL: () => {},
  });
});
afterEach(() => vi.restoreAllMocks());

const img = (name = "p.jpg") => new File(["x"], name, { type: "image/jpeg" });

describe("useChat — вложения", () => {
  it("принимает только картинки", () => {
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.addFiles([img(), new File(["t"], "a.txt", { type: "text/plain" })]));
    expect(result.current.state.attachments).toHaveLength(1);
  });

  it("не превышает лимит вложений", () => {
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.addFiles(Array.from({ length: MAX_ATTACHMENTS + 3 }, () => img())));
    expect(result.current.state.attachments).toHaveLength(MAX_ATTACHMENTS);
    expect(result.current.state.atLimit).toBe(true);
  });

  it("удаляет вложение по индексу", () => {
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.addFiles([img("a.jpg"), img("b.jpg")]));
    act(() => result.current.actions.removeAttachment(0));
    expect(result.current.state.attachments.map((a) => a.file.name)).toEqual(["b.jpg"]);
  });
});

describe("useChat — canSend", () => {
  it("false без ввода и вложений", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.state.canSend).toBe(false);
  });

  it("true при непустом тексте", () => {
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("деловой костюм"));
    expect(result.current.state.canSend).toBe(true);
  });

  it("false пока идёт запрос", async () => {
    sendChatRequest.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("костюм"));
    act(() => void result.current.actions.send());
    await waitFor(() => expect(result.current.state.loading).toBe(true));
    expect(result.current.state.canSend).toBe(false);
  });
});

describe("useChat — send", () => {
  it("добавляет сообщение пользователя и ответ ассистента", async () => {
    sendChatRequest.mockResolvedValue({ text: "Готово!", image: null });
    const { result } = renderHook(() => useChat());

    act(() => result.current.actions.setInput("деловой костюм"));
    await act(async () => void (await result.current.actions.send()));

    const { messages } = result.current.state;
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: "user", text: "деловой костюм" });
    expect(messages[1]).toMatchObject({ role: "assistant", text: "Готово!" });
  });

  it("очищает ввод, но фото остаётся закреплённым за разговором", async () => {
    sendChatRequest.mockResolvedValue({ text: "ок", image: null });
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.actions.setInput("костюм");
      result.current.actions.addFiles([img()]);
    });

    await act(async () => void (await result.current.actions.send()));

    expect(result.current.state.input).toBe("");
    expect(result.current.state.attachments).toHaveLength(1);
    expect(result.current.state.photoRemembered).toBe(true);
  });

  it("показывает текст ошибки от бэкенда как есть", async () => {
    sendChatRequest.mockRejectedValue(new ChatApiError("Недостаточно средств на балансе"));
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("костюм"));

    await act(async () => void (await result.current.actions.send()));

    const last = result.current.state.messages.at(-1)!;
    expect(last.role).toBe("assistant");
    expect(last.text).toBe("Недостаточно средств на балансе");
  });

  it("на неизвестную ошибку показывает дружелюбный текст, а не стектрейс", async () => {
    sendChatRequest.mockRejectedValue(new TypeError("fetch failed"));
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("костюм"));

    await act(async () => void (await result.current.actions.send()));

    expect(result.current.state.messages.at(-1)!.text).toMatch(/связаться с сервером/i);
  });

  it("не отправляет пустой запрос", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => void (await result.current.actions.send()));
    expect(sendChatRequest).not.toHaveBeenCalled();
  });

  it("передаёт файлы и историю в запрос", async () => {
    sendChatRequest.mockResolvedValue({ text: "ок", image: null });
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.actions.setInput("костюм");
      result.current.actions.addFiles([img("me.jpg")]);
    });

    await act(async () => void (await result.current.actions.send()));

    const [text, files, history] = sendChatRequest.mock.calls[0]!;
    expect(text).toBe("костюм");
    expect(files).toHaveLength(1);
    expect(history).toEqual([]); // первое сообщение — истории ещё нет
  });
});

describe("useChat — память фото", () => {
  const setup = () => renderHook(() => useChat());
  const ok = () => sendChatRequest.mockResolvedValue({ text: "ок", image: null });

  it("follow-up без повторного прикрепления переиспользует то же фото", async () => {
    ok();
    const { result } = setup();
    act(() => {
      result.current.actions.setInput("примерь костюм");
      result.current.actions.addFiles([img("me.jpg")]);
    });
    await act(async () => void (await result.current.actions.send()));

    // второй запрос — только текст, фото не прикрепляем заново
    act(() => result.current.actions.setInput("собери образ"));
    await act(async () => void (await result.current.actions.send()));

    expect(sendChatRequest).toHaveBeenCalledTimes(2);
    const secondFiles = sendChatRequest.mock.calls[1]![1] as File[];
    expect(secondFiles).toHaveLength(1);
    expect(secondFiles[0]!.name).toBe("me.jpg");
  });

  it("фото показывается в первом пузыре, но не дублируется на follow-up", async () => {
    ok();
    const { result } = setup();
    act(() => {
      result.current.actions.setInput("примерь костюм");
      result.current.actions.addFiles([img()]);
    });
    await act(async () => void (await result.current.actions.send()));
    act(() => result.current.actions.setInput("собери образ"));
    await act(async () => void (await result.current.actions.send()));

    const userMsgs = result.current.state.messages.filter((m) => m.role === "user");
    expect(userMsgs[0]!.imageSrc).toBeTruthy(); // первый — с фото
    expect(userMsgs[1]!.imageSrc).toBeUndefined(); // второй — без дубля
  });

  it("после отправки закреплённое фото само по себе не разрешает пустой follow-up", async () => {
    ok();
    const { result } = setup();
    act(() => {
      result.current.actions.setInput("примерь костюм");
      result.current.actions.addFiles([img()]);
    });
    await act(async () => void (await result.current.actions.send()));

    // ввод пуст, но фото закреплено — отправка должна быть заблокирована
    expect(result.current.state.canSend).toBe(false);
    await act(async () => void (await result.current.actions.send()));
    expect(sendChatRequest).toHaveBeenCalledTimes(1);
  });

  it("новое фото снова показывается в пузыре", async () => {
    ok();
    const { result } = setup();
    act(() => {
      result.current.actions.setInput("примерь костюм");
      result.current.actions.addFiles([img("a.jpg")]);
    });
    await act(async () => void (await result.current.actions.send()));

    // заменяем фото
    act(() => result.current.actions.removeAttachment(0));
    act(() => {
      result.current.actions.setInput("а теперь это");
      result.current.actions.addFiles([img("b.jpg")]);
    });
    await act(async () => void (await result.current.actions.send()));

    const userMsgs = result.current.state.messages.filter((m) => m.role === "user");
    expect(userMsgs[1]!.imageSrc).toBeTruthy(); // новое фото снова показано
  });
});

describe("useChat — регрессии", () => {
  // Регрессия: общий Context перерисовывал галерею на каждую букву.
  // Actions должны иметь стабильную ссылку между рендерами.
  it("ссылка на actions стабильна при изменении состояния", () => {
    const { result } = renderHook(() => useChat());
    const before = result.current.actions;

    act(() => result.current.actions.setInput("печатаю"));

    expect(result.current.actions).toBe(before);
  });

  // Регрессия: удаление чата во время генерации должно отменять его запрос.
  it("удаление чата прерывает его запрос", async () => {
    let capturedSignal: AbortSignal | undefined;
    sendChatRequest.mockImplementation((_t, _f, _h, signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });
    const { result } = renderHook(() => useChat());

    act(() => result.current.actions.setInput("костюм"));
    act(() => void result.current.actions.send());
    await waitFor(() => expect(result.current.state.loading).toBe(true));

    const id = result.current.state.activeId;
    act(() => result.current.actions.deleteConversation(id));

    expect(capturedSignal?.aborted).toBe(true);
    // остался свежий пустой чат
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.messages).toHaveLength(0);
  });

  it("ответ отменённого запроса не появляется после удаления чата", async () => {
    let rejectFn: (e: unknown) => void = () => {};
    sendChatRequest.mockImplementation(
      (_t, _f, _h, signal: AbortSignal) =>
        new Promise((_res, rej) => {
          rejectFn = rej;
          signal.addEventListener("abort", () =>
            rej(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("костюм"));
    act(() => void result.current.actions.send());
    await waitFor(() => expect(result.current.state.loading).toBe(true));

    const id = result.current.state.activeId;
    await act(async () => {
      result.current.actions.deleteConversation(id);
      rejectFn(new DOMException("aborted", "AbortError"));
    });

    expect(result.current.state.messages).toHaveLength(0);
  });
});

describe("useChat — мульти-чат", () => {
  const ok = () => sendChatRequest.mockResolvedValue({ text: "ок", image: null });

  it("стартует с одного пустого чата", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.state.conversations).toHaveLength(1);
    expect(result.current.state.messages).toHaveLength(0);
  });

  it("newConversation создаёт новый чат и переключает на него", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("примерь костюм"));
    await act(async () => void (await result.current.actions.send()));

    act(() => result.current.actions.newConversation());

    expect(result.current.state.conversations).toHaveLength(2);
    expect(result.current.state.messages).toHaveLength(0); // новый чат пуст
  });

  it("newConversation не плодит пустые чаты", () => {
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.newConversation());
    act(() => result.current.actions.newConversation());
    expect(result.current.state.conversations).toHaveLength(1);
  });

  it("заголовок чата берётся из первого сообщения", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("деловой костюм на собеседование"));
    await act(async () => void (await result.current.actions.send()));

    expect(result.current.state.conversations[0]!.title).toContain("деловой костюм");
  });

  it("selectConversation переключает и показывает сообщения нужного чата", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("первый"));
    await act(async () => void (await result.current.actions.send()));
    const firstId = result.current.state.activeId;

    act(() => result.current.actions.newConversation());
    act(() => result.current.actions.setInput("второй"));
    await act(async () => void (await result.current.actions.send()));

    act(() => result.current.actions.selectConversation(firstId));
    expect(result.current.state.messages[0]).toMatchObject({ text: "первый" });
  });

  it("каждый чат помнит своё фото независимо", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.actions.setInput("примерь");
      result.current.actions.addFiles([img("a.jpg")]);
    });
    await act(async () => void (await result.current.actions.send()));

    act(() => result.current.actions.newConversation());
    expect(result.current.state.attachments).toHaveLength(0); // новый чат — без фото
  });

  // Ключевое свойство фоновой генерации: ответ приходит в СВОЙ чат, даже если
  // пользователь уже переключился на другой.
  it("фоновая генерация завершается в своём чате после переключения", async () => {
    let resolveFn: (v: unknown) => void = () => {};
    sendChatRequest.mockImplementation(
      () => new Promise((res) => { resolveFn = res; }),
    );
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("в первом чате"));
    act(() => void result.current.actions.send());
    await waitFor(() => expect(result.current.state.loading).toBe(true));
    const firstId = result.current.state.activeId;

    // переключаемся на новый чат, пока первый генерит
    act(() => result.current.actions.newConversation());
    expect(result.current.state.messages).toHaveLength(0);

    // ответ первого чата приходит
    await act(async () => {
      resolveFn({ text: "готово в первом", image: null });
    });

    // в активном (втором) — по-прежнему пусто
    expect(result.current.state.messages).toHaveLength(0);
    // а в первом появился ответ
    act(() => result.current.actions.selectConversation(firstId));
    expect(result.current.state.messages.at(-1)).toMatchObject({
      role: "assistant",
      text: "готово в первом",
    });
  });

  it("deleteConversation удаляет и переключает на оставшийся", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("чат-1"));
    await act(async () => void (await result.current.actions.send()));
    act(() => result.current.actions.newConversation());
    const secondId = result.current.state.activeId;

    act(() => result.current.actions.deleteConversation(secondId));

    expect(result.current.state.conversations).toHaveLength(1);
    expect(result.current.state.messages[0]).toMatchObject({ text: "чат-1" });
  });

  it("удаление последнего чата оставляет один свежий пустой", async () => {
    ok();
    const { result } = renderHook(() => useChat());
    act(() => result.current.actions.setInput("единственный"));
    await act(async () => void (await result.current.actions.send()));

    const id = result.current.state.activeId;
    act(() => result.current.actions.deleteConversation(id));

    expect(result.current.state.conversations).toHaveLength(1);
    expect(result.current.state.messages).toHaveLength(0);
  });
});
