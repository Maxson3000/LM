"use client";

import { createContext, useContext } from "react";
import { useChat, type ChatActions, type ChatState } from "../../hooks/useChat";

const StateContext = createContext<ChatState | null>(null);
const ActionsContext = createContext<ChatActions | null>(null);

const useRequired = <T,>(ctx: T | null, name: string): T => {
  if (!ctx) throw new Error(`${name} must be used within <ChatProvider>`);
  return ctx;
};

/** Состояние чата. Подписчик перерисовывается на любое изменение. */
export const useChatState = (): ChatState =>
  useRequired(useContext(StateContext), "useChatState");

/** Действия над чатом. Ссылка стабильна — перерисовок от ввода не будет. */
export const useChatActions = (): ChatActions =>
  useRequired(useContext(ActionsContext), "useChatActions");

/**
 * Держит состояние чата. Статичные секции страницы приходят сюда как children
 * из серверного page.tsx — так они остаются Server Components и не попадают
 * в клиентский бандл.
 *
 * Состояние и действия разведены по разным контекстам намеренно: галерее и
 * подсказкам нужны только действия, и на ввод текста они реагировать не должны.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { state, actions } = useChat();

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>{children}</StateContext>
    </ActionsContext>
  );
}
