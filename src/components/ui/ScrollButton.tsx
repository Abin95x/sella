"use client";

import { useEffect, useState } from "react";
import { getLenis } from "../providers/SmoothScroll";

export function ScrollButton() {
  const [direction, setDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    const onScroll = () => {
      // If we've scrolled down more than 100px, show "up", else "down"
      if (window.scrollY > 100) {
        setDirection("up");
      } else {
        setDirection("down");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const lenis = getLenis();
    lenis?.start();
    if (direction === "down") {
      const bottom = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (lenis) {
        lenis.scrollTo(bottom, { duration: 1.5 });
      } else {
        window.scrollTo({ top: bottom, behavior: "smooth" });
      }
    } else {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-fg text-bg shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
      aria-label={direction === "down" ? "Scroll down" : "Scroll to top"}
    >
      <svg
        className={`size-6 transition-transform duration-500 ease-(--ease-out) ${
          direction === "down" ? "rotate-0" : "rotate-180"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
