import React from "react";
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from "remotion";

/**
 * Animated illustrations that show what the narration describes when no official
 * screenshot exists for it. They are clearly drawn graphics (never fake gameplay),
 * carry an "ILUSTRACIÓN" tag, and every beat is driven by the voice: `cues` maps a
 * normalized spoken word to the frame (relative to the scene start) where it is said.
 */
export type SceneGraphic = "eggs" | "dexter" | "car" | "conspiracy" | "gps" | "bank" | "revolver" | "tasks" | "clothes" | "motel" | "portal" | "block" | "bigfoot" | "clown" | "hat" | "save" | "race" | "magazines" | "phone" | "savings" | "moses" | "tracker" | "criminals" | "derby" | "hunt";
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

// ---------------------------------------------------------------- Bank balance resets to zero
const Bank: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const app = spring({frame: frame - Math.min(at("saldo", 8), 6), fps: 30, config: {damping: 11}});
  const drop = ramp("cero", 40, 16);
  const balance = Math.round(48250 * (1 - drop));
  const save = ramp("ahorros", 90, 22);
  const spend = pop("gastalo", 120, 9);
  return (
    <Card accent="#39ff6a" bg="linear-gradient(180deg, #071a12 0%, #0c2f22 100%)" shake={hit("cero", 40, 12) * 0.6}>
      {/* Phone bank app */}
      <div style={{position: "absolute", left: 60, top: 60, width: 420, height: 600, transform: `scale(${app})`, transformOrigin: "center", background: "#111", borderRadius: 50, border: "8px solid #000", boxShadow: "10px 10px 0 #000"}}>
        <div style={{position: "absolute", inset: 18, borderRadius: 34, background: "linear-gradient(180deg, #1d1d2b, #0e0e16)", overflow: "hidden"}}>
          <div style={{padding: "36px 28px 0", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#9fb"}}>🏦 BANCO</div>
          <div style={{padding: "10px 28px", fontFamily: BODY, fontWeight: 700, fontSize: 24, color: "#aaa"}}>Saldo disponible</div>
          <div style={{padding: "0 28px", fontFamily: DISPLAY, fontSize: 92, color: drop > 0.95 ? "#ff3b3b" : "#fff"}}>${balance.toLocaleString("en-US")}</div>
          <div style={{margin: "30px 28px", padding: "18px 20px", borderRadius: 18, background: "#1f3a2c", fontFamily: BODY, fontWeight: 800, fontSize: 26, color: "#8ff7b0", opacity: save}}>
            🐷 Ahorros familiares
            <div style={{fontFamily: DISPLAY, fontSize: 56, color: "#fff"}}>${Math.round(48250 * save).toLocaleString("en-US")}</div>
          </div>
        </div>
      </div>
      {/* Reset stamp */}
      <Stamp text="SE REINICIA A $0" p={pop("cero", 40, 8)} color="#ff3b3b" x={600} y={140} rot={10} size={58} />
      {/* Money flying to savings */}
      {Array.from({length: 6}).map((_, i) => {
        const t = Math.max(0, Math.min(1, save * 1.4 - i * 0.08));
        return (
          <div key={i} style={{position: "absolute", left: 200 + i * 20, top: 300 + t * 160 - Math.sin(t * Math.PI) * 60, fontSize: 54, opacity: t > 0 && t < 1 ? 1 : 0}}>💵</div>
        );
      })}
      {/* Spend it */}
      <div style={{position: "absolute", left: 560, top: 360, transform: `scale(${spend}) rotate(-6deg)`, textAlign: "center"}}>
        <div style={{fontSize: 150}}>🛒</div>
        <div style={{fontFamily: DISPLAY, fontSize: 56, color: YELLOW, WebkitTextStroke: "6px #000", paintOrder: "stroke fill"}}>¡O GÁSTALO!</div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- Car trunk with unique revolver
const Revolver: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const car = spring({frame: frame - Math.min(at("coche", 20), 6), fps: 30, config: {damping: 14}});
  const lid = ramp("atras", 30, 14);
  const gun = pop("revolver", 70, 9);
  const shine = interpolate((frame - at("personalizado", 85)) % 40, [0, 20], [-200, 400], clamp);
  return (
    <Card accent={YELLOW} bg="linear-gradient(180deg, #1a0b05 0%, #3d1d0b 100%)" shake={hit("ahi", 110, 10) * 0.5}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(0 ${(1 - car) * 500})`}>
          {/* Car rear */}
          <path d="M 120 640 L 120 380 Q 130 300 220 290 L 680 290 Q 770 300 780 380 L 780 640 Z" fill="#7a1f1f" stroke="#000" strokeWidth={8} />
          <rect x={150} y={540} width={140} height={44} rx={8} fill="#ff4040" stroke="#000" strokeWidth={5} />
          <rect x={610} y={540} width={140} height={44} rx={8} fill="#ff4040" stroke="#000" strokeWidth={5} />
          <rect x={390} y={560} width={120} height={40} fill="#f2f2f2" stroke="#000" strokeWidth={4} />
          {/* Trunk cavity */}
          <rect x={170} y={320} width={560} height={200} rx={14} fill="#140a05" />
          {/* Revolver rises */}
          <g transform={`translate(450 ${470 - gun * 70}) scale(${gun}) rotate(-12)`}>
            <path d="M -170 -20 L 60 -20 L 60 -48 L 110 -48 L 110 10 L 40 10 Q 30 70 -10 90 L -60 90 Q -40 40 -50 10 L -170 10 Z" fill="#d9c07a" stroke="#000" strokeWidth={7} />
            <circle cx={20} cy={-6} r={30} fill="#b8963d" stroke="#000" strokeWidth={6} />
            <path d="M -40 30 Q -20 60 -30 82" stroke="#6b3a1a" strokeWidth={22} />
          </g>
          {/* Trunk lid opens on "atrás" */}
          <g transform={`translate(450 320) scale(1 ${1 - lid * 1.6})`}>
            <rect x={-290} y={0} width={580} height={210} rx={16} fill="#8c2525" stroke="#000" strokeWidth={8} />
          </g>
        </g>
        {/* Shine sweep */}
        <rect x={shine} y={250} width={60} height={300} fill="rgba(255,255,255,0.25)" transform="skewX(-20)" opacity={gun} />
      </svg>
      <Stamp text="¡SOLO AQUÍ!" p={pop("ahi", 110, 8)} color={YELLOW} x={W / 2} y={120} rot={-6} />
      <div style={{position: "absolute", left: 40, top: 40, transform: `scale(${pop("donnie", 50)})`, background: PINK, color: "#fff", fontFamily: DISPLAY, fontSize: 44, padding: "4px 20px", borderRadius: 12, border: "5px solid #000"}}>COCHE DE DONNIE</div>
    </Card>
  );
};

// ---------------------------------------------------------------- Shirley's requests vanish
const Tasks: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const card = spring({frame: frame - Math.min(at("encargos", 6), 6), fps: 30, config: {damping: 11}});
  const name = pop("shirley", 22);
  const vanish = ramp("desaparecen", 70, 14);
  const items = ["Encargo #1 de Shirley", "Encargo #2 de Shirley"];
  return (
    <Card accent={PINK} bg="linear-gradient(180deg, #2a0a2a 0%, #13041a 100%)">
      <div style={{position: "absolute", left: 90, top: 60, width: 720, height: 560, background: "#fdf7e3", borderRadius: 18, boxShadow: "10px 10px 0 #000", transform: `rotate(-2deg) scale(${card})`, padding: 40, boxSizing: "border-box"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 64, color: "#222", transform: `scale(${name})`, transformOrigin: "left"}}>📋 ENCARGOS · SHIRLEY</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, color: "#a33", marginTop: 6}}>Solo en el Capítulo 1</div>
        {items.map((t, i) => {
          const s = spring({frame: frame - at("encargos", 6) - 8 - i * 6, fps: 30, config: {damping: 12}});
          const v = Math.max(0, Math.min(1, vanish * 1.5 - i * 0.3));
          return (
            <div key={i} style={{position: "relative", marginTop: 40, fontFamily: BODY, fontWeight: 800, fontSize: 44, color: "#222", opacity: s * (1 - v * 0.85), filter: `blur(${v * 6}px)`, transform: `translateX(${v * 80}px)`}}>
              ⬜ {t}
            </div>
          );
        })}
      </div>
      <Stamp text="DESAPARECEN" p={pop("desaparecen", 70, 8)} color="#ff3b3b" x={W / 2} y={520} rot={-10} size={92} />
    </Card>
  );
};

// ---------------------------------------------------------------- Unique clothes locked forever
const Clothes: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {pop, hit} = useBeats(cues);
  const items = [
    {e: "📿", t: "Collar de Lucía", k: "collar", f: 10},
    {e: "🕶️", t: "Gafas de Donnie", k: "gafas", f: 40},
    {e: "👕", t: "Outfit Rusty Anchor", k: "outfit", f: 70},
  ];
  const lock = pop("vuelven", 110, 8);
  return (
    <Card accent={CYAN} bg="linear-gradient(180deg, #071c2c 0%, #04101b 100%)" shake={hit("vuelven", 110, 10) * 0.5}>
      {items.map((it, i) => {
        const s = pop(it.k, it.f, 10);
        return (
          <div key={i} style={{position: "absolute", left: 40 + i * 280, top: 140, width: 260, height: 360, transform: `scale(${s}) rotate(${(i - 1) * 4}deg)`, background: "#12324a", border: `5px solid ${CYAN}`, borderRadius: 26, boxShadow: "8px 8px 0 #000", textAlign: "center"}}>
            <div style={{fontSize: 150, marginTop: 40, filter: lock > 0.5 ? "grayscale(1) brightness(0.6)" : "none"}}>{it.e}</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, color: "#fff", padding: "10px 12px"}}>{it.t}</div>
            <div style={{position: "absolute", left: 0, right: 0, top: 90, fontSize: 120, transform: `scale(${lock})`}}>🔒</div>
          </div>
        );
      })}
      <Stamp text="NO VUELVEN" p={lock} color="#ff3b3b" x={W / 2} y={600} rot={-6} size={96} />
    </Card>
  );
};

// ---------------------------------------------------------------- Motel: collectibles + growing debt
const Motel: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const mags = pop("coleccionables", 40);
  const bill = spring({frame: frame - Math.min(at("motel", 4), 6), fps: 30, config: {damping: 11}});
  const linda = pop("linda", 90);
  const grow = ramp("tardes", 110, 40);
  const debt = Math.round(300 + grow * 900);
  return (
    <Card accent={PINK} bg="linear-gradient(180deg, #1b0b26 0%, #0b0612 100%)">
      {/* Collectible magazines */}
      {["📰", "📕", "📗"].map((e, i) => {
        const s = spring({frame: frame - at("coleccionables", 40) - i * 5, fps: 30, config: {damping: 10}});
        return (
          <div key={i} style={{position: "absolute", left: 60 + i * 120, top: 80 + (i % 2) * 40, fontSize: 130, transform: `scale(${s * mags}) rotate(${(i - 1) * 12}deg)`}}>{e}</div>
        );
      })}
      <div style={{position: "absolute", left: 60, top: 300, transform: `scale(${mags})`, transformOrigin: "left", fontFamily: DISPLAY, fontSize: 56, color: YELLOW, WebkitTextStroke: "6px #000", paintOrder: "stroke fill"}}>¡RECÓGELOS!</div>
      {/* Bill */}
      <div style={{position: "absolute", right: 60, top: 70, width: 380, height: 560, background: "#fffdf4", borderRadius: 10, boxShadow: "10px 10px 0 #000", transform: `rotate(4deg) translateY(${(1 - bill) * 700}px)`, padding: 30, boxSizing: "border-box", fontFamily: BODY, color: "#222"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 46, textAlign: "center"}}>STARLET MOTEL</div>
        <div style={{borderTop: "4px dashed #999", margin: "16px 0"}} />
        <div style={{fontWeight: 800, fontSize: 30}}>Deuda pendiente</div>
        <div style={{fontFamily: DISPLAY, fontSize: 110, color: grow > 0 ? "#d40000" : "#222"}}>${debt}</div>
        <div style={{fontWeight: 700, fontSize: 24, color: "#666", opacity: grow}}>+ recargo por tardar ⬆</div>
        <div style={{position: "absolute", left: 30, bottom: 30, transform: `scale(${linda})`, transformOrigin: "left", background: PINK, color: "#fff", fontFamily: BODY, fontWeight: 800, fontSize: 28, padding: "6px 16px", borderRadius: 10}}>
          Cobra: Linda
        </div>
      </div>
      <Stamp text="¡PÁGALA YA!" p={pop("cara", 140, 8)} color="#ff3b3b" x={260} y={560} rot={-8} size={80} />
    </Card>
  );
};

// ---------------------------------------------------------------- Radio tower time portal to 2002
const Portal: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const tower = spring({frame: frame - Math.min(at("torre", 10), 6), fps: 30, config: {damping: 14}});
  const waves = ramp("radio", 30, 10);
  const warp = ramp("viajas", 70, 20);
  const year = Math.round(interpolate(warp, [0, 1], [2026, 2002]));
  const shirt = pop("camisa", 140, 9);
  const bike = pop("moto", 160, 9);
  return (
    <Card accent={PINK} bg={warp > 0.5 ? "linear-gradient(180deg, #ff4fd8 0%, #3dd6ff 100%)" : "linear-gradient(180deg, #0b1030 0%, #1d0b3a 100%)"} shake={hit("viajas", 70, 16) * 0.6}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Time vortex */}
        {Array.from({length: 8}).map((_, i) => (
          <circle key={i} cx={W / 2} cy={330} r={(40 + i * 60 + frame * 6) % 520} fill="none" stroke={i % 2 ? CYAN : YELLOW} strokeWidth={8} opacity={warp * 0.7} />
        ))}
        {/* Radio tower */}
        <g transform={`translate(${W / 2} ${720 - tower * 560})`} opacity={1 - warp * 0.7}>
          <path d="M -60 560 L 0 0 L 60 560" stroke="#ddd" strokeWidth={10} fill="none" />
          {Array.from({length: 8}).map((_, i) => (
            <line key={i} x1={-56 + i * 7} y1={520 - i * 64} x2={56 - i * 7} y2={460 - i * 64} stroke="#bbb" strokeWidth={5} />
          ))}
          <circle cx={0} cy={0} r={14} fill="#ff3b3b" opacity={frame % 20 < 10 ? 1 : 0.3} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${-50 - k * 40} ${-20 - k * 30} Q 0 ${-90 - k * 45} ${50 + k * 40} ${-20 - k * 30}`} stroke={CYAN} strokeWidth={6} fill="none" opacity={waves * (((frame / 6 + k) % 3) / 3)} />
          ))}
        </g>
      </svg>
      <div style={{position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: DISPLAY, fontSize: 170, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", opacity: warp, transform: `scale(${0.6 + 0.4 * warp})`}}>
        {year}
      </div>
      {/* Tommy's shirt and bike */}
      <div style={{position: "absolute", left: 60, bottom: 70, transform: `scale(${shirt}) rotate(-8deg)`, textAlign: "center"}}>
        <div style={{width: 230, height: 230, borderRadius: 30, background: "repeating-linear-gradient(45deg, #2fb5ff 0 26px, #1b7fd6 26px 52px)", border: "6px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120}}>🌺</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#fff", textShadow: "3px 3px 0 #000", marginTop: 8}}>CAMISA DE TOMMY</div>
      </div>
      <div style={{position: "absolute", right: 60, bottom: 80, transform: `scale(${bike}) rotate(6deg)`, textAlign: "center"}}>
        <div style={{fontSize: 210}}>🏍️</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#fff", textShadow: "3px 3px 0 #000"}}>SU MOTO</div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- Retro block with two caps
const Block: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const forest = spring({frame: frame - Math.min(at("bosque", 10), 6), fps: 30, config: {damping: 13}});
  const block = pop("bloque", 40, 9);
  const broken = ramp("romperlo", 70, 10);
  const notes = ramp("melodia", 90, 40);
  const caps = pop("gorras", 130, 9);
  return (
    <Card accent={YELLOW} bg="linear-gradient(180deg, #5ec8ff 0%, #2a7f3a 100%)" shake={hit("romperlo", 70, 10) * 0.5}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({length: 7}).map((_, i) => (
          <g key={i} transform={`translate(${40 + i * 135} ${740 - forest * 360})`}>
            <rect x={-12} y={120} width={24} height={240} fill="#5b3a1a" />
            <path d="M 0 -40 L 80 140 L -80 140 Z" fill="#1f6b2c" stroke="#0d3d17" strokeWidth={5} />
          </g>
        ))}
        {/* Block */}
        <g transform={`translate(${W / 2} 270) scale(${block * (1 - broken)})`}>
          <rect x={-90} y={-90} width={180} height={180} rx={16} fill="#f2a516" stroke="#000" strokeWidth={8} />
          <text x={0} y={46} textAnchor="middle" fontFamily={DISPLAY} fontSize={140} fill="#fff" stroke="#000" strokeWidth={6}>?</text>
        </g>
        {/* Shards */}
        {broken > 0 && broken < 1
          ? Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <rect key={i} x={W / 2 + Math.cos(a) * broken * 220 - 20} y={270 + Math.sin(a) * broken * 220 - 20} width={40} height={40} fill="#f2a516" stroke="#000" strokeWidth={4} opacity={1 - broken} />;
            })
          : null}
        {/* Music notes */}
        {Array.from({length: 6}).map((_, i) => {
          const t = Math.max(0, Math.min(1, notes * 1.6 - i * 0.12));
          return (
            <text key={i} x={W / 2 - 200 + i * 80} y={260 - t * 180} fontSize={64} fill="#fff" stroke="#000" strokeWidth={3} opacity={t > 0 && t < 1 ? 1 - t * 0.5 : 0}>
              {i % 2 ? "♪" : "♫"}
            </text>
          );
        })}
      </svg>
      {/* Two caps: red and green */}
      {[{c: "#e3262b", l: "ROJA"}, {c: "#2fae45", l: "VERDE"}].map((cap, i) => {
        const s = spring({frame: frame - at("gorras", 130) - i * 6, fps: 30, config: {damping: 9}});
        return (
          <div key={i} style={{position: "absolute", left: 200 + i * 300, top: 240, transform: `scale(${s * caps}) rotate(${i ? 8 : -8}deg)`, textAlign: "center"}}>
            <svg width={220} height={160} viewBox="0 0 220 160">
              <path d="M 20 110 Q 20 20 110 20 Q 200 20 200 110 Z" fill={cap.c} stroke="#000" strokeWidth={8} />
              <path d="M 110 110 L 215 110 Q 215 140 160 140 L 110 140 Z" fill={cap.c} stroke="#000" strokeWidth={8} />
              <circle cx={100} cy={70} r={28} fill="#fff" stroke="#000" strokeWidth={5} />
            </svg>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, color: "#fff", textShadow: "3px 3px 0 #000"}}>GORRA {cap.l}</div>
          </div>
        );
      })}
    </Card>
  );
};

