"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatApiError, sendChatRequest } from "../lib/api";
import { MAX_ATTACHMENTS } from "../lib/constants";
import { ObjectUrlRegistry } from "../lib/object-url";
import type { Attachment, GalleryItem, Msg } from "../lib/types";

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type ChatState = {
  messages: Msg[];
  attachments: Attachment[];
  input: string;
  loading: boolean;
  canSend: boolean;
  atLimit: boolean;
};

export type ChatActions = {
  setInput: (value: string) => void;
  addFiles: (files: FileList | File[]) => void;
  removeAttachment: (index: number) => void;
  send: () => Promise<void>;
  reset: () => void;
  addReference: (item: GalleryItem) => void;
};

/**
 * Состояние чата и действия над ним.
 *
 * Действия отдаются отдельным объектом со стабильной ссылкой: потребителям,
 * которым нужен только вызов (галерея, подсказки), незачем перерисовываться
 * на каждую букву в поле ввода.
 */
export const useChat = (): { state: ChatState; actions: ChatActions } => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const urls = useRef(new ObjectUrlRegistry());
  const inflight = useRef<AbortController | null>(null);

  // Свежее состояние для send(), чтобы у него была стабильная ссылка.
  // Пишем в effect, а не во время рендера — ref не должен меняться в рендере.
  const latest = useRef({ input, attachments, messages, loading });
  useEffect(() => {
    latest.current = { input, attachments, messages, loading };
  });

  useEffect(() => {
    const registry = urls.current;
    return () => {
      inflight.current?.abort();
      registry.releaseAll();
    };
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const picked = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (picked.length === 0) return;

    setAttachments((prev) => {
      const free = MAX_ATTACHMENTS - prev.length;
      if (free <= 0) return prev;
      return [
        ...prev,
        ...picked.slice(0, free).map((file) => ({
          file,
          url: urls.current.fromFile(file),
        })),
      ];
    });
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const target = prev[index];
      if (target) urls.current.release(target.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reset = useCallback(() => {
    // Без отмены ответ уже отменённой генерации прилетел бы в пустой чат.
    inflight.current?.abort();
    inflight.current = null;
    urls.current.releaseAll();
    setMessages([]);
    setAttachments([]);
    setInput("");
    setLoading(false);
  }, []);

  const addReference = useCallback((item: GalleryItem) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        text: `Референс: ${item.alt} (${item.tag})`,
        imageSrc: item.src,
        imageAlt: item.alt,
      },
    ]);
  }, []);

  const send = useCallback(async () => {
    const { input, attachments, messages, loading } = latest.current;
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      text: text || "(вложение без текста)",
    };
    const cover = attachments[0];
    if (cover) {
      userMsg.imageSrc = cover.url;
      userMsg.imageAlt = cover.file.name || "Загруженное фото";
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    const controller = new AbortController();
    inflight.current = controller;

    try {
      const data = await sendChatRequest(
        text,
        attachments.map((a) => a.file),
        messages,
        controller.signal,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: data.text || undefined,
          imageSrc: data.image ? urls.current.fromBase64(data.image) : undefined,
          imageAlt: "Сгенерированный образ",
          products:
            data.products && data.products.length > 0 ? data.products : undefined,
        },
      ]);
    } catch (err) {
      // Отменили сами (новый чат / уход со страницы) — сообщать не о чем.
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          // Текст от бэкенда уже написан для пользователя — показываем как есть.
          text:
            err instanceof ChatApiError
              ? err.message
              : "Не удалось связаться с сервером. Проверьте соединение и попробуйте ещё раз.",
        },
      ]);
    } finally {
      if (inflight.current === controller) {
        inflight.current = null;
        setLoading(false);
      }
    }
  }, []);

  const actions = useMemo<ChatActions>(
    () => ({ setInput, addFiles, removeAttachment, send, reset, addReference }),
    [addFiles, removeAttachment, send, reset, addReference],
  );

  const state = useMemo<ChatState>(
    () => ({
      messages,
      attachments,
      input,
      loading,
      canSend: (input.trim().length > 0 || attachments.length > 0) && !loading,
      atLimit: attachments.length >= MAX_ATTACHMENTS,
    }),
    [messages, attachments, input, loading],
  );

  return { state, actions };
};
