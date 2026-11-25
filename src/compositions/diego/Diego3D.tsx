import React, {useLayoutEffect, useMemo} from "react";
import {useThree} from "@react-three/fiber";
import {ThreeCanvas} from "@remotion/three";
import {useCurrentFrame} from "remotion";
import * as THREE from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {RectAreaLightUniformsLib} from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import {boxerTex, concreteTex, gameTex, gradTex, hoodieTex, irisTex, neonSignTex, nightTex, poreBump, posterTex, rng, rubberTex, rugTex, skinTex, skyTex, teeTex, tileTex, wallTex, woodTex} from "./tex";

RectAreaLightUniformsLib.init();

type V3 = [number, number, number];

// ───────────────────────── Materials & primitives ─────────────────────────

type MatProps = {
  color?: string;
  rough?: number;
  metal?: number;
  emissive?: string;
  ei?: number;
  clear?: number;
  sheen?: number;
  sheenColor?: string;
  opacity?: number;
  map?: THREE.Texture;
  emissiveMap?: THREE.Texture;
  bump?: THREE.Texture;
  bumpScale?: number;
  side?: THREE.Side;
};

const Mat: React.FC<MatProps> = ({color = "#ffffff", rough = 0.55, metal = 0, emissive, ei = 0, clear = 0, sheen = 0, sheenColor, opacity, map, emissiveMap, bump, bumpScale = 1, side}) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    metalness={metal}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={ei}
    emissiveMap={emissiveMap ?? null}
    clearcoat={clear}
    clearcoatRoughness={0.35}
    sheen={sheen}
    sheenRoughness={0.6}
    sheenColor={sheenColor ?? color}
    transparent={opacity !== undefined}
    opacity={opacity ?? 1}
    map={map ?? null}
    bumpMap={bump ?? null}
    bumpScale={bumpScale}
    side={side ?? THREE.FrontSide}
  />
);

type Tr = {p?: V3; s?: V3; rot?: V3};

const Ball: React.FC<Tr & MatProps & {r: number; seg?: number; theta?: number}> = ({p = [0, 0, 0], s = [1, 1, 1], rot = [0, 0, 0], r, seg = 48, theta = Math.PI, ...m}) => (
  <mesh position={p} scale={s} rotation={rot} castShadow receiveShadow>
    <sphereGeometry args={[r, seg, Math.round(seg * 0.75), 0, Math.PI * 2, 0, theta]} />
    <Mat {...m} />
  </mesh>
);

const Cap: React.FC<Tr & MatProps & {r: number; len: number}> = ({p = [0, 0, 0], rot = [0, 0, 0], r, len, ...m}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <capsuleGeometry args={[r, len, 12, 32]} />
    <Mat {...m} />
  </mesh>
);

const Cyl: React.FC<Tr & MatProps & {r: number; h: number; r2?: number; open?: boolean}> = ({p = [0, 0, 0], rot = [0, 0, 0], s = [1, 1, 1], r, h, r2, open, ...m}) => (
  <mesh position={p} rotation={rot} scale={s} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r, r, h, 48, 1, open]} />
    <Mat {...m} />
  </mesh>
);

const Torus: React.FC<Tr & MatProps & {r: number; tube: number; arc?: number}> = ({p = [0, 0, 0], rot = [0, 0, 0], s = [1, 1, 1], r, tube, arc = Math.PI * 2, ...m}) => (
  <mesh position={p} rotation={rot} scale={s} castShadow>
    <torusGeometry args={[r, tube, 20, 64, arc]} />
    <Mat {...m} />
  </mesh>
);

const RBox: React.FC<Tr & MatProps & {size: V3; radius?: number}> = ({p = [0, 0, 0], rot = [0, 0, 0], size, radius = 0.06, ...m}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(size[0], size[1], size[2], 4, Math.min(radius, Math.min(...size) / 2 - 0.001)), [size, radius]);
  return (
    <mesh position={p} rotation={rot} geometry={geo} castShadow receiveShadow>
      <Mat {...m} />
    </mesh>
  );
};

const Plane: React.FC<Tr & MatProps & {w: number; h: number}> = ({p = [0, 0, 0], rot = [0, 0, 0], w, h, ...m}) => (
  <mesh position={p} rotation={rot} receiveShadow>
    <planeGeometry args={[w, h]} />
    <Mat {...m} />
  </mesh>
);

// ───────────────────────── Instancing helpers ─────────────────────────

const useInstanced = (geo: THREE.BufferGeometry, mat: THREE.Material, mats: THREE.Matrix4[], colors?: THREE.Color[]) =>
  useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((x, i) => m.setMatrixAt(i, x));
    colors?.forEach((c, i) => m.setColorAt(i, c));
    m.castShadow = true;
    m.receiveShadow = true;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return m;
  }, [geo, mat, mats, colors]);

const UP = new THREE.Vector3(0, 1, 0);

/** Short strands scattered on an ellipsoid patch, combed downward. */
const hairOnEllipsoid = (seed: number, n: number, center: V3, radii: V3, keep: (d: THREE.Vector3) => boolean, len = 0.05, lie = 0.85, thick = 1) => {
  const r = rng(seed);
  const out: THREE.Matrix4[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 60) {
    const d = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (d.lengthSq() > 1 || d.lengthSq() < 0.01) continue;
    d.normalize();
    if (!keep(d)) continue;
    const pos = new THREE.Vector3(center[0] + d.x * radii[0], center[1] + d.y * radii[1], center[2] + d.z * radii[2]);
    const nrm = new THREE.Vector3(d.x / radii[0], d.y / radii[1], d.z / radii[2]).normalize();
    const tan = new THREE.Vector3(0, -1, 0).add(nrm.clone().multiplyScalar(nrm.y));
    if (tan.lengthSq() < 1e-4) tan.set(0, 0, 1);
    tan.normalize();
    const jit = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.8);
    const dir = nrm.clone().multiplyScalar(1 - lie).add(tan.multiplyScalar(lie)).add(jit).normalize();
    const l = len * (0.6 + r() * 0.8);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
    pos.add(dir.clone().multiplyScalar(l / 2));
    out.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(thick, l, thick)));
  }
  return out;
};

const strandGeo = new THREE.CylinderGeometry(0.0035, 0.006, 1, 4, 1);
const darkHairMat = new THREE.MeshStandardMaterial({color: "#1c120c", roughness: 0.8});

/** Deterministic smooth displacement → crumpled cloth / blanket blobs. */
const crumpled = (seed: number, amp = 0.16, detail = 4) => {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const r = rng(seed);
  const waves = [...Array(7)].map(() => ({w: new THREE.Vector3(r() * 6 - 3, r() * 6 - 3, r() * 6 - 3), ph: r() * 6.28, a: 0.3 + r()}));
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = waves.reduce((s, k) => s + k.a * Math.sin(v.dot(k.w) + k.ph), 0) / 3;
    v.multiplyScalar(1 + n * amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const Cloth: React.FC<Tr & MatProps & {seed: number; amp?: number}> = ({p = [0, 0, 0], s = [1, 1, 1], rot = [0, 0, 0], seed, amp, ...m}) => {
  const geo = useMemo(() => crumpled(seed, amp), [seed, amp]);
  return (
    <mesh position={p} scale={s} rotation={rot} geometry={geo} castShadow receiveShadow>
      <Mat rough={0.9} {...m} />
    </mesh>
  );
};

// ───────────────────────── Scene infrastructure ─────────────────────────

const Env: React.FC<{intensity: number}> = ({intensity}) => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
};

const CameraRig: React.FC<{pos: V3; look: V3; fov?: number}> = ({pos, look, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    if (fov && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = 0.05;
      camera.far = 80;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(...look);
  }, [camera, pos, look, fov]);
  return null;
};

const AreaLight: React.FC<{p: V3; look: V3; w: number; h: number; color: string; intensity: number}> = ({p, look, w, h, color, intensity}) => {
  const ref = React.useRef<THREE.RectAreaLight>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(...look);
  }, [look]);
  return <rectAreaLight ref={ref} position={p} width={w} height={h} color={color} intensity={intensity} />;
};

const canvasProps = {shadows: "soft" as const, gl: {antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05}};

// ───────────────────────── Diego ─────────────────────────

export type DiegoItem = "controller" | "dumbbell" | "salad" | "none";
export type Expr = "tired" | "shock" | "worried";
const SKIN = "#e8ae8c";

const useSkin = (key: string, rough = true, base = SKIN) => {
  const map = skinTex(base, key, rough);
  const bump = poreBump();
  return {map, bump, bumpScale: rough ? 0.3 : 0.08, rough: 0.52, sheen: 0.35, sheenColor: "#ff8f7a", clear: 0.06};
};

const Hand: React.FC<{side: 1 | -1; grip?: number}> = ({side, grip = 0.6}) => {
  const sk = useSkin("diego");
  return (
    <group>
      <Ball r={0.13} s={[1, 1.15, 0.7]} {...sk} />
      {[-0.075, -0.025, 0.025, 0.075].map((x, i) => (
        <group key={i} position={[x * side, -0.12, 0.02]} rotation={[grip * 1.2, 0, 0]}>
          <Cap p={[0, -0.06, 0]} r={0.034} len={0.09 - Math.abs(i - 1.5) * 0.012} {...sk} />
        </group>
      ))}
      <group position={[-0.11 * side, -0.02, 0.06]} rotation={[0.6, 0, -0.7 * side]}>
        <Cap p={[0, -0.05, 0]} r={0.036} len={0.07} {...sk} />
      </group>
    </group>
  );
};