// ---------------------------------------------------------------- Bigfoot in the swamp, caught on camera
const Bigfoot: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, pop, ramp, hit} = useBeats(cues);
  const walk = ramp("pie", 4, 70);
  const swamp = ramp("pantano", 40, 10);
  const flash = hit("mision", 80, 8);
  const step = Math.sin(frame / 4) * 8;
  return (
    <Card accent="#9cff6a" bg="linear-gradient(180deg, #0c1a10 0%, #1d3320 100%)">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Swamp water + fog */}
        <rect x={0} y={520} width={W} height={220} fill="#17331f" />
        {Array.from({length: 5}).map((_, i) => (
          <ellipse key={i} cx={((i * 220 + frame * 2) % 1100) - 100} cy={480 + (i % 2) * 40} rx={220} ry={40} fill="rgba(200,255,200,0.12)" opacity={0.4 + swamp * 0.6} />
        ))}
        {/* Cypress trees */}
        {[80, 260, 700, 830].map((x, i) => (
          <g key={i}>
            <rect x={x - 14} y={180} width={28} height={360} fill="#0d1a10" />
            <ellipse cx={x} cy={180} rx={90} ry={60} fill="#0f2414" />
          </g>
        ))}
        {/* Bigfoot silhouette walking across */}
        <g transform={`translate(${120 + walk * 560} ${300 + step})`}>
          <ellipse cx={0} cy={0} rx={70} ry={110} fill="#2a1a10" />
          <circle cx={0} cy={-120} r={46} fill="#2a1a10" />
          <rect x={-90} y={-40} width={30} height={150} rx={15} fill="#2a1a10" transform={`rotate(${step * 2} -75 -40)`} />
          <rect x={60} y={-40} width={30} height={150} rx={15} fill="#2a1a10" transform={`rotate(${-step * 2} 75 -40)`} />
          <rect x={-50} y={90} width={36} height={150} rx={16} fill="#2a1a10" transform={`rotate(${-step} -32 90)`} />
          <rect x={14} y={90} width={36} height={150} rx={16} fill="#2a1a10" transform={`rotate(${step} 32 90)`} />
          <circle cx={-14} cy={-126} r={6} fill="#ffdd55" />
          <circle cx={14} cy={-126} r={6} fill="#ffdd55" />
        </g>
        {/* Footprints */}
        {Array.from({length: 6}).map((_, i) => (
          <ellipse key={i} cx={140 + i * 100} cy={640 + (i % 2) * 24} rx={26} ry={12} fill="#0a140c" opacity={walk * 6 > i ? 0.9 : 0} />
        ))}
      </svg>
      {/* Camera viewfinder */}
      <div style={{position: "absolute", inset: 24, border: "4px solid rgba(255,255,255,0.7)", borderRadius: 20, pointerEvents: "none"}} />
      <div style={{position: "absolute", left: 50, top: 44, fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#ff3b3b"}}>● REC</div>
      <div style={{position: "absolute", inset: 0, background: "#fff", opacity: flash}} />
      <Stamp text="¡PIE GRANDE!" p={pop("grande", 12, 8)} color={YELLOW} x={W / 2} y={110} rot={-5} size={80} />
    </Card>
  );
};

