/** Tracks which 3D view wrappers are near the viewport so the shared canvas can sleep when none are. */
const visible = new Set<Element>();

export function markViewVisible(el: Element, isVisible: boolean) {
  if (isVisible) visible.add(el);
  else visible.delete(el);
}

export const anyViewVisible = () => visible.size > 0;
