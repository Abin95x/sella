"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import { gsap } from "@/lib/gsap";
import { anyViewVisible } from "./visibility";

/**
 * Renders from GSAP's ticker instead of R3F's own rAF. Lenis (prioritised on the same ticker) scrolls
 * first, then ScrollTrigger scrubs, then we render — so views read the final scroll position of the frame
 * and never trail their DOM panels by a frame. When no 3D view is near the viewport the canvas sleeps.
 */
function TickerDriver() {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    let awake = true;
    // R3F expects seconds here (delta = timestamp - clock.elapsedTime). We feed a virtual clock that
    // advances by at most 0.1s per tick, so waking from sleep or a background tab never jumps the scene.
    let last = performance.now();
    let clock = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (anyViewVisible()) {
        awake = true;
        clock += dt;
        advance(clock);
      } else if (awake) {
        // Wipe the last frame so no stale chair lingers over the page while asleep.
        gl.setScissorTest(false);
        gl.clear();
        awake = false;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, gl]);

  return null;
}

/**
 * One fixed, transparent WebGL canvas for the whole page. Every 3D block on the page is a drei <View>
 * that scissors into this canvas, so we pay for a single GL context and views off-screen are skipped.
 */
export default function Scene() {
  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const [dpr, setDpr] = useState(Math.min(maxDpr, 1.5));

  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      frameloop="never"
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }}
    >
      {/* Drops resolution on slow GPUs, raises it again when there is headroom. */}
      <PerformanceMonitor onIncline={() => setDpr(maxDpr)} onDecline={() => setDpr(1)} onFallback={() => setDpr(1)} flipflops={3} />
      <TickerDriver />
      <View.Port />
    </Canvas>
  );
}