// ---------------------------------------------------------------- Elevator full of balloons, killer clown
const Clown: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const elev = spring({frame: frame - Math.min(at("elevador", 20), 6), fps: 30, config: {damping: 13}});
  const balloons = ramp("globos", 50, 14);
  const open = ramp("abrirse", 80, 12);
  const clown = pop("payaso", 110, 7);
  const colors = ["#ff3b3b", YELLOW, CYAN, PINK, "#39ff6a", ORANGE];
  return (
    <Card accent="#ff3b3b" bg="linear-gradient(180deg, #120808 0%, #2a0d0d 100%)" shake={hit("payaso", 110, 16)}>
      <div style={{position: "absolute", left: 200, top: 60, width: 500, height: 620, transform: `scale(${elev})`, background: "#1a1a1a", border: "10px solid #888", borderRadius: 10, overflow: "hidden"}}>
        {/* Inside: balloons + clown */}
        <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #5a1010, #120404)"}} />
        {colors.map((c, i) => (
          <div key={i} style={{position: "absolute", left: 30 + (i % 3) * 140, top: 40 + Math.floor(i / 3) * 140 + Math.sin(frame / 10 + i) * 10, width: 110, height: 130, borderRadius: "50%", background: c, border: "4px solid #000", transform: `scale(${balloons})`}} />
        ))}
        <svg width={480} height={600} viewBox="0 0 480 600" style={{position: "absolute", left: 0, top: 0, transform: `scale(${0.4 + clown * 0.8})`, transformOrigin: "50% 60%", opacity: clown}}>
          <circle cx={240} cy={330} r={150} fill="#f4f1ea" stroke="#000" strokeWidth={8} />
          <circle cx={120} cy={230} r={60} fill="#ff3b3b" />
          <circle cx={360} cy={230} r={60} fill="#ff3b3b" />
          <ellipse cx={190} cy={300} rx={28} ry={36} fill="#000" />
          <ellipse cx={290} cy={300} rx={28} ry={36} fill="#000" />
          <circle cx={240} cy={360} r={28} fill="#e01010" />
          <path d="M 150 410 Q 240 480 330 410" stroke="#c40000" strokeWidth={18} fill="none" />
          {Array.from({length: 6}).map((_, i) => (
            <path key={i} d={`M ${165 + i * 30} 418 l 12 22 l 12 -22`} fill="#fff" stroke="#000" strokeWidth={2} />
          ))}
        </svg>
        {/* Doors */}
        <div style={{position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", background: "linear-gradient(90deg, #9aa1ab, #c9ced6)", borderRight: "3px solid #555", transform: `translateX(${-open * 100}%)`}} />
        <div style={{position: "absolute", top: 0, bottom: 0, right: 0, width: "50%", background: "linear-gradient(90deg, #c9ced6, #9aa1ab)", borderLeft: "3px solid #555", transform: `translateX(${open * 100}%)`}} />
      </div>
      <div style={{position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#ffd27a", letterSpacing: 6}}>HAYMARKET · ▲ ▼</div>
      <Stamp text="¡AAAAH!" p={pop("asesino", 125, 7)} color={YELLOW} x={W / 2} y={620} rot={-6} size={96} />
    </Card>
  );
};

// ---------------------------------------------------------------- Yard sale cowboy hat
const Hat: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, hit} = useBeats(cues);
  const table = spring({frame: frame - Math.min(at("venta", 20), 6), fps: 30, config: {damping: 13}});
  const price = pop("35", 70, 8);
  const hat = pop("sombrero", 100, 9);
  const arthur = pop("arthur", 130, 9);
  return (
    <Card accent={ORANGE} bg="linear-gradient(180deg, #ffb35c 0%, #a85a1e 100%)" shake={hit("arthur", 130, 8) * 0.4}>
      {/* Yard sale sign */}
      <div style={{position: "absolute", left: 50, top: 40, transform: `rotate(-6deg) scale(${table})`, background: "#fff", border: "6px solid #000", padding: "10px 24px", fontFamily: DISPLAY, fontSize: 60, color: "#d40000", boxShadow: "6px 6px 0 #000"}}>
        YARD SALE
      </div>
      {/* Table */}
      <div style={{position: "absolute", left: 80, right: 80, bottom: 80, height: 200, transform: `translateY(${(1 - table) * 400}px)`}}>
        <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 40, background: "#7a4a1e", border: "5px solid #000", borderRadius: 6}} />
        <div style={{position: "absolute", left: 30, top: 40, width: 30, height: 160, background: "#5b3714"}} />
        <div style={{position: "absolute", right: 30, top: 40, width: 30, height: 160, background: "#5b3714"}} />
      </div>
      {/* Cowboy hat */}
      <svg width={460} height={260} viewBox="0 0 460 260" style={{position: "absolute", left: 220, top: 230, transform: `scale(${hat}) rotate(${(1 - hat) * -20}deg)`}}>
        <ellipse cx={230} cy={190} rx={220} ry={50} fill="#6b4a2a" stroke="#000" strokeWidth={8} />
        <path d="M 110 180 Q 100 60 170 40 Q 230 70 290 40 Q 360 60 350 180 Z" fill="#7d5733" stroke="#000" strokeWidth={8} />
        <path d="M 112 160 Q 230 190 348 160" stroke="#2b1a0c" strokeWidth={18} fill="none" />
      </svg>
      {/* Price tag */}
      <div style={{position: "absolute", right: 70, top: 200, transform: `rotate(10deg) scale(${price})`, background: YELLOW, border: "6px solid #000", borderRadius: 14, padding: "8px 22px", fontFamily: DISPLAY, fontSize: 84, color: "#000", boxShadow: "6px 6px 0 #000"}}>
        $35
      </div>
      <Stamp text="¿ARTHUR MORGAN?" p={arthur} color="#fff" x={W / 2} y={560} rot={-4} size={70} />
    </Card>
  );
};

