"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export const isReduced = () =>
  typeof document !== "undefined" && document.documentElement.dataset.motion === "reduced";

export { gsap, ScrollTrigger, SplitText, useGSAP };
