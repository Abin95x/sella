"use client";

import { useEffect, useRef, useState } from "react";
import { RollText } from "./ui/RollText";
import { usePrefs } from "./providers/Prefs";
import { getLenis } from "./providers/SmoothScroll";

const links = [
  { label: "Studio", href: "#studio" },
  { label: "Chairs", href: "#chairs" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint: string }) {
  return (
    <div className="border-t border-line pt-4">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="font-medium">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className="relative h-6 w-11 shrink-0 rounded-full bg-bg-3 transition-colors data-[on=true]:bg-fg"
          data-on={checked}
        >
          <span
            className="absolute top-1 left-1 size-4 rounded-full bg-bg shadow transition-transform duration-300 ease-(--ease-out) data-[on=true]:translate-x-5"
            data-on={checked}
          />
        </button>
      </label>
      <p className="mt-1.5 text-sm text-muted">{hint}</p>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { theme, setTheme, reducedMotion, setReducedMotion } = usePrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const savingLevel = (theme === "dark" ? 1 : 0) + (reducedMotion ? 1 : 0);
  const usage = ["High", "Med", "Low"][savingLevel];

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 200);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const lenis = getLenis();
    lenis?.start();
    if (lenis) lenis.scrollTo(href, { offset: 0, duration: 2 });
    else document.querySelector(href)?.scrollIntoView();
  };

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between p-(--gutter) transition-transform duration-500 ease-(--ease-out) data-[hidden=true]:-translate-y-[140%]"
      data-hidden={hidden && !open}
    >
      <a href="#top" onClick={go("#top")} className="pointer-events-auto text-[1.7rem] leading-none font-semibold tracking-[-0.06em]" aria-label="sella, back to top">
        sella<span className="text-[#e0573a]">.</span>
      </a>

      <div ref={panelRef} className="pointer-events-auto relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="group grid size-9 place-items-center rounded-full bg-card shadow-sm"
          >
            <span className="relative block h-3 w-4">
              <span className="absolute top-0 left-0 h-[1.5px] w-full bg-fg transition-transform duration-500 ease-(--ease-out) group-aria-expanded:translate-y-[5px] group-aria-expanded:rotate-45" />
              <span className="absolute top-[5px] left-0 h-[1.5px] w-full bg-fg transition-opacity duration-300 group-aria-expanded:opacity-0" />
              <span className="absolute top-[10px] left-0 h-[1.5px] w-full bg-fg transition-transform duration-500 ease-(--ease-out) group-aria-expanded:-translate-y-[5px] group-aria-expanded:-rotate-45" />
            </span>
          </button>
        </div>

        <div
          id="site-menu"
          data-open={open}
          inert={!open}
          className="pointer-events-none absolute top-full right-0 mt-2 w-[min(380px,calc(100vw-2*var(--gutter)))] origin-top-right scale-95 bg-card p-6 opacity-0 shadow-xl transition-[opacity,transform] duration-500 ease-(--ease-out) data-[open=true]:pointer-events-auto data-[open=true]:scale-100 data-[open=true]:opacity-100"
        >
          <nav aria-label="Main">
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={go(l.href)} className="roll-host display text-4xl">
                    <RollText text={l.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 bg-bg p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Energy usage</p>
              <div className="flex gap-1 text-xs font-medium">
                {["High", "Med", "Low"].map((l) => (
                  <span
                    key={l}
                    className="rounded-full px-2 py-1 transition-colors data-[on=true]:bg-fg data-[on=true]:text-bg"
                    data-on={l === usage}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 mb-4 text-sm text-muted">
              Dark mode and fewer animations lower the work your device does — and the energy it burns.
            </p>
            <div className="flex flex-col gap-4">
              <Toggle
                label="Dark mode"
                checked={theme === "dark"}
                onChange={(v) => setTheme(v ? "dark" : "light")}
                hint="OLED screens use less power to show dark pixels."
              />
              <Toggle
                label="Reduce motion"
                checked={reducedMotion}
                onChange={setReducedMotion}
                hint="Turns off smooth scrolling and most animation work."
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