/** One arm, pivoting at the shoulder. Angles: [flex, abduction], elbow bend. */
const Arm: React.FC<{side: 1 | -1; flex: number; abd: number; elbow: number; twist?: number; children?: React.ReactNode; grip?: number}> = ({side, flex, abd, elbow, twist = 0, children, grip}) => {
  const sk = useSkin("diego");
  const tee = teeTex(false);
  return (
    <group rotation={[flex, twist * side, abd * side]}>
      <Cap p={[0, -0.3, 0]} r={0.21} len={0.4} {...sk} />
      {/* sleeve */}
      <Cyl p={[0, -0.1, 0]} r={0.245} r2={0.235} h={0.28} map={tee} rough={0.85} sheen={0.6} />
      <group position={[0, -0.6, 0]} rotation={[elbow, 0, 0]}>
        <Ball r={0.18} {...sk} />
        <Cap p={[0, -0.26, 0]} r={0.17} len={0.36} {...sk} />
        <group position={[0, -0.6, 0]}>
          <Hand side={side} grip={grip} />
          {children}
        </group>
      </group>
    </group>
  );
};

const Leg: React.FC<{side: 1 | -1; hip: number; knee: number; t: number}> = ({side, hip, knee}) => {
  const sk = useSkin("diego");
  const hair = useMemo(() => hairOnEllipsoid(31 + side, 140, [0, -0.3, 0], [0.25, 0.45, 0.25], (d) => d.z > -0.2, 0.032, 0.94, 0.8), [side]);
  const legHair = useInstanced(strandGeo, darkHairMat, hair);
  return (
    <group rotation={[hip, 0, side * 0.04]}>
      <Cap p={[0, -0.3, 0]} r={0.25} len={0.35} {...sk} />
      <primitive object={legHair} />
      <group position={[0, -0.6, 0]} rotation={[knee, 0, 0]}>
        <Cap p={[0, -0.22, 0]} r={0.2} len={0.3} {...sk} />
        {/* sock + slide */}
        <Cyl p={[0, -0.45, 0]} r={0.2} r2={0.19} h={0.14} color="#f4f4f4" rough={0.9} sheen={0.5} />
        <Torus p={[0, -0.41, 0]} r={0.2} tube={0.018} rot={[Math.PI / 2, 0, 0]} color={side > 0 ? "#ff3b5c" : "#2f6bff"} />
        <group position={[0, -0.56, 0.12]}>
          <Ball r={0.2} s={[1, 0.55, 1.55]} color="#f4f4f4" rough={0.9} sheen={0.5} />
          {side > 0 && <Ball p={[0.02, 0.02, 0.29]} r={0.05} s={[1, 0.8, 0.6]} {...sk} />}
          <RBox p={[0, -0.09, 0.02]} size={[0.44, 0.06, 0.72]} radius={0.03} color="#141418" rough={0.5} />
          <RBox p={[0, -0.02, -0.05]} size={[0.42, 0.04, 0.14]} radius={0.02} color="#2a2a33" />
        </group>
      </group>
    </group>
  );
};

const Controller: React.FC<{t: number}> = ({t}) => (
  <group>
    <RBox size={[0.6, 0.12, 0.28]} radius={0.05} color="#14141a" rough={0.35} clear={0.6} />
    <Ball p={[-0.27, -0.04, 0.06]} r={0.13} s={[1, 0.75, 1.3]} color="#14141a" rough={0.35} clear={0.6} />
    <Ball p={[0.27, -0.04, 0.06]} r={0.13} s={[1, 0.75, 1.3]} color="#14141a" rough={0.35} clear={0.6} />
    {(["#ff3b5c", "#3ee6ff", "#c6ff3d", "#ffd400"] as const).map((c, i) => (
      <Ball key={i} p={[0.15 + (i % 2) * 0.06, 0.07, -0.04 + Math.floor(i / 2) * 0.07]} r={0.022} color={c} emissive={c} ei={2 + Math.sin(t / 3 + i)} />
    ))}
    <Cyl p={[-0.12, 0.08, 0]} r={0.035} h={0.04} color="#2a2a33" />
    <RBox p={[0, 0.065, 0.12]} size={[0.36, 0.01, 0.02]} radius={0.004} color="#b14bff" emissive="#b14bff" ei={3} />
  </group>
);

const Dumbbell: React.FC = () => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <Cyl r={0.04} h={0.7} color="#aab3bd" metal={1} rough={0.2} />
    {[-0.28, -0.2, 0.2, 0.28].map((y, i) => (
      <Cyl key={i} p={[0, y, 0]} r={i % 3 === 0 ? 0.17 : 0.21} h={0.07} color="#1b1b22" rough={0.4} clear={0.5} />
    ))}
  </group>
);

const Salad: React.FC = () => (
  <group>
    <Ball r={0.34} theta={Math.PI / 2} rot={[Math.PI, 0, 0]} color="#f6f3ea" rough={0.15} clear={1} side={THREE.DoubleSide} />
    {[...Array(14)].map((_, i) => (
      <Ball key={i} p={[Math.cos(i * 2.4) * 0.18 * ((i % 3) / 3 + 0.4), 0.02 + (i % 3) * 0.025, Math.sin(i * 2.4) * 0.18 * ((i % 3) / 3 + 0.4)]} r={0.08} s={[1.2, 0.45, 1]} rot={[0.3 * i, i, 0]} color={i % 5 === 0 ? "#ff3b3b" : i % 4 === 0 ? "#ffb347" : i % 2 ? "#3fbf4f" : "#7ad65a"} rough={0.35} clear={0.4} />
    ))}
  </group>
);

