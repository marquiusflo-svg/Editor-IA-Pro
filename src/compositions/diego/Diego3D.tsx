import React, {useLayoutEffect} from "react";
import {useThree} from "@react-three/fiber";
import {ThreeCanvas} from "@remotion/three";
import {useCurrentFrame} from "remotion";
import * as THREE from "three";

// ───────────────────────── Primitives ─────────────────────────

type V3 = [number, number, number];
type MatProps = {color: string; rough?: number; metal?: number; emissive?: string; ei?: number; clear?: number; sheen?: number; opacity?: number};

const Mat: React.FC<MatProps> = ({color, rough = 0.55, metal = 0, emissive, ei = 0, clear = 0, sheen = 0, opacity}) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    metalness={metal}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={ei}
    clearcoat={clear}
    clearcoatRoughness={0.4}
    sheen={sheen}
    sheenColor={color}
    transparent={opacity !== undefined}
    opacity={opacity ?? 1}
  />
);

const Ball: React.FC<{p?: V3; r: number; s?: V3; rot?: V3; seg?: number} & MatProps> = ({p = [0, 0, 0], r, s = [1, 1, 1], rot = [0, 0, 0], seg = 48, ...m}) => (
  <mesh position={p} scale={s} rotation={rot} castShadow receiveShadow>
    <sphereGeometry args={[r, seg, Math.round(seg * 0.75)]} />
    <Mat {...m} />
  </mesh>
);

const Cap: React.FC<{p?: V3; r: number; len: number; rot?: V3} & MatProps> = ({p = [0, 0, 0], r, len, rot = [0, 0, 0], ...m}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <capsuleGeometry args={[r, len, 12, 32]} />
    <Mat {...m} />
  </mesh>
);

const Box: React.FC<{p?: V3; s: V3; rot?: V3} & MatProps> = ({p = [0, 0, 0], s, rot = [0, 0, 0], ...m}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={s} />
    <Mat {...m} />
  </mesh>
);

const Cyl: React.FC<{p?: V3; r: number; h: number; rot?: V3; r2?: number} & MatProps> = ({p = [0, 0, 0], r, h, rot = [0, 0, 0], r2, ...m}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r, r, h, 40]} />
    <Mat {...m} />
  </mesh>
);

const Torus: React.FC<{p?: V3; r: number; tube: number; arc?: number; rot?: V3} & MatProps> = ({p = [0, 0, 0], r, tube, arc = Math.PI * 2, rot = [0, 0, 0], ...m}) => (
  <mesh position={p} rotation={rot} castShadow>
    <torusGeometry args={[r, tube, 20, 64, arc]} />
    <Mat {...m} />
  </mesh>
);

// ───────────────────────── Props ─────────────────────────

export const EnergyCan: React.FC<{p: V3; rot?: V3; color?: string}> = ({p, rot, color = "#39ff88"}) => (
  <group position={p} rotation={rot}>
    <Cyl r={0.13} h={0.42} color="#15151c" rough={0.25} metal={0.8} />
    <Cyl r={0.132} h={0.14} color={color} emissive={color} ei={0.9} />
    <Cyl p={[0, 0.22, 0]} r={0.1} h={0.02} color="#c8c8d0" metal={1} rough={0.2} />
  </group>
);

const ChipBag: React.FC<{p: V3; rot?: V3; color?: string}> = ({p, rot, color = "#ff6b1a"}) => (
  <group position={p} rotation={rot}>
    <Ball r={0.3} s={[1, 1.25, 0.45]} color={color} rough={0.25} clear={1} />
    <Ball p={[0, 0.05, 0.13]} r={0.12} s={[1, 1, 0.3]} color="#ffd23f" emissive="#ffd23f" ei={0.3} />
  </group>
);