// ---------------------------------------------------------------- Manual save before a no-return mission
const Save: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const card = spring({frame: frame - Math.min(at("guarda", 4), 6), fps: 30, config: {damping: 12}});
  const bar = ramp("mano", 25, 30);
  const door = ramp("retorno", 60, 18);
  const lock = pop("atras", 100, 8);
  return (
    <Card accent={CYAN} bg="linear-gradient(180deg, #0a1730 0%, #06101e 100%)" shake={hit("atras", 100, 10) * 0.5}>
      {/* Save dialog */}
      <div style={{position: "absolute", left: 60, top: 60, width: 420, height: 330, transform: `scale(${card})`, background: "#101c33", border: `5px solid ${CYAN}`, borderRadius: 24, boxShadow: "8px 8px 0 #000", padding: 30, boxSizing: "border-box"}}>
        <div style={{fontSize: 90, lineHeight: 1}}>💾</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#fff", marginTop: 10}}>{bar >= 1 ? "PARTIDA GUARDADA ✔" : "Guardando…"}</div>
        <div style={{marginTop: 20, height: 34, background: "#000", borderRadius: 10, border: "3px solid #fff"}}>
          <div style={{width: `${bar * 100}%`, height: "100%", background: "#39ff6a", borderRadius: 8}} />
        </div>
      </div>
      {/* No-return door */}
      <div style={{position: "absolute", right: 60, top: 90, width: 300, height: 520, background: "#1a0a0a", border: "6px solid #000", borderRadius: "150px 150px 10px 10px", overflow: "hidden", boxShadow: "8px 8px 0 #000"}}>
        <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, #ff9a3c, #4a0d0d)"}} />
        <div style={{position: "absolute", top: 0, bottom: 0, left: 0, width: "100%", background: "linear-gradient(90deg, #5a2a12, #7a3a18)", transformOrigin: "left", transform: `perspective(600px) rotateY(${-80 + door * 80}deg)`, borderRight: "6px solid #000"}} />
        <div style={{position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 120, transform: `scale(${lock})`}}>🔒</div>
      </div>
      <Stamp text="SIN RETORNO" p={pop("retorno", 60, 8)} color="#ff3b3b" x={600} y={650} rot={-6} size={70} />
    </Card>
  );
};

