import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMessage } from "./ChatMessage";
import type { Msg } from "../../lib/types";

const base = (over: Partial<Msg>): Msg => ({
  id: "1",
  role: "assistant",
  ...over,
});

describe("ChatMessage — скачивание образа", () => {
  it("у сгенерированного образа (ответ ассистента с фото) есть кнопка скачать", () => {
    render(
      <ChatMessage
        msg={base({ role: "assistant", imageSrc: "blob:test/look", imageAlt: "Образ" })}
      />,
    );
    const link = screen.getByRole("link", { name: /скачать/i });
    expect(link).toHaveAttribute("download");
    expect(link).toHaveAttribute("href", "blob:test/look");
  });

  it("у загруженного пользователем фото кнопки скачать нет", () => {
    render(
      <ChatMessage msg={base({ role: "user", imageSrc: "blob:test/my-photo" })} />,
    );
    expect(screen.queryByRole("link", { name: /скачать/i })).toBeNull();
  });

  it("у текстового сообщения без фото кнопки скачать нет", () => {
    render(<ChatMessage msg={base({ role: "assistant", text: "Готово!" })} />);
    expect(screen.queryByRole("link", { name: /скачать/i })).toBeNull();
  });
});

describe("ChatMessage — контент", () => {
  it("рендерит текст сообщения", () => {
    render(<ChatMessage msg={base({ text: "Вам идут тёплые тона" })} />);
    expect(screen.getByText("Вам идут тёплые тона")).toBeInTheDocument();
  });

  it("рендерит вещи со ссылками на маркетплейсы", () => {
    render(
      <ChatMessage
        msg={base({
          text: "Совет",
          products: [
            {
              title: "Бежевые чиносы",
              links: [
                { market: "Wildberries", url: "https://wb.ru/x" },
                { market: "Ozon", url: "https://ozon.ru/y" },
              ],
            },
          ],
        })}
      />,
    );
    expect(screen.getByText("Бежевые чиносы")).toBeInTheDocument();
    const wb = screen.getByRole("link", { name: /Wildberries/ });
    expect(wb).toHaveAttribute("href", "https://wb.ru/x");
    expect(wb).toHaveAttribute("target", "_blank");
  });
});