/** Diego: chubby gamer — curly mop, stubble, thick glasses, RGB headset, AFK tee riding up over a hairy belly. Feet at y=0 when standing. */
export const Diego: React.FC<{item?: DiegoItem; sit?: boolean; t?: number; expr?: Expr}> = ({item = "none", sit = false, t: tOff = 0, expr = "tired"}) => {
  const t = useCurrentFrame() + tOff;
  const sk = useSkin("diego");
  const tee = teeTex(false);
  const teePrint = teeTex(true, 700);
  const boxer = boxerTex();
  const iris = irisTex("#6b4024", "diego");
  const breathe = 1 + Math.sin(t / 11) * 0.012;
  const jiggle = Math.sin(t / 3.5) * (item === "dumbbell" ? 0.02 : 0.006);
  const blink = t % 84 > 79;
  const lookX = Math.sin(t / 37) * 0.02;
  const rgb = new THREE.Color().setHSL((t / 90) % 1, 1, 0.55).getStyle();

  // body hair, stubble, curls (computed once)
  const bellyHair = useInstanced(
    strandGeo,
    darkHairMat,
    useMemo(() => [...hairOnEllipsoid(5, 420, [0, 1.42, 0.28], [0.86, 0.63, 0.78], (d) => d.z > 0.25 && d.y < 0.45 && Math.abs(d.x) < 0.55 + (0.5 - d.y) * 0.1, 0.034, 0.93, 0.8), ...hairOnEllipsoid(6, 200, [0, 1.42, 0.28], [0.86, 0.63, 0.78], (d) => d.z > 0.6 && Math.abs(d.x) < 0.12, 0.04, 0.95, 0.8)], []),
  );
  const stubble = useInstanced(
    strandGeo,
    darkHairMat,
    useMemo(() => hairOnEllipsoid(8, 900, [0, -0.06, 0.02], [0.67, 0.66, 0.64], (d) => d.y < -0.18 && d.z > 0.15 && !(Math.abs(d.x) < 0.22 && d.y > -0.5 && d.y < -0.28), 0.011, 0.5, 0.7), []),
  );
  const curlGeo = useMemo(() => new THREE.TorusGeometry(0.075, 0.032, 8, 16), []);
  const curlMat = useMemo(() => new THREE.MeshPhysicalMaterial({color: "#2a1a10", roughness: 0.6, sheen: 0.6, sheenColor: new THREE.Color("#7a5038")}), []);
  const curls = useInstanced(
    curlGeo,
    curlMat,
    useMemo(() => {
      const r = rng(77);
      const out: THREE.Matrix4[] = [];
      while (out.length < 520) {
        const d = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
        if (d.lengthSq() > 1 || d.lengthSq() < 0.05) continue;
        d.normalize();
        const onFace = d.z > 0.35 && d.y < 0.42;
        if (onFace || d.y < -0.45 || (d.z > 0.1 && d.y < 0.05 && Math.abs(d.x) < 0.75)) continue;
        const rad = 0.7 + r() * 0.12 + Math.max(0, d.y) * 0.08;
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
        out.push(new THREE.Matrix4().compose(d.multiplyScalar(rad), q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + r() * 0.5)));
      }
      return out;
    }, []),
  );
  const brows = useInstanced(
    strandGeo,
    darkHairMat,
    useMemo(() => {
      const r = rng(9);
      const out: THREE.Matrix4[] = [];
      for (const sx of [-1, 1])
        for (let i = 0; i < 70; i++) {
          const u = r();
          const raise = expr === "shock" ? 0.06 : 0;
          const tilt = expr === "worried" ? -0.08 * sx : expr === "tired" ? 0.04 : 0;
          const pos = new THREE.Vector3(sx * (0.12 + u * 0.24), 0.3 + raise + (u - 0.5) * tilt * 2 + (r() - 0.5) * 0.04, 0.6 - u * 0.08);
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.3, 0, sx * (1.2 + (r() - 0.5) * 0.6)));
          out.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(2.4, 0.07, 2.4)));
        }
      return out;
    }, [expr]),
  );

  const lid = expr === "tired" ? 1.25 : expr === "worried" ? 1.05 : 0.75;
  const legs = sit ? {hip: -1.5, knee: 1.45} : {hip: 0, knee: 0};
  const curl = item === "dumbbell" ? 0.6 + Math.max(0, Math.sin(t / 6)) * 1.3 : 0;

  const torsoProfile = useMemo(
    () =>
      [
        [0.01, 1.02],
        [0.62, 1.05],
        [0.86, 1.22],
        [0.97, 1.48],
        [0.99, 1.72],
        [0.93, 1.96],
        [0.82, 2.16],
        [0.64, 2.33],
        [0.42, 2.46],
        [0.26, 2.54],
        [0.01, 2.56],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  const shirtProfile = useMemo(() => torsoProfile.filter((v) => v.y >= 1.6).map((v) => new THREE.Vector2(v.x * 1.035, v.y)), [torsoProfile]);
  shirtProfile.unshift(new THREE.Vector2(1.03, 1.6));

  return (
    <group position={[0, sit ? -0.32 : 0, 0]}>
      {/* legs */}
      {([-1, 1] as const).map((sd) => (
        <group key={sd} position={[sd * 0.36, 1.04, 0.05]}>
          <Leg side={sd} hip={legs.hip} knee={legs.knee} t={t} />
        </group>
      ))}
      {/* boxers */}
      <mesh position={[0, 0, 0]} scale={[1, 1, 0.9]} castShadow receiveShadow>
        <latheGeometry args={[[0.82, 0.83, 0.86, 0.9, 0.93].map((x, i) => new THREE.Vector2(x, 0.88 + i * 0.09)), 64]} />
        <Mat map={boxer} rough={0.85} sheen={0.6} side={THREE.DoubleSide} />
      </mesh>
      {([-1, 1] as const).map((sd) => (
        <group key={sd} position={[sd * 0.36, 0.95, 0.05]} rotation={[legs.hip, 0, 0]}>
          <Cyl p={[0, -0.12, 0]} r={0.34} r2={0.38} h={0.3} map={boxer} rough={0.85} sheen={0.6} />
        </group>
      ))}

      {/* torso */}
      <group scale={[breathe, breathe, breathe * 0.92]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[torsoProfile, 64]} />
          <Mat {...sk} />
        </mesh>
        {/* t-shirt (front of the tee sits at u=0.5) */}
        <mesh castShadow receiveShadow>
          <latheGeometry args={[shirtProfile, 64, Math.PI]} />
          <Mat map={teePrint} rough={0.85} sheen={0.7} sheenColor="#6a6d80" />
        </mesh>
        <Torus p={[0, 1.6, 0]} r={1.03} tube={0.05} rot={[Math.PI / 2, 0, 0]} s={[1, 1, 1]} color="#1d1e26" rough={0.9} />
      </group>
      {/* belly bulge: skin below, shirt cap on top */}
      <group position={[0, 1.42 + jiggle, 0.28]} scale={[1.1 * breathe, 0.9, 1.0 * breathe]}>
        <Ball r={0.78} {...sk} />
        <Ball r={0.8} theta={1.28} rot={[0, Math.PI / 2, 0]} map={tee} rough={0.85} sheen={0.7} sheenColor="#6a6d80" />
        <Ball p={[0, -0.08, 0.765]} r={0.045} s={[1, 1.3, 0.5]} color="#7a3c2c" rough={0.9} />
      </group>
      <group position={[0, jiggle, 0]}>
        <primitive object={bellyHair} />
      </group>

      {/* arms */}
      <group position={[-0.98, 2.22, 0.05]}>
        {sit || item === "controller" ? (
          <Arm side={-1} flex={-0.75} abd={-0.12} elbow={-1.0} twist={-0.3} grip={0.8} />
        ) : item === "salad" ? (
          <Arm side={-1} flex={-0.85} abd={0.32} elbow={-1.25} twist={0.5} grip={0.9} />
        ) : (
          <Arm side={-1} flex={0.05} abd={0.42} elbow={-0.25} grip={0.5} />
        )}
      </group>
      <group position={[0.98, 2.22, 0.05]}>
        {sit || item === "controller" ? (
          <Arm side={1} flex={-0.75} abd={-0.12} elbow={-1.0} twist={-0.3} grip={0.8} />
        ) : item === "dumbbell" ? (
          <Arm side={1} flex={-0.1} abd={0.38} elbow={-curl} grip={1}>
            <group position={[0, -0.12, 0.05]} rotation={[0, Math.PI / 2, 0]}>
              <Dumbbell />
            </group>
          </Arm>
        ) : item === "salad" ? (
          <Arm side={1} flex={-0.85} abd={0.32} elbow={-1.25} twist={0.5} grip={0.9} />
        ) : (
          <Arm side={1} flex={0.05} abd={0.42} elbow={-0.25} grip={0.5} />
        )}
      </group>
      {(sit || item === "controller") && (
        <group position={[0, 1.78, 1.18]} rotation={[0.6, 0, 0]}>
          <Controller t={t} />
        </group>
      )}
      {item === "salad" && (
        <group position={[0, 1.62, 1.3]}>
          <Salad />
        </group>
      )}

      {/* head */}
      <group position={[0, 3.08, 0.08]} rotation={[Math.sin(t / 26) * 0.04 + (expr === "shock" ? -0.08 : 0.05), Math.sin(t / 41) * 0.12, Math.sin(t / 19) * 0.03]}>
        <Ball r={0.66} s={[1, 0.98, 0.95]} {...sk} />
        {/* double chin + cheeks */}
        <Ball p={[0, -0.44, 0.16]} r={0.48} s={[1.12, 0.6, 0.95]} {...sk} />
        <Ball p={[-0.34, -0.2, 0.36]} r={0.26} s={[1, 0.9, 0.8]} {...sk} />
        <Ball p={[0.34, -0.2, 0.36]} r={0.26} s={[1, 0.9, 0.8]} {...sk} />
        <primitive object={stubble} />
        {/* ears */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.64, 0, 0]}>
            <Ball r={0.14} s={[0.55, 1, 0.85]} {...sk} />
            <Ball p={[sd * 0.04, 0, 0.02]} r={0.07} s={[0.4, 0.8, 0.6]} color="#b8745c" />
          </group>
        ))}
        {/* eyes */}
        {[-0.24, 0.24].map((x) => (
          <group key={x} position={[x, 0.08, 0.5]}>
            <Ball r={0.13} color="#f7efe9" rough={0.15} />
            <mesh position={[lookX, -0.01, 0.124]}>
              <circleGeometry args={[expr === "shock" ? 0.07 : 0.082, 48]} />
              <meshPhysicalMaterial map={iris} roughness={0.1} clearcoat={1} />
            </mesh>
            <Ball r={0.134} color="#ffffff" rough={0} clear={1} opacity={0.12} />
            {/* upper lid */}
            <mesh rotation={[-(blink ? 0.05 : Math.PI / 2 - (lid * Math.PI) / 4), 0, 0]} scale={[1.08, 1.08, 1.08]}>
              <sphereGeometry args={[0.14, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <Mat {...sk} side={THREE.DoubleSide} />
            </mesh>
            {/* bags */}
            <Torus p={[0, -0.075, 0.03]} r={0.1} tube={0.025} arc={Math.PI} rot={[0.4, 0, Math.PI]} color="#9a6a78" rough={0.7} />
          </group>
        ))}
        <primitive object={brows} />
        {/* nose */}
        <Ball p={[0, -0.02, 0.62]} r={0.09} s={[0.8, 1.3, 0.8]} {...sk} />
        <Ball p={[0, -0.12, 0.66]} r={0.13} s={[1.15, 0.95, 1]} {...sk} />
        {[-0.055, 0.055].map((x) => (
          <Ball key={x} p={[x, -0.18, 0.7]} r={0.03} s={[1.2, 0.7, 1]} color="#5a2a22" />
        ))}
        {/* mouth */}
        {expr === "shock" ? (
          <group position={[0, -0.34, 0.58]}>
            <Ball r={0.075} s={[1, 1.3, 0.5]} color="#3a0d10" rough={0.9} />
            <Torus r={0.08} tube={0.03} s={[1, 1.3, 1]} color="#c56a63" clear={0.6} />
          </group>
        ) : (
          <Torus p={[0, -0.36, 0.56]} r={0.1} tube={0.026} arc={Math.PI} rot={[0.15, 0, 0]} color="#a8524a" clear={0.6} />
        )}
        {/* glasses */}
        <Glasses />
        {/* curly mop */}
        <primitive object={curls} />
        {/* RGB headset (resting on the curls) */}
        <Torus p={[0, 0.12, -0.04]} r={0.86} tube={0.055} arc={Math.PI} color="#121216" rough={0.25} metal={0.5} clear={1} />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.8, 0.0, 0]}>
            <Cyl r={0.25} h={0.2} rot={[0, 0, Math.PI / 2]} color="#121216" rough={0.3} clear={1} />
            <Torus p={[sd * 0.11, 0, 0]} r={0.2} tube={0.028} rot={[0, Math.PI / 2, 0]} color={rgb} emissive={rgb} ei={4} />
          </group>
        ))}
        <Cap p={[-0.66, -0.3, 0.36]} r={0.022} len={0.5} rot={[1.0, 0.3, 0.35]} color="#121216" />
        <Ball p={[-0.44, -0.46, 0.58]} r={0.05} color="#121216" />
      </group>
    </group>
  );
};

const Glasses: React.FC = () => {
  const frame = useMemo(() => {
    const rr = (w: number, h: number, r: number) => {
      const s = new THREE.Shape();
      s.moveTo(-w / 2 + r, -h / 2);
      s.lineTo(w / 2 - r, -h / 2);
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      s.lineTo(w / 2, h / 2 - r);
      s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      s.lineTo(-w / 2 + r, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      s.lineTo(-w / 2, -h / 2 + r);
      s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      return s;
    };
    const outer = rr(0.38, 0.3, 0.1);
    outer.holes.push(rr(0.29, 0.21, 0.07));
    const g = new THREE.ExtrudeGeometry(outer, {depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3});
    const lens = new THREE.ShapeGeometry(rr(0.3, 0.22, 0.07));
    return {g, lens};
  }, []);
  return (
    <group position={[0, 0.08, 0.66]}>
      {[-0.24, 0.24].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={frame.g} castShadow>
            <Mat color="#0c0c10" rough={0.2} clear={1} />
          </mesh>
          <mesh geometry={frame.lens} position={[0, 0, 0.02]}>
            <meshPhysicalMaterial color="#cfe8ff" transparent opacity={0.14} roughness={0} clearcoat={1} />
          </mesh>
        </group>
      ))}
      <RBox p={[0, 0.02, 0.02]} size={[0.12, 0.04, 0.04]} radius={0.015} color="#0c0c10" />
      {[-1, 1].map((sd) => (
        <RBox key={sd} p={[sd * 0.47, 0.03, -0.28]} rot={[0, sd * 0.12, 0]} size={[0.03, 0.04, 0.6]} radius={0.012} color="#0c0c10" />
      ))}
    </group>
  );
};

