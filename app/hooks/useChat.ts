"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatApiError, sendChatRequest } from "../lib/api";
import { MAX_ATTACHMENTS } from "../lib/constants";
import { ObjectUrlRegistry } from "../lib/object-url";
import type { Attachment, GalleryItem, Msg } from "../lib/types";

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const NEW_CHAT_TITLE = "Новый чат";
const deriveTitle = (text: string): string => {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? `${t.slice(0, 40)}…` : t || NEW_CHAT_TITLE;
};

/** Один разговор. Владеет своими сообщениями, вложениями и состоянием фото. */
export type Conversation = {
  id: string;
  title: string;
  messages: Msg[];
  attachments: Attachment[];
  loading: boolean;
  photoShown: boolean;
  createdAt: number;
};

/** Лёгкая проекция разговора для списка в сайдбаре. */
export type ConversationMeta = { id: string; title: string; createdAt: number };

const makeConversation = (): Conversation => ({
  id: uid(),
  title: NEW_CHAT_TITLE,
  messages: [],
  attachments: [],
  loading: false,
  photoShown: false,
  createdAt: Date.now(),
});

const isEmpty = (c: Conversation): boolean =>
  c.messages.length === 0 && c.attachments.length === 0;

export type ChatState = {
  // Активный разговор
  messages: Msg[];
  attachments: Attachment[];
  input: string;
  loading: boolean;
  canSend: boolean;
  atLimit: boolean;
  photoRemembered: boolean;
  // Список для сайдбара
  conversations: ConversationMeta[];
  activeId: string;
};

export type ChatActions = {
  setInput: (value: string) => void;
  addFiles: (files: FileList | File[]) => void;
  removeAttachment: (index: number) => void;
  send: () => Promise<void>;
  addReference: (item: GalleryItem) => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
};

