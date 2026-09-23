"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { arcParts, flowParts, perforationMap } from "./geometry";

type ChairProps = {
  color: string;
  /** 0 = assembled, 1 = fully exploded. Read every frame, so a ref avoids React re-renders. */
  explode?: RefObject<number>;
};

type PartSpec = {
  geometry: THREE.BufferGeometry;
  offset: [number, number, number];
  spin?: [number, number, number];
  material: THREE.Material;
};

/** Eases the material colour toward the target so swatch changes feel physical. */
function useDampedColor(materials: THREE.MeshStandardMaterial[], hex: string) {
  const target = useMemo(() => new THREE.Color(hex), [hex]);
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 7);
    for (const m of materials) m.color.lerp(target, k);
  });
}

function Parts({ parts, explode }: { parts: PartSpec[]; explode?: RefObject<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const e = explode?.current ?? 0;
    parts.forEach((p, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.set(p.offset[0] * e, p.offset[1] * e, p.offset[2] * e);
      const s = p.spin ?? [0, 0, 0];
      m.rotation.set(s[0] * e, s[1] * e, s[2] * e);
    });
  });
  return (
    <>
      {parts.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={p.geometry}
          material={p.material}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

export function ArcChair({ color, explode }: ChairProps) {
  const g = arcParts();
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0, envMapIntensity: 0.9 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useDampedColor([mat], color);

  const parts = useMemo<PartSpec[]>(
    () => [
      { geometry: g.seat, offset: [0, 0.22, 0.28], spin: [0.5, 0, 0.15], material: mat },
      { geometry: g.rail, offset: [0, 0.42, -0.25], spin: [-0.4, 0.2, 0], material: mat },
      { geometry: g.rearL, offset: [-0.32, 0.08, -0.22], spin: [0, 0, 0.3], material: mat },
      { geometry: g.rearR, offset: [0.32, 0.08, -0.22], spin: [0, 0, -0.3], material: mat },
      { geometry: g.frontL, offset: [-0.34, -0.06, 0.3], spin: [0.2, 0, 0.35], material: mat },
      { geometry: g.frontR, offset: [0.34, -0.06, 0.3], spin: [0.2, 0, -0.35], material: mat },
      { geometry: g.stretchL, offset: [-0.5, 0.12, 0], spin: [0, 0.6, 0], material: mat },
      { geometry: g.stretchR, offset: [0.5, 0.12, 0], spin: [0, -0.6, 0], material: mat },
      { geometry: g.backStretcher, offset: [0, -0.02, -0.5], spin: [0, 0, 0.4], material: mat },
    ],
    [g, mat],
  );

  return <Parts parts={parts} explode={explode} />;
}

export function FlowChair({ color, explode }: ChairProps) {
  const g = flowParts();
  const [shellMat, rimMat, baseMat] = useMemo(() => {
    const shell = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.62,
      alphaMap: perforationMap(),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    const rim = new THREE.MeshStandardMaterial({ color, roughness: 0.62, side: THREE.DoubleSide });
    const base = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.35 });
    return [shell, rim, base];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useDampedColor([shellMat, rimMat, baseMat], color);

  const parts = useMemo<PartSpec[]>(
    () => [
      { geometry: g.shell, offset: [0, 0.35, 0], spin: [-0.25, 0.3, 0], material: shellMat },
      { geometry: g.rim, offset: [0, 0.35, 0], spin: [-0.25, 0.3, 0], material: rimMat },
      { geometry: g.hub, offset: [0, 0.05, 0], material: baseMat },
      { geometry: g.legs[0], offset: [0.28, -0.04, 0.28], spin: [0.3, 0, -0.3], material: baseMat },
      { geometry: g.legs[1], offset: [-0.28, -0.04, 0.28], spin: [0.3, 0, 0.3], material: baseMat },
      { geometry: g.legs[2], offset: [0.28, -0.04, -0.28], spin: [-0.3, 0, -0.3], material: baseMat },
      { geometry: g.legs[3], offset: [-0.28, -0.04, -0.28], spin: [-0.3, 0, 0.3], material: baseMat },
    ],
    [g, shellMat, rimMat, baseMat],
  );

  return <Parts parts={parts} explode={explode} />;
}