// ---------------------------------------------------------------- Time-limited race
const Race: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const flag = spring({frame: frame - Math.min(at("carrera", 20), 6), fps: 30, config: {damping: 11}});
  const go = ramp("yago", 40, 50);
  const timer = Math.max(0, 30 - Math.floor(Math.max(0, frame - at("golpe", 70)) / 3));
  const lost = pop("pierdes", 110, 8);
  return (
    <Card accent={YELLOW} bg="linear-gradient(180deg, #1b1035 0%, #2c2c38 55%, #18181f 56%, #23232c 100%)" shake={hit("pierdes", 110, 10) * 0.5}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Checkered flag */}
        <g transform={`translate(80 60) scale(${flag})`}>
          <line x1={0} y1={0} x2={0} y2={260} stroke="#ddd" strokeWidth={10} />
          {Array.from({length: 24}).map((_, i) => (
            <rect key={i} x={6 + (i % 6) * 34} y={4 + Math.floor(i / 6) * 34 + Math.sin(frame / 5 + (i % 6)) * 4} width={34} height={34} fill={(i + Math.floor(i / 6)) % 2 ? "#000" : "#fff"} />
          ))}
        </g>
        {/* Road lanes */}
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={((i * 200 - frame * 20) % 1200 + 1200) % 1200 - 150} y={560} width={110} height={12} fill={YELLOW} />
        ))}
        {/* Two racing cars */}
        {[{c: "#ff3b3b", y: 470, s: 1}, {c: CYAN, y: 610, s: 0.85}].map((car, i) => (
          <g key={i} transform={`translate(${-200 + go * (700 * car.s) + i * 40} ${car.y})`}>
            <path d="M 0 0 L 30 -40 Q 80 -70 150 -70 L 210 -70 Q 250 -60 270 -30 L 300 -20 L 300 10 L 0 10 Z" fill={car.c} stroke="#000" strokeWidth={6} />
            <circle cx={70} cy={14} r={26} fill="#111" />
            <circle cx={240} cy={14} r={26} fill="#111" />
          </g>
        ))}
      </svg>
      {/* Timer */}
      <div style={{position: "absolute", right: 50, top: 60, transform: `scale(${pop("golpe", 70)})`, background: "#000", border: `5px solid ${timer < 10 ? "#ff3b3b" : YELLOW}`, borderRadius: 18, padding: "10px 26px", fontFamily: DISPLAY, fontSize: 90, color: timer < 10 ? "#ff3b3b" : YELLOW}}>
        ⏱ 0:{String(timer).padStart(2, "0")}
      </div>
      <div style={{position: "absolute", right: 60, top: 210, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#fff", textShadow: "3px 3px 0 #000", opacity: ramp("yago", 40, 8)}}>VS YAGO 🏁</div>
      <Stamp text="¡O LA PIERDES!" p={lost} color="#ff3b3b" x={W / 2} y={330} rot={-6} size={84} />
    </Card>
  );
};

