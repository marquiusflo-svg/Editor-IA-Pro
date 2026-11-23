import React from "react";
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {useFonts} from "../templates/gta/GTAInfo";
import {RETO_CAPTIONS, RETO_KEYWORDS, RETO_VOICE, RETO_VOTE_START, type RetoWord} from "./retoMilData";

const ORANGE = "#ff8a00";
const PURPLE = "#6a2ee8";
const LIME = "#c6ff3d";
const RED = "#ff3b3b";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const outline = (w: number) => ({WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill"}) as const;

// ───────────────────────── Character ─────────────────────────

type Item = "wallet" | "lemonade" | "sponge";

/** "Lalo": skinny broke guy in a purple hoodie and backwards cap. */
const Lalo: React.FC<{item?: Item; t?: number}> = ({item = "wallet", t = 0}) => {
  const frame = useCurrentFrame() + t;
  const bob = Math.sin(frame / 7) * 4;
  const blink = frame % 90 > 85 ? 0.12 : 1;
  const look = Math.sin(frame / 25) * 6;
  const SKIN = "#c98b62";
  const sweatY = (frame * 2.2) % 70;

  // Moth flutters out of the empty wallet on a loop.
  const mp = (frame % 80) / 80;
  const moth = {x: 300 + Math.sin(mp * 9) * 40 + mp * 60, y: 560 - mp * 420, o: mp < 0.9 ? 1 : (1 - mp) * 10, w: Math.sin(frame * 1.6) > 0};

  return (
    <svg viewBox="0 0 600 900" style={{width: "100%", height: "100%", overflow: "visible"}}>
      {/* legs + sneakers */}
      <rect x={225} y={620} width={60} height={200} rx={20} fill="#26324d" />
      <rect x={315} y={620} width={60} height={200} rx={20} fill="#26324d" />
      {[255, 345].map((x, i) => (
        <g key={i}>
          <path d={`M ${x - 45} 850 Q ${x - 45} 810 ${x} 810 L ${x + 20} 810 Q ${x + 55} 815 ${x + 55} 850 Z`} fill="#fff" stroke="#000" strokeWidth={5} />
          <rect x={x - 45} y={842} width={100} height={14} rx={6} fill={RED} stroke="#000" strokeWidth={4} />
        </g>
      ))}

      <g transform={`translate(0 ${bob * 0.5})`}>
        {/* hoodie body */}
        <path d="M 170 360 Q 300 320 430 360 L 445 640 Q 300 670 155 640 Z" fill={PURPLE} stroke="#000" strokeWidth={6} />
        <path d="M 225 540 L 375 540 L 360 610 L 240 610 Z" fill="#5622c9" stroke="#000" strokeWidth={4} />
        <path d="M 270 370 L 262 450" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <path d="M 330 370 L 338 450" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        {/* patch */}
        <rect x={380} y={430} width={40} height={36} rx={4} fill={ORANGE} stroke="#000" strokeWidth={3} transform="rotate(12 400 448)" />

        {/* arms reaching forward */}
        <path d="M 180 390 Q 120 480 210 540" stroke={PURPLE} strokeWidth={62} fill="none" strokeLinecap="round" />
        <path d="M 420 390 Q 480 480 390 540" stroke={PURPLE} strokeWidth={62} fill="none" strokeLinecap="round" />
        <circle cx={225} cy={545} r={30} fill={SKIN} stroke="#000" strokeWidth={4} />
        <circle cx={375} cy={545} r={30} fill={SKIN} stroke="#000" strokeWidth={4} />

        {item === "wallet" && (
          <g>
            <path d="M 225 520 L 300 560 L 375 520 L 375 585 L 300 615 L 225 585 Z" fill="#8a5a2b" stroke="#000" strokeWidth={5} />
            <path d="M 300 560 L 300 615" stroke="#000" strokeWidth={4} />
            <g transform={`translate(${moth.x} ${moth.y})`} opacity={moth.o}>
              <ellipse cx={0} cy={0} rx={7} ry={14} fill="#6b5b4b" />
              <ellipse cx={-14} cy={-4} rx={16} ry={f2(moth.w)} fill="#d8cbb8" stroke="#000" strokeWidth={2} />
              <ellipse cx={14} cy={-4} rx={16} ry={f2(moth.w)} fill="#d8cbb8" stroke="#000" strokeWidth={2} />
            </g>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={290 + i * 6 + Math.sin(frame / 5 + i) * 10} cy={540 - ((frame * 2 + i * 17) % 90)} r={3} fill="#e6dccb" opacity={0.7} />
            ))}
          </g>
        )}
        {item === "lemonade" && (
          <g transform="translate(300 520)">
            <path d="M -50 -60 L 50 -60 L 40 70 L -40 70 Z" fill="#fff59a" stroke="#000" strokeWidth={5} />
            <rect x={-50} y={-60} width={100} height={18} fill="#ffffffaa" />
            <circle cx={-10} cy={10} r={18} fill="#ffe14d" stroke="#000" strokeWidth={3} />
            <path d={`M 20 -60 L 35 -110`} stroke={RED} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
        {item === "sponge" && (
          <g transform={`translate(300 ${525 + Math.sin(frame / 3) * 8}) rotate(${Math.sin(frame / 3) * 10})`}>
            <rect x={-60} y={-35} width={120} height={70} rx={16} fill="#ffe14d" stroke="#000" strokeWidth={5} />
            {[...Array(7)].map((_, i) => (
              <circle key={i} cx={-40 + i * 13} cy={(i % 2) * 22 - 10} r={5} fill="#d8b800" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={-50 + i * 35} cy={-50 - ((frame * 3 + i * 20) % 90)} r={10 + (i % 2) * 6} fill="#ffffffcc" stroke="#9fdcff" strokeWidth={3} />
            ))}
          </g>
        )}

        {/* neck + head */}
        <rect x={270} y={300} width={60} height={50} fill={SKIN} />
        <g transform={`translate(0 ${bob})`}>
          <circle cx={300} cy={200} r={130} fill={SKIN} stroke="#000" strokeWidth={6} />
          {/* ears */}
          <circle cx={170} cy={215} r={26} fill={SKIN} stroke="#000" strokeWidth={5} />
          <circle cx={430} cy={215} r={26} fill={SKIN} stroke="#000" strokeWidth={5} />
          {/* backwards cap */}
          <path d="M 175 160 Q 300 20 425 160 Z" fill={ORANGE} stroke="#000" strokeWidth={6} />
          <path d="M 395 150 Q 470 160 480 120 Q 430 110 405 135 Z" fill="#d96f00" stroke="#000" strokeWidth={5} />
          <circle cx={300} cy={68} r={10} fill="#d96f00" stroke="#000" strokeWidth={3} />
          {/* worried brows */}
          <path d="M 215 160 Q 245 140 270 165" stroke="#000" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M 330 165 Q 355 140 385 160" stroke="#000" strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* big eyes */}
          <ellipse cx={248} cy={210} rx={34} ry={40 * blink} fill="#fff" stroke="#000" strokeWidth={5} />
          <ellipse cx={352} cy={210} rx={34} ry={40 * blink} fill="#fff" stroke="#000" strokeWidth={5} />
          {blink > 0.5 && (
            <>
              <circle cx={248 + look} cy={218} r={14} fill="#000" />
              <circle cx={352 + look} cy={218} r={14} fill="#000" />
              <circle cx={243 + look} cy={212} r={4} fill="#fff" />
              <circle cx={347 + look} cy={212} r={4} fill="#fff" />
            </>
          )}
          {/* nervous wavy mouth */}
          <path d="M 255 290 q 11 -12 22 0 q 11 12 22 0 q 11 -12 22 0 q 11 12 22 0" stroke="#000" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* sweat drop */}
          <path d={`M 405 ${150 + sweatY} q 14 22 0 32 q -14 -10 0 -32`} fill="#7fd4ff" stroke="#000" strokeWidth={3} opacity={1 - sweatY / 70} />
        </g>
      </g>
    </svg>
  );
};
const f2 = (open: boolean) => (open ? 12 : 4);

