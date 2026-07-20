"use client";

import { useEffect, useState } from "react";
import { LOADING_STAGES } from "../lib/constants";

const stageTextAt = (elapsedMs: number): string => {
  let text = LOADING_STAGES[0]!.text;
  for (const stage of LOADING_STAGES) {
    if (elapsedMs >= stage.at) text = stage.text;
    else break;
  }
  return text;
};

/**
 * Подпись под текущую стадию генерации. Стадии сменяются по времени, а не по
 * кругу: бэкенд промежуточный прогресс не отдаёт, но длительности шагов
 * стабильны (см. LOADING_STAGES), так что подпись отражает реальный этап.
 *
 * Отсчёт стартует с монтирования — вызывающий рендерит хук только на время
 * загрузки, поэтому сброс между запросами получается сам собой.
 */
export const useLoadingMessages = (): string => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1_000);
    return () => clearInterval(id);
  }, []);

  return stageTextAt(elapsed);
};
