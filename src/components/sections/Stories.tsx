"use client";

import { useRef } from "react";
import { stories } from "@/lib/content";
import { Stars } from "@/components/ui/ChairIcon";
import { gsap, useGSAP, isReduced } from "@/lib/gsap";

const avatarColors = ["#f0cf36", "#b3a4e6", "#e0573a", "#7f8c52", "#cdbfae"];

export function Stories() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0, moved: false });

  useGSAP(
    () => {
      if (isReduced()) return;
      gsap.from(".story", {
        x: 120,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: list.current, start: "top 85%" },
      });
    },
    { scope: root },
  );

  const scrollBy = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 12), behavior: "smooth" });
  };

  // Mouse drag-to-scroll (touch devices already scroll natively).
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !list.current) return;
    drag.current = { active: true, x: e.clientX, left: list.current.scrollLeft, moved: false };
    list.current.style.scrollSnapType = "none";
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || !list.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    list.current.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    drag.current.active = false;
    if (list.current) list.current.style.scrollSnapType = "";
  };

  return (
    <section id="stories" ref={root} className="py-[14vh]">
      <div className="mb-10 flex items-end justify-between gap-6 px-(--gutter)">
        <h2 className="display h-lg">Sat on, loved</h2>
        <div className="flex gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scrollBy(d)}
              aria-label={d < 0 ? "Previous stories" : "Next stories"}
              className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:bg-fg hover:text-bg"
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={list}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        data-lenis-prevent-horizontal
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-(--gutter) px-(--gutter) select-none active:cursor-grabbing"
      >
        {stories.map((s, i) => (
          <li key={s.name} className="story flex w-[min(86vw,400px)] shrink-0 snap-start flex-col justify-between gap-10 bg-bg-2 p-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="size-9 rounded-full" style={{ backgroundColor: avatarColors[i % avatarColors.length] }} aria-hidden="true" />
                <p className="font-medium">{s.name}</p>
              </div>
              <p className="mt-5 text-lg leading-snug">{s.text}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Stars count={s.rating} />
              <span className="text-muted">Verified buyer</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
