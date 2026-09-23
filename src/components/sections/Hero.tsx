"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, isReduced } from "@/lib/gsap";
import { colorStore, heroSwatches, useSwatchIndex } from "@/lib/colorStore";
import { HeroView } from "@/components/three/lazy";
import type { Motion } from "@/components/three/Stage";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const motion = useRef<Motion>({
    explode: 1,
    rotation: -1.4,
    scrollExplode: 0,
    scrollRotation: 0,
    lift: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const active = useSwatchIndex("hero");
  const swatch = heroSwatches[active];

  useGSAP(
    () => {
      const m = motion.current;
      gsap.set(".hero-title", { autoAlpha: 1 });
      if (isReduced()) {
        m.explode = 0;
        m.rotation = 0.55;
        return;
      }

      SplitText.create(".hero-title", {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.09, delay: 0.1 }),
      });

      gsap
        .timeline({ delay: 0.2 })
        .from(".hero-fade", { autoAlpha: 0, y: 14, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.5)
        .to(m, { explode: 0, rotation: 0.55, duration: 2.6, ease: "expo.inOut" }, 0);

      // Scroll: the chair turns and gently comes apart as the hero leaves the viewport.
      gsap.to(m, {
        scrollRotation: Math.PI * 1.1,
        scrollExplode: 0.45,
        lift: 0.12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      gsap.to(".hero-copy", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return () => ScrollTrigger.refresh();
    },
    { scope: root },
  );

  // Rect is cached on enter so pointer moves never force a layout read.
  const rect = useRef<DOMRect | null>(null);
  const onPointerEnter = () => {
    rect.current = root.current!.getBoundingClientRect();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = (rect.current ??= root.current!.getBoundingClientRect());
    motion.current.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
    motion.current.pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  return (
    <section id="top" ref={root} onPointerEnter={onPointerEnter} onPointerMove={onPointerMove} className="relative grid min-h-svh md:grid-cols-2">
      <div className="hero-copy flex flex-col justify-between gap-10 px-(--gutter) pt-28 pb-(--gutter) md:pt-32">
        <h1 className="hero-title display h-xl max-w-[11ch] [.js_&]:invisible">
          Chairs that keep up with the way you actually live
        </h1>
        <div className="flex items-end justify-between gap-6">
          <p className="hero-fade max-w-xs text-lg leading-snug">
            An independent furniture studio making light, playful seats from recovered materials.
          </p>
          <p className="hero-fade hidden text-sm text-muted md:block">(Scroll)</p>
        </div>
      </div>

      <div
        className="relative h-[72svh] overflow-hidden transition-colors duration-700 ease-(--ease-out) md:h-auto"
        style={{ backgroundColor: swatch.panel }}
      >
        <HeroView motion={motion} className="absolute inset-x-0 top-0 bottom-28" />
        <p className="hero-fade absolute top-5 left-(--gutter) text-sm text-[#2e2d2b] md:top-32">
          Arc — {swatch.name}
        </p>
        <div className="hero-fade absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-(--gutter) text-[#2e2d2b]">
          <div className="flex gap-2" role="radiogroup" aria-label="Chair colour">
            {heroSwatches.map((s, i) => (
              <button
                key={s.name}
                type="button"
                role="radio"
                aria-checked={i === active}
                aria-label={s.name}
                onClick={() => colorStore.set("hero", i)}
                className="size-8 rounded-full border border-black/15 ring-offset-2 ring-offset-transparent transition-transform duration-300 hover:scale-110 aria-checked:ring-2 aria-checked:ring-[#2e2d2b]"
                style={{ backgroundColor: s.hex }}
              />
            ))}
          </div>
          <p className="text-right text-sm">9 parts · 0 screws · 2.8 kg</p>
        </div>
      </div>
    </section>
  );
}