// ---------------------------------------------------------------- Two collectible magazines vanish
const Magazines: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const room = spring({frame: frame - Math.min(at("departamento", 6), 6), fps: 30, config: {damping: 12}});
  const vanish = ramp("esfuman", 80, 16);
  return (
    <Card accent={PINK} bg="linear-gradient(180deg, #3a1d4a 0%, #1a0d24 100%)">
      <div style={{position: "absolute", left: 40, top: 30, transform: `scale(${room})`, transformOrigin: "left top", fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#ffd27a", letterSpacing: 4}}>🏢 BAYSIDE APARTMENT</div>
      {/* Coffee table */}
      <div style={{position: "absolute", left: 120, right: 120, top: 470, height: 40, background: "#6b3f1e", border: "5px solid #000", borderRadius: 10, transform: `scale(${room})`}} />
      <div style={{position: "absolute", left: 170, top: 510, width: 26, height: 120, background: "#4a2a12", transform: `scale(${room})`}} />
      <div style={{position: "absolute", right: 170, top: 510, width: 26, height: 120, background: "#4a2a12", transform: `scale(${room})`}} />
      {/* Magazines */}
      {[{c: PINK, t: "VICE\nMAG", r: -8}, {c: CYAN, t: "LEONIDA\nNOW", r: 7}].map((m, i) => {
        const s = spring({frame: frame - at("revistas", 30) - i * 6, fps: 30, config: {damping: 10}});
        const v = Math.max(0, Math.min(1, vanish * 1.4 - i * 0.2));
        return (
          <div key={i} style={{position: "absolute", left: 220 + i * 250, top: 160 - v * 120, width: 210, height: 290, background: m.c, border: "6px solid #000", borderRadius: 10, boxShadow: "8px 8px 0 #000", transform: `rotate(${m.r + v * 40}deg) scale(${s * (1 - v * 0.6)})`, opacity: 1 - v, filter: `blur(${v * 8}px)`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", whiteSpace: "pre-line", fontFamily: DISPLAY, fontSize: 52, color: "#fff", WebkitTextStroke: "4px #000", paintOrder: "stroke fill"}}>
            {m.t}
          </div>
        );
      })}
      {/* Sparkle poof */}
      {vanish > 0 && vanish < 1
        ? Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{position: "absolute", left: 300 + Math.cos(i) * vanish * 260, top: 250 + Math.sin(i * 1.7) * vanish * 200, fontSize: 50, opacity: 1 - vanish}}>✨</div>
          ))
        : null}
      <Stamp text="SE ESFUMAN" p={pop("esfuman", 80, 8)} color={YELLOW} x={W / 2} y={360} rot={-6} size={92} />
    </Card>
  );
};

// ---------------------------------------------------------------- Pending call before "Sunset"
const Phone: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const list = spring({frame: frame - Math.min(at("misiones", 20), 6), fps: 30, config: {damping: 12}});
  const ring = pop("llamada", 60, 9);
  const sunset = ramp("sunset", 100, 40);
  const shake = Math.sin(frame * 1.6) * 6 * (ring > 0.5 ? 1 : 0);
  return (
    <Card accent={ORANGE} bg={`linear-gradient(180deg, #2a0f4d 0%, ${sunset > 0 ? "#ff4f8b" : "#2a0f4d"} 60%, #ff9a3c 100%)`}>
      {/* Sun going down on "Sunset" */}
      <div style={{position: "absolute", left: W / 2 - 160, top: 220 + sunset * 300, width: 320, height: 320, borderRadius: "50%", background: "linear-gradient(180deg, #ffe36e, #ff7b3c)", opacity: 0.9}} />
      <div style={{position: "absolute", left: 0, right: 0, top: 520, height: 220, background: "#1a0d33"}} />
      {/* Side missions checklist */}
      <div style={{position: "absolute", left: 50, top: 50, width: 380, transform: `scale(${list})`, transformOrigin: "left top", background: "#fffdf4", border: "5px solid #000", borderRadius: 16, padding: 24, boxShadow: "8px 8px 0 #000", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#222"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 40}}>SECUNDARIAS</div>
        <div>☐ Misión extra 1</div>
        <div>☐ Misión extra 2</div>
        <div>☐ Llamada pendiente</div>
      </div>
      {/* Ringing phone */}
      <div style={{position: "absolute", right: 70, top: 60, width: 230, height: 400, transform: `scale(${ring}) rotate(${shake}deg)`, background: "#111", border: "6px solid #000", borderRadius: 36, boxShadow: "8px 8px 0 #000", padding: 18, boxSizing: "border-box", textAlign: "center"}}>
        <div style={{fontSize: 80, marginTop: 30}}>📞</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 24, color: "#39ff6a", marginTop: 14}}>LLAMADA ENTRANTE</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 20, color: "#ccc", marginTop: 8}}>"This Is a Free Call From…"</div>
      </div>
      <Stamp text="ANTES DE SUNSET" p={pop("sunset", 100, 8)} color={YELLOW} x={W / 2} y={620} rot={-5} size={72} />
    </Card>
  );
};

// ---------------------------------------------------------------- Family savings goal for the best ending
const Savings: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const card = spring({frame: frame - Math.min(at("final", 6), 6), fps: 30, config: {damping: 12}});
  const fill = ramp("millones", 40, 40);
  const amount = Math.round(2000000 * fill);
  const trophy = pop("decision", 120, 8);
  return (
    <Card accent="#39ff6a" bg="linear-gradient(180deg, #06210f 0%, #0b3a1c 100%)" shake={hit("decision", 120, 10) * 0.4}>
      <div style={{position: "absolute", left: 50, top: 40, transform: `scale(${card})`, transformOrigin: "left top", fontFamily: BODY, fontWeight: 800, fontSize: 34, color: "#8ff7b0"}}>🐷 AHORROS FAMILIARES</div>
      <div style={{position: "absolute", left: 50, top: 100, fontFamily: DISPLAY, fontSize: 120, color: fill >= 1 ? YELLOW : "#fff", textShadow: "6px 6px 0 #000"}}>
        ${amount.toLocaleString("en-US")}
      </div>
      {/* Progress meter */}
      <div style={{position: "absolute", left: 50, right: 50, top: 290, height: 70, background: "#000", border: "5px solid #fff", borderRadius: 18, overflow: "hidden"}}>
        <div style={{width: `${fill * 100}%`, height: "100%", background: "linear-gradient(90deg, #39ff6a, #ffe500)"}} />
      </div>
      <div style={{position: "absolute", right: 60, top: 370, fontFamily: BODY, fontWeight: 800, fontSize: 28, color: "#fff"}}>META: $2,000,000</div>
      {/* Money stacks */}
      {Array.from({length: 7}).map((_, i) => (
        <div key={i} style={{position: "absolute", left: 60 + i * 110, top: 560 - Math.min(1, Math.max(0, fill * 7 - i)) * 120, fontSize: 80, opacity: Math.min(1, Math.max(0, fill * 7 - i))}}>💵</div>
      ))}
      <div style={{position: "absolute", left: W / 2 - 110, top: 400, transform: `scale(${trophy})`, textAlign: "center"}}>
        <div style={{fontSize: 160}}>🏆</div>
      </div>
      <Stamp text="MEJOR FINAL" p={trophy} color={YELLOW} x={W / 2} y={660} rot={-4} size={76} />
    </Card>
  );
};

