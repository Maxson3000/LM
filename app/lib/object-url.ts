/**
 * Реестр object-URL'ов с явным освобождением.
 *
 * Браузер держит blob в памяти, пока URL не отозван, поэтому каждый созданный
 * URL обязан попасть сюда — иначе при «Новом чате» или размонтировании
 * картинки утекают.
 */
export class ObjectUrlRegistry {
  private urls = new Set<string>();

  fromFile(file: File): string {
    return this.track(URL.createObjectURL(file));
  }

  /**
   * Base64 -> blob URL. Держать сгенерированное фото в `data:`-строке дорого:
   * base64 весит на треть больше бинарника и живёт в JS-куче, пока цела ссылка.
   */
  fromBase64(base64: string, mime = "image/jpeg"): string {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return this.track(URL.createObjectURL(new Blob([bytes], { type: mime })));
  }

  private track(url: string): string {
    this.urls.add(url);
    return url;
  }

  release(url: string): void {
    if (this.urls.delete(url)) URL.revokeObjectURL(url);
  }

  releaseAll(): void {
    for (const url of this.urls) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}
