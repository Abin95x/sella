"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/** three.js + drei live in their own chunks and never run on the server. */
export const HeroView = dynamic(() => import("./Views").then((m) => m.HeroView), { ssr: false });
export const ProductView = dynamic(() => import("./Views").then((m) => m.ProductView), { ssr: false });
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Mounts the shared canvas once the browser is idle, so text paints (LCP) before WebGL spins up. */
export function DeferredScene() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(go, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(go, 300);
    return () => clearTimeout(t);
  }, []);
  return ready ? <Scene /> : null;
}
