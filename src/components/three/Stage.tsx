"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ArcChair, FlowChair } from "./Chairs";
import { blobTexture } from "./geometry";
import { stepSpin, type Spin } from "./spin";

export type ChairKind = "arc" | "flow";

/** Mutable values written by GSAP / pointer handlers and read inside useFrame (no React renders). */
export type Motion = {
  /** Intro values (load timeline). */
  explode: number;
  rotation: number;
  /** Scroll-scrubbed values, summed with the intro ones. */
  scrollExplode: number;
  scrollRotation: number;
  lift: number;
  pointerX: number;
  pointerY: number;
};

const TARGET = new THREE.Vector3(0, 0.44, 0);

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.4, 4, 2.2]} intensity={1.7} />
      <directionalLight position={[-3, 2, -1]} intensity={0.35} />
      {/* Procedural studio reflections — no HDR download needed. */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 3, 2]} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-3, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[3, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
      </Environment>
    </>
  );
}

/** Cheap soft shadow: one textured quad, no extra render pass. */
function BlobShadow({ opacity = 0.28 }: { opacity?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.0005, -0.02]} scale={[0.95, 0.85, 1]} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={blobTexture()} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

type V3 = [number, number, number];
const PRODUCT_CAM: V3 = [1.45, 0.95, 1.85];
const HERO_CAM: V3 = [1.2, 1.05, 2.25];

/**
 * Camera that orbits TARGET. Vertical drag (spin.tilt) moves it over/under the chair; when `yaw` is set,
 * horizontal drag (spin.angle) orbits around it too. Eased so the motion stays soft.
 */
function OrbitCamera({ from, fov, spin, yaw }: { from: V3; fov: number; spin: RefObject<Spin>; yaw: boolean }) {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const base = useMemo(() => new THREE.Spherical().setFromVector3(new THREE.Vector3(...from).sub(TARGET)), [from]);
  const current = useRef({ theta: base.theta, phi: base.phi });
  const sph = useMemo(() => new THREE.Spherical(), []);

  useFrame((_, dt) => {
    const cam = ref.current;
    if (!cam) return;
    const s = spin.current;
    const c = current.current;
    const k = s.dragging ? 1 - Math.exp(-Math.min(dt, 0.05) * 22) : 1 - Math.exp(-Math.min(dt, 0.05) * 10);
    c.theta += (base.theta - (yaw ? s.angle : 0) - c.theta) * k;
    c.phi += (THREE.MathUtils.clamp(base.phi - s.tilt, 0.08, Math.PI - 0.08) - c.phi) * k;
    sph.set(base.radius, c.phi, c.theta);
    cam.position.setFromSpherical(sph).add(TARGET);
    cam.lookAt(TARGET);
  });

  return <PerspectiveCamera ref={ref} makeDefault fov={fov} />;
}

function Chair({ kind, color, explode }: { kind: ChairKind; color: string; explode?: RefObject<number> }) {
  return kind === "arc" ? <ArcChair color={color} explode={explode} /> : <FlowChair color={color} explode={explode} />;
}

/**
 * Product stage: drag in any direction to orbit (with inertia), slow idle turn until touched.
 * The chair never moves relative to the floor (the camera orbits), so one baked contact-shadow frame is enough.
 */
export function ProductStage({ kind, color, spin, idle }: { kind: ChairKind; color: string; spin: RefObject<Spin>; idle: boolean }) {
  useFrame((_, dt) => stepSpin(spin.current, dt, idle ? -0.35 : 0));

  return (
    <>
      <OrbitCamera from={PRODUCT_CAM} fov={28} spin={spin} yaw />
      <Lights />
      <group rotation-y={0.35}>
        <Chair kind={kind} color={color} />
      </group>
      <BlobShadow />
      <ContactShadows position={[0, 0.001, 0]} scale={2.2} blur={1.6} opacity={0.75} far={0.6} resolution={512} frames={1} />
    </>
  );
}

/** Hero stage: intro/scroll/parallax come from `motion`; the user can also drag it in any direction. */
export function HeroStage({ kind, color, motion, spin }: { kind: ChairKind; color: string; motion: RefObject<Motion>; spin: RefObject<Spin> }) {
  const group = useRef<THREE.Group>(null);
  const explode = useRef(1);

  useFrame((state, dt) => {
    const m = motion.current;
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 6);
    explode.current = m.explode + m.scrollExplode;
    stepSpin(spin.current, dt, 0);
    const drag = spin.current.angle;
    const idle = Math.sin(state.clock.elapsedTime * 0.8) * 0.012;
    const targetY = m.rotation + m.scrollRotation + drag + m.pointerX * 0.35;
    // Follow the finger tightly while dragging, ease otherwise.
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, spin.current.dragging ? 1 - Math.exp(-dt * 18) : k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, m.pointerY * 0.06, k);
    g.position.y = m.lift + idle;
  });

  return (
    <>
      {/* Horizontal drag turns the chair itself (it shares that axis with the scroll spin); vertical drag tilts the camera. */}
      <OrbitCamera from={HERO_CAM} fov={30} spin={spin} yaw={false} />
      <Lights />
      <group ref={group}>
        <Chair kind={kind} color={color} explode={explode} />
      </group>
      {/* Blob only: a live contact shadow would cost an extra depth + blur pass every frame. */}
      <BlobShadow opacity={0.4} />
    </>
  );
}
