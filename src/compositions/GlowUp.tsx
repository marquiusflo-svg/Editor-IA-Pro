import React from "react";
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {useFonts} from "../templates/gta/GTAInfo";
import {GLOW_CAPTIONS, GLOW_KEYWORDS, GLOW_VOICE, GLOW_VOTE_START, type GlowWord} from "./glowUpData";

const YELLOW = "#ffd400";
const BLUE = "#1f5bff";
const GREEN = "#17a94a";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";
const STROKE = (w: number) => `${w}px #000`;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// ───────────────────────── Character ─────────────────────────

type Item = "none" | "shower" | "scissors";

/** "Beto": an original cartoon slob drawn in SVG, with idle animation. */
const Beto: React.FC<{item?: Item; t?: number}> = ({item = "none", t = 0}) => {
  const frame = useCurrentFrame() + t;
  const breathe = 1 + Math.sin(frame / 9) * 0.015;
  const blink = frame % 75 > 70 ? 0.1 : 1;
  const sway = Math.sin(frame / 22) * 2;
  const SKIN_D = "#d98d7b";

  const flies = [0, 1, 2, 3].map((i) => {
    const a = frame / (10 + i * 3) + i * 1.7;
    return {x: 300 + Math.cos(a) * (190 + i * 25), y: 230 + Math.sin(a * 1.3) * (120 + i * 15), w: Math.sin(frame * 2 + i) > 0};
  });

  const stink = (x: number, d: number) => {
    const o = Math.sin(frame / 8 + d) * 10;
    const y0 = 560 - ((frame * 2 + d * 40) % 60);
    return `M ${x} ${y0} q ${15 + o} -25 0 -50 q ${-15 - o} -25 0 -50 q ${15 + o} -25 0 -50`;
  };

  return (
    <svg viewBox="0 0 600 820" style={{width: "100%", height: "100%", overflow: "visible"}}>
      <defs>
        <radialGradient id="skin" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffd6c9" />
          <stop offset="100%" stopColor={SKIN_D} />
        </radialGradient>
        <radialGradient id="belly" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffd0c2" />
          <stop offset="100%" stopColor="#c97c6b" />
        </radialGradient>
      </defs>

      {/* stink lines */}
      {[90, 510, 140].map((x, i) => (
        <path key={i} d={stink(x, i * 2)} stroke="#9be15d" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
      ))}

      <g transform={`rotate(${sway} 300 760)`}>
        {/* legs */}
        <rect x={205} y={640} width={70} height={140} rx={32} fill="url(#skin)" />
        <rect x={325} y={640} width={70} height={140} rx={32} fill="url(#skin)" />
        <ellipse cx={235} cy={790} rx={52} ry={22} fill="#f0d34a" stroke="#000" strokeWidth={4} />
        <ellipse cx={365} cy={790} rx={52} ry={22} fill="#f0d34a" stroke="#000" strokeWidth={4} />
        {/* shorts */}
        <path d="M 180 600 L 420 600 L 410 690 L 310 690 L 300 660 L 290 690 L 190 690 Z" fill="#2b2b33" />

        <g transform={`translate(300 520) scale(${breathe}) translate(-300 -520)`}>
          {/* arms */}
          <ellipse cx={128} cy={470} rx={48} ry={110} fill="url(#skin)" transform="rotate(14 128 470)" />
          <ellipse cx={472} cy={470} rx={48} ry={110} fill="url(#skin)" transform="rotate(-14 472 470)" />
          {/* belly */}
          <ellipse cx={300} cy={530} rx={175} ry={140} fill="url(#belly)" />
          {[...Array(26)].map((_, i) => {
            const x = 250 + ((i * 37) % 100);
            const y = 500 + ((i * 53) % 130);
            return <path key={i} d={`M ${x} ${y} q 4 -8 0 -16`} stroke="#3a2418" strokeWidth={3} fill="none" />;
          })}
          <ellipse cx={300} cy={585} rx={9} ry={6} fill="#a35d4d" />
          {/* tank top (rides up over the belly) */}
          <path d="M 150 330 Q 300 300 450 330 L 470 500 Q 300 470 130 500 Z" fill="#f4f1e6" stroke="#d8d2bf" strokeWidth={3} />
          <path d="M 230 320 Q 300 380 370 320" fill="url(#skin)" />
          {[
            [210, 400, 26, 18, "#b5833d"],
            [345, 440, 34, 20, "#8c5a2b"],
            [280, 380, 14, 10, "#c0392b"],
            [400, 380, 18, 12, "#b5833d"],
            [190, 460, 12, 8, "#8c5a2b"],
          ].map(([x, y, rx, ry, c], i) => (
            <ellipse key={i} cx={x as number} cy={y as number} rx={rx as number} ry={ry as number} fill={c as string} opacity={0.75} />
          ))}
          {/* hands */}
          <circle cx={112} cy={575} r={34} fill="url(#skin)" />
          <circle cx={488} cy={575} r={34} fill="url(#skin)" />
          {item === "shower" && (
            <g transform={`translate(500 ${505 + Math.sin(frame / 4) * 6}) scale(1.5)`}>
              <ellipse cx={0} cy={30} rx={48} ry={32} fill="#ffd400" stroke="#000" strokeWidth={4} />
              <circle cx={-20} cy={-8} r={26} fill="#ffd400" stroke="#000" strokeWidth={4} />
              <path d="M -46 -6 L -66 0 L -46 6 Z" fill="#ff8a00" stroke="#000" strokeWidth={3} />
              <circle cx={-26} cy={-14} r={4} fill="#000" />
              <path d="M 10 22 Q 30 8 40 26" stroke="#e0a800" strokeWidth={5} fill="none" />
            </g>
          )}
          {item === "scissors" && (
            <g transform={`translate(70 500) rotate(${-30 + Math.sin(frame / 3) * 10})`}>
              <circle cx={0} cy={60} r={18} fill="none" stroke="#e23b3b" strokeWidth={9} />
              <circle cx={38} cy={60} r={18} fill="none" stroke="#e23b3b" strokeWidth={9} />
              <path d="M 8 45 L 50 -50 L 42 -52 L 19 40 Z" fill="#c9d1d9" stroke="#000" strokeWidth={3} />
              <path d="M 30 45 L -12 -50 L -4 -52 L 19 40 Z" fill="#dfe6ec" stroke="#000" strokeWidth={3} />
            </g>
          )}
        </g>

        {/* head */}
        <g transform={`translate(0 ${Math.sin(frame / 9) * 3})`}>
          <circle cx={300} cy={210} r={150} fill="url(#skin)" />
          {/* messy side hair */}
          {[...Array(9)].map((_, i) => {
            const left = i < 5;
            const x = left ? 165 - (i % 3) * 8 : 435 + (i % 3) * 8;
            const y = 170 + (i % 5) * 26;
            return (
              <path
                key={i}
                d={`M ${x} ${y} q ${left ? -25 : 25} 10 ${left ? -5 : 5} 24 q ${left ? 22 : -22} 10 ${left ? -8 : 8} 26`}
                stroke="#111"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          {/* the last three hairs on top */}
          {[-30, 0, 28].map((dx, i) => (
            <path key={i} d={`M ${300 + dx} 68 q ${12 + Math.sin(frame / 6 + i) * 8} -28 ${-4 + i * 4} -55`} stroke="#111" strokeWidth={6} fill="none" strokeLinecap="round" />
          ))}
          {/* pimples */}
          {[[230, 120], [370, 140], [395, 270], [210, 285], [330, 95]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={7} fill="#e0524a" opacity={0.85} />
          ))}
          {/* sad brows */}
          <path d="M 205 150 L 270 135" stroke="#111" strokeWidth={12} strokeLinecap="round" />
          <path d="M 330 135 L 395 150" stroke="#111" strokeWidth={12} strokeLinecap="round" />
          {/* glasses */}
          <rect x={190} y={165} width={95} height={75} rx={22} fill="#ffffff55" stroke="#111" strokeWidth={12} />
          <rect x={315} y={165} width={95} height={75} rx={22} fill="#ffffff55" stroke="#111" strokeWidth={12} />
          <path d="M 285 195 L 315 195" stroke="#111" strokeWidth={10} />
          {/* eyes */}
          <ellipse cx={240} cy={205} rx={14} ry={16 * blink} fill="#3b2a20" />
          <ellipse cx={360} cy={205} rx={14} ry={16 * blink} fill="#3b2a20" />
          {/* nose + cheeks */}
          <ellipse cx={300} cy={262} rx={30} ry={24} fill="#e99a87" />
          <circle cx={205} cy={275} r={24} fill="#ff8f8f" opacity={0.45} />
          <circle cx={395} cy={275} r={24} fill="#ff8f8f" opacity={0.45} />
          {/* stubble */}
          {[...Array(40)].map((_, i) => (
            <circle key={i} cx={225 + ((i * 41) % 150)} cy={295 + ((i * 23) % 55)} r={2.6} fill="#3a2a22" />
          ))}
          {/* frown */}
          <path d="M 265 325 Q 300 300 335 325" stroke="#5a2a20" strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* flies */}
      {flies.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <ellipse cx={0} cy={0} rx={9} ry={6} fill="#111" />
          <ellipse cx={-4} cy={-8} rx={6} ry={f.w ? 8 : 3} fill="#ffffffaa" />
          <ellipse cx={5} cy={-8} rx={6} ry={f.w ? 8 : 3} fill="#ffffffaa" />
        </g>
      ))}
    </svg>
  );
};