// ───────────────────────── Sofi ─────────────────────────

/** Sofi: gamer girlfriend, purple→pink hair, cat-ear headset, waving. */
export const Sofi: React.FC = () => {
  const t = useCurrentFrame();
  const sk = useSkin("sofi", false, "#f2c4a6");
  const blink = t % 70 > 66;
  const pink = "#ff4fb8";
  const hairMap = gradTex("#2b1748", "#ff5fc0", "sofi");
  const hairM = {map: hairMap, rough: 0.45, sheen: 1, sheenColor: "#c58cff", clear: 0.3};
  const hairTop = {color: "#3b2066", rough: 0.42, sheen: 1, sheenColor: "#c58cff", clear: 0.4};
  const iris = irisTex("#7b3fd0", "sofi");
  const hoodie = hoodieTex();
  const wave = Math.sin(t / 4) * 0.35;
  return (
    <group rotation={[0, Math.sin(t / 30) * 0.1, Math.sin(t / 22) * 0.05]}>
      {/* hoodie */}
      <mesh position={[0, -1.95, 0]} scale={[1, 1, 0.72]} castShadow receiveShadow>
        <latheGeometry args={[[[0.01, 0], [1.05, 0.02], [1.1, 0.5], [1.0, 0.9], [0.72, 1.18], [0.34, 1.32], [0.01, 1.34]].map(([x, y]) => new THREE.Vector2(x, y)), 64, Math.PI]} />
        <Mat map={hoodie} rough={0.95} sheen={1} sheenColor="#ffffff" />
      </mesh>
      <Torus p={[0, -0.72, -0.12]} r={0.42} tube={0.12} rot={[Math.PI / 2 + 0.25, 0, 0]} color="#b29cf2" rough={0.95} sheen={1} />
      {[-0.13, 0.13].map((x) => (
        <Cap key={x} p={[x, -0.95, 0.55]} r={0.02} len={0.3} color="#ffffff" />
      ))}
      <Cyl p={[0, -0.6, 0]} r={0.19} h={0.35} {...sk} />
      {/* hair: back volume + long locks framing the face */}
      <Ball p={[0, 0.05, -0.36]} r={0.72} {...hairTop} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Cap p={[sd * 0.6, -0.35, 0.08]} r={0.16} len={0.95} rot={[0.08, 0, sd * -0.08]} {...hairM} />
          <Cap p={[sd * 0.47, -0.45, -0.18]} r={0.17} len={0.9} rot={[0, 0, sd * -0.05]} {...hairM} />
        </group>
      ))}
      {/* head */}
      <Ball r={0.62} s={[1, 1, 0.95]} {...sk} />
      <Ball p={[0, -0.36, 0.2]} r={0.32} s={[1, 0.7, 0.9]} {...sk} />
      {/* skull cap + fringe */}
      <Ball p={[0, 0.03, -0.03]} r={0.67} theta={1.75} rot={[-0.55, 0, 0]} {...hairTop} side={THREE.DoubleSide} />
      <mesh castShadow>
        <sphereGeometry args={[0.675, 64, 24, Math.PI / 2 - 1.15, 2.3, 0.5, 0.5]} />
        <Mat {...hairTop} side={THREE.DoubleSide} />
      </mesh>
      {[-0.9, -0.45, 0, 0.45, 0.9].map((a, i) => (
        <Ball key={i} p={[Math.sin(a) * 0.5, 0.36 - Math.abs(a) * 0.08, Math.cos(a) * 0.5]} r={0.12} s={[1.1, 0.7, 0.5]} rot={[0, a, 0]} {...hairTop} />
      ))}
      {/* eyes */}
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 0.02, 0.5]}>
          <Ball r={0.135} s={[0.95, 1.12, 1]} color="#fbf6f4" rough={0.15} />
          <mesh position={[0, -0.01, 0.128]} scale={[1, blink ? 0.1 : 1.1, 1]}>
            <circleGeometry args={[0.1, 48]} />
            <meshPhysicalMaterial map={iris} roughness={0.1} clearcoat={1} />
          </mesh>
          <Ball r={0.14} color="#ffffff" rough={0} clear={1} opacity={0.12} />
          {/* lashes */}
          {[...Array(6)].map((_, k) => (
            <RBox key={k} p={[(k - 2.5) * 0.04 * Math.sign(x) + Math.sign(x) * 0.02, 0.15 - Math.abs(k - 2.5) * 0.008, 0.06]} rot={[0.4, 0, Math.sign(x) * (0.2 + k * 0.12)]} size={[0.012, 0.07, 0.01]} radius={0.004} color="#120a18" />
          ))}
        </group>
      ))}
      {/* brows, nose, freckles, blush, smile */}
      {[-1, 1].map((sd) => (
        <Cap key={sd} p={[sd * 0.23, 0.27, 0.53]} r={0.018} len={0.15} rot={[0, 0, sd * -1.35]} color="#2b1748" />
      ))}
      <Ball p={[0, -0.12, 0.6]} r={0.06} s={[1, 0.8, 0.9]} {...sk} />
      {[...Array(14)].map((_, i) => (
        <Ball key={i} p={[(i % 2 ? 1 : -1) * (0.2 + (i % 5) * 0.035), -0.1 - (i % 3) * 0.03, 0.55 - (i % 5) * 0.012]} r={0.009} color="#b9724e" />
      ))}
      <Ball p={[-0.33, -0.16, 0.45]} r={0.12} s={[1, 0.6, 0.4]} color="#ff7fa8" opacity={0.5} />
      <Ball p={[0.33, -0.16, 0.45]} r={0.12} s={[1, 0.6, 0.4]} color="#ff7fa8" opacity={0.5} />
      <Torus p={[0, -0.27, 0.55]} r={0.1} tube={0.026} arc={Math.PI} rot={[0.25, 0, Math.PI]} color="#d9506e" clear={1} />
      {/* cat-ear headset */}
      <Torus p={[0, 0.14, -0.03]} r={0.74} tube={0.055} arc={Math.PI} color="#ffffff" rough={0.25} clear={1} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Cyl p={[sd * 0.7, 0.02, 0]} r={0.23} h={0.18} rot={[0, 0, Math.PI / 2]} color="#ffffff" rough={0.25} clear={1} />
          <Torus p={[sd * 0.8, 0.02, 0]} r={0.19} tube={0.028} rot={[0, Math.PI / 2, 0]} color={pink} emissive={pink} ei={4} />
          <mesh position={[sd * 0.44, 0.78, 0]} rotation={[0, 0, -sd * 0.35]} castShadow>
            <coneGeometry args={[0.19, 0.36, 4]} />
            <Mat color="#ffffff" rough={0.25} clear={1} />
          </mesh>
          <mesh position={[sd * 0.44, 0.76, 0.07]} rotation={[0, 0, -sd * 0.35]}>
            <coneGeometry args={[0.1, 0.22, 4]} />
            <Mat color={pink} emissive={pink} ei={3} />
          </mesh>
        </group>
      ))}
      {/* mic */}
      <Cap p={[-0.52, -0.32, 0.36]} r={0.02} len={0.42} rot={[1.0, 0.25, 0.4]} color="#ffffff" />
      <Ball p={[-0.33, -0.45, 0.56]} r={0.05} color={pink} emissive={pink} ei={1} />
      {/* waving hand */}
      <group position={[1.15, -1.6, 0.35]} rotation={[0, 0, 0.35 + wave * 0.4]}>
        <Cap p={[0, 0.45, 0]} r={0.15} len={0.7} map={hoodie} rough={0.95} sheen={1} />
        <group position={[0, 1.05, 0]} rotation={[0, 0, wave]}>
          <Ball r={0.13} s={[1, 1.2, 0.6]} {...sk} />
          {[-0.07, -0.025, 0.025, 0.07].map((x, i) => (
            <Cap key={i} p={[x, 0.16 - Math.abs(i - 1.5) * 0.01, 0]} r={0.03} len={0.1} {...sk} />
          ))}
          <Cap p={[-0.12, 0.04, 0.02]} r={0.03} len={0.07} rot={[0, 0, 0.9]} {...sk} />
        </group>
      </group>
    </group>
  );
};

// ───────────────────────── Props for the room ─────────────────────────

const canGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.36, 24);
const canMat = new THREE.MeshPhysicalMaterial({roughness: 0.25, metalness: 0.7, clearcoat: 1, emissive: new THREE.Color("#111"), emissiveIntensity: 0.2});
const CAN_COLORS = ["#39ff88", "#ff3b5c", "#ffd400", "#3ee6ff", "#b14bff"];

/** Instanced energy-drink cans; each entry: position, rotation, color index. */
const Cans: React.FC<{items: [V3, V3, number][]}> = ({items}) => {
  const mats = useMemo(() => items.map(([p, r]) => new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(1, 1, 1))), [items]);
  const cols = useMemo(() => items.map(([, , c]) => new THREE.Color(CAN_COLORS[c % CAN_COLORS.length])), [items]);
  const mesh = useInstanced(canGeo, canMat, mats, cols);
  return <primitive object={mesh} />;
};

