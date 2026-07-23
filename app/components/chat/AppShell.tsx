"use client";

import { useState } from "react";
import { LookChat } from "./LookChat";
import { Sidebar } from "./Sidebar";

/**
 * Оболочка чата: слева список разговоров, справа активный чат. На узких экранах
 * сайдбар превращается в выдвижную панель поверх контента.
 */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex h-[calc(100vh-6rem)] min-h-[560px] overflow-hidden rounded-2xl border border-lm-line bg-white shadow-md shadow-violet-100/40">
      <aside className="hidden w-[248px] shrink-0 border-r border-lm-line md:block lg:w-[264px]">
        <Sidebar />
      </aside>

      {drawerOpen && (
        <div className="absolute inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Закрыть список чатов"
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 z-50 w-[268px] border-r border-lm-line shadow-xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <LookChat onOpenSidebar={() => setDrawerOpen(true)} />
      </div>
    </div>
  );
}
