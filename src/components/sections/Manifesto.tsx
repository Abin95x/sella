"use client";

import { useRef } from "react";
import { tiles } from "@/lib/content";
import { gsap, SplitText, useGSAP, isReduced } from "@/lib/gsap";
import { ChairIcon } from "@/components/ui/ChairIcon";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReduced()) return;
      SplitText.create(".manifesto-text", {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: ".manifesto-text", start: "top 80%" },
          }),
      });

      // Scroll velocity nudges the marquee: faster scroll = faster, skewed tiles.
      const tiles = gsap.utils.toArray<HTMLElement>(".tile");
      const skew = gsap.quickTo(tiles, "skewX", { duration: 0.5, ease: "power3.out" });
      let cached: Animation | undefined;
      const anim = () => (cached ??= track.current?.getAnimations()[0]);
      gsap.to({}, {
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 3000);
            skew(v * -6);
            const a = anim();
            if (a) a.playbackRate = 1 + Math.abs(v) * 3;
          },
        },
      });
    },
    { scope: root },
  );

  const row = [...tiles, ...tiles];

  return (
    <section ref={root} className="overflow-hidden py-[14vh]">
      <p className="manifesto-text display h-md mx-auto max-w-[26ch] px-(--gutter) text-center">
        We design for the chaos of real homes — kids, deadlines, dinner parties — so that the furniture is the one thing
        you never have to think about.
      </p>

      <div className="marquee mt-[10vh]" aria-hidden="true">
        <div ref={track} className="marquee-track flex w-max gap-3" style={{ "--marquee-duration": "45s" } as React.CSSProperties}>
          {row.map((t, i) => (
            <div
              key={i}
              className="tile grid aspect-[3/4] w-[clamp(150px,17vw,250px)] place-items-center will-change-transform"
              style={{ backgroundColor: t.color }}
            >
              <ChairIcon kind={t.chair} color={t.tone} className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
