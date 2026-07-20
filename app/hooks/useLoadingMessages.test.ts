import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOADING_STAGES } from "../lib/constants";
import { useLoadingMessages } from "./useLoadingMessages";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("useLoadingMessages", () => {
  it("стартует с первой стадии", () => {
    const { result } = renderHook(() => useLoadingMessages());
    expect(result.current).toBe(LOADING_STAGES[0]!.text);
  });

  it("переключается на следующую стадию по достижении её порога", () => {
    const { result } = renderHook(() => useLoadingMessages());

    advance(2_000);
    expect(result.current).toBe("Проверяем фото и запрос");

    advance(6_000); // всего 8с
    expect(result.current).toBe("Подбираем образ");

    advance(8_000); // всего 16с
    expect(result.current).toBe("Примеряем одежду");
  });

  it("до порога держит предыдущую подпись", () => {
    const { result } = renderHook(() => useLoadingMessages());

    advance(7_900); // ещё не 8с
    expect(result.current).toBe("Проверяем фото и запрос");
  });

  it("доходит до последней стадии и не выходит за неё", () => {
    const { result } = renderHook(() => useLoadingMessages());

    advance(60_000);
    expect(result.current).toBe("Наводим финальный лоск");
  });

  it("перемонтирование сбрасывает отсчёт на первую стадию", () => {
    const { unmount } = renderHook(() => useLoadingMessages());
    advance(20_000);
    unmount();

    const second = renderHook(() => useLoadingMessages());
    expect(second.result.current).toBe(LOADING_STAGES[0]!.text);
  });

  it("останавливает таймер при размонтировании", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useLoadingMessages());

    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