const ChipBag: React.FC<Tr & {color?: string; seed?: number}> = ({p, rot, color = "#ff6b1a", seed = 1}) => (
  <group position={p} rotation={rot}>
    <Cloth seed={seed} amp={0.12} s={[0.32, 0.42, 0.12]} color={color} rough={0.2} clear={1} metal={0.3} />
    <Ball p={[0, 0.02, 0.1]} r={0.1} s={[1, 1, 0.3]} color="#ffd23f" emissive="#ffd23f" ei={0.2} />
  </group>
);

const PizzaBox: React.FC<Tr & {open?: boolean}> = ({p, rot, open}) => (
  <group position={p} rotation={rot}>
    <RBox size={[0.9, 0.09, 0.9]} radius={0.015} color="#c9a46a" rough={0.95} />
    {open && (
      <>
        <group position={[0, 0.045, -0.45]} rotation={[-1.9, 0, 0]}>
          <RBox p={[0, 0, 0.45]} size={[0.9, 0.02, 0.9]} radius={0.008} color="#c9a46a" rough={0.95} />
        </group>
        <mesh position={[0.05, 0.06, 0.05]} rotation={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.03, 32, 1, false, 0, 1.0]} />
          <Mat color="#f2b134" rough={0.6} clear={0.4} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <Cyl key={i} p={[0.15 + i * 0.07, 0.08, 0.15 + (i % 2) * 0.06]} r={0.04} h={0.01} color="#c0392b" />
        ))}
      </>
    )}
  </group>
);

const Clock: React.FC<{p: V3; minutes: number}> = ({p, minutes}) => (
  <group position={p}>
    <Cyl r={0.42} h={0.06} rot={[Math.PI / 2, 0, 0]} color="#f7f4ec" rough={0.4} />
    <Torus r={0.43} tube={0.04} color="#16161d" rough={0.3} />
    {[...Array(12)].map((_, i) => (
      <RBox key={i} p={[Math.sin((i / 12) * Math.PI * 2) * 0.34, Math.cos((i / 12) * Math.PI * 2) * 0.34, 0.04]} rot={[0, 0, -(i / 12) * Math.PI * 2]} size={[0.025, 0.07, 0.01]} radius={0.005} color="#16161d" />
    ))}
    <group rotation={[0, 0, -((minutes / 60) % 12) * (Math.PI / 6)]}>
      <RBox p={[0, 0.11, 0.05]} size={[0.035, 0.24, 0.01]} radius={0.008} color="#16161d" />
    </group>
    <group rotation={[0, 0, -(minutes % 60) * (Math.PI / 30)]}>
      <RBox p={[0, 0.15, 0.06]} size={[0.022, 0.32, 0.01]} radius={0.006} color="#ff3b5c" />
    </group>
  </group>
);

const Bookshelf: React.FC<{p: V3}> = ({p}) => {
  const items = useMemo(() => {
    const r = rng(42);
    const out: {m: THREE.Matrix4; c: THREE.Color}[] = [];
    let x = -1.1;
    while (x < 1.05) {
      const w = 0.07 + r() * 0.07;
      const h = 0.38 + r() * 0.22;
      const lean = r() > 0.85 ? 0.25 : 0;
      out.push({m: new THREE.Matrix4().compose(new THREE.Vector3(x + w / 2, h / 2 + 0.06, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, lean)), new THREE.Vector3(w, h, 0.3)), c: new THREE.Color().setHSL(r(), 0.55, 0.35 + r() * 0.2)});
      x += w + 0.01 + (lean ? 0.08 : 0);
    }
    return out;
  }, []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.7}), []);
  const books = useInstanced(
    geo,
    mat,
    useMemo(() => items.map((i) => i.m), [items]),
    useMemo(() => items.map((i) => i.c), [items]),
  );
  return (
    <group position={p}>
      <RBox size={[2.4, 0.08, 0.42]} radius={0.02} color="#3a2a20" rough={0.7} />
      <primitive object={books} />
      {/* trophy */}
      <group position={[0.85, 0.06, 0.05]}>
        <Cyl p={[0, 0.05, 0]} r={0.08} h={0.1} color="#16161d" />
        <Cyl p={[0, 0.25, 0]} r={0.11} r2={0.04} h={0.28} color="#ffc83d" metal={1} rough={0.2} />
      </group>
    </group>
  );
};

const NeonStrip: React.FC<{p: V3; size: V3; color: string; ei?: number; rot?: V3}> = ({p, size, color, ei = 5, rot}) => (
  <RBox p={p} rot={rot} size={size} radius={Math.min(...size) / 2.2} color={color} emissive={color} ei={ei} />
);

// ───────────────────────── Diego's room ─────────────────────────