const Controller: React.FC<{t: number}> = ({t}) => (
  <group>
    <Box s={[0.62, 0.16, 0.3]} color="#121218" rough={0.35} />
    <Ball p={[-0.3, -0.05, 0.05]} r={0.16} s={[1, 0.8, 1.2]} color="#121218" rough={0.35} />
    <Ball p={[0.3, -0.05, 0.05]} r={0.16} s={[1, 0.8, 1.2]} color="#121218" rough={0.35} />
    {(["#ff3b5c", "#3ee6ff", "#c6ff3d", "#ffd400"] as const).map((c, i) => (
      <Ball key={i} p={[0.16 + (i % 2) * 0.07, 0.09, -0.04 + Math.floor(i / 2) * 0.08]} r={0.03} color={c} emissive={c} ei={1.5 + Math.sin(t / 3 + i) * 0.8} />
    ))}
    <Box p={[0, 0.085, 0.12]} s={[0.4, 0.01, 0.02]} color="#b14bff" emissive="#b14bff" ei={2} />
  </group>
);

const Dumbbell: React.FC = () => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <Cyl r={0.05} h={0.9} color="#9aa3ad" metal={1} rough={0.25} />
    {[-0.36, -0.26, 0.26, 0.36].map((y, i) => (
      <Cyl key={i} p={[0, y, 0]} r={i % 3 === 0 ? 0.2 : 0.25} h={0.08} color="#1b1b22" rough={0.4} />
    ))}
  </group>
);

const Salad: React.FC = () => (
  <group>
    <mesh castShadow rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.38, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Mat color="#f6f3ea" rough={0.2} clear={1} />
    </mesh>
    {[...Array(9)].map((_, i) => (
      <Ball key={i} p={[Math.cos(i * 2.1) * 0.2, 0.05 + (i % 3) * 0.03, Math.sin(i * 2.1) * 0.2]} r={0.1} s={[1, 0.6, 1]} color={i % 4 === 0 ? "#ff3b3b" : i % 3 === 0 ? "#ffb347" : "#3fbf4f"} rough={0.4} />
    ))}
  </group>
);

// ───────────────────────── Characters ─────────────────────────

export type DiegoItem = "controller" | "dumbbell" | "salad";
const SKIN = "#e9b38d";

