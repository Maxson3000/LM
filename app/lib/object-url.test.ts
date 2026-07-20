import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectUrlRegistry } from "./object-url";

// jsdom не реализует createObjectURL/revokeObjectURL — подменяем и считаем вызовы.
let counter = 0;
const created: string[] = [];
const revoked: string[] = [];

beforeEach(() => {
  counter = 0;
  created.length = 0;
  revoked.length = 0;
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: () => {
      const url = `blob:test/${counter++}`;
      created.push(url);
      return url;
    },
    revokeObjectURL: (url: string) => revoked.push(url),
  });
});
afterEach(() => vi.restoreAllMocks());

const fakeFile = () => new File(["x"], "photo.jpg", { type: "image/jpeg" });

describe("ObjectUrlRegistry", () => {
  it("создаёт blob-URL из файла", () => {
    const r = new ObjectUrlRegistry();
    expect(r.fromFile(fakeFile())).toBe("blob:test/0");
    expect(created).toHaveLength(1);
  });

  it("декодирует base64 в blob того же размера", () => {
    const r = new ObjectUrlRegistry();
    const spy = vi.spyOn(URL, "createObjectURL");

    const raw = "hello world";
    r.fromBase64(btoa(raw));

    const blob = spy.mock.calls[0]![0] as Blob;
    expect(blob.size).toBe(raw.length); // без раздувания base64
    expect(blob.type).toBe("image/jpeg");
  });

  // Регрессия «Новый чат»: URL'ы копились и не отзывались — утечка памяти.
  it("releaseAll отзывает все выданные URL", () => {
    const r = new ObjectUrlRegistry();
    r.fromFile(fakeFile());
    r.fromFile(fakeFile());
    r.fromBase64(btoa("z"));

    r.releaseAll();

    expect(revoked).toHaveLength(3);
    expect(new Set(revoked).size).toBe(3); // все разные
  });

  it("release отзывает только один URL", () => {
    const r = new ObjectUrlRegistry();
    const a = r.fromFile(fakeFile());
    r.fromFile(fakeFile());

    r.release(a);

    expect(revoked).toEqual([a]);
  });

  it("повторный release того же URL не отзывает дважды", () => {
    const r = new ObjectUrlRegistry();
    const a = r.fromFile(fakeFile());

    r.release(a);
    r.release(a);

    expect(revoked).toEqual([a]);
  });

  it("releaseAll после release не трогает уже отозванный URL", () => {
    const r = new ObjectUrlRegistry();
    const a = r.fromFile(fakeFile());
    const b = r.fromFile(fakeFile());

    r.release(a);
    r.releaseAll();

    expect(revoked).toEqual([a, b]);
    expect(revoked.filter((u) => u === a)).toHaveLength(1);
  });
});
