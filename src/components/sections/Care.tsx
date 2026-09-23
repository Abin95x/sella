"use client";

import { useRef } from "react";
import { stats } from "@/lib/content";
import { gsap, useGSAP, isReduced } from "@/lib/gsap";

export function Care() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReduced()) return;
      gsap.from(".care-card", {
        y: 80,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".care-grid", start: "top 80%" },
      });
      gsap.utils.toArray<HTMLElement>(".care-num").forEach((el) => {
        const target = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-(--gutter) py-[14vh]">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2 className="display h-lg">Made to matter</h2>
        <p className="hidden max-w-xs text-muted md:block">
          We publish the numbers behind every chair, and we update them every year.
        </p>
      </div>
      <div className="care-grid grid gap-3 md:grid-cols-3">
        {stats.map((s, i) => (
          <article key={s.label} className="care-card flex aspect-[4/5] flex-col justify-between bg-bg-2 p-6 md:aspect-[3/4]">
            <p className="flex items-center gap-2 text-sm">
              <span className="size-2 rounded-full bg-[#e0573a]" aria-hidden="true" />
              {s.label}
            </p>
            <div className="text-center">
              <p className="display text-[clamp(4rem,9vw,8rem)] tabular-nums">
                <span className="care-num" data-value={s.value}>
                  {s.value}
                </span>
                <span className="text-[0.45em]">{s.suffix}</span>
              </p>
              <p className="mt-2 text-muted">{s.note}</p>
            </div>
            <p className="text-sm text-muted tabular-nums">0{i + 1}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