const Room: React.FC<{t: number; monitorTint: string}> = ({t, monitorTint}) => {
  const wood = woodTex();
  const wall = wallTex("#3a3150", "back");
  const side = wallTex("#2f2844", "side");
  const rug = rugTex();
  const night = nightTex();
  const game = gameTex("a", 280);
  const game2 = gameTex("b", 190);
  const led = new THREE.Color().setHSL((t / 120) % 1, 1, 0.55).getStyle();
  const p1 = posterTex("LVL 99", "#ff2e88", "#5a0f8c", "p1");
  const p2 = posterTex("NO LIFE", "#3ee6ff", "#14306b", "p2");
  const p3 = posterTex("GG EZ", "#c6ff3d", "#0f6b4a", "p3");
  return (
    <group>
      {/* floor + walls */}
      <Plane w={16} h={16} rot={[-Math.PI / 2, 0, 0]} map={wood} rough={0.55} clear={0.3} />
      <Plane w={16} h={9} p={[0, 4.5, -4]} map={wall} rough={0.95} />
      <Plane w={16} h={9} p={[-5, 4.5, 2]} rot={[0, Math.PI / 2, 0]} map={side} rough={0.95} />
      <RBox p={[0, 0.12, -3.95]} size={[16, 0.24, 0.06]} radius={0.01} color="#1c1726" />
      {/* rug */}
      <mesh position={[0.2, 0.012, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.3, 64]} />
        <Mat map={rug} rough={1} sheen={1} sheenColor="#a070ff" />
      </mesh>

      {/* LED strips */}
      <NeonStrip p={[0, 6.2, -3.93]} size={[16, 0.07, 0.07]} color={led} />
      <NeonStrip p={[-4.93, 6.2, 2]} size={[0.07, 0.07, 12]} color={led} />
      <NeonStrip p={[3.6, 3.2, -3.93]} size={[0.07, 4.5, 0.07]} color="#ff2e88" ei={4} />

      {/* window with blinds (left wall) */}
      <group position={[-4.96, 3.6, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <Plane w={2.2} h={1.8} p={[0, 0, -0.02]} map={night} emissiveMap={night} emissive="#ffffff" ei={0.9} />
        <RBox size={[2.4, 0.12, 0.14]} p={[0, 0.96, 0]} radius={0.02} color="#e8e4dc" />
        <RBox size={[2.4, 0.12, 0.14]} p={[0, -0.96, 0]} radius={0.02} color="#e8e4dc" />
        <RBox size={[0.12, 2.0, 0.14]} p={[-1.15, 0, 0]} radius={0.02} color="#e8e4dc" />
        <RBox size={[0.12, 2.0, 0.14]} p={[1.15, 0, 0]} radius={0.02} color="#e8e4dc" />
        {[...Array(9)].map((_, i) => (
          <RBox key={i} p={[0, 0.85 - i * 0.085, 0.08]} rot={[0.6, 0, 0]} size={[2.2, 0.06, 0.008]} radius={0.003} color="#d8d2c8" />
        ))}
      </group>
      <AreaLight p={[-4.7, 3.6, -0.2]} look={[0, 1.5, 0.5]} w={2.2} h={1.6} color="#6f8cff" intensity={5} />

      {/* posters + shelf + clock */}
      <Plane w={1.3} h={1.83} p={[-2.6, 3.9, -3.97]} map={p1} rough={0.4} clear={0.6} />
      <Plane w={1.1} h={1.55} p={[-1.1, 4.3, -3.97]} rot={[0, 0, 0.05]} map={p2} rough={0.4} clear={0.6} />
      <Plane w={1.0} h={1.4} p={[2.3, 4.5, -3.97]} rot={[0, 0, -0.06]} map={p3} rough={0.4} clear={0.6} />
      <Bookshelf p={[0.75, 3.0, -3.78]} />
      <Clock p={[4.6, 4.7, -3.95]} minutes={3 * 60 + 17 + t * 0.6} />

      {/* bed (back-left corner) */}
      <group position={[-3.3, 0, -2.4]}>
        <RBox p={[0, 0.35, 0]} size={[3.2, 0.5, 2.6]} radius={0.08} color="#2b2236" rough={0.8} />
        <RBox p={[0, 0.72, 0]} size={[3.1, 0.3, 2.5]} radius={0.12} color="#e8e6f0" rough={0.9} sheen={1} />
        <Cloth seed={11} amp={0.22} p={[0.2, 0.92, 0.25]} s={[1.5, 0.28, 1.15]} color="#3b56a8" sheen={1} sheenColor="#8fa8ff" />
        <Cloth seed={12} amp={0.1} p={[-1.0, 0.98, -0.6]} s={[0.55, 0.2, 0.4]} rot={[0, 0.4, 0]} color="#f2f0f7" sheen={1} />
      </group>

      {/* desk setup (right) */}
      <group position={[2.9, 0, -0.9]} rotation={[0, -0.55, 0]}>
        <RBox p={[0, 1.42, 0]} size={[3.0, 0.1, 1.4]} radius={0.04} color="#17171f" rough={0.35} clear={0.6} />
        <RBox p={[-1.4, 0.7, 0]} size={[0.1, 1.4, 1.3]} radius={0.03} color="#17171f" />
        <RBox p={[1.4, 0.7, 0]} size={[0.1, 1.4, 1.3]} radius={0.03} color="#17171f" />
        <NeonStrip p={[0, 1.36, 0.69]} size={[2.9, 0.035, 0.035]} color={led} ei={4} />
        {/* monitors */}
        <group position={[-0.35, 2.32, -0.35]} rotation={[0, 0.15, 0]}>
          <RBox size={[1.9, 1.1, 0.07]} radius={0.03} color="#0b0b10" rough={0.3} />
          <Plane w={1.8} h={1.0} p={[0, 0, 0.037]} map={game} emissiveMap={game} emissive="#ffffff" ei={1.3} />
          <RBox p={[0, -0.75, -0.05]} size={[0.12, 0.5, 0.1]} radius={0.02} color="#0b0b10" />
          <RBox p={[0, -0.97, 0]} size={[0.6, 0.04, 0.35]} radius={0.02} color="#0b0b10" />
        </group>
        <group position={[1.05, 2.25, -0.25]} rotation={[0, -0.35, 0]}>
          <RBox size={[1.0, 0.62, 0.06]} radius={0.03} color="#0b0b10" />
          <Plane w={0.92} h={0.54} p={[0, 0, 0.032]} map={game2} emissiveMap={game2} emissive="#ffffff" ei={1.1} />
          <RBox p={[0, -0.5, -0.03]} size={[0.08, 0.4, 0.08]} radius={0.02} color="#0b0b10" />
        </group>
        {/* keyboard, mouse, mug, cans, pizza */}
        <RBox p={[-0.3, 1.5, 0.25]} size={[1.1, 0.05, 0.36]} radius={0.02} color="#101014" />
        <RBox p={[-0.3, 1.528, 0.25]} size={[1.06, 0.008, 0.32]} radius={0.003} color={led} emissive={led} ei={2.5} />
        <Ball p={[0.5, 1.5, 0.3]} r={0.08} s={[0.8, 0.5, 1.2]} color="#101014" clear={1} />
        <Cyl p={[0.95, 1.58, 0.35]} r={0.11} h={0.22} color="#f2f2f2" clear={1} rough={0.2} />
        <Cans items={[[[-1.1, 1.65, 0.3], [0, 0, 0], 0], [[-0.86, 1.65, 0.45], [0, 0, 0], 1], [[-0.98, 1.65, 0.1], [0, 0, 0], 2], [[-1.0, 2.01, 0.28], [0, 0.4, 0], 3], [[0.75, 1.55, 0.55], [Math.PI / 2, 0, 0.8], 0]]} />
        <PizzaBox p={[1.0, 1.52, 0.05]} rot={[0, 0.3, 0]} open />
        <ChipBag p={[0.3, 1.72, -0.15]} rot={[0.3, 0.2, 0.2]} seed={3} />
      </group>
      <AreaLight p={[2.3, 2.3, -0.2]} look={[0, 2.4, 0.6]} w={1.8} h={1.0} color={monitorTint} intensity={7} />

      {/* floor mess */}
      <Cans
        items={[
          [[-1.8, 0.11, 1.6], [Math.PI / 2, 0, 0.6], 0],
          [[-1.3, 0.19, 2.2], [0, 0, 0], 1],
          [[1.2, 0.11, 2.3], [Math.PI / 2, 0, -0.4], 2],
          [[1.6, 0.11, 1.4], [Math.PI / 2, 0, 1.3], 3],
          [[-2.5, 0.11, 0.6], [Math.PI / 2, 0, 0.1], 4],
          [[2.4, 0.11, 2.8], [Math.PI / 2, 0, 2.0], 1],
          [[-0.7, 0.11, 2.9], [Math.PI / 2, 0, -1.0], 0],
        ]}
      />
      <ChipBag p={[-2.3, 0.16, 1.4]} rot={[-1.3, 0.2, 0.4]} color="#2f7bff" seed={4} />
      <PizzaBox p={[-2.2, 0.05, 2.6]} rot={[0, 0.5, 0]} />
      <PizzaBox p={[-2.15, 0.14, 2.62]} rot={[0, 0.2, 0]} />
      <Cloth seed={21} amp={0.25} p={[1.9, 0.18, 1.9]} s={[0.6, 0.2, 0.5]} color="#c0392b" sheen={1} />
      <Cloth seed={22} amp={0.25} p={[-1.4, 0.15, -0.6]} s={[0.55, 0.16, 0.45]} rot={[0, 1, 0]} color="#2b2d42" sheen={1} />
      {/* trash can overflowing */}
      <group position={[-3.9, 0, 0.9]}>
        <Cyl p={[0, 0.5, 0]} r={0.42} r2={0.48} h={1.0} color="#2a2f38" metal={0.6} rough={0.35} open side={THREE.DoubleSide} />
        <Cans items={[[[0, 1.0, 0], [0.5, 0, 0.3], 0], [[0.15, 1.05, 0.1], [1.2, 0, 0], 2], [[-0.12, 1.02, -0.1], [0.2, 1, 0.8], 3]]} />
        <Cloth seed={31} p={[0, 0.95, 0]} s={[0.4, 0.15, 0.4]} color="#e8e4dc" />
      </group>
    </group>
  );
};

const GamingChair: React.FC = () => (
  <group>
    <RBox p={[0, 2.4, -0.4]} size={[1.9, 2.6, 0.4]} rot={[-0.12, 0, 0]} radius={0.18} color="#141419" rough={0.45} clear={0.4} />
    <RBox p={[0, 2.4, -0.19]} size={[0.5, 2.3, 0.02]} rot={[-0.12, 0, 0]} radius={0.01} color="#ff2e3d" emissive="#ff2e3d" ei={0.5} />
    <RBox p={[0, 3.6, -0.55]} size={[1.3, 0.5, 0.35]} rot={[-0.12, 0, 0]} radius={0.15} color="#141419" />
    <RBox p={[0, 0.78, 0.25]} size={[1.9, 0.28, 1.6]} radius={0.12} color="#141419" rough={0.45} clear={0.4} />
    <Cyl p={[0, 0.4, 0.25]} r={0.09} h={0.7} color="#9aa0aa" metal={1} rough={0.25} />
    {[0, 1, 2, 3, 4].map((i) => (
      <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]} position={[0, 0.08, 0.25]}>
        <RBox p={[0, 0, 0.45]} size={[0.1, 0.07, 0.9]} radius={0.03} color="#141419" />
        <Ball p={[0, -0.03, 0.88]} r={0.07} color="#141419" />
      </group>
    ))}
  </group>
);

const DiegoLights: React.FC<{t: number}> = ({t}) => (
  <>
    <Env intensity={0.32} />
    <hemisphereLight args={["#9fb4ff", "#2a1630", 0.35]} />
    <spotLight position={[3.5, 8, 6]} angle={0.55} penumbra={0.9} intensity={160} distance={30} decay={2} color="#ffe6cc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-radius={6} target-position={[0, 1.5, 0]} />
    <pointLight position={[-3.5, 4.5, -3]} intensity={30 + Math.sin(t / 8) * 8} color="#ff2e88" distance={12} />
    <pointLight position={[3.5, 4.5, -3]} intensity={30 + Math.cos(t / 9) * 8} color="#3ee6ff" distance={12} />
  </>
);

/** Diego's room. `shot` picks pose + camera move. */
export const DiegoRoom: React.FC<{width: number; height: number; shot: "intro" | "belly" | "pip"; local: number}> = ({width, height, shot, local}) => {
  const t = useCurrentFrame();
  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const cam: {pos: V3; look: V3; fov: number} =
    shot === "intro"
      ? {pos: [Math.sin(local / 90) * 1.0 + 0.9, 4.0 - ease(local / 120) * 0.4, 12.5 - ease(local / 125) * 2.8], look: [0.4, 2.5, 0], fov: 40}
      : shot === "belly"
        ? {pos: [1.6 - ease(local / 100) * 1.0, 1.7 + ease(local / 100) * 0.3, 7.6 - ease(local / 100) * 1.6], look: [0.1, 2.3, 0.3], fov: 42}
        : {pos: [0.4, 3.2, 5.6], look: [0, 2.75, 0], fov: 38};
  const sit = shot !== "belly";
  return (
    <ThreeCanvas width={width} height={height} {...canvasProps}>
      <color attach="background" args={["#0b0716"]} />
      <fog attach="fog" args={["#0b0716", 14, 30]} />
      <CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
      <DiegoLights t={t} />
      <Room t={t} monitorTint={shot === "pip" ? "#ff4fb8" : "#7d8cff"} />
      {sit ? (
        <group position={[0, 0, 0.1]}>
          <GamingChair />
          <group position={[0, 0.12, 0.25]}>
            <Diego sit item="controller" expr="tired" />
          </group>
        </group>
      ) : (
        <>
          <group position={[-1.9, 0, -1.2]} rotation={[0, 0.6, 0]}>
            <GamingChair />
          </group>
          <group position={[0.1, 0, 0.4]}>
            <Diego expr="shock" />
          </group>
        </>
      )}
    </ThreeCanvas>
  );
};

// ───────────────────────── Sofi's room ─────────────────────────

const heartCurve = () => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    pts.push(new THREE.Vector3(x / 16, y / 16, 0));
  }
  return new THREE.CatmullRomCurve3(pts, true);
};

const Plushie: React.FC<{p: V3; color: string; s?: number}> = ({p, color, s = 1}) => (
  <group position={p} scale={[s, s, s]}>
    <Ball p={[0, 0.25, 0]} r={0.28} color={color} rough={1} sheen={1} sheenColor="#ffffff" />
    <Ball p={[0, 0.68, 0]} r={0.22} color={color} rough={1} sheen={1} sheenColor="#ffffff" />
    {[-1, 1].map((sd) => (
      <Ball key={sd} p={[sd * 0.16, 0.86, 0]} r={0.08} color={color} rough={1} sheen={1} />
    ))}
    {[-1, 1].map((sd) => (
      <Ball key={sd} p={[sd * 0.07, 0.72, 0.2]} r={0.025} color="#120a18" />
    ))}
  </group>
);

