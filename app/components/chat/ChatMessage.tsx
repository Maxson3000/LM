import type { Msg } from "../../lib/types";

const bubbleFor = (role: Msg["role"]): string =>
  role === "user"
    ? "ml-auto bg-lm-rose text-white shadow-sm"
    : "mr-auto bg-white text-slate-700 border border-lm-line";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </svg>
  );
}

export function ChatMessage({ msg }: { msg: Msg }) {
  // Скачивание — только для сгенерированного образа (ответ ассистента с фото).
  const downloadable = msg.role === "assistant" && Boolean(msg.imageSrc);

  return (
    <div
      className={`max-w-[85%] overflow-hidden rounded-2xl text-sm leading-relaxed sm:text-[15px] ${bubbleFor(msg.role)}`}
    >
      {msg.imageSrc && (
        <div className="relative p-1">
          {/* Источник — blob/URL референса, размеры заранее неизвестны:
              next/image здесь не применим, object-contain бережёт пропорции. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.imageSrc}
            alt={msg.imageAlt ?? "Изображение"}
            className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
          />
          {downloadable && (
            <a
              href={msg.imageSrc}
              download="lookmax-obraz.jpg"
              className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full border border-lm-line-strong bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-lm-rose hover:text-lm-rose-ink"
            >
              <DownloadIcon />
              Скачать
            </a>
          )}
        </div>
      )}
      {msg.text && <p className="px-4 py-2.5">{msg.text}</p>}
      {msg.products && msg.products.length > 0 && (
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {msg.products.map((p) => (
            <li
              key={p.title}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-lm-line bg-lm-rose-softer px-3 py-2"
            >
              <span className="text-[13px] font-medium text-slate-700">
                {p.title}
              </span>
              <span className="flex gap-1.5">
                {p.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-lm-line-strong bg-white px-2.5 py-1 text-[11px] font-semibold text-lm-rose-ink transition hover:border-lm-rose hover:bg-lm-rose-soft"
                  >
                    {l.market} ↗
                  </a>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
