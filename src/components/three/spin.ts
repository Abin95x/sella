"use client";

import { useEffect, useMemo, useRef } from "react";
import { markViewVisible } from "./visibility";

/** Drag-to-orbit state, mutated by DOM pointer handlers and read inside useFrame. */
export type Spin = {
  /** Horizontal orbit (radians, unbounded). */
  angle: number;
  /** Vertical orbit (radians, clamped to [tiltMin, tiltMax]). */
  tilt: number;
  /** Radians per 60fps frame, used for inertia after release. */
  velocity: number;
  tiltVelocity: number;
  tiltMin: number;
  tiltMax: number;
  dragging: boolean;
  touched: boolean;
};

const createSpin = (tiltMin: number, tiltMax: number): Spin => ({
  angle: 0,
  tilt: 0,
  velocity: 0,
  tiltVelocity: 0,
  tiltMin,
  tiltMax,
  dragging: false,
  touched: false,
});

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Orbit state plus pointer handlers for the wrapper element around a 3D view.
 * Horizontal drag orbits around the chair, vertical drag tilts over/under it.
 * Pointer capture keeps the drag alive outside the element. The wrapper also registers itself
 * for visibility tracking so the shared canvas can sleep when no chair is on screen.
 */
export function useSpin({ tiltMin = -1.2, tiltMax = 0.9 } = {}) {
  const spin = useRef<Spin>(createSpin(tiltMin, tiltMax));
  const last = useRef({ x: 0, y: 0, t: 0, id: -1 });
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => markViewVisible(node, entry.isIntersecting), {
      rootMargin: "15% 0px",
    });
    io.observe(node);
    return () => {
      io.disconnect();
      markViewVisible(node, false);
    };
  }, []);

  const handlers = useMemo(() => {
    const end = (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerId !== last.current.id) return;
      spin.current.dragging = false;
      last.current.id = -1;
      delete e.currentTarget.dataset.dragging;
    };
    return {
      onPointerDown(e: React.PointerEvent<HTMLElement>) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // Stops text selection / native drag-and-drop from hijacking the gesture.
        if (e.pointerType === "mouse") e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.dataset.dragging = "";
        const s = spin.current;
        s.dragging = true;
        s.touched = true;
        s.velocity = 0;
        s.tiltVelocity = 0;
        last.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
      },
      onPointerMove(e: React.PointerEvent<HTMLElement>) {
        const l = last.current;
        const s = spin.current;
        if (!s.dragging || e.pointerId !== l.id) return;
        const now = performance.now();
        const size = Math.max(1, e.currentTarget.clientHeight);
        const dx = ((e.clientX - l.x) / size) * Math.PI * 1.6;
        const dy = ((e.clientY - l.y) / size) * Math.PI * 1.2;
        const frames = Math.max(1, now - l.t) / 16.7;
        s.angle += dx;
        s.tilt = clamp(s.tilt + dy, s.tiltMin, s.tiltMax);
        s.velocity = dx / frames;
        s.tiltVelocity = dy / frames;
        l.x = e.clientX;
        l.y = e.clientY;
        l.t = now;
      },
      onPointerUp: end,
      onPointerCancel: end,
      onLostPointerCapture: end,
    };
  }, []);

  return { spin, handlers, ref: el };
}

/** Advances inertia (and the idle turn until the user touches it); call once per frame. */
export function stepSpin(s: Spin, dt: number, idleSpeed: number) {
  if (s.dragging) return;
  dt = Math.min(dt, 0.05);
  const f = dt * 60;
  const decay = Math.pow(0.92, f);
  s.angle += s.velocity * f;
  s.tilt = clamp(s.tilt + s.tiltVelocity * f, s.tiltMin, s.tiltMax);
  s.velocity *= decay;
  s.tiltVelocity *= decay;
  if (Math.abs(s.velocity) < 1e-4) s.velocity = 0;
  if (Math.abs(s.tiltVelocity) < 1e-4) s.tiltVelocity = 0;
  if (!s.touched) s.angle += idleSpeed * dt;
}
