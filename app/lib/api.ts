import { API_URL } from "./constants";
import type { ChatResponse, Msg } from "./types";

/** Ошибка с текстом, который бэкенд предназначил пользователю. */
export class ChatApiError extends Error {}

const errorFromResponse = async (res: Response): Promise<ChatApiError> => {
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) return new ChatApiError(body.error);
  } catch {
    // тело не JSON — покажем статус
  }
  return new ChatApiError(`HTTP ${res.status}`);
};

export const sendChatRequest = async (
  text: string,
  files: File[],
  history: Msg[],
  signal?: AbortSignal,
): Promise<ChatResponse> => {
  const fd = new FormData();
  fd.append("text", text);
  fd.append("messages", JSON.stringify(history));
  for (const file of files) fd.append("files", file, file.name);

  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    body: fd,
    signal,
  });

  if (!res.ok) throw await errorFromResponse(res);
  return (await res.json()) as ChatResponse;
};