// ───────────────────────── Backdrop + HUD ─────────────────────────

/** City sidewalk at dusk. */
const Street: React.FC = () => {
  const frame = useCurrentFrame();
  const buildings = [
    [0, 520, 220],
    [200, 380, 180],
    [370, 600, 160],
    [520, 300, 220],
    [730, 460, 170],
    [890, 360, 200],
  ];
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg, #2b1055 0%, #7a2d8c 38%, #ff7a3d 62%, #ffb86b 70%)"}}>
      {buildings.map(([x, h, w], i) => (
        <div key={i} style={{position: "absolute", left: x, bottom: 640, width: w, height: h, background: "#1a0f2e"}}>
          {[...Array(Math.floor(h / 70))].map((_, r) =>
            [0, 1, 2].map((c) => {
              const on = (i * 7 + r * 3 + c + Math.floor(frame / 45)) % 5 !== 0;
              return <div key={`${r}-${c}`} style={{position: "absolute", left: 22 + c * (w / 3.3), top: 24 + r * 70, width: 30, height: 38, background: on ? "#ffd36b" : "#2d2147"}} />;
            }),
          )}
        </div>
      ))}
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 640, background: "linear-gradient(180deg, #5b5566 0%, #3a3644 100%)"}} />
      <div style={{position: "absolute", left: 0, right: 0, bottom: 600, height: 40, background: "#8a8494"}} />
      {/* lamp post glow */}
      <div style={{position: "absolute", left: 930, bottom: 640, width: 16, height: 700, background: "#222"}} />
      <div style={{position: "absolute", left: 860, top: 540, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, #fff3b0 0%, #ffd36b55 40%, transparent 70%)", opacity: 0.8 + Math.sin(frame / 4) * 0.1}} />
      <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(0,0,0,0.55) 100%)"}} />
    </AbsoluteFill>
  );
};