// ───────────────────────── UI pieces ─────────────────────────

const Badge: React.FC<{label: string; value: string; color: string}> = ({label, value, color}) => (
  <div style={{background: "#111", border: "5px solid #fff", borderRadius: 16, padding: "6px 18px", textAlign: "center", boxShadow: "0 6px 0 #000"}}>
    <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: 2}}>{label}</div>
    <div style={{fontFamily: DISPLAY, fontSize: 64, color, lineHeight: 1}}>{value}</div>
  </div>
);

const Counters: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 4, fps, config: {damping: 11}});
  const glitch = frame % 40 < 3 ? 1 : 0;
  return (
    <div style={{position: "absolute", top: 110, left: 70, display: "flex", gap: 20, transform: `scale(${s})`, transformOrigin: "top left"}}>
      <Badge label="DÍAS" value="30" color={YELLOW} />
      <Badge label="GLOW" value={glitch ? "1%" : "0%"} color="#ff3b5c" />
    </div>
  );
};

/** Messy-room backdrop for the intro. */
const Room: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg, #121a3a 0%, #1c2a5c 60%, #0b0f22 100%)"}}>
      <div style={{position: "absolute", left: 120, top: 260, width: 300, height: 380, background: "#c2183f", transform: "rotate(-3deg)", opacity: 0.85}} />
      <div style={{position: "absolute", right: 90, top: 330, width: 220, height: 160, borderRadius: 12, background: "#0a0a0a", boxShadow: `0 0 ${60 + Math.sin(frame / 5) * 20}px #4f7bff`}} />
      <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 520, background: "linear-gradient(180deg, #d9d4c7, #9d978a)"}} />
      {/* pizza boxes */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: "absolute", left: 90 + i * 12, bottom: 360 + i * 34, width: 220, height: 34, background: "#c79a5a", border: "3px solid #6d4f24", transform: `rotate(${i * 3 - 3}deg)`}} />
      ))}
      <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(0,0,0,0.6) 100%)"}} />
    </AbsoluteFill>
  );
};

