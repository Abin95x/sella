"use client";

import { useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

export const cart = {
  add() {
    count += 1;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useCartCount = () =>
  useSyncExternalStore(
    cart.subscribe,
    () => count,
    () => 0,
  );