/** Sofi's side of the video call: pastel room, neon heart, fairy lights. */
export const SofiCall: React.FC<{width: number; height: number}> = ({width, height}) => {
  const t = useCurrentFrame();
  const heart = useMemo(() => new THREE.TubeGeometry(heartCurve(), 200, 0.035, 12, true), []);
  const wall = wallTex("#4a2470", "sofi");
  const bulbs = useMemo(() => [...Array(14)].map((_, i) => [-3 + i * 0.46, 2.55 - Math.sin((i / 13) * Math.PI) * 0.35, -1.85] as V3), []);
  return (
    <ThreeCanvas width={width} height={height} {...canvasProps}>
      <color attach="background" args={["#24103a"]} />
      <CameraRig pos={[0, 0.1, 6.0 - Math.min(1, t / 90) * 0.4]} look={[0, -0.25, 0]} fov={42} />
      <Env intensity={0.4} />
      <hemisphereLight args={["#ffd6f0", "#2a1240", 0.5]} />
      <spotLight position={[1.5, 3, 5]} angle={0.6} penumbra={1} intensity={60} color="#ffe9f4" castShadow shadow-mapSize={[1024, 1024]} target-position={[0, 0, 0]} />
      <pointLight position={[-2, 1.5, -1]} intensity={18} color="#ff4fb8" distance={8} />
      <pointLight position={[2.2, 1.2, -1]} intensity={14} color="#8a5cff" distance={8} />
      <AreaLight p={[0, -0.2, 3]} look={[0, 0, 0]} w={2} h={1.2} color="#bfe0ff" intensity={3} />
      <Plane w={14} h={10} p={[0, 0, -2]} map={wall} rough={1} />
      {/* neon heart sign */}
      <group position={[-1.6, 1.05, -1.9]} scale={[0.5, 0.5, 0.5]}>
        <mesh geometry={heart}>
          <meshStandardMaterial color="#ff4fb8" emissive="#ff4fb8" emissiveIntensity={4 + Math.sin(t / 5) * 1.2} />
        </mesh>
      </group>
      {/* fairy lights */}
      {bulbs.map((b, i) => (
        <Ball key={i} p={b} r={0.03} seg={16} color="#ffd36b" emissive="#ffd36b" ei={3 + Math.sin(t / 6 + i) * 1.5} />
      ))}
      {/* shelf with plushies */}
      <RBox p={[-2.1, 0.55, -1.75]} size={[1.8, 0.08, 0.4]} radius={0.02} color="#f2e6ff" />
      <Plushie p={[-2.6, 0.6, -1.7]} color="#ffb3d9" s={0.7} />
      <Plushie p={[-1.85, 0.6, -1.7]} color="#bfa8ff" s={0.55} />
      <Plushie p={[-1.35, 0.6, -1.7]} color="#9fe7ff" s={0.45} />
      <group position={[0, -0.25, 0]}>
        <Sofi />
      </group>
    </ThreeCanvas>
  );
};

/** Diego standing on a pedestal, transparent background (vote panels). */
export const DiegoPose: React.FC<{width: number; height: number; item: DiegoItem; tOff?: number}> = ({width, height, item, tOff = 0}) => {
  const t = useCurrentFrame();
  return (
    <ThreeCanvas width={width} height={height} shadows="soft" gl={{antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping}}>
      <CameraRig pos={[1.8, 2.6, 8.4]} look={[0, 2.0, 0]} fov={38} />
      <Env intensity={0.5} />
      <hemisphereLight args={["#ffffff", "#444466", 0.5]} />
      <spotLight position={[3, 7, 6]} angle={0.6} penumbra={0.9} intensity={140} color="#fff1e0" castShadow shadow-mapSize={[1024, 1024]} target-position={[0, 1.5, 0]} />
      <pointLight position={[-3, 3, -2]} intensity={30} color="#ffffff" distance={10} />
      <pointLight position={[3, 2, -2]} intensity={26} color="#c6ff3d" distance={10} />
      <group rotation={[0, -0.2 + Math.sin((t + tOff) / 30) * 0.15, 0]}>
        <Cyl p={[0, -0.1, 0]} r={1.5} h={0.2} color="#0d0d14" rough={0.25} clear={1} />
        <Torus r={1.5} tube={0.035} rot={[Math.PI / 2, 0, 0]} color="#c6ff3d" emissive="#c6ff3d" ei={4} />
        <Diego item={item} t={tOff} expr={item === "salad" ? "worried" : "tired"} />
      </group>
    </ThreeCanvas>
  );
};

/** Close-up portrait for the profile picture (transparent background). */
export const DiegoPortrait: React.FC<{width: number; height: number}> = ({width, height}) => (
  <ThreeCanvas width={width} height={height} shadows="soft" gl={{antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping}}>
    <CameraRig pos={[0.9, 3.2, 6.3]} look={[0.05, 2.75, 0]} fov={36} />
    <Env intensity={0.55} />
    <hemisphereLight args={["#ffffff", "#3a2a55", 0.45]} />
    <spotLight position={[2.5, 6, 6]} angle={0.5} penumbra={0.9} intensity={150} color="#fff1e0" castShadow shadow-mapSize={[1024, 1024]} target-position={[0, 2.6, 0]} />
    <pointLight position={[-2.6, 3.4, -1.2]} intensity={45} color="#ff2e88" distance={9} />
    <pointLight position={[2.6, 3.2, -1.2]} intensity={45} color="#3ee6ff" distance={9} />
    <group rotation={[0, -0.18, 0]}>
      <Diego item="controller" t={22} expr="tired" />
    </group>
  </ThreeCanvas>
);


// ───────────────────────── Vote sets ─────────────────────────

/** Fake volumetric light cone (additive, no depth write). */
const Beam: React.FC<{p: V3; color: string; opacity?: number; len?: number; r?: number; rot?: V3}> = ({p, color, opacity = 0.14, len = 6, r = 1.4, rot = [0, 0, 0]}) => (
  <mesh position={p} rotation={rot}>
    <coneGeometry args={[r, len, 48, 1, true]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);

const Kettlebell: React.FC<{p: V3; color: string}> = ({p, color}) => (
  <group position={p}>
    <Ball p={[0, 0.25, 0]} r={0.27} color={color} rough={0.35} clear={0.8} />
    <Torus p={[0, 0.52, 0]} r={0.15} tube={0.045} color={color} rough={0.35} clear={0.8} />
  </group>
);

const GymSet: React.FC<{t: number}> = ({t}) => {
  const floor = rubberTex();
  const wall = concreteTex();
  const sign = neonSignTex("NO PAIN NO GAIN", "#ff2e88", "gym");
  const flick = t % 47 < 2 ? 0.4 : 1;
  return (
    <group>
      <Plane w={30} h={30} rot={[-Math.PI / 2, 0, 0]} map={floor} rough={0.8} />
      <Plane w={30} h={12} p={[0, 6, -3.2]} map={wall} rough={0.9} />
      {/* neon sign + strips */}
      <mesh position={[-0.6, 5.2, -3.15]}>
        <planeGeometry args={[4.4, 1.29]} />
        <meshBasicMaterial map={sign} transparent blending={THREE.AdditiveBlending} opacity={flick} />
      </mesh>
      <NeonStrip p={[0, 6.1, -3.12]} size={[30, 0.08, 0.08]} color="#ff2e88" ei={5} />
      <NeonStrip p={[-4.6, 3, -3.12]} size={[0.08, 6, 0.08]} color="#b14bff" ei={5} />
      <NeonStrip p={[5.2, 3, -3.12]} size={[0.08, 6, 0.08]} color="#b14bff" ei={5} />
      {/* squat rack with loaded barbell */}
      <group position={[2.2, 0, -2.1]}>
        {[-1.15, 1.15].map((x) => (
          <RBox key={x} p={[x, 1.6, 0]} size={[0.14, 3.2, 0.14]} radius={0.02} color="#2a2a33" metal={0.7} rough={0.3} />
        ))}
        <Cyl p={[0, 2.25, 0.05]} r={0.04} h={3.2} rot={[0, 0, Math.PI / 2]} color="#c9d0d8" metal={1} rough={0.2} />
        {[-1.4, -1.3, 1.3, 1.4].map((x, i) => (
          <Cyl key={x} p={[x, 2.25, 0.05]} r={i % 3 === 0 ? 0.36 : 0.44} h={0.08} rot={[0, 0, Math.PI / 2]} color={i % 3 === 0 ? "#ff2e88" : "#15151b"} rough={0.4} clear={0.6} />
        ))}
      </group>
      {/* dumbbell rack */}
      <group position={[-2.6, 0, -2.4]}>
        <RBox p={[0, 0.8, 0]} size={[2.4, 0.08, 0.5]} radius={0.02} color="#2a2a33" metal={0.6} />
        <RBox p={[0, 0.4, 0]} size={[2.4, 0.08, 0.5]} radius={0.02} color="#2a2a33" metal={0.6} />
        {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
          <group key={x}>
            <group position={[x, 0.98, 0]} scale={[0.55 + i * 0.05, 0.55 + i * 0.05, 0.55 + i * 0.05]}>
              <Dumbbell />
            </group>
            <group position={[x, 0.58, 0]} scale={[0.65 + i * 0.05, 0.65 + i * 0.05, 0.65 + i * 0.05]}>
              <Dumbbell />
            </group>
          </group>
        ))}
      </group>
      {/* bench + kettlebells */}
      <group position={[3.4, 0, 0.3]} rotation={[0, -0.5, 0]}>
        <RBox p={[0, 0.65, 0]} size={[0.5, 0.14, 1.8]} radius={0.06} color="#15151b" rough={0.4} clear={0.6} />
        <RBox p={[0, 0.32, 0.6]} size={[0.1, 0.62, 0.1]} radius={0.02} color="#2a2a33" />
        <RBox p={[0, 0.32, -0.6]} size={[0.1, 0.62, 0.1]} radius={0.02} color="#2a2a33" />
      </group>
      <Kettlebell p={[-3.4, 0, 0.9]} color="#ff2e88" />
      <Kettlebell p={[-2.8, 0, 1.4]} color="#3ee6ff" />
      {/* light beams */}
      <Beam p={[-1.7, 4.2, 0]} color="#ffffff" opacity={0.1} r={1.5} len={6} />
      <Beam p={[2.4, 4.2, -1]} color="#ff2e88" opacity={0.12} r={1.2} len={6} />
      <spotLight position={[-1.7, 7.5, 0.5]} angle={0.4} penumbra={0.7} intensity={180} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} target-position={[-1.7, 0, 0]} />
      <pointLight position={[2.5, 4, -2]} intensity={50} color="#ff2e88" distance={12} />
      <pointLight position={[-4, 3, -2]} intensity={40} color="#b14bff" distance={12} />
    </group>
  );
};