/** Money goal card: "$0 / $1000" with an empty progress bar and days left. */
const GoalHud: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 6, fps, config: {damping: 12}});
  const blinkRed = Math.sin(frame / 4) > 0 ? RED : "#ffffff";
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 60,
        right: 60,
        background: "#0d0d14ee",
        border: "5px solid #fff",
        borderRadius: 26,
        padding: "22px 30px",
        transform: `translateY(${(1 - s) * -300}px)`,
        boxShadow: "0 10px 0 #000",
      }}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: "#fff", letterSpacing: 1}}>
          RETO <span style={{color: LIME}}>$1000</span>
        </div>
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 34, color: "#0d0d14", background: LIME, padding: "4px 18px", borderRadius: 30}}>
          DÍA 1 · QUEDAN 30
        </div>
      </div>
      <div style={{marginTop: 18, height: 40, borderRadius: 20, background: "#2a2a38", border: "4px solid #fff", position: "relative", overflow: "hidden"}}>
        <div style={{width: 14, height: "100%", background: blinkRed}} />
      </div>
      <div style={{marginTop: 8, display: "flex", justifyContent: "space-between", fontFamily: DISPLAY, fontSize: 54}}>
        <span style={{color: blinkRed}}>$0</span>
        <span style={{color: "#fff"}}>$1000</span>
      </div>
    </div>
  );
};

const isKey = (w: string) => {
  const c = w.replace(/[¿?¡!.,…]/g, "").toLowerCase();
  return RETO_KEYWORDS.some((k) => k.replace(/[.]/g, "") === c);
};

