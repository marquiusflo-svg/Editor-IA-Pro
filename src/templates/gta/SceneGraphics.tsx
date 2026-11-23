import React from "react";
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from "remotion";

/**
 * Animated illustrations that show what the narration describes when no official
 * screenshot exists for it. They are clearly drawn graphics (never fake gameplay),
 * carry an "ILUSTRACIÓN" tag, and every beat is driven by the voice: `cues` maps a
 * normalized spoken word to the frame (relative to the scene start) where it is said.
 */
export type SceneGraphic = "eggs" | "dexter" | "car" | "conspiracy" | "gps";
export type GraphicCues = Record<string, number>;

const PINK = "#ff2e9a";
const CYAN = "#2ef2ff";
const YELLOW = "#ffe500";
const ORANGE = "#ff8a1f";
const BODY = "'Montserrat', sans-serif";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const W = 900;
const H = 740;

/** Beat helpers bound to the voice cues. */
const useBeats = (cues: GraphicCues) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = (key: string, fallback: number) => cues[key] ?? fallback;
  const pop = (key: string, fallback: number, damping = 11) =>
    spring({frame: frame - at(key, fallback), fps, config: {damping, stiffness: 170}});
  const ramp = (key: string, fallback: number, len = 12) =>
    interpolate(frame, [at(key, fallback), at(key, fallback) + len], [0, 1], clamp);
  /** Short 0→1→0 flash right when the word is said. */
  const hit = (key: string, fallback: number, len = 10) =>
    interpolate(frame, [at(key, fallback), at(key, fallback) + 2, at(key, fallback) + len], [0, 1, 0], clamp);
  return {frame, fps, at, pop, ramp, hit};
};

const Card: React.FC<{children: React.ReactNode; accent: string; bg: string; shake?: number}> = ({children, accent, bg, shake = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 2, fps, config: {damping: 13, stiffness: 150}});
  const sx = shake * (random(`sx${frame}`) - 0.5) * 18;
  const sy = shake * (random(`sy${frame}`) - 0.5) * 18;
  return (
    <div
      style={{
        position: "absolute",
        top: 640,
        left: (1080 - W) / 2,
        width: W,
        height: H,
        borderRadius: 44,
        background: bg,
        border: `6px solid ${accent}`,
        boxShadow: `0 0 60px ${accent}aa, 14px 14px 0 #000`,
        overflow: "hidden",
        transform: `translate(${sx}px, ${sy}px) scale(${0.55 + 0.45 * pop}) translateY(${(1 - pop) * 90}px)`,
        opacity: pop,
      }}
    >
      {children}
      {/* Glass highlight */}
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, transparent 30%)", pointerEvents: "none"}} />
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 18,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.8)",
          background: "rgba(0,0,0,0.6)",
          padding: "4px 14px",
          borderRadius: 10,
        }}
      >
        ILUSTRACIÓN
      </div>
    </div>
  );
};

