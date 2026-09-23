"use client";

import { useSyncExternalStore } from "react";
import { products } from "./content";

/** Tiny external store so DOM swatches and 3D materials share the selected colour without prop drilling. */
type State = Record<string, number>;
// Default swatch per chair (index into its swatch list). Hero starts on Tomato (red).
const initial: State = { arc: 0, flow: 0, hero: 1 };
let state: State = initial;
const listeners = new Set<() => void>();

export const colorStore = {
  get: () => state,
  set(id: string, index: number) {
    if (state[id] === index) return;
    state = { ...state, [id]: index };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSwatchIndex(id: string) {
  return useSyncExternalStore(
    colorStore.subscribe,
    () => colorStore.get()[id] ?? 0,
    // Server render uses the same defaults, so the page never flashes a different colour on hydration.
    () => initial[id] ?? 0,
  );
}

export const heroSwatches = products[0].swatches;
