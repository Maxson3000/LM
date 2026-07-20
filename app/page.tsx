import { AboutSection } from "./components/AboutSection";
import { ChatProvider } from "./components/chat/ChatProvider";
import { LookChat } from "./components/chat/LookChat";
import { SiteFooter, SiteHeader } from "./components/SiteHeader";
import { StyleGallery } from "./components/StyleGallery";

/**
 * Server Component: интерактив живёт только внутри ChatProvider, а статика
 * (шапка, описание, футер) рендерится на сервере и в клиентский бандл не идёт.
 */
export default function Home() {
  return (
    <div className="lm-page-bg relative min-h-full flex-1 text-lm-text">
      <ChatProvider>
        <section className="relative z-10 min-h-screen">
          <div className="pointer-events-none absolute right-10 top-24 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-1/3 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
            <SiteHeader />
            <LookChat />
          </div>
        </section>

        <AboutSection />
        <StyleGallery />
        <SiteFooter />
      </ChatProvider>
    </div>
  );
}