export const useChat = (): { state: ChatState; actions: ChatActions } => {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    makeConversation(),
  ]);
  const [activeId, setActiveId] = useState<string>(() => conversations[0]!.id);
  // Ввод — общий, а не на каждый разговор: так набор текста не перерисовывает
  // список чатов в сайдбаре. Черновик очищается при переключении.
  const [input, setInput] = useState("");

  // Хендлы ресурсов держим вне стейта, по id разговора — они не рендерят UI.
  const registries = useRef(new Map<string, ObjectUrlRegistry>());
  const inflights = useRef(new Map<string, AbortController>());

  // Свежее состояние для стабильных колбэков (пишем в effect, не в рендере).
  const latest = useRef({ conversations, activeId, input });
  useEffect(() => {
    latest.current = { conversations, activeId, input };
  });

  useEffect(() => {
    const regs = registries.current;
    const infl = inflights.current;
    return () => {
      infl.forEach((c) => c.abort());
      regs.forEach((r) => r.releaseAll());
    };
  }, []);

  const registryFor = useCallback((id: string): ObjectUrlRegistry => {
    let r = registries.current.get(id);
    if (!r) {
      r = new ObjectUrlRegistry();
      registries.current.set(id, r);
    }
    return r;
  }, []);

  const updateConv = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c)),
      );
    },
    [],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const { activeId } = latest.current;
      const picked = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (picked.length === 0) return;
      const reg = registryFor(activeId);

      updateConv(activeId, (c) => {
        const free = MAX_ATTACHMENTS - c.attachments.length;
        if (free <= 0) return c;
        return {
          ...c,
          attachments: [
            ...c.attachments,
            ...picked.slice(0, free).map((file) => ({
              file,
              url: reg.fromFile(file),
            })),
          ],
          photoShown: false,
        };
      });
    },
    [registryFor, updateConv],
  );

  const removeAttachment = useCallback(
    (index: number) => {
      const { activeId } = latest.current;
      const reg = registryFor(activeId);
      updateConv(activeId, (c) => {
        const target = c.attachments[index];
        if (target) reg.release(target.url);
        const attachments = c.attachments.filter((_, i) => i !== index);
        return {
          ...c,
          attachments,
          photoShown: attachments.length === 0 ? false : c.photoShown,
        };
      });
    },
    [registryFor, updateConv],
  );

  const addReference = useCallback(
    (item: GalleryItem) => {
      const { activeId } = latest.current;
      updateConv(activeId, (c) => ({
        ...c,
        title: c.title === NEW_CHAT_TITLE ? deriveTitle(item.alt) : c.title,
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "user",
            text: `Референс: ${item.alt} (${item.tag})`,
            imageSrc: item.src,
            imageAlt: item.alt,
          },
        ],
      }));
    },
    [updateConv],
  );

  const newConversation = useCallback(() => {
    const { conversations, activeId } = latest.current;
    const active = conversations.find((c) => c.id === activeId);
    // Не плодим пустые чаты — если текущий пуст, просто остаёмся в нём.
    if (active && isEmpty(active)) return;
    const conv = makeConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput("");
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setInput("");
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const { conversations, activeId } = latest.current;
    inflights.current.get(id)?.abort();
    inflights.current.delete(id);
    registries.current.get(id)?.releaseAll();
    registries.current.delete(id);

    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fresh = makeConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    } else {
      setConversations(remaining);
      if (activeId === id) setActiveId(remaining[0]!.id);
    }
    setInput("");
  }, []);

  const send = useCallback(async () => {
    const { conversations, activeId, input } = latest.current;
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;

    const text = input.trim();
    const hasFreshPhoto = conv.attachments.length > 0 && !conv.photoShown;
    if ((!text && !hasFreshPhoto) || conv.loading) return;

    const id = activeId;
    const reg = registryFor(id);
    const history = conv.messages;
    const files = conv.attachments.map((a) => a.file);

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      text: text || "(фото без описания)",
    };
    const cover = conv.attachments[0];
    // Фото прикрепляем к пузырю только когда оно новое — на follow-up превью
    // не дублируем, но само фото уходит в запрос повторно.
    if (cover && !conv.photoShown) {
      userMsg.imageSrc = cover.url;
      userMsg.imageAlt = cover.file.name || "Загруженное фото";
    }

    setInput("");
    updateConv(id, (c) => ({
      ...c,
      title:
        c.title === NEW_CHAT_TITLE && text ? deriveTitle(text) : c.title,
      messages: [...c.messages, userMsg],
      loading: true,
      photoShown: cover ? true : c.photoShown,
    }));

    const controller = new AbortController();
    inflights.current.set(id, controller);

    try {
      const data = await sendChatRequest(text, files, history, controller.signal);
      updateConv(id, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "assistant",
            text: data.text || undefined,
            imageSrc: data.image ? reg.fromBase64(data.image) : undefined,
            imageAlt: "Сгенерированный образ",
            products:
              data.products && data.products.length > 0
                ? data.products
                : undefined,
          },
        ],
      }));
    } catch (err) {
      // Отменили сами (удалили чат / уход со страницы) — сообщать не о чем.
      if (err instanceof DOMException && err.name === "AbortError") return;
      updateConv(id, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "assistant",
            // Текст от бэкенда уже написан для пользователя — показываем как есть.
            text:
              err instanceof ChatApiError
                ? err.message
                : "Не удалось связаться с сервером. Проверьте соединение и попробуйте ещё раз.",
          },
        ],
      }));
    } finally {
      if (inflights.current.get(id) === controller) {
        inflights.current.delete(id);
        updateConv(id, (c) => ({ ...c, loading: false }));
      }
    }
  }, [registryFor, updateConv]);

  const actions = useMemo<ChatActions>(
    () => ({
      setInput,
      addFiles,
      removeAttachment,
      send,
      addReference,
      newConversation,
      selectConversation,
      deleteConversation,
    }),
    [
      addFiles,
      removeAttachment,
      send,
      addReference,
      newConversation,
      selectConversation,
      deleteConversation,
    ],
  );

  const state = useMemo<ChatState>(() => {
    const active =
      conversations.find((c) => c.id === activeId) ?? conversations[0]!;
    return {
      messages: active.messages,
      attachments: active.attachments,
      input,
      loading: active.loading,
      canSend:
        (input.trim().length > 0 ||
          (active.attachments.length > 0 && !active.photoShown)) &&
        !active.loading,
      atLimit: active.attachments.length >= MAX_ATTACHMENTS,
      photoRemembered: active.attachments.length > 0 && active.photoShown,
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
      })),
      activeId,
    };
  }, [conversations, activeId, input]);

  return { state, actions };
};
