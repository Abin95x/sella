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

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/26d651bb-bdd3-4887-8843-54427cc0b4b3" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5f54c29b-3738-45c6-b822-32c66a180c9a" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e0dee480-6aa5-4f2a-bb02-331267351fbd" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0325f05b-50c3-43c5-b440-d686783990dc" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bfe6ef83-ba96-4e5a-8b6c-4c56ec811c64" />





