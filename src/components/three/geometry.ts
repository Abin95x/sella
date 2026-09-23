import * as THREE from "three";

/**
 * Procedural chair geometry. Everything is built once and cached at module level,
 * so every <View> that shows the same chair shares GPU buffers.
 */

type V3 = [number, number, number];

const once = <T,>(fn: () => T) => {
  let v: T | undefined;
  return () => (v ??= fn());
};

/** Tapered cylinder spanning two points. */
export function strut(a: V3, b: V3, rTop: number, rBottom: number, radial = 14) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = end.clone().sub(start);
  const geo = new THREE.CylinderGeometry(rTop, rBottom, dir.length(), radial, 1);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  const mid = start.add(end).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

function roundedRect(w: number, d: number, r: number, frontFlare = 0) {
  const s = new THREE.Shape();
  const hw = w / 2;
  const hd = d / 2;
  const fw = hw + frontFlare;
  s.moveTo(-hw + r, -hd);
  s.lineTo(hw - r, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + r);
  s.lineTo(fw, hd - r);
  s.quadraticCurveTo(fw, hd, fw - r, hd);
  s.lineTo(-fw + r, hd);
  s.quadraticCurveTo(-fw, hd, -fw, hd - r);
  s.lineTo(-hw, -hd + r);
  s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
  return s;
}

/* ------------------------------------------------------------------ */
/* ARC — a light stacking chair with a curved back rail               */
/* ------------------------------------------------------------------ */

const RAIL_R = 0.5;
const RAIL_SHIFT = RAIL_R - 0.2;
const railZ = (x: number) => -Math.sqrt(RAIL_R * RAIL_R - x * x) + RAIL_SHIFT;

export const arcParts = once(() => {
  // Seat: rounded slab, slightly wider at the front, soft bevel.
  const seatShape = roundedRect(0.44, 0.4, 0.07, 0.015);
  const seat = new THREE.ExtrudeGeometry(seatShape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 4,
    curveSegments: 10,
  });
  seat.rotateX(-Math.PI / 2);
  seat.translate(0, 0.435, 0.01);

  // Back rail: extruded annulus sector that wraps around the sitter.
  const a = 0.52;
  const t = 0.026;
  const rail = new THREE.Shape();
  const seg = 32;
  for (let i = 0; i <= seg; i++) {
    const th = -a + (2 * a * i) / seg;
    const p = [RAIL_R * Math.sin(th), RAIL_R * Math.cos(th)] as const;
    if (i === 0) rail.moveTo(p[0], p[1]);
    else rail.lineTo(p[0], p[1]);
  }
  for (let i = seg; i >= 0; i--) {
    const th = -a + (2 * a * i) / seg;
    rail.lineTo((RAIL_R - t) * Math.sin(th), (RAIL_R - t) * Math.cos(th));
  }
  rail.closePath();
  const railGeo = new THREE.ExtrudeGeometry(rail, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.011,
    bevelSegments: 4,
    curveSegments: 4,
  });
  railGeo.rotateX(-Math.PI / 2);
  railGeo.translate(0, 0.73, RAIL_SHIFT);

  // Rear legs: continuous tubes that run from floor into the back rail.
  const rearLeg = (side: 1 | -1) => {
    const x = 0.195 * side;
    const top = railZ(0.195) - 0.012;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * 1.08, 0, -0.26),
      new THREE.Vector3(x * 1.03, 0.22, -0.215),
      new THREE.Vector3(x, 0.44, -0.19),
      new THREE.Vector3(x, 0.66, top - 0.012),
      new THREE.Vector3(x, 0.835, top - 0.03),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.0165, 12, false);
  };

  const frontLeg = (side: 1 | -1) => strut([0.215 * side, 0, 0.225], [0.19 * side, 0.44, 0.18], 0.018, 0.0135);
  const stretcher = (side: 1 | -1) => strut([0.204 * side, 0.17, 0.205], [0.206 * side, 0.17, -0.238], 0.0105, 0.0105, 10);
  const backStretcher = strut([-0.2, 0.2, -0.232], [0.2, 0.2, -0.232], 0.0095, 0.0095, 10);

  return {
    seat,
    rail: railGeo,
    rearL: rearLeg(-1),
    rearR: rearLeg(1),
    frontL: frontLeg(-1),
    frontR: frontLeg(1),
    stretchL: stretcher(-1),
    stretchR: stretcher(1),
    backStretcher,
  };
});

/* ------------------------------------------------------------------ */
/* FLOW — a perforated one-piece shell on a four-star base            */
/* ------------------------------------------------------------------ */

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// Side profile of the shell (y, z) from the front lip up to the top of the back.
const profile = new THREE.CatmullRomCurve3(
  [
    [0.4, 0.25],
    [0.455, 0.215],
    [0.458, 0.08],
    [0.442, -0.07],
    [0.458, -0.185],
    [0.54, -0.245],
    [0.68, -0.278],
    [0.82, -0.31],
    [0.9, -0.33],
  ].map(([y, z]) => new THREE.Vector3(0, y, z)),
  false,
  "centripetal",
);

