import { AboutSection } from "./components/AboutSection";
import { AppShell } from "./components/chat/AppShell";
import { ChatProvider } from "./components/chat/ChatProvider";
import { ColorTypeSection } from "./components/colortype/ColorTypeSection";
import { SiteFooter } from "./components/SiteHeader";
import { StyleGallery } from "./components/StyleGallery";

/**
 * Server Component: интерактив живёт только внутри ChatProvider, а статика
 * (описание, тест, галерея, футер) рендерится на сервере и в клиентский бандл
 * не идёт.
 */
export default function Home() {
  return (
    <div className="lm-page-bg relative min-h-full flex-1 text-lm-text">
      <ChatProvider>
        <section className="relative z-10">
          <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-6 sm:pt-6 lg:px-8">
            <AppShell />
          </div>
        </section>

        <AboutSection />
        <ColorTypeSection />
        <StyleGallery />
        <SiteFooter />
      </ChatProvider>
    </div>
  );
}