/** Captions: 3-word groups; the active word sits in a colored box. */
const Captions: React.FC<{words: RetoWord[]; top: number}> = ({words, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = words.findIndex((w) => frame >= w.start && frame < w.end + 6);
  if (idx < 0) return null;
  const g0 = idx - (idx % 3);
  const group = words.slice(g0, g0 + 3).filter((w) => w.start <= frame);
  return (
    <div style={{position: "absolute", top, left: 40, right: 40, textAlign: "center"}}>
      {group.map((w, i) => {
        const active = g0 + i === idx;
        const s = spring({frame: frame - w.start, fps, config: {damping: 11, stiffness: 240}});
        const box = active ? (isKey(w.text) ? LIME : ORANGE) : "transparent";
        return (
          <span
            key={w.start}
            style={{
              display: "inline-block",
              margin: "6px 8px",
              padding: "2px 18px",
              borderRadius: 18,
              background: box,
              fontFamily: BODY,
              fontWeight: 900,
              fontSize: 84,
              textTransform: "uppercase",
              color: active ? "#0d0d14" : "#fff",
              ...(active ? {} : outline(4)),
              textShadow: active ? "none" : "0 6px 0 #000",
              boxShadow: active ? "0 8px 0 #000" : "none",
              transform: `scale(${interpolate(s, [0, 1], [0.5, 1])}) rotate(${active ? -2 : 0}deg)`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ───────────────────────── Scenes ─────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14}});
  const push = interpolate(frame, [0, RETO_VOTE_START], [1, 1.12], {...clamp, easing: Easing.inOut(Easing.quad)});
  // Quick zoom punch on "$1000"
  const punch = interpolate(frame, [125, 132, 145], [0, 0.08, 0], clamp);
  return (
    <AbsoluteFill>
      <Street />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 470,
          height: 1300,
          transform: `translateX(${(1 - enter) * 900}px) scale(${push + punch})`,
          transformOrigin: "50% 45%",
        }}
      >
        <Lalo />
      </div>
      <GoalHud />
    </AbsoluteFill>
  );
};

const Option: React.FC<{color: string; title: string; sub: string; tag: string; item: Item; delay: number; top: number}> = ({color, title, sub, tag, item, delay, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 13}});
  return (
    <div style={{position: "absolute", left: 0, right: 0, top, height: 760, background: color, overflow: "hidden"}}>
      {/* diagonal stripes */}
      <AbsoluteFill style={{background: "repeating-linear-gradient(135deg, #ffffff12 0 40px, transparent 40px 80px)"}} />
      <div style={{position: "absolute", left: 10, top: 40, width: 470, height: 700, transform: `translateX(${(1 - s) * -500}px)`}}>
        <Lalo item={item} t={delay * 3} />
      </div>
      <div style={{position: "absolute", left: 480, right: 40, top: 150, opacity: s, transform: `translateX(${(1 - s) * 300}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 124, lineHeight: 0.95, color: "#fff", ...outline(7), textShadow: "0 9px 0 #000"}}>{title}</div>
        <div style={{marginTop: 22, fontFamily: BODY, fontWeight: 800, fontSize: 36, color: "#fff", textShadow: "0 3px 0 #000", lineHeight: 1.25}}>{sub}</div>
        <div style={{marginTop: 24, display: "inline-block", fontFamily: BODY, fontWeight: 900, fontSize: 34, background: "#0d0d14", color: LIME, padding: "8px 20px", borderRadius: 14}}>{tag}</div>
      </div>
    </div>
  );
};

const Vote: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flash = interpolate(frame, [0, 8], [1, 0], clamp);
  const vs = spring({frame: frame - 18, fps, config: {damping: 7}});
  const header = spring({frame: frame - 4, fps, config: {damping: 10}});
  const wobble = Math.sin(frame / 3) * 4;
  return (
    <AbsoluteFill style={{background: "#0d0d14"}}>
      <Option color={ORANGE} title="LIMONADA" sub="Puesto en la esquina, a $1 el vaso" tag="INVERSIÓN: $5" item="lemonade" delay={6} top={200} />
      <Option color="#33157a" title="LAVAR COCHES" sub="Cubeta, esponja y mucho sudor" tag="INVERSIÓN: $0" item="sponge" delay={12} top={960} />
      {/* header */}
      <div style={{position: "absolute", top: 50, width: "100%", textAlign: "center", transform: `scale(${header})`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 104, color: LIME, ...outline(6), textShadow: "0 8px 0 #000"}}>TÚ DECIDES</div>
      </div>
      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: 540 - 110,
          top: 960 - 110,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "#0d0d14",
          border: "8px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
          fontSize: 110,
          color: LIME,
          transform: `scale(${vs}) rotate(${wobble}deg)`,
          boxShadow: "0 0 50px #c6ff3d88",
        }}
      >
        VS
      </div>
      {/* footer */}
      <div style={{position: "absolute", left: 0, right: 0, top: 1720, bottom: 0, background: "#0d0d14"}}>
        <div style={{position: "absolute", bottom: 30, width: "100%", textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#ffffffaa"}}>
          comenta LIMONADA o COCHES · @WoloByte
        </div>
      </div>
      <AbsoluteFill style={{background: "#fff", opacity: flash}} />
    </AbsoluteFill>
  );
};

// ───────────────────────── Root ─────────────────────────

export const RetoMil: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <Intro />
      <Sequence from={RETO_VOTE_START}>
        <Vote />
        <Audio src={staticFile("sfx/impact.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={RETO_VOTE_START + 18}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.7} />
      </Sequence>
      <Sequence from={0}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={125}>
        <Audio src={staticFile("sfx/hit.wav")} volume={0.5} />
      </Sequence>
      <Captions words={RETO_CAPTIONS} top={frame < RETO_VOTE_START ? 1560 : 1735} />
      {RETO_VOICE && <Audio src={staticFile(RETO_VOICE)} />}
    </AbsoluteFill>
  );
};