/** Diego: chubby gamer, messy hair, RGB headset, tired eyes. Feet at y=0. */
export const Diego: React.FC<{item?: DiegoItem; sit?: boolean; t?: number; mood?: "tired" | "worried"}> = ({item = "controller", sit = false, t: tOff = 0, mood = "tired"}) => {
  const t = useCurrentFrame() + tOff;
  const breathe = 1 + Math.sin(t / 10) * 0.018;
  const blink = t % 80 > 75 ? 0.15 : 1;
  const lift = item === "dumbbell" ? Math.max(0, Math.sin(t / 7)) * 0.55 : 0;
  const play = item === "controller" ? Math.sin(t * 1.3) * 0.02 : 0;
  const rgb = new THREE.Color().setHSL((t / 90) % 1, 1, 0.55).getStyle();
  const lid = mood === "tired" ? 0.95 : 1.25; // eyelid coverage

  return (
    <group>
      {/* legs */}
      <group position={[0, 0.85, 0]} rotation={[sit ? -1.45 : 0, 0, 0]}>
        {[-0.32, 0.32].map((x) => (
          <group key={x}>
            <Cap p={[x, -0.42, 0]} r={0.23} len={0.45} color={SKIN} />
            <Ball p={[x, -0.78, 0.1]} r={0.2} s={[1.1, 0.6, 1.6]} color="#f2f2f5" rough={0.4} />
            <Ball p={[x, -0.72, 0.28]} r={0.08} color="#ff3b5c" />
          </group>
        ))}
      </group>
      {/* shorts */}
      <Cyl p={[0, 0.9, 0]} r={0.74} r2={0.8} h={0.42} color="#1f3a68" sheen={0.6} rough={0.8} />

      {/* torso */}
      <group position={[0, 1.5, 0]} scale={[breathe, breathe, breathe]}>
        <Ball r={0.9} s={[1, 1.02, 0.95]} color="#24262f" sheen={0.8} rough={0.85} />
        {/* belly peeking out under the shirt */}
        <Ball p={[0, -0.42, 0.32]} r={0.62} s={[1.12, 0.62, 0.95]} color={SKIN} />
        <Ball p={[0, -0.45, 0.88]} r={0.05} color="#b9745a" />
        {/* RGB logo + crumbs/stains */}
        <Torus p={[0, 0.32, 0.8]} r={0.17} tube={0.035} color={rgb} emissive={rgb} ei={2.2} />
        {[[-0.3, 0.05], [0.25, 0.15], [0.1, -0.05], [-0.15, 0.3]].map(([x, y], i) => (
          <Ball key={i} p={[x, y, 0.84]} r={0.04} s={[1, 1, 0.4]} color="#ff8a1a" />
        ))}
      </group>

      {/* arms (pivot at the shoulders) */}
      <group position={[0, 2.08, 0]} rotation={[-lift, 0, 0]}>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <Cap p={[sd * 0.78, -0.32, 0.32]} r={0.21} len={0.62} rot={[-0.95, 0, sd * 0.35]} color="#24262f" sheen={0.8} rough={0.85} />
            <Ball p={[sd * 0.42, -0.6 + play * sd, 0.82]} r={0.18} color={SKIN} />
          </group>
        ))}
        <group position={[0, -0.6, 0.9]}>
          {item === "controller" && <Controller t={t} />}
          {item === "dumbbell" && <Dumbbell />}
          {item === "salad" && <Salad />}
        </group>
      </group>

      {/* head */}
      <group position={[0, 2.92, 0]} rotation={[Math.sin(t / 25) * 0.04, Math.sin(t / 40) * 0.12, Math.sin(t / 18) * 0.03]}>
        <Ball r={0.64} color={SKIN} sheen={0.3} />
        <Ball p={[-0.63, -0.02, 0]} r={0.13} color={SKIN} />
        <Ball p={[0.63, -0.02, 0]} r={0.13} color={SKIN} />
        {/* eyes */}
        {[-0.23, 0.23].map((x) => (
          <group key={x} position={[x, 0.05, 0.53]}>
            <Ball r={0.14} s={[1, 1.1, 0.6]} color="#ffffff" rough={0.1} clear={1} />
            <Ball p={[0, -0.02, 0.07]} r={0.075} s={[1, 1, 0.5]} color="#2a1a12" rough={0.1} />
            <Ball p={[0.03, 0.02, 0.1]} r={0.022} color="#ffffff" emissive="#ffffff" ei={1} />
            {/* heavy eyelid */}
            <mesh scale={[1.08, 1.15 * (blink < 1 ? 2 : 1), 0.7]} rotation={[-0.2 * lid, 0, 0]}>
              <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, (Math.PI / 2) * lid * (blink < 1 ? 1.9 : 1)]} />
              <Mat color="#dca07c" />
            </mesh>
            {/* dark circles */}
            <Ball p={[0, -0.16, -0.02]} r={0.11} s={[1.2, 0.4, 0.4]} color="#8d6a8f" opacity={0.6} />
          </group>
        ))}
        {/* brows */}
        <Cap p={[-0.24, 0.28, 0.56]} r={0.03} len={0.16} rot={[0, 0, mood === "worried" ? 1.2 : 1.7]} color="#2c1d14" />
        <Cap p={[0.24, 0.28, 0.56]} r={0.03} len={0.16} rot={[0, 0, mood === "worried" ? -1.2 : -1.7]} color="#2c1d14" />
        {/* nose, cheeks, mouth */}
        <Ball p={[0, -0.1, 0.64]} r={0.1} s={[1.1, 0.9, 1]} color="#dc9d7a" />
        <Ball p={[-0.36, -0.18, 0.47]} r={0.11} s={[1, 0.7, 0.4]} color="#ff8f8f" opacity={0.55} />
        <Ball p={[0.36, -0.18, 0.47]} r={0.11} s={[1, 0.7, 0.4]} color="#ff8f8f" opacity={0.55} />
        <Torus p={[0, -0.34, 0.56]} r={0.09} tube={0.022} arc={Math.PI} rot={[0.2, 0, 0]} color="#7a3328" />
        {/* chin stubble shadow */}
        <Ball p={[0, -0.36, 0.38]} r={0.36} s={[1.1, 0.55, 0.7]} color="#c99577" opacity={0.35} />
        {/* messy hair */}
        {[
          [0, 0.5, 0, 0.36],
          [-0.3, 0.42, 0.12, 0.28],
          [0.3, 0.44, 0.1, 0.3],
          [-0.42, 0.25, -0.1, 0.26],
          [0.42, 0.25, -0.12, 0.26],
          [0, 0.38, -0.35, 0.34],
          [-0.15, 0.48, 0.32, 0.22],
          [0.18, 0.46, 0.34, 0.2],
          [0, 0.25, -0.5, 0.3],
        ].map(([x, y, z, r], i) => (
          <Ball key={i} p={[x, y, z]} r={r} color="#2b1b12" rough={0.9} seg={24} />
        ))}
        <mesh position={[0.05, 0.92, 0]} rotation={[0.2, 0, -0.5 + Math.sin(t / 6) * 0.15]} castShadow>
          <coneGeometry args={[0.07, 0.35, 16]} />
          <Mat color="#2b1b12" rough={0.9} />
        </mesh>
        {/* RGB headset */}
        <Torus p={[0, 0.06, -0.02]} r={0.72} tube={0.06} arc={Math.PI} color="#15151c" rough={0.3} metal={0.4} />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.72, 0.02, 0]}>
            <Cyl r={0.24} h={0.18} rot={[0, 0, Math.PI / 2]} color="#15151c" rough={0.3} />
            <Torus p={[sd * 0.1, 0, 0]} r={0.2} tube={0.03} rot={[0, Math.PI / 2, 0]} color={rgb} emissive={rgb} ei={3} />
          </group>
        ))}
        <Cap p={[-0.6, -0.25, 0.32]} r={0.025} len={0.45} rot={[0.9, 0.3, 0.3]} color="#15151c" />
        <Ball p={[-0.42, -0.42, 0.5]} r={0.05} color="#15151c" />
      </group>
    </group>
  );
};

