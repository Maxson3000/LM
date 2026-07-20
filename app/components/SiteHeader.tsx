export function SiteHeader() {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          <span className="text-lm-text">Look</span>
          <span className="bg-gradient-to-r from-lm-coral to-violet-500 bg-clip-text text-transparent">
            MAX
          </span>
        </h1>
        <span className="hidden rounded-full bg-lm-lavender px-3 py-1 text-xs font-medium text-violet-800 sm:inline">
          ИИ-стилист
        </span>
      </div>

      <a
        href="#about"
        className="shrink-0 text-sm font-medium text-lm-muted transition hover:text-lm-coral"
      >
        О сервисе ↓
      </a>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/60 bg-white/50 py-8 text-center text-sm text-lm-muted backdrop-blur-md">
      LookMAX · ИИ помощник
    </footer>
  );
}
