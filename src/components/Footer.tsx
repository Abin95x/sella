"use client";

import { useRef } from "react";
import { gsap, useGSAP, isReduced } from "@/lib/gsap";
import { RollText } from "./ui/RollText";
import { getLenis } from "./providers/SmoothScroll";

const cols = [
  { title: "Shop", links: ["Arc", "Flow", "Gift cards", "Trade"] },
  { title: "Studio", links: ["About", "Materials", "Journal", "Careers"] },
  { title: "Follow", links: ["Instagram", "Pinterest", "YouTube", "Newsletter"] },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReduced()) return;
      gsap.from(".wordmark-letter", {
        yPercent: 100,
        ease: "none",
        stagger: 0.06,
        scrollTrigger: { trigger: ".wordmark", start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
    },
    { scope: root },
  );

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 2.6 });
    else window.scrollTo({ top: 0 });
  };

  return (
    <footer ref={root} className="overflow-hidden bg-tan px-(--gutter) pt-16 text-[#2e2d2b] [:root[data-theme=dark]_&]:text-fg">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
        <div>
          <p className="text-sm opacity-70">Say hello</p>
          <a href="mailto:hello@sella.example" className="mt-2 block text-xl font-medium">
            hello@sella.example
          </a>
          <p className="mt-2 text-sm opacity-70">Studio 4, 12 Rua das Flores, Lisbon</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm opacity-70">{c.title}</p>
            <ul className="mt-2 space-y-1">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="roll-host font-medium">
                    <RollText text={l} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="button" onClick={toTop} className="roll-host self-start text-sm font-medium">
          <RollText text="Back to top ↑" />
        </button>
      </div>

      <p className="wordmark display mt-16 flex justify-center overflow-hidden text-[29vw] leading-[0.82] tracking-[-0.07em]" aria-label="sella">
        {"sella".split("").map((ch, i) => (
          <span key={i} className="wordmark-letter inline-block" aria-hidden="true">
            {ch}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap justify-between gap-4 border-t border-black/10 py-5 text-sm opacity-70">
        <p>© {new Date().getFullYear()} sella studio — a design concept</p>
        <p>Privacy · Terms · Cookies</p>
      </div>
    </footer>
  );
}
