"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefs } from "./Prefs";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in lock-step. */
export function SmoothScroll() {
  const { reducedMotion } = usePrefs();

  useEffect(() => {
    if (reducedMotion) return;
    // Slow, glide-y feel: low lerp = longer ease-out after each wheel tick; lower multiplier = less
    // distance per tick. Touch keeps native momentum (syncTouch off) so phones don't feel sluggish.
    const lenis = new Lenis({
      lerp: 0.055,
      wheelMultiplier: 0.65,
      touchMultiplier: 1,
      anchors: { offset: -20, duration: 2 },
      autoRaf: false,
    });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    // Prioritised: scroll must settle before scrubbed tweens and the WebGL render read it this frame.
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reducedMotion]);

  return null;
}