const Stamp: React.FC<{text: string; p: number; color: string; x: number; y: number; rot?: number; size?: number}> = ({text, p, color, x, y, rot = -8, size = 78}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${p})`,
      fontFamily: DISPLAY,
      fontSize: size,
      color,
      WebkitTextStroke: "8px #000",
      paintOrder: "stroke fill",
      textShadow: "6px 6px 0 #000",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

// ---------------------------------------------------------------- 1. Eggs
const Eggs: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const tower = pop("torre", 6, 14);
  const nest = pop("nido", 40);
  const paint = ramp("pintados", 90, 14);
  const throwT = interpolate(frame, [at("lanzar", 150), at("abajo", 180) + 2], [0, 1], clamp);
  const splat = pop("abajo", 180, 8);
  const zoom = interpolate(frame, [at("nido", 40), at("nido", 40) + 14], [1, 1.12], clamp) - 0.12 * ramp("lanzar", 150, 16);
  const colors = ["#ff8ad8", "#8af7ff", "#ffe36e", "#b28aff"];
  return (
    <Card accent={YELLOW} bg="linear-gradient(180deg, #2a0f4d 0%, #ff4f8b 70%, #ff9a3c 100%)" shake={hit("abajo", 180, 12)}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`}>
          {/* Sun + skyline */}
          <circle cx={680} cy={470} r={120} fill="#ffd36b" opacity={0.8} />
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={i * 100 - 20} y={520 - random(`b${i}`) * 140} width={90} height={300} fill="#1a0d33" opacity={0.85} />
          ))}
          {/* Tower rises on "torre" */}
          <g transform={`translate(0 ${(1 - tower) * 520})`}>
            <rect x={360} y={250} width={180} height={520} fill="#140b2e" stroke={CYAN} strokeWidth={4} />
            <rect x={385} y={225} width={130} height={30} fill="#140b2e" stroke={CYAN} strokeWidth={4} />
            {Array.from({length: 18}).map((_, i) => (
              <rect key={i} x={378 + (i % 3) * 55} y={280 + Math.floor(i / 3) * 70} width={34} height={42} fill={random(`w${i}`) > 0.35 ? "#ffd86b" : "#2a2060"} />
            ))}
            {/* Nest on "nido" */}
            <g transform={`translate(450 222) scale(${nest})`}>
              <ellipse cx={0} cy={6} rx={140} ry={40} fill="#5b3716" />
              {Array.from({length: 18}).map((_, i) => (
                <line key={i} x1={-140 + i * 16} y1={-6 + (i % 2) * 22} x2={-110 + i * 15} y2={26 - (i % 3) * 12} stroke={i % 2 ? "#a8743c" : "#7d5122"} strokeWidth={7} strokeLinecap="round" />
              ))}
              {/* Eggs on "huevos", one after another */}
              {colors.map((c, i) => {
                const s = spring({frame: frame - at("huevos", 70) - i * 5, fps: 30, config: {damping: 9}});
                const thrown = i === 3;
                const tx = thrown ? throwT * 300 : 0;
                const ty = thrown ? -Math.sin(throwT * Math.PI) * 160 + throwT * throwT * 420 : 0;
                if (thrown && splat > 0.05) return null;
                return (
                  <g key={i} transform={`translate(${-90 + i * 60 + tx} ${-30 + ty}) scale(${s}) rotate(${thrown ? throwT * 720 : (i - 1.5) * 6})`}>
                    <ellipse cx={0} cy={0} rx={28} ry={38} fill={c} stroke="#000" strokeWidth={4} />
                    <g opacity={paint}>
                      <path d="M -26 -8 L -13 -18 L 0 -8 L 13 -18 L 26 -8" stroke="#fff" strokeWidth={5} fill="none" />
                      <circle cx={-10} cy={12} r={5} fill="#fff" />
                      <circle cx={10} cy={12} r={5} fill="#fff" />
                      <path d="M -24 24 Q 0 34 24 24" stroke={PINK} strokeWidth={4} fill="none" />
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
          {/* Throw trail */}
          {throwT > 0 && throwT < 1
            ? Array.from({length: 6}).map((_, k) => {
                const tt = Math.max(0, throwT - k * 0.04);
                return <circle key={k} cx={540 + tt * 300} cy={192 - Math.sin(tt * Math.PI) * 160 + tt * tt * 420} r={8 - k} fill="#fff" opacity={0.5 - k * 0.07} />;
              })
            : null}
          {/* Pedestrian below */}
          <g transform={`translate(760 640) rotate(${splat * 8})`}>
            <circle cx={0} cy={-90} r={26} fill="#e9b48a" stroke="#000" strokeWidth={4} />
            <rect x={-28} y={-62} width={56} height={84} rx={12} fill="#3a6df0" stroke="#000" strokeWidth={4} />
            <g transform={`translate(0 -96) scale(${splat})`}>
              <path d="M -50 0 Q -40 -40 0 -30 Q 40 -50 52 -6 Q 70 20 30 26 Q 0 50 -30 26 Q -70 20 -50 0 Z" fill="#fff7c2" stroke="#000" strokeWidth={4} />
              <circle cx={4} cy={-2} r={18} fill="#ffb400" />
            </g>
          </g>
        </g>
      </svg>
      <Stamp text="¡PLAF!" p={splat} color={YELLOW} x={640} y={190} />
    </Card>
  );
};

// ---------------------------------------------------------------- 2. Dexter
const Dexter: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const lights = (frame - at("departamento", 10)) / 2;
  const sign = ramp("dexter", 40, 6);
  const flicker = sign < 1 ? (frame % 4 < 2 ? 0.3 : 1) : frame % 37 < 2 ? 0.5 : 1;
  const serie = pop("serie", 60);
  const kit = pop("kit", 90, 14);
  const boat = interpolate(frame, [at("barco", 150) - 4, at("barco", 150) + 40], [-260, 1100], clamp);
  return (
    <Card accent="#ff3b3b" bg="linear-gradient(180deg, #050816 0%, #0d1d3a 60%, #062b3a 100%)" shake={hit("asesino", 120, 8) * 0.5}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Building */}
        <rect x={150} y={185} width={600} height={400} fill="#12162a" stroke="#000" strokeWidth={6} />
        {Array.from({length: 24}).map((_, i) => {
          const on = lights > i;
          return <rect key={i} x={180 + (i % 6) * 95} y={215 + Math.floor(i / 6) * 62} width={60} height={40} fill={on ? (i === 9 ? "#ff5050" : "#ffd27a") : "#1f2540"} />;
        })}
        {/* Water + boat on "barco" */}
        <rect x={0} y={600} width={W} height={140} fill="#08506a" />
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M ${((i * 140 + frame * 3) % 1000) - 80} 640 q 20 -10 40 0`} stroke="#7fe8ff" strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        <g transform={`translate(${boat} 600)`}>
          <path d="M -120 0 L 120 0 L 90 40 L -100 40 Z" fill="#f2f2f2" stroke="#000" strokeWidth={5} />
          <rect x={-60} y={-38} width={90} height={38} fill="#dde6ee" stroke="#000" strokeWidth={4} />
          <line x1={10} y1={-38} x2={10} y2={-90} stroke="#000" strokeWidth={4} />
          <path d="M -130 30 q -40 6 -80 0" stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />
        </g>
      </svg>
      {/* Neon sign on "Dexter" */}
      <div style={{position: "absolute", top: 22, left: 0, right: 0, textAlign: "center", opacity: sign * flicker}}>
        <div style={{fontFamily: DISPLAY, fontSize: 96, color: "#fff", textShadow: `0 0 18px #ff2a2a, 0 0 46px #ff2a2a`, letterSpacing: 6}}>TRINITY</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, color: CYAN, letterSpacing: 12, textShadow: `0 0 16px ${CYAN}`}}>APARTMENTS</div>
      </div>
      {/* "La serie" tag */}
      <div style={{position: "absolute", top: 150, right: 24, transform: `rotate(8deg) scale(${serie})`, background: YELLOW, color: "#000", fontFamily: BODY, fontWeight: 800, fontSize: 30, padding: "8px 18px", borderRadius: 12, boxShadow: "5px 5px 0 #000"}}>
        📺 LA SERIE
      </div>
      {/* Kit case slides up on "kit", slides fill on "asesino" */}
      <div style={{position: "absolute", left: 140, top: 330 + (1 - kit) * 460, width: 620, height: 250}}>
        <div style={{position: "absolute", inset: 0, background: "#2b2b33", borderRadius: 26, border: "6px solid #000", boxShadow: "0 20px 40px rgba(0,0,0,0.6)"}} />
        <div style={{position: "absolute", left: 22, top: 22, right: 22, bottom: 22, background: "#16161c", borderRadius: 14}} />
        {Array.from({length: 6}).map((_, i) => {
          const s = spring({frame: frame - at("asesino", 120) - i * 4, fps: 30, config: {damping: 12}});
          return (
            <div key={i} style={{position: "absolute", left: 50 + i * 90, top: 40, width: 62, height: 180, transform: `translateY(${(1 - s) * -220}px)`, opacity: s, background: "rgba(220,240,255,0.88)", border: "3px solid #9cc", borderRadius: 6}}>
              <div style={{position: "absolute", left: 16, top: 70, width: 30, height: 30 + (i % 3) * 6, borderRadius: "50%", background: "#c40000"}} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- 3. Car
const Car: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const lock = pop("robar", 4);
  const lockOpen = ramp("robar", 4, 8);
  const enter = interpolate(frame, [at("mitsubishi", 22) - 6, at("mitsubishi", 22) + 12], [-900, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const settle = Math.sin(Math.max(0, frame - at("mitsubishi", 22) - 12) / 2.2) * Math.exp(-Math.max(0, frame - at("mitsubishi", 22) - 12) / 8) * 10;
  const vinyl = ramp("eclipse", 40, 14);
  const speed = ramp("rapido", 60, 6);
  const fire = ramp("furioso", 75, 4);
  const wheel = frame * (8 + speed * 30);
  const lockGone = ramp("mitsubishi", 22, 8);
  return (
    <Card accent="#39ff6a" bg="linear-gradient(180deg, #0a0420 0%, #3b0f5e 55%, #11111a 56%, #1b1b24 100%)" shake={hit("furioso", 75, 14) * 0.7}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Skyline + road */}
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={i * 95} y={250 - random(`s${i}`) * 140} width={80} height={170} fill="#170a33" />
        ))}
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={((i * 200 - frame * (6 + speed * 40)) % 1200 + 1200) % 1200 - 150} y={620} width={110} height={14} fill={YELLOW} opacity={0.8} />
        ))}
        {/* Speed lines on "rápido" */}
        {Array.from({length: 10}).map((_, i) => {
          const x = ((frame * 60 + i * 170) % 1100) - 150;
          return <line key={i} x1={x} y1={300 + i * 28} x2={x + 160} y2={300 + i * 28} stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinecap="round" opacity={speed} />;
        })}
        <g transform={`translate(${enter} ${settle})`}>
          {/* Nitro flames on "furioso" */}
          <g opacity={fire} transform={`translate(80 515) scale(${1 + 0.5 * Math.abs(Math.sin(frame / 2))} 1.4)`}>
            <path d="M 0 0 L -150 -24 L -90 0 L -170 26 Z" fill={ORANGE} />
            <path d="M 0 0 L -90 -12 L -60 0 L -100 14 Z" fill={YELLOW} />
            <path d="M 0 0 L -40 -6 L -40 6 Z" fill={CYAN} />
          </g>
          {/* Coupe body */}
          <path d="M 80 540 L 90 490 Q 170 470 250 440 Q 340 380 470 372 L 560 372 Q 640 380 700 440 L 800 456 Q 840 466 842 500 L 842 540 Z" fill="#39ff6a" stroke="#000" strokeWidth={8} />
          <path d="M 300 432 Q 380 388 470 384 L 560 384 Q 620 392 660 440 Z" fill="#0d1b2a" stroke="#000" strokeWidth={6} />
          <line x1={520} y1={384} x2={505} y2={440} stroke="#000" strokeWidth={6} />
          {/* Spoiler */}
          <path d="M 70 470 L 150 470 L 150 482 L 70 482 Z" fill="#111" />
          <line x1={110} y1={482} x2={120} y2={500} stroke="#111" strokeWidth={8} />
          {/* Vinyl graphics draw on "Eclipse" */}
          <path d="M 120 520 Q 260 450 420 512 T 820 480" stroke="#0b5d22" strokeWidth={16} fill="none" strokeDasharray={900} strokeDashoffset={900 * (1 - vinyl)} />
          <path d="M 140 500 Q 280 440 440 496 T 800 466" stroke="#fff" strokeWidth={6} fill="none" strokeDasharray={900} strokeDashoffset={900 * (1 - vinyl)} />
          <path d="M 780 470 L 830 474" stroke="#fff6a0" strokeWidth={10} />
          {[230, 690].map((cx) => (
            <g key={cx} transform={`translate(${cx} 545) rotate(${wheel})`}>
              <circle r={64} fill="#0c0c0c" stroke="#000" strokeWidth={6} />
              <circle r={40} fill="#d9d9d9" />
              {Array.from({length: 6}).map((_, k) => (
                <rect key={k} x={-5} y={-38} width={10} height={38} fill="#555" transform={`rotate(${k * 60})`} />
              ))}
            </g>
          ))}
        </g>
      </svg>
      {/* Padlock breaks on "robar" */}
      <div style={{position: "absolute", left: W / 2 - 70, top: 120, transform: `scale(${lock * (1 - lockGone)})`, width: 140, height: 160}}>
        <div style={{position: "absolute", left: 30, top: -lockOpen * 34, width: 80, height: 80, border: "16px solid #ddd", borderBottom: "none", borderRadius: "50px 50px 0 0", transform: `rotate(${lockOpen * -25}deg)`, transformOrigin: "left bottom"}} />
        <div style={{position: "absolute", left: 0, top: 70, width: 140, height: 100, background: YELLOW, border: "6px solid #000", borderRadius: 18}} />
      </div>
      <Stamp text="¡SE PUEDE ROBAR!" p={pop("eclipse", 40)} color="#fff" x={W / 2} y={110} rot={-4} size={70} />
      <Stamp text="¡NITRO!" p={pop("furioso", 75, 8)} color={ORANGE} x={700} y={250} rot={8} size={84} />
    </Card>
  );
};