const isKey = (w: string) => {
  const c = w.replace(/[¿?¡!.,…]/g, "").toLowerCase();
  return GLOW_KEYWORDS.some((k) => k.toLowerCase() === c) || c === "30";
};

/** CapCut captions: 3-word groups, active word pops, keywords in yellow. */
const Captions: React.FC<{words: GlowWord[]; top: number}> = ({words, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = words.findIndex((w) => frame >= w.start && frame < w.end + 6);
  if (idx < 0) return null;
  const groupStart = idx - (idx % 3);
  const group = words.slice(groupStart, groupStart + 3).filter((w) => w.start <= frame);
  return (
    <div style={{position: "absolute", top, left: 60, right: 60, textAlign: "center"}}>
      {group.map((w, i) => {
        const s = spring({frame: frame - w.start, fps, config: {damping: 10, stiffness: 220}});
        const active = groupStart + i === idx;
        return (
          <span
            key={w.start}
            style={{
              display: "inline-block",
              margin: "0 16px",
              fontFamily: BODY,
              fontWeight: 900,
              fontSize: 86,
              color: isKey(w.text) ? YELLOW : "#fff",
              WebkitTextStroke: STROKE(4),
              paintOrder: "stroke fill",
              textShadow: "0 7px 0 #000",
              transform: `scale(${interpolate(s, [0, 1], [0.4, active ? 1.08 : 1])})`,
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
  const zoom = interpolate(frame, [0, GLOW_VOTE_START], [1.0, 1.18], {...clamp, easing: Easing.inOut(Easing.quad)});
  const shake = frame > 110 && frame < 170 ? Math.sin(frame * 1.7) * 4 : 0;
  return (
    <AbsoluteFill>
      <Room />
      <div style={{position: "absolute", left: 90, right: 90, top: 380, height: 1350, transform: `scale(${zoom}) translateX(${shake}px)`, transformOrigin: "50% 40%"}}>
        <Beto />
      </div>
      <Counters />
      <div style={{position: "absolute", top: 130, right: 60, fontFamily: BODY, fontWeight: 900, fontSize: 34, color: "#fff", background: "#000a", padding: "10px 20px", borderRadius: 40}}>
        DÍA 1 / 30
      </div>
    </AbsoluteFill>
  );
};

const Side: React.FC<{color: string; title: string; sub: string; item: Item; delay: number; side: "l" | "r"}> = ({color, title, sub, item, delay, side}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 13}});
  return (
    <div style={{position: "absolute", top: 0, bottom: 0, [side === "l" ? "left" : "right"]: 0, width: 540, background: color, overflow: "hidden"}}>
      <div style={{position: "absolute", top: 300, width: "100%", textAlign: "center", transform: `translateY(${(1 - s) * -200}px)`, opacity: s}}>
        <div style={{fontFamily: DISPLAY, fontSize: title.length > 6 ? 96 : 118, color: "#fff", WebkitTextStroke: STROKE(6), paintOrder: "stroke fill", textShadow: "0 8px 0 #000"}}>
          {title}
        </div>
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 30, color: "#fff", padding: "6px 40px", lineHeight: 1.2, textShadow: "0 3px 0 #000"}}>{sub}</div>
      </div>
      <div style={{position: "absolute", left: 40, right: 40, top: 640, height: 640, transform: `scale(${s})`, transformOrigin: "50% 100%"}}>
        <Beto item={item} t={side === "r" ? 20 : 0} />
      </div>
    </div>
  );
};

const Vote: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wipe = interpolate(frame, [0, 12], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  const header = spring({frame: frame - 6, fps, config: {damping: 9}});
  const btnIn = spring({frame: frame - 30, fps, config: {damping: 8}});
  const pulse = 1 + Math.max(0, Math.sin(frame / 5)) * 0.06;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 0 ${100 - wipe}% 0)`}}>
      <Side color={BLUE} title="DUCHA" sub="ADIÓS OLOR A 2019 + ADIÓS MOSCAS" item="shower" delay={8} side="l" />
      <Side color={GREEN} title="PELUQUERÍA" sub="RESCATAR LO QUE QUEDA DE PELO" item="scissors" delay={14} side="r" />
      <div style={{position: "absolute", left: 537, top: 0, bottom: 0, width: 6, background: "#fff"}} />
      <div
        style={{
          position: "absolute",
          top: 170,
          width: "100%",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 92,
          color: YELLOW,
          WebkitTextStroke: STROKE(6),
          paintOrder: "stroke fill",
          textShadow: "0 8px 0 #000",
          transform: `scale(${header})`,
        }}
      >
        COMENTA UNA PALABRA
      </div>
      <div style={{position: "absolute", top: 1560, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 22}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 110,
            color: "#111",
            background: YELLOW,
            padding: "6px 70px",
            borderRadius: 28,
            border: "7px solid #000",
            boxShadow: "0 12px 0 #000",
            transform: `scale(${btnIn * pulse})`,
          }}
        >
          VOTA YA
        </div>
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: "#fff", textShadow: "0 4px 0 #000", opacity: btnIn}}>
          Beto hará lo que elijas →
        </div>
      </div>
      <div style={{position: "absolute", bottom: 60, right: 50, fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#fffc"}}>@WoloByte</div>
    </AbsoluteFill>
  );
};

// ───────────────────────── Root ─────────────────────────

export const GlowUp: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <Intro />
      <Sequence from={GLOW_VOTE_START}>
        <Vote />
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={GLOW_VOTE_START + 30}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.7} />
      </Sequence>
      <Sequence from={5}>
        <Audio src={staticFile("sfx/hit.wav")} volume={0.5} />
      </Sequence>
      <CaptionLayer />
      {GLOW_VOICE && <Audio src={staticFile(GLOW_VOICE)} />}
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  // Intro: captions over the belly like the reference; vote scene: above the button.
  return <Captions words={GLOW_CAPTIONS} top={frame < GLOW_VOTE_START ? 1180 : 1400} />;
};
