"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/** Script injected in <head> so the saved theme / motion preference applies before first paint. */
export const prefsBootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('sella-theme');if(t)d.dataset.theme=t;var m=localStorage.getItem('sella-motion');if(m==='reduced'||(!m&&matchMedia('(prefers-reduced-motion: reduce)').matches))d.dataset.motion='reduced';}catch(e){}})();`;

// The <html> data attributes are the single source of truth; React subscribes to them.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  return () => mo.disconnect();
};
const snapshot = () => `${document.documentElement.dataset.theme ?? "light"}|${document.documentElement.dataset.motion ?? "full"}`;
const serverSnapshot = () => "light|full";

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function usePrefs() {
  const [themeRaw, motion] = useSyncExternalStore(subscribe, snapshot, serverSnapshot).split("|");
  const theme: Theme = themeRaw === "dark" ? "dark" : "light";

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    write("sella-theme", t);
  }, []);

  const setReducedMotion = useCallback((v: boolean) => {
    const d = document.documentElement;
    if (v) d.dataset.motion = "reduced";
    else delete d.dataset.motion;
    write("sella-motion", v ? "reduced" : "full");
  }, []);

  return { theme, reducedMotion: motion === "reduced", setTheme, setReducedMotion };
}
