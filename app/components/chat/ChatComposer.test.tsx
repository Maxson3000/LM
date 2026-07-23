import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendChatRequest = vi.fn();
vi.mock("../../lib/api", async () => {
  const actual =
    await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
  return {
    ...actual,
    sendChatRequest: (...a: unknown[]) => sendChatRequest(...a),
  };
});

import { ChatProvider } from "./ChatProvider";
import { ChatComposer } from "./ChatComposer";

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

const renderComposer = () =>
  render(
    <ChatProvider>
      <ChatComposer />
    </ChatProvider>,
  );

describe("ChatComposer", () => {
  it("кнопка «Отправить» заблокирована при пустом поле", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });

  it("ввод текста разблокирует отправку", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByPlaceholderText(/Опиши образ/), "костюм");

    expect(screen.getByRole("button", { name: "Отправить" })).toBeEnabled();
  });

  it("отправка вызывает бэкенд с введённым текстом", async () => {
    sendChatRequest.mockResolvedValue({ text: "ок", image: null });
    const user = userEvent.setup();
    renderComposer();

    await user.type(
      screen.getByPlaceholderText(/Опиши образ/),
      "деловой костюм",
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(sendChatRequest).toHaveBeenCalledOnce();
    expect(sendChatRequest.mock.calls[0]![0]).toBe("деловой костюм");
  });

  it("Enter отправляет запрос", async () => {
    sendChatRequest.mockResolvedValue({ text: "ок", image: null });
    const user = userEvent.setup();
    renderComposer();

    await user.type(
      screen.getByPlaceholderText(/Опиши образ/),
      "костюм{Enter}",
    );

    expect(sendChatRequest).toHaveBeenCalledOnce();
  });

  it("поле очищается после отправки", async () => {
    sendChatRequest.mockResolvedValue({ text: "ок", image: null });
    const user = userEvent.setup();
    renderComposer();

    const field = screen.getByPlaceholderText(/Опиши образ/);
    await user.type(field, "костюм");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(field).toHaveValue("");
  });
});