// ---------------------------------------------------------------- 4. Conspiracy
const Conspiracy: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const garage = ramp("tablero", 20, 16);
  const strings = ramp("conspiracion", 40, 30);
  const person = pop("alguien", 70);
  const glitch = ramp("videojuego", 110, 4);
  const g = glitch > 0 ? (frame % 6 < 3 ? 1 : 0) : 0;
  const notes = [
    {x: 60, y: 60, t: "¿ESTO ES\nUN JUEGO?", r: -6},
    {x: 560, y: 50, t: "¿QUIÉN ME\nCONTROLA?", r: 5},
    {x: 320, y: 250, t: "NPC\n#4821", r: -3},
    {x: 60, y: 450, t: "GUARDAR\nPARTIDA", r: 4},
    {x: 580, y: 440, t: "MISIÓN\nFALLIDA", r: -5},
  ];
  const pins = notes.map((n) => ({x: n.x + 120, y: n.y + 18}));
  const links: [number, number][] = [[0, 2], [1, 2], [2, 3], [2, 4], [0, 1], [3, 4]];
  return (
    <Card accent="#ff3b3b" bg="#1a1410" shake={hit("videojuego", 110, 14) * 0.6}>
      <div style={{position: "absolute", inset: 0, transform: `translateX(${g * 8}px)`}}>
        {/* Corkboard */}
        <div style={{position: "absolute", inset: 0, background: "#a8743f", backgroundImage: "radial-gradient(rgba(0,0,0,0.2) 2px, transparent 2px)", backgroundSize: "18px 18px"}} />
        {notes.map((n, i) => {
          const s = spring({frame: frame - at("conspiracion", 40) - i * 5, fps: 30, config: {damping: 11}});
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: n.x,
                top: n.y,
                width: 240,
                height: 150,
                background: i % 2 ? "#fff59a" : "#f4f1e6",
                boxShadow: "6px 6px 0 rgba(0,0,0,0.4)",
                transform: `rotate(${n.r}deg) scale(${s})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                whiteSpace: "pre-line",
                fontFamily: BODY,
                fontWeight: 800,
                fontSize: 34,
                lineHeight: 1.05,
                color: "#1a1a1a",
              }}
            >
              {n.t}
            </div>
          );
        })}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: "absolute", top: 0, left: 0}}>
          {links.map(([a, b], i) => {
            const p = Math.max(0, Math.min(1, strings * links.length - i));
            const A = pins[a];
            const B = pins[b];
            return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * p} y2={A.y + (B.y - A.y) * p} stroke="#d40000" strokeWidth={6} />;
          })}
          {pins.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={12} fill="#e01010" stroke="#000" strokeWidth={3} opacity={strings > 0 ? 1 : 0} />
          ))}
        </svg>
        {/* Hooded figure on "alguien" */}
        <svg width={260} height={320} viewBox="0 0 260 320" style={{position: "absolute", left: 330, bottom: -20, transform: `translateY(${(1 - person) * 320}px)`}}>
          <path d="M 30 320 Q 30 200 130 190 Q 230 200 230 320 Z" fill="#141414" />
          <path d="M 70 150 Q 70 50 130 50 Q 190 50 190 150 Q 190 210 130 210 Q 70 210 70 150 Z" fill="#141414" />
          <ellipse cx={130} cy={150} rx={42} ry={50} fill="#2a2a2a" />
          <circle cx={113} cy={148} r={6} fill="#fff" />
          <circle cx={147} cy={148} r={6} fill="#fff" />
        </svg>
        <Stamp text="?" p={pop("cree", 85, 8)} color={YELLOW} x={620} y={560} rot={12} size={140} />
      </div>
      {/* Game HUD glitch on "videojuego" */}
      <div style={{position: "absolute", inset: 0, opacity: glitch, pointerEvents: "none"}}>
        <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 6px)"}} />
        <div style={{position: "absolute", inset: 0, mixBlendMode: "screen", background: `rgba(255,0,80,${0.18 * g})`, transform: "translateX(-10px)"}} />
        <div style={{position: "absolute", left: 30, top: 24, width: 260, height: 30, border: "4px solid #fff", background: "#000"}}>
          <div style={{width: "62%", height: "100%", background: "#39ff6a"}} />
        </div>
        <div style={{position: "absolute", right: 30, top: 20, fontFamily: DISPLAY, fontSize: 44, color: "#fff", textShadow: "4px 4px 0 #000"}}>$ 1,000</div>
        <div style={{position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: DISPLAY, fontSize: 96, color: YELLOW, WebkitTextStroke: "8px #000", paintOrder: "stroke fill", opacity: frame % 20 < 14 ? 1 : 0.2}}>
          PRESS START
        </div>
      </div>
      {/* Garage door rolls up on "tablero" */}
      <div style={{position: "absolute", left: 0, right: 0, top: 0, height: H * (1 - garage), background: "repeating-linear-gradient(180deg, #8a8f99 0 34px, #6c717b 34px 40px)", borderBottom: "8px solid #222"}}>
        <div style={{position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 40, color: "#222", opacity: garage < 0.3 ? 1 : 0}}>🏠 GARAJE</div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- 5. GPS
const Gps: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const fans = pop("fans", 4);
  const dash = pop("barco", 40, 14);
  const michael = pop("michael", 60);
  const screenOn = ramp("gps", 140, 8);
  const map = ramp("mapa", 170, 18);
  const label = pop("santos", 200);
  const blink = Math.floor(frame / 10) % 2 === 0 ? 1 : 0.4;
  const pulse = ((frame % 30) / 30);
  return (
    <Card accent={CYAN} bg="linear-gradient(180deg, #0a2a4a 0%, #06121f 100%)">
      {/* Comment bubbles on "fans" */}
      {[
        {t: "¡ES EL DE MICHAEL! 🤯", x: 40, y: 34, r: -4},
        {t: "No puede ser 😳", x: 500, y: 90, r: 4},
      ].map((b, i) => {
        const s = spring({frame: frame - at("fans", 4) - i * 6, fps: 30, config: {damping: 10}});
        return (
          <div key={i} style={{position: "absolute", left: b.x, top: b.y, transform: `rotate(${b.r}deg) scale(${s * fans})`, background: "#fff", color: "#000", fontFamily: BODY, fontWeight: 800, fontSize: 32, padding: "12px 22px", borderRadius: 26, boxShadow: "5px 5px 0 #000", opacity: 1 - screenOn * 0.6}}>
            {b.t}
          </div>
        );
      })}
      {/* Boat dashboard on "barco" */}
      <div style={{position: "absolute", left: 40, right: 40, bottom: 0, height: 560, transform: `translateY(${(1 - dash) * 600}px)`}}>
        <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg, #e9edf2, #b7c0cc)", borderRadius: "40px 40px 0 0", border: "6px solid #000"}} />
        {/* GPS screen */}
        <div style={{position: "absolute", left: 60, top: 40, width: 700, height: 400, background: "#020c12", border: "10px solid #111", borderRadius: 22, overflow: "hidden"}}>
          <div style={{position: "absolute", inset: 0, opacity: screenOn}}>
            <div style={{position: "absolute", inset: 0, background: "#06303b"}} />
            <svg width={680} height={380} viewBox="0 0 680 380" style={{position: "absolute", left: 0, top: 0}}>
              {Array.from({length: 8}).map((_, i) => (
                <line key={i} x1={0} y1={i * 50} x2={680} y2={i * 50} stroke="rgba(46,242,255,0.15)" strokeWidth={2} />
              ))}
              <path
                d="M 230 360 Q 180 290 230 230 Q 210 160 290 120 Q 310 50 400 30 Q 490 20 520 90 Q 580 130 550 210 Q 590 280 530 340 Q 490 380 410 380 Z"
                fill={`rgba(46,160,90,${map})`}
                stroke={CYAN}
                strokeWidth={5}
                strokeDasharray={1500}
                strokeDashoffset={1500 * (1 - map)}
              />
              <circle cx={130} cy={300} r={10 + pulse * 30} fill="none" stroke={YELLOW} strokeWidth={4} opacity={1 - pulse} />
              <path d="M 130 285 L 142 312 L 130 305 L 118 312 Z" fill={YELLOW} stroke="#000" strokeWidth={2} />
            </svg>
            <div style={{position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 26, color: CYAN, letterSpacing: 6}}>GPS · NAVEGACIÓN</div>
            <div style={{position: "absolute", left: 250, top: 170, transform: `scale(${label})`, fontFamily: DISPLAY, fontSize: 64, color: "#fff", opacity: blink, textShadow: "4px 4px 0 #000"}}>
              LOS SANTOS
            </div>
          </div>
          {/* Power-on scanline */}
          <div style={{position: "absolute", left: 0, right: 0, top: `${screenOn * 100}%`, height: 6, background: CYAN, opacity: screenOn > 0 && screenOn < 1 ? 1 : 0, boxShadow: `0 0 20px ${CYAN}`}} />
        </div>
        {/* Steering wheel */}
        <svg width={260} height={160} viewBox="0 0 260 160" style={{position: "absolute", left: 280, bottom: -40}}>
          <circle cx={130} cy={130} r={110} fill="none" stroke="#222" strokeWidth={22} />
          <line x1={130} y1={130} x2={130} y2={20} stroke="#222" strokeWidth={14} />
        </svg>
      </div>
      {/* "¿Michael?" tag */}
      <div style={{position: "absolute", right: 30, top: 200 - screenOn * 150, transform: `rotate(7deg) scale(${michael})`, background: PINK, color: "#fff", fontFamily: DISPLAY, fontSize: 50, padding: "6px 24px", borderRadius: 14, border: "5px solid #000", boxShadow: "6px 6px 0 #000"}}>
        ¿MICHAEL?
      </div>
    </Card>
  );
};

export const SceneGraphicView: React.FC<{graphic: SceneGraphic; cues?: GraphicCues}> = ({graphic, cues = {}}) => {
  switch (graphic) {
    case "eggs":
      return <Eggs cues={cues} />;
    case "dexter":
      return <Dexter cues={cues} />;
    case "car":
      return <Car cues={cues} />;
    case "conspiracy":
      return <Conspiracy cues={cues} />;
    case "gps":
      return <Gps cues={cues} />;
    default:
      return null;
  }
};
