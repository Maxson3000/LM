import type { Msg } from "../../lib/types";

const bubbleFor = (role: Msg["role"]): string =>
  role === "user"
    ? "ml-auto bg-gradient-to-r from-rose-400 to-violet-400 text-white shadow-sm"
    : "mr-auto bg-white text-slate-700 ring-1 ring-violet-100";

export function ChatMessage({ msg }: { msg: Msg }) {
  return (
    <div
      className={`max-w-[85%] overflow-hidden rounded-2xl text-sm leading-relaxed sm:text-[15px] ${bubbleFor(msg.role)}`}
    >
      {msg.imageSrc && (
        <div className="p-1">
          {/* Источник — blob/URL референса, размеры заранее неизвестны:
              next/image здесь не применим, object-contain бережёт пропорции. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.imageSrc}
            alt={msg.imageAlt ?? "Изображение"}
            className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      )}
      {msg.text && <p className="px-4 py-2.5">{msg.text}</p>}
      {msg.products && msg.products.length > 0 && (
        <ul className="flex flex-col gap-2 px-4 pb-3">
          {msg.products.map((p) => (
            <li
              key={p.title}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-50/60 px-3 py-2"
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
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100"
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