// ---------------------------------------------------------------- Selling stolen cars to Moses
const Moses: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const car = spring({frame: frame - Math.min(at("coches", 6), 6), fps: 30, config: {damping: 13}});
  const tag = pop("moses", 40, 9);
  const list = pop("quiere", 90, 10);
  const cash = ramp("vende", 20, 30);
  return (
    <Card accent="#39ff6a" bg="linear-gradient(180deg, #1c1408 0%, #3a2a10 100%)">
      {/* Garage door stripes */}
      <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 40px, rgba(0,0,0,0.1) 40px 46px)"}} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${-500 + car * 500} 0)`}>
          <path d="M 100 560 L 120 500 Q 200 480 280 440 Q 360 390 480 386 L 560 386 Q 640 394 700 450 L 790 466 Q 820 476 820 510 L 820 560 Z" fill="#e8b400" stroke="#000" strokeWidth={8} />
          <path d="M 320 444 Q 400 400 480 396 L 560 396 Q 620 404 660 450 Z" fill="#14202c" stroke="#000" strokeWidth={6} />
          {[230, 690].map((cx) => <circle key={cx} cx={cx} cy={566} r={56} fill="#111" stroke="#000" strokeWidth={6} />)}
        </g>
      </svg>
      {/* Price tag */}
      <div style={{position: "absolute", left: 330, top: 300, transform: `rotate(-8deg) scale(${tag})`, background: YELLOW, border: "6px solid #000", borderRadius: 14, padding: "6px 22px", fontFamily: DISPLAY, fontSize: 64, boxShadow: "6px 6px 0 #000"}}>
        VENDIDO 💰
      </div>
      {/* Moses' wanted list */}
      <div style={{position: "absolute", left: 40, top: 40, width: 360, transform: `scale(${list}) rotate(-3deg)`, transformOrigin: "left top", background: "#fffdf4", border: "5px solid #000", borderRadius: 14, padding: 20, boxShadow: "8px 8px 0 #000", fontFamily: BODY, fontWeight: 800, fontSize: 28, color: "#222"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 38}}>MOSES BUSCA:</div>
        <div>✔ Deportivo amarillo</div>
        <div>☐ Coupé clásico</div>
        <div>☐ Todoterreno</div>
      </div>
      {/* Cash rain */}
      {Array.from({length: 8}).map((_, i) => (
        <div key={i} style={{position: "absolute", left: 470 + (i % 4) * 100, top: -80 + cash * 260 + (i > 3 ? 90 : 0), fontSize: 64, opacity: cash > 0 ? 1 : 0, transform: `rotate(${(i - 4) * 10}deg)`}}>💵</div>
      ))}
    </Card>
  );
};

// ---------------------------------------------------------------- Tracker check with the WAiNK app
const Tracker: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp, hit} = useBeats(cues);
  const phone = spring({frame: frame - Math.min(at("app", 20), 6), fps: 30, config: {damping: 12}});
  const scan = ramp("revisa", 6, 40);
  const found = pop("rastreador", 30, 8);
  const no = pop("compra", 80, 8);
  return (
    <Card accent="#ff3b3b" bg="linear-gradient(180deg, #0a0f1f 0%, #121a33 100%)" shake={hit("compra", 80, 10) * 0.5}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Car top view */}
        <g transform="translate(200 150)">
          <rect x={0} y={0} width={200} height={420} rx={70} fill="#3a6df0" stroke="#000" strokeWidth={8} />
          <rect x={30} y={90} width={140} height={100} rx={20} fill="#14202c" />
          <rect x={30} y={270} width={140} height={80} rx={20} fill="#14202c" />
          {/* Tracker dot */}
          <circle cx={150} cy={360} r={18 + found * 10 * Math.abs(Math.sin(frame / 4))} fill="#ff3b3b" opacity={found} />
        </g>
        {/* Scan beam */}
        <rect x={180} y={140 + scan * 420} width={240} height={10} fill="#39ff6a" opacity={scan > 0 && scan < 1 ? 0.9 : 0} />
      </svg>
      {/* Phone app */}
      <div style={{position: "absolute", right: 70, top: 70, width: 300, height: 560, transform: `scale(${phone})`, background: "#111", border: "6px solid #000", borderRadius: 40, boxShadow: "8px 8px 0 #000", padding: 20, boxSizing: "border-box", textAlign: "center"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 52, color: PINK, marginTop: 20}}>WAiNK</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, color: "#aaa"}}>Escaneando vehículo…</div>
        <div style={{fontSize: 110, marginTop: 40}}>{found > 0.5 ? "📡" : "🔍"}</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: found > 0.5 ? "#ff3b3b" : "#39ff6a", marginTop: 20}}>{found > 0.5 ? "⚠️ RASTREADOR" : "…"}</div>
      </div>
      <Stamp text="NO SE VENDE" p={no} color="#ff3b3b" x={300} y={640} rot={-6} size={80} />
    </Card>
  );
};

// ---------------------------------------------------------------- Rob criminals: more than a store
const Criminals: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {at, pop, ramp} = useBeats(cues);
  const store = spring({frame: useCurrentFrame() - Math.min(at("tienda", 60), 6), fps: 30, config: {damping: 12}});
  const thug = pop("criminales", 10, 10);
  const bars = ramp("mas", 40, 24);
  return (
    <Card accent={ORANGE} bg="linear-gradient(180deg, #1a0d05 0%, #2e1608 100%)">
      {/* Store register */}
      <div style={{position: "absolute", left: 70, top: 60, width: 330, textAlign: "center", transform: `scale(${store})`}}>
        <div style={{fontSize: 130}}>🏪</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 32, color: "#fff"}}>TIENDA</div>
        <div style={{margin: "20px auto 0", width: 120, height: 260 * 0.25 * bars, background: "#9aa1ab", border: "4px solid #000", borderRadius: 8}} />
        <div style={{fontFamily: DISPLAY, fontSize: 52, color: "#ccc"}}>$</div>
      </div>
      {/* Criminal with bag */}
      <div style={{position: "absolute", right: 70, top: 60, width: 330, textAlign: "center", transform: `scale(${thug})`}}>
        <div style={{fontSize: 130}}>🦹💰</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 32, color: "#fff"}}>CRIMINAL</div>
        <div style={{margin: "20px auto 0", width: 120, height: 260 * bars, background: "linear-gradient(180deg, #ffe500, #39ff6a)", border: "4px solid #000", borderRadius: 8}} />
        <div style={{fontFamily: DISPLAY, fontSize: 52, color: YELLOW}}>$$$</div>
      </div>
      <Stamp text="¡PAGA MÁS!" p={pop("mas", 40, 8)} color={YELLOW} x={W / 2} y={660} rot={-6} size={84} />
    </Card>
  );
};

