"use client";

import type { RefObject } from "react";
import { View } from "@react-three/drei";
import { products } from "@/lib/content";
import { heroSwatches, useSwatchIndex } from "@/lib/colorStore";
import { usePrefs } from "@/components/providers/Prefs";
import { HeroStage, ProductStage, type Motion } from "./Stage";
import { useSpin } from "./spin";

// Drag surface: mouse/pen drags orbit in every direction; on touch, vertical swipes keep scrolling the page.
const dragClass = "touch-pan-y cursor-grab select-none data-dragging:cursor-grabbing";

export function HeroView({ motion, className }: { motion: RefObject<Motion>; className?: string }) {
  const i = useSwatchIndex("hero");
  const { spin, handlers, ref } = useSpin();
  return (
    <div ref={ref} className={`${className ?? ""} ${dragClass}`} {...handlers}>
      <View className="size-full" index={1}>
        <HeroStage kind="arc" color={heroSwatches[i].hex} motion={motion} spin={spin} />
      </View>
    </div>
  );
}

export function ProductView({ id, className }: { id: "arc" | "flow"; className?: string }) {
  const product = products.find((p) => p.id === id)!;
  const i = useSwatchIndex(id);
  const { reducedMotion } = usePrefs();
  const { spin, handlers, ref } = useSpin();
  return (
    <div ref={ref} className={`${className ?? ""} ${dragClass}`} {...handlers}>
      <View className="size-full" index={id === "arc" ? 2 : 3}>
        <ProductStage kind={id} color={product.swatches[i].hex} spin={spin} idle={!reducedMotion} />
      </View>
    </div>
  );
}