const Fruit: React.FC<{kind: number; p: V3; t: number; spin?: number}> = ({kind, p, t, spin = 1}) => {
  const rot: V3 = [t * 0.03 * spin, t * 0.04 * spin, 0];
  const pos: V3 = [p[0], p[1] + Math.sin(t / 12 + p[0]) * 0.15, p[2]];
  return (
    <group position={pos} rotation={rot}>
      {kind === 0 && (
        <>
          <Ball r={0.28} s={[1, 0.92, 1]} color="#e8262f" rough={0.25} clear={1} />
          <Cyl p={[0, 0.3, 0]} r={0.02} h={0.12} color="#5a3a1a" />
          <Ball p={[0.08, 0.32, 0]} r={0.08} s={[1.4, 0.3, 0.7]} color="#3fbf4f" />
        </>
      )}
      {kind === 1 && <Ball r={0.26} color="#ff9a1a" rough={0.5} bump={poreBump()} bumpScale={0.6} />}
      {kind === 2 && <Torus r={0.32} tube={0.09} arc={2.2} s={[1, 1, 1.1]} color="#ffd93b" rough={0.45} />}
      {kind === 3 && (
        <>
          <Cyl p={[0, -0.18, 0]} r={0.07} r2={0.09} h={0.3} color="#8fcf5a" />
          {[...Array(7)].map((_, i) => (
            <Ball key={i} p={[Math.cos(i) * 0.14, 0.05 + (i % 2) * 0.06, Math.sin(i) * 0.14]} r={0.13} color="#2f8f3a" rough={0.8} />
          ))}
        </>
      )}
      {kind === 4 && (
        <>
          <Ball r={0.24} s={[0.85, 1.15, 0.6]} color="#cfe86a" rough={0.6} />
          <Ball p={[0, -0.06, 0.12]} r={0.1} s={[1, 1, 0.5]} color="#7a4a22" rough={0.4} clear={1} />
        </>
      )}
      {kind === 5 && (
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.32, 24]} />
          <Mat color="#ff2d4a" rough={0.3} clear={1} />
        </mesh>
      )}
    </group>
  );
};

const KitchenSet: React.FC<{t: number}> = ({t}) => {
  const tiles = tileTex();
  const wood = woodTex();
  const sky = skyTex();
  return (
    <group>
      <Plane w={30} h={30} rot={[-Math.PI / 2, 0, 0]} map={wood} rough={0.5} clear={0.4} />
      <Plane w={30} h={12} p={[0, 6, -3.2]} map={tiles} rough={0.35} clear={0.5} />
      {/* window with daylight */}
      <group position={[-2.6, 3.6, -3.15]}>
        <Plane w={2.4} h={1.8} map={sky} emissiveMap={sky} emissive="#ffffff" ei={1.0} />
        <RBox p={[0, 0, 0.04]} size={[2.6, 0.1, 0.1]} radius={0.02} color="#ffffff" />
        <RBox p={[0, 0, 0.04]} size={[0.1, 2.0, 0.1]} radius={0.02} color="#ffffff" />
        <RBox p={[0, 0.95, 0.04]} size={[2.6, 0.12, 0.12]} radius={0.02} color="#ffffff" />
        <RBox p={[0, -0.95, 0.04]} size={[2.6, 0.12, 0.12]} radius={0.02} color="#ffffff" />
      </group>
      {/* counter */}
      <RBox p={[0.5, 0.9, -2.6]} size={[9, 1.8, 1.1]} radius={0.04} color="#ffffff" rough={0.4} />
      <RBox p={[0.5, 1.84, -2.55]} size={[9.1, 0.1, 1.2]} radius={0.03} color="#f1eee8" rough={0.15} clear={1} />
      {[-3, -1, 1, 3].map((x) => (
        <RBox key={x} p={[x + 0.5, 1.0, -2.04]} size={[0.5, 0.05, 0.03]} radius={0.01} color="#c9b48a" metal={1} rough={0.2} />
      ))}
      {/* fruit bowl, board, bottles, plant */}
      <group position={[2.2, 1.9, -2.5]}>
        <Ball r={0.45} theta={Math.PI / 2} rot={[Math.PI, 0, 0]} color="#ffffff" rough={0.1} clear={1} side={THREE.DoubleSide} />
        <Fruit kind={0} p={[-0.15, 0.12, 0]} t={0} spin={0} />
        <Fruit kind={1} p={[0.18, 0.1, 0.05]} t={0} spin={0} />
        <Fruit kind={2} p={[0, 0.28, -0.05]} t={0} spin={0} />
      </group>
      <RBox p={[0.4, 1.92, -2.4]} size={[1.0, 0.06, 0.6]} radius={0.02} color="#c48a52" rough={0.6} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.1 + i * 0.25, 1.99, -2.35]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.4, 16]} />
          <Mat color="#ff7a1a" rough={0.5} />
        </mesh>
      ))}
      {[3.4, 3.7].map((x) => (
        <group key={x} position={[x, 2.25, -2.5]}>
          <Cyl r={0.12} h={0.7} color="#bfe8ff" rough={0} clear={1} opacity={0.45} />
          <Cyl p={[0, 0.4, 0]} r={0.06} h={0.1} color="#3aa6ff" />
        </group>
      ))}
      <group position={[-0.9, 1.9, -2.55]}>
        <Cyl p={[0, 0.2, 0]} r={0.22} r2={0.26} h={0.4} color="#e86a4a" rough={0.7} />
        {[...Array(7)].map((_, i) => (
          <Ball key={i} p={[Math.cos(i * 0.9) * 0.18, 0.6 + (i % 3) * 0.12, Math.sin(i * 0.9) * 0.12]} r={0.16} s={[0.6, 1.3, 0.3]} rot={[0, i, (i - 3) * 0.2]} color="#3fae4f" rough={0.6} />
        ))}
      </group>
      {/* pendant lamps */}
      {[-0.4, 2.6].map((x) => (
        <group key={x} position={[x, 5.0, -1.4]}>
          <Cyl p={[0, 1.2, 0]} r={0.01} h={2.4} color="#222" />
          <mesh>
            <coneGeometry args={[0.45, 0.45, 32, 1, true]} />
            <Mat color="#1f3a2e" rough={0.4} side={THREE.DoubleSide} />
          </mesh>
          <Ball p={[0, -0.12, 0]} r={0.12} color="#fff4d0" emissive="#fff1c0" ei={4} />
          <pointLight position={[0, -0.3, 0]} intensity={14} color="#ffe2a8" distance={6} />
        </group>
      ))}
      {/* floating fruits in the foreground */}
      {[
        [-3.3, 3.6, 0.6, 0],
        [-2.6, 1.2, 1.4, 3],
        [3.6, 4.6, 0.2, 5],
        [3.9, 1.0, 1.2, 1],
        [-3.8, 5.0, -0.6, 2],
        [2.8, 0.6, 2.0, 4],
        [-1.0, 5.4, 0.4, 5],
      ].map(([x, y, z, k], i) => (
        <Fruit key={i} kind={k} p={[x, y, z]} t={t + i * 13} spin={i % 2 ? 1 : -1} />
      ))}
      <hemisphereLight args={["#e8fbff", "#c9b48a", 0.9]} />
      <spotLight position={[2, 8, 5]} angle={0.6} penumbra={1} intensity={160} color="#fff4e0" castShadow shadow-mapSize={[1024, 1024]} target-position={[1.5, 1, 0]} />
      <AreaLight p={[-2.6, 3.6, -3]} look={[0, 2, 1]} w={2.4} h={1.8} color="#fff6dc" intensity={6} />
    </group>
  );
};

/** Full vote panel scene: themed set + Diego on one side. */
export const VoteSet: React.FC<{width: number; height: number; kind: "gym" | "diet"; tOff?: number}> = ({width, height, kind, tOff = 0}) => {
  const t = useCurrentFrame() + tOff;
  const gym = kind === "gym";
  const dx = gym ? -1.7 : 1.7;
  return (
    <ThreeCanvas width={width} height={height} {...canvasProps}>
      <color attach="background" args={[gym ? "#120818" : "#c8f2dc"]} />
      <fog attach="fog" args={[gym ? "#120818" : "#c8f2dc", 12, 26]} />
      <CameraRig pos={[dx * 0.3 + Math.sin(t / 60) * 0.3, 2.9, 11.2]} look={[dx * 0.3, 2.4, 0]} fov={34} />
      <Env intensity={gym ? 0.35 : 0.6} />
      {gym ? <GymSet t={t} /> : <KitchenSet t={t} />}
      <group position={[dx, 0, 0.6]} rotation={[0, (gym ? 0.25 : -0.25) + Math.sin(t / 40) * 0.08, 0]}>
        <Diego item={gym ? "dumbbell" : "salad"} t={tOff} expr={gym ? "tired" : "worried"} />
      </group>
    </ThreeCanvas>
  );
};
