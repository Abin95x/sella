"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { products, type Product } from "@/lib/content";
import { colorStore, useSwatchIndex } from "@/lib/colorStore";
import { gsap, useGSAP, isReduced } from "@/lib/gsap";
import { ProductView } from "@/components/three/lazy";
import { RollText } from "@/components/ui/RollText";
import { Stars } from "@/components/ui/ChairIcon";
import { getLenis } from "@/components/providers/SmoothScroll";

const noop = () => () => {};

function Drawer({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (!open) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portalled to <body> so the panel's scroll-driven clip-path can't clip the fixed drawer.
  return createPortal(
    <div className="fixed inset-0 z-60" inert={!open} aria-hidden={!open}>
      <div
        className="absolute inset-0 bg-black/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 data-[open=true]:opacity-100"
        data-open={open}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} details`}
        data-lenis-prevent
        data-open={open}
        className="absolute inset-y-0 right-0 w-full max-w-[560px] translate-x-full overflow-y-auto bg-bg p-(--gutter) transition-transform duration-700 ease-(--ease-in-out) data-[open=true]:translate-x-0 md:p-10"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{product.name}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full bg-card text-xl shadow-sm"
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <h3 className="display h-md mt-10">{product.tagline}</h3>
        <p className="mt-4 text-lg leading-snug text-muted">{product.blurb}</p>

        <figure className="mt-10 bg-card p-6">
          <Stars count={5} />
          <blockquote className="mt-3 text-xl leading-snug font-medium">“{product.quote.text}”</blockquote>
          <figcaption className="mt-3 text-sm text-muted">— {product.quote.author}</figcaption>
        </figure>

        <h4 className="mt-12 mb-4 text-sm text-muted">Why {product.name.split(" ")[1]}</h4>
        <ol className="divide-y divide-line border-y border-line">
          {product.features.map((f, i) => (
            <li key={f.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-5">
              <span className="text-sm text-muted tabular-nums">0{i + 1}</span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{f.title}</p>
                <p className="mt-1 leading-snug text-muted">{f.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4">
          {product.specs.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>,
    document.body,
  );
}

function ProductPanel({ product, index }: { product: Product; index: number }) {
  const active = useSwatchIndex(product.id);
  const swatch = product.swatches[active];
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <li
      className="product-panel relative flex h-[max(88svh,640px)] flex-col transition-colors duration-700 ease-(--ease-out)"
      style={{ backgroundColor: swatch.panel }}
    >
      <div className="flex items-start justify-between p-(--gutter) text-[#2e2d2b]">
        <span className="text-sm tabular-nums">0{index + 1}</span>
      </div>

      <ProductView id={product.id} className="relative min-h-0 flex-1" />

      <div className="flex flex-wrap items-end justify-between gap-5 p-(--gutter) text-[#2e2d2b]">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{product.name}</p>
          <p className="mt-0.5 text-sm">
            From <span className="font-semibold">${product.price}</span> · <span>{swatch.name}</span>
          </p>
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label={`${product.name} colour`}>
            {product.swatches.map((s, i) => (
              <button
                key={s.name}
                type="button"
                role="radio"
                aria-checked={i === active}
                aria-label={s.name}
                onClick={() => colorStore.set(product.id, i)}
                className="size-6 rounded-full border border-black/15 transition-transform duration-300 hover:scale-110 aria-checked:ring-2 aria-checked:ring-[#2e2d2b] aria-checked:ring-offset-2"
                style={{ backgroundColor: s.hex, ["--tw-ring-offset-color" as string]: swatch.panel }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(true)} className="roll-host rounded-full bg-white px-5 py-3 text-sm font-medium">
            <RollText text="Details" />
          </button>
        </div>
      </div>

      {mounted && <Drawer product={product} open={open} onClose={close} />}
    </li>
  );
}

export function Products() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReduced()) return;
      gsap.fromTo(
        ".product-panel",
        { clipPath: "inset(12% 6% 0% 6%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 25%", scrub: 0.5 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="chairs" ref={root} aria-label="Chairs">
      <ul className="grid md:grid-cols-2">
        {products.map((p, i) => (
          <ProductPanel key={p.id} product={p} index={i} />
        ))}
      </ul>
      <p className="px-(--gutter) pt-3 text-sm text-muted">Drag a chair to spin it.</p>
    </section>
  );
}
