# sella — 3D furniture studio concept

A concept site inspired by the layout and motion language of noho.ink, with an original brand, copy and
procedurally-generated 3D chairs (no external models or photos).

## Stack
Next.js 16 (App Router, TS) · Tailwind v4 · three.js + @react-three/fiber + drei · GSAP (ScrollTrigger, SplitText) · Lenis

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live
- `src/components/three/geometry.ts` — procedural Arc / Flow chair geometry, perforation alpha map, blob shadow
- `src/components/three/Scene.tsx` — the single shared WebGL canvas (drei `View.Port`)
- `src/components/three/Stage.tsx` — hero stage (intro assembly, scroll spin, parallax) and product stage (drag to orbit)
- `src/components/three/spin.ts` — drag-to-orbit in every direction with inertia; registers views for sleep tracking
- `src/components/sections/*` — page sections; `src/lib/content.ts` — all copy and data

## Performance notes
- One WebGL context for all 3D views; the canvas sleeps entirely when no chair is near the viewport.
- WebGL renders from GSAP's ticker right after Lenis, so 3D never lags its DOM panel by a frame.
- Adaptive resolution (drei PerformanceMonitor) drops DPR on slow GPUs.
- three.js loads in a separate chunk, only after the browser is idle, so text paints first.
- Geometry built once and shared; lighting uses procedural Lightformers (no HDR download).
- Product contact shadows are baked once (the camera orbits, the chair stays put); the hero uses a blob shadow only.
- "Reduce motion" / dark-mode toggles in the menu; honours `prefers-reduced-motion`.