/** Sofi: gamer girlfriend bust with cat-ear headset, for the video call. */
export const Sofi: React.FC = () => {
  const t = useCurrentFrame();
  const blink = t % 70 > 66 ? 0.12 : 1;
  const pink = "#ff4fb8";
  const HAIR = "#2a1840";
  const skin = "#f3c9ab";
  return (
    <group rotation={[0, Math.sin(t / 30) * 0.12, Math.sin(t / 22) * 0.06]}>
      {/* hoodie */}
      <Ball p={[0, -1.12, -0.05]} r={0.85} s={[1.1, 0.62, 0.7]} color="#b9a4ff" sheen={1} rough={0.9} />
      <Cyl p={[0, -0.55, 0]} r={0.2} h={0.35} color={skin} />
      {/* long hair back */}
      <Ball p={[0, 0.05, -0.18]} r={0.74} color={HAIR} rough={0.7} />
      {[-0.62, 0.62].map((x) => (
        <group key={x}>
          <Cap p={[x, -0.55, -0.05]} r={0.2} len={0.8} color={HAIR} rough={0.7} />
          <Ball p={[x, -1.05, -0.05]} r={0.2} color={pink} emissive={pink} ei={0.25} />
        </group>
      ))}
      {/* head */}
      <Ball r={0.62} color={skin} sheen={0.4} />
      {/* bangs */}
      {[-0.32, -0.1, 0.12, 0.34].map((x, i) => (
        <Ball key={i} p={[x, 0.42 - Math.abs(x) * 0.2, 0.34]} r={0.22} s={[1, 0.8, 0.7]} color={HAIR} rough={0.7} seg={24} />
      ))}
      <Ball p={[0, 0.38, -0.05]} r={0.6} s={[1.05, 0.7, 1]} color={HAIR} rough={0.7} />
      {/* eyes */}
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 0.0, 0.52]} scale={[1, blink, 1]}>
          <Ball r={0.15} s={[0.9, 1.15, 0.55]} color="#ffffff" rough={0.1} clear={1} />
          <Ball p={[0, -0.01, 0.07]} r={0.095} s={[1, 1.1, 0.5]} color="#5b2b8c" rough={0.1} />
          <Ball p={[0, -0.01, 0.1]} r={0.045} s={[1, 1, 0.5]} color="#140a20" />
          <Ball p={[0.035, 0.04, 0.12]} r={0.025} color="#ffffff" emissive="#ffffff" ei={1} />
          <Box p={[x > 0 ? 0.1 : -0.1, 0.15, 0.03]} s={[0.12, 0.025, 0.02]} rot={[0, 0, x > 0 ? -0.5 : 0.5]} color="#140a20" />
        </group>
      ))}
      <Ball p={[0, -0.12, 0.6]} r={0.06} color="#e8a98a" />
      <Ball p={[-0.34, -0.17, 0.46]} r={0.12} s={[1, 0.6, 0.4]} color="#ff7fa8" opacity={0.6} />
      <Ball p={[0.34, -0.17, 0.46]} r={0.12} s={[1, 0.6, 0.4]} color="#ff7fa8" opacity={0.6} />
      {/* smile */}
      <Torus p={[0, -0.27, 0.55]} r={0.09} tube={0.022} arc={Math.PI} rot={[0.2, 0, Math.PI]} color="#b03a4e" />
      {/* cat-ear headset */}
      <Torus p={[0, 0.1, -0.02]} r={0.7} tube={0.055} arc={Math.PI} color="#ffffff" rough={0.3} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Cyl p={[sd * 0.68, 0.02, 0]} r={0.22} h={0.16} rot={[0, 0, Math.PI / 2]} color="#ffffff" rough={0.3} />
          <Torus p={[sd * 0.77, 0.02, 0]} r={0.18} tube={0.03} rot={[0, Math.PI / 2, 0]} color={pink} emissive={pink} ei={3} />
          <mesh position={[sd * 0.42, 0.72, 0]} rotation={[0, 0, -sd * 0.35]} castShadow>
            <coneGeometry args={[0.18, 0.34, 4]} />
            <Mat color="#ffffff" rough={0.3} />
          </mesh>
          <mesh position={[sd * 0.42, 0.7, 0.06]} rotation={[0, 0, -sd * 0.35]}>
            <coneGeometry args={[0.1, 0.22, 4]} />
            <Mat color={pink} emissive={pink} ei={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ───────────────────────── Scenes ─────────────────────────

const CameraRig: React.FC<{pos: V3; look: V3; fov?: number}> = ({pos, look, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    if (fov && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(...look);
  }, [camera, pos, look, fov]);
  return null;
};

const KeyLights: React.FC<{t: number; rimA?: string; rimB?: string}> = ({t, rimA = "#ff2e88", rimB = "#3ee6ff"}) => (
  <>
    <hemisphereLight args={["#bcd2ff", "#2a1630", 0.4]} />
    <directionalLight
      position={[3, 7, 6]}
      intensity={1.6}
      color="#fff1e0"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
    />
    <pointLight position={[-4, 3.5, -1.5]} intensity={40 + Math.sin(t / 8) * 12} color={rimA} distance={14} />
    <pointLight position={[4, 3, -1.5]} intensity={40 + Math.cos(t / 9) * 12} color={rimB} distance={14} />
  </>
);

/** Diego's messy gamer room. `shot` picks the camera move. */
export const DiegoRoom: React.FC<{width: number; height: number; shot: "intro" | "belly" | "pip"; local: number}> = ({width, height, shot, local}) => {
  const t = useCurrentFrame();
  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const cam: {pos: V3; look: V3; fov: number} =
    shot === "intro"
      ? {pos: [Math.sin(local / 90) * 1.2 + 0.6, 3.6 - ease(local / 120) * 0.3, 13 - ease(local / 125) * 2.5], look: [0.5, 2.35, 0], fov: 40}
      : shot === "belly"
        ? {pos: [3.4 - ease(local / 100) * 1.2, 2.9, 9.5 - ease(local / 100) * 1.8], look: [0.4, 1.9, 0], fov: 40}
        : {pos: [0.2, 2.9, 4.4], look: [0, 2.6, 0], fov: 40};
  const monitor = shot === "pip" ? "#ff4fb8" : "#4f7bff";
  const ledA = new THREE.Color().setHSL(((t / 120) % 1), 1, 0.55).getStyle();

  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}}>
      <color attach="background" args={["#0b0716"]} />
      <fog attach="fog" args={["#0b0716", 9, 22]} />
      <CameraRig pos={cam.pos} look={cam.look} fov={cam.fov} />
      <KeyLights t={t} />
      {/* monitor light on his face */}
      <pointLight position={[2.2, 2.6, 1.6]} intensity={30 + Math.sin(t / 2) * 6} color={monitor} distance={6} />

      {/* floor + walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1b1628" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, -3.2]} receiveShadow>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial color="#17122a" roughness={0.95} />
      </mesh>
      {/* LED strips */}
      <Box p={[0, 5.2, -3.15]} s={[14, 0.08, 0.05]} color={ledA} emissive={ledA} ei={4} />
      <Box p={[-4.2, 2.6, -3.15]} s={[0.08, 5, 0.05]} color="#ff2e88" emissive="#ff2e88" ei={3} />
      {/* posters */}
      <Box p={[-2.3, 3.6, -3.1]} s={[1.5, 2, 0.03]} color="#2d1f5a" emissive="#7b2cff" ei={0.4} />
      <Box p={[2.6, 3.9, -3.1]} s={[1.3, 1.3, 0.03]} color="#3a1424" emissive="#ff2e88" ei={0.35} />

      {/* gaming chair */}
      <group position={[0, 0, -0.9]}>
        <Box p={[0, 2.3, -0.2]} s={[1.9, 2.8, 0.35]} rot={[-0.1, 0, 0]} color="#16161d" rough={0.4} />
        <Box p={[0, 2.3, -0.02]} s={[0.35, 2.6, 0.02]} rot={[-0.1, 0, 0]} color="#ff2e3d" emissive="#ff2e3d" ei={0.6} />
        <Box p={[0, 1.05, 0.5]} s={[1.9, 0.3, 1.6]} color="#16161d" rough={0.4} />
        <Cyl p={[0, 0.5, 0.5]} r={0.1} h={0.9} color="#8a8f99" metal={1} rough={0.3} />
        <Cyl p={[0, 0.08, 0.5]} r={0.8} h={0.1} color="#16161d" />
      </group>

      {/* Diego sitting */}
      <group position={[0, 0.35, 0.1]}>
        <Diego sit item="controller" mood={shot === "belly" ? "worried" : "tired"} />
      </group>

      {/* desk with monitor, snacks */}
      <group position={[2.6, 0, 0.6]} rotation={[0, -0.6, 0]}>
        <Box p={[0, 1.4, 0]} s={[2.4, 0.12, 1.3]} color="#202030" rough={0.4} />
        <Box p={[-1.05, 0.7, 0]} s={[0.1, 1.4, 1.2]} color="#202030" />
        <Box p={[1.05, 0.7, 0]} s={[0.1, 1.4, 1.2]} color="#202030" />
        <group position={[0, 2.3, -0.35]} rotation={[0, -0.9, 0]}>
          <Box s={[1.7, 1.0, 0.08]} color="#0d0d12" />
          <Box p={[0, 0, 0.045]} s={[1.6, 0.9, 0.01]} color={monitor} emissive={monitor} ei={1.6} />
          <Box p={[0, -0.75, 0]} s={[0.12, 0.6, 0.12]} color="#0d0d12" />
        </group>
        <Box p={[0, 1.5, 0.25]} s={[1, 0.06, 0.3]} color="#111" />
        <Box p={[0, 1.535, 0.25]} s={[0.96, 0.01, 0.26]} color={ledA} emissive={ledA} ei={2} />
        <EnergyCan p={[-0.8, 1.67, 0.3]} />
        <EnergyCan p={[-0.55, 1.67, 0.45]} color="#ff3b5c" />
        <EnergyCan p={[0.8, 1.67, 0.35]} />
        <ChipBag p={[0.55, 1.75, 0.0]} rot={[0.2, 0.3, 0.2]} />
      </group>
      {/* floor mess */}
      <EnergyCan p={[-1.6, 0.13, 1.4]} rot={[Math.PI / 2, 0, 0.6]} />
      <EnergyCan p={[-1.1, 0.21, 1.9]} color="#ff3b5c" />
      <EnergyCan p={[1.0, 0.13, 2.1]} rot={[Math.PI / 2, 0, -0.4]} color="#ffd400" />
      <ChipBag p={[-2.2, 0.25, 0.6]} rot={[-1.2, 0.2, 0.3]} color="#2f7bff" />
      <Box p={[-2.0, 0.08, 1.9]} s={[1.0, 0.1, 1.0]} rot={[0, 0.4, 0]} color="#c79a5a" rough={0.9} />
      <Box p={[-2.0, 0.18, 1.9]} s={[1.0, 0.1, 1.0]} rot={[0, 0.2, 0]} color="#d6aa66" rough={0.9} />
    </ThreeCanvas>
  );
};