// ---------------------------------------------------------------- Demolition derby
const Derby: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, hit} = useBeats(cues);
  const t = Math.max(0, frame - Math.min(at("derbis", 6), 6));
  const crash = at("demolicion", 30);
  const x = Math.min(1, t / Math.max(1, crash - 6));
  const win = pop("victoria", 90, 8);
  return (
    <Card accent={YELLOW} bg="linear-gradient(180deg, #2a1a08 0%, #4a2e10 60%, #6b4a22 100%)" shake={hit("demolicion", 30, 14)}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Arena */}
        <ellipse cx={W / 2} cy={520} rx={420} ry={160} fill="#8a6a3a" stroke="#000" strokeWidth={6} />
        {/* Two cars crashing */}
        {[{c: "#ff3b3b", from: -260, dir: 1}, {c: CYAN, from: 1160, dir: -1}].map((car, i) => (
          <g key={i} transform={`translate(${car.from + car.dir * x * 600} 470) scale(${car.dir} 1)`}>
            <path d="M 0 0 L 30 -50 Q 80 -80 150 -80 L 210 -80 Q 250 -70 270 -40 L 300 -30 L 300 20 L 0 20 Z" fill={car.c} stroke="#000" strokeWidth={6} transform={frame > crash ? "rotate(-6 150 0)" : ""} />
            <circle cx={70} cy={24} r={26} fill="#111" />
            <circle cx={240} cy={24} r={26} fill="#111" />
          </g>
        ))}
        {/* Crash burst */}
        {frame > crash ? (
          <g transform={`translate(${W / 2} 440) scale(${Math.min(1, (frame - crash) / 6)})`}>
            <path d="M 0 -110 L 30 -40 L 110 -60 L 50 0 L 120 50 L 30 40 L 0 110 L -30 40 L -120 50 L -50 0 L -110 -60 L -30 -40 Z" fill={YELLOW} stroke="#000" strokeWidth={6} />
            <text x={0} y={18} textAnchor="middle" fontFamily={DISPLAY} fontSize={56} fill="#ff3b3b">¡CRASH!</text>
          </g>
        ) : null}
      </svg>
      <div style={{position: "absolute", left: 40, top: 30, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#ffd27a", letterSpacing: 3}}>🏁 AMBROSIA RACEWAY</div>
      <div style={{position: "absolute", right: 50, top: 80, transform: `scale(${win})`, textAlign: "center"}}>
        <div style={{fontSize: 120}}>🏆</div>
        <div style={{fontFamily: DISPLAY, fontSize: 50, color: "#39ff6a", WebkitTextStroke: "5px #000", paintOrder: "stroke fill"}}>+$$$ MILES</div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- Hunting rare animals for Bret
const Hunt: React.FC<{cues: GraphicCues}> = ({cues}) => {
  const {frame, at, pop, ramp} = useBeats(cues);
  const scope = spring({frame: frame - Math.min(at("caza", 6), 6), fps: 30, config: {damping: 12}});
  const rare = ramp("raros", 50, 10);
  const paid = pop("pagan", 70, 8);
  const sway = Math.sin(frame / 12) * 30;
  return (
    <Card accent="#39ff6a" bg="linear-gradient(180deg, #8fd36a 0%, #3c7a2a 100%)">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({length: 6}).map((_, i) => (
          <path key={i} d={`M ${i * 170} 740 L ${i * 170 + 60} 520 L ${i * 170 + 120} 740 Z`} fill="#2a5a1e" />
        ))}
        {/* Animals: normal deer and rare golden one */}
        <text x={180 + sway} y={470} fontSize={140}>🦌</text>
        <g opacity={rare}>
          <text x={560 - sway} y={470} fontSize={160} style={{filter: "drop-shadow(0 0 20px #ffe500)"}}>🦌</text>
          <text x={640 - sway} y={300} fontSize={50}>✨</text>
        </g>
        {/* Scope */}
        <g transform={`translate(${620 - sway} 400) scale(${scope})`} opacity={rare}>
          <circle r={130} fill="none" stroke="#000" strokeWidth={14} />
          <line x1={-130} y1={0} x2={130} y2={0} stroke="#000" strokeWidth={4} />
          <line x1={0} y1={-130} x2={0} y2={130} stroke="#000" strokeWidth={4} />
        </g>
      </svg>
      <div style={{position: "absolute", left: 40, top: 30, transform: `scale(${scope})`, transformOrigin: "left top", background: "#fffdf4", border: "5px solid #000", borderRadius: 12, padding: "8px 18px", fontFamily: BODY, fontWeight: 800, fontSize: 30, boxShadow: "6px 6px 0 #000"}}>
        🎯 ENCARGO DE BRET
      </div>
      <div style={{position: "absolute", left: 120, bottom: 70, background: "#fff", border: "4px solid #000", borderRadius: 10, padding: "4px 16px", fontFamily: DISPLAY, fontSize: 48}}>$</div>
      <div style={{position: "absolute", right: 120, bottom: 70, transform: `scale(${paid})`, background: YELLOW, border: "5px solid #000", borderRadius: 12, padding: "4px 22px", fontFamily: DISPLAY, fontSize: 64, boxShadow: "6px 6px 0 #000"}}>$$$$</div>
      <Stamp text="RARO = MÁS $" p={paid} color={YELLOW} x={W / 2} y={140} rot={-5} size={74} />
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
    case "bank":
      return <Bank cues={cues} />;
    case "revolver":
      return <Revolver cues={cues} />;
    case "tasks":
      return <Tasks cues={cues} />;
    case "clothes":
      return <Clothes cues={cues} />;
    case "motel":
      return <Motel cues={cues} />;
    case "portal":
      return <Portal cues={cues} />;
    case "block":
      return <Block cues={cues} />;
    case "bigfoot":
      return <Bigfoot cues={cues} />;
    case "clown":
      return <Clown cues={cues} />;
    case "hat":
      return <Hat cues={cues} />;
    case "save":
      return <Save cues={cues} />;
    case "race":
      return <Race cues={cues} />;
    case "magazines":
      return <Magazines cues={cues} />;
    case "phone":
      return <Phone cues={cues} />;
    case "savings":
      return <Savings cues={cues} />;
    case "moses":
      return <Moses cues={cues} />;
    case "tracker":
      return <Tracker cues={cues} />;
    case "criminals":
      return <Criminals cues={cues} />;
    case "derby":
      return <Derby cues={cues} />;
    case "hunt":
      return <Hunt cues={cues} />;
    default:
      return null;
  }
};