function shellPoint(u: number, v: number, out = new THREE.Vector3()) {
  const p = profile.getPoint(v);
  const s = 2 * u - 1;
  const back = smoothstep(0.42, 0.66, v);
  const waist = Math.exp(-(((v - 0.52) / 0.11) ** 2));
  const top = smoothstep(0.75, 1, v);
  const width = 0.47 - 0.13 * waist - 0.02 * top + 0.02 * (1 - smoothstep(0, 0.15, v));
  out.set(s * width * 0.5, p.y + (1 - back) * 0.04 * s * s, p.z + back * 0.075 * s * s);
  // Round the top corners of the back.
  if (v > 0.9) out.y -= 0.12 * (v - 0.9) * s ** 4;
  return out;
}

export const flowParts = once(() => {
  const nu = 48;
  const nv = 96;
  const thickness = 0.007;
  const count = (nu + 1) * (nv + 1);
  const top = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const du = new THREE.Vector3();
  const dv = new THREE.Vector3();
  const e = 1e-3;

  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const v = j / nv;
      const k = j * (nu + 1) + i;
      shellPoint(u, v, a);
      shellPoint(Math.min(1, u + e), v, b);
      shellPoint(Math.max(0, u - e), v, c);
      du.subVectors(b, c);
      shellPoint(u, Math.min(1, v + e), b);
      shellPoint(u, Math.max(0, v - e), c);
      dv.subVectors(b, c);
      const n = du.cross(dv).normalize();
      top.set([a.x, a.y, a.z], k * 3);
      normals.set([n.x, n.y, n.z], k * 3);
      uvs.set([u, v], k * 2);
    }
  }

  // Shell = top surface + offset bottom surface, explicit normals.
  const pos = new Float32Array(count * 6);
  const nor = new Float32Array(count * 6);
  const uv = new Float32Array(count * 4);
  for (let k = 0; k < count; k++) {
    const [x, y, z] = [top[k * 3], top[k * 3 + 1], top[k * 3 + 2]];
    const [nx, ny, nz] = [normals[k * 3], normals[k * 3 + 1], normals[k * 3 + 2]];
    pos.set([x, y, z], k * 3);
    nor.set([nx, ny, nz], k * 3);
    pos.set([x - nx * thickness, y - ny * thickness, z - nz * thickness], (count + k) * 3);
    nor.set([-nx, -ny, -nz], (count + k) * 3);
    uv.set([uvs[k * 2], uvs[k * 2 + 1]], k * 2);
    uv.set([uvs[k * 2], uvs[k * 2 + 1]], (count + k) * 2);
  }
  const idx: number[] = [];
  const at = (i: number, j: number) => j * (nu + 1) + i;
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const p0 = at(i, j), p1 = at(i + 1, j), p2 = at(i + 1, j + 1), p3 = at(i, j + 1);
      idx.push(p0, p1, p3, p1, p2, p3);
      idx.push(count + p0, count + p3, count + p1, count + p1, count + p3, count + p2);
    }
  }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  shell.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  shell.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  shell.setIndex(idx);

  // Rim: a thin strip joining the two surfaces around the outline.
  const ring: number[] = [];
  for (let i = 0; i <= nu; i++) ring.push(at(i, 0));
  for (let j = 1; j <= nv; j++) ring.push(at(nu, j));
  for (let i = nu - 1; i >= 0; i--) ring.push(at(i, nv));
  for (let j = nv - 1; j >= 0; j--) ring.push(at(0, j));
  const rimPos: number[] = [];
  const rimIdx: number[] = [];
  ring.forEach((k, n) => {
    rimPos.push(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]);
    rimPos.push(pos[(count + k) * 3], pos[(count + k) * 3 + 1], pos[(count + k) * 3 + 2]);
    if (n < ring.length - 1) {
      const q = n * 2;
      rimIdx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
    }
  });
  const rim = new THREE.BufferGeometry();
  rim.setAttribute("position", new THREE.Float32BufferAttribute(rimPos, 3));
  rim.setIndex(rimIdx);
  rim.computeVertexNormals();

  // Base: hub + four splayed legs.
  const hub = new THREE.CylinderGeometry(0.055, 0.045, 0.05, 24);
  hub.translate(0, 0.405, -0.02);
  const legs = [
    strut([0.035, 0.395, 0.01], [0.235, 0, 0.225], 0.017, 0.011),
    strut([-0.035, 0.395, 0.01], [-0.235, 0, 0.225], 0.017, 0.011),
    strut([0.035, 0.395, -0.05], [0.225, 0, -0.27], 0.017, 0.011),
    strut([-0.035, 0.395, -0.05], [-0.225, 0, -0.27], 0.017, 0.011),
  ];

  return { shell, rim, hub, legs };
});

/** Hex-grid perforation alpha map for the Flow shell (generated, no network). */
export const perforationMap = once(() => {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  const cols = 24;
  const rows = 52;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = (c + (r % 2 ? 0.5 : 0) + 0.5) / cols;
      const v = (r + 0.5) / rows;
      // Keep a solid border and a solid band where seat meets back.
      if (u < 0.13 || u > 0.87 || v < 0.1 || v > 0.9) continue;
      if (v > 0.44 && v < 0.54) continue;
      const fade = Math.min(u - 0.13, 0.87 - u, v - 0.1, 0.9 - v) / 0.08;
      const rad = 9.5 * Math.min(1, Math.max(0.35, fade));
      ctx.beginPath();
      ctx.arc(u * size, (1 - v) * size, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
});

/** Soft radial blob used as an ambient-occlusion shadow under each chair. */
export const blobTexture = once(() => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.45, "rgba(0,0,0,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
});