/** Sofi's side of the video call: pastel LED room. */
export const SofiCall: React.FC<{width: number; height: number}> = ({width, height}) => {
  const t = useCurrentFrame();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}}>
      <color attach="background" args={["#2a1240"]} />
      <CameraRig pos={[0, 0.1, 6.4 - Math.min(1, t / 90) * 0.5]} look={[0, -0.25, 0]} fov={42} />
      <KeyLights t={t} rimA="#ff4fb8" rimB="#8a5cff" />
      <pointLight position={[0, 0.5, 2.5]} intensity={14} color="#ffd9f0" distance={6} />
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#3a1858" roughness={1} />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[-2.4 + i * 0.95, 1.25 + Math.sin(i * 1.7) * 0.2, -1.9]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#ffd36b" emissive="#ffd36b" emissiveIntensity={2 + Math.sin(t / 6 + i) * 1} />
        </mesh>
      ))}
      <group position={[0, -0.2, 0]}>
        <Sofi />
      </group>
    </ThreeCanvas>
  );
};

/** Diego standing on a pedestal, transparent background (vote panels). */
export const DiegoPose: React.FC<{width: number; height: number; item: DiegoItem; tOff?: number}> = ({width, height, item, tOff = 0}) => {
  const t = useCurrentFrame();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
      <CameraRig pos={[1.6, 2.4, 7.4]} look={[0, 1.8, 0]} fov={38} />
      <KeyLights t={t} rimA="#ffffff" rimB="#c6ff3d" />
      <group rotation={[0, -0.25 + Math.sin((t + tOff) / 30) * 0.15, 0]}>
        <Cyl p={[0, -0.1, 0]} r={1.4} h={0.2} color="#0d0d14" rough={0.3} />
        <Torus p={[0, 0.0, 0]} r={1.4} tube={0.04} rot={[Math.PI / 2, 0, 0]} color="#c6ff3d" emissive="#c6ff3d" ei={3} />
        <Diego item={item} t={tOff} mood={item === "salad" ? "worried" : "tired"} />
      </group>
    </ThreeCanvas>
  );
};
