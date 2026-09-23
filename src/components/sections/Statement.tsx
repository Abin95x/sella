"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, isReduced } from "@/lib/gsap";
import { ChairIcon } from "@/components/ui/ChairIcon";

function Chip({ bg, kind, fg }: { bg: string; kind: "arc" | "flow"; fg: string }) {
  return (
    <span
      className="chip mx-[0.12em] inline-grid h-[0.78em] w-[1.1em] translate-y-[0.06em] place-items-center align-baseline"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <ChairIcon kind={kind} color={fg} className="h-[0.62em]" />
    </span>
  );
}

export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReduced()) return;
      const split = SplitText.create(".statement-text", { type: "words" });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.5 },
      });
      tl.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none" }, 0);
      tl.from(".chip", { scale: 0, rotate: -25, stagger: 0.8, ease: "back.out(2)", duration: 0.8 }, 0);
    },
    { scope: root },
  );

  return (
    <section id="studio" ref={root} className="px-(--gutter) py-[18vh] text-center">
      <p className="mb-8 text-sm text-muted">(The studio)</p>
      <p className="statement-text display h-lg mx-auto max-w-[20ch]">
        Every chair starts life as something <Chip bg="#b3a4e6" kind="flow" fg="#262626" /> thrown away — old
        fishing nets, worn-out carpet <Chip bg="#f0cf36" kind="arc" fg="#2e2d2b" /> and castor oil — and ends up
        as the seat you <Chip bg="#7f8c52" kind="arc" fg="#ebe7df" /> reach for first.
      </p>
    </section>
  );
}
