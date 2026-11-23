import React from "react";
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from "remotion";

/**
 * Animated illustrations that show what the narration describes when no official
 * screenshot exists for it. They are clearly drawn graphics (never fake gameplay)
 * and carry an "ILUSTRACIÓN" tag.
 */
export type SceneGraphic = "eggs" | "dexter" | "car" | "conspiracy" | "gps";

const PINK = "#ff2e9a";
const CYAN = "#2ef2ff";
const YELLOW = "#ffe500";
const BODY = "'Montserrat', sans-serif";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const W = 860;
const H = 720;

const Card: React.FC<{children: React.ReactNode; accent: string}> = ({children, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 140}});
  return (
    <div
      style={{
        position: "absolute",
        top: 650,
        left: (1080 - W) / 2,
        width: W,
        height: H,
        borderRadius: 40,
        background: "rgba(8, 6, 20, 0.78)",
        border: `6px solid ${accent}`,
        boxShadow: `0 0 50px ${accent}88, 12px 12px 0 #000`,
        overflow: "hidden",
        transform: `scale(${0.6 + 0.4 * pop}) translateY(${(1 - pop) * 80}px)`,
        opacity: pop,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 18,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.75)",
          background: "rgba(0,0,0,0.55)",
          padding: "4px 14px",
          borderRadius: 10,
        }}
      >
        ILUSTRACIÓN
      </div>
    </div>
  );
};

// 1. Nest with painted eggs on top of a tower; one egg gets thrown down.
const Eggs: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colors = ["#ff8ad8", "#8af7ff", "#ffe36e", "#b28aff"];
  const throwT = interpolate(frame, [70, 110], [0, 1], clamp);
  return (
    <Card accent={YELLOW}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Tower */}
        <rect x={330} y={400} width={200} height={340} fill="#1b1838" stroke={CYAN} strokeWidth={4} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={350 + (i % 3) * 60} y={430 + Math.floor(i / 3) * 70} width={36} height={40} fill={random(`w${i}`) > 0.4 ? "#ffd86b" : "#2a2650"} />
        ))}
        {/* Nest */}
        <ellipse cx={430} cy={390} rx={150} ry={42} fill="#6b4320" />
        {Array.from({length: 14}).map((_, i) => (
          <line key={i} x1={290 + i * 20} y1={372 + (i % 2) * 18} x2={320 + i * 18} y2={408 - (i % 3) * 10} stroke="#9a6a35" strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* Eggs popping in */}
        {colors.map((c, i) => {
          const s = spring({frame: frame - 12 - i * 8, fps, config: {damping: 9}});
          const thrown = i === 3;
          const x = thrown ? 520 + throwT * 180 : 345 + i * 55;
          const y = thrown ? 345 - Math.sin(throwT * Math.PI) * 120 + throwT * throwT * 360 : 345;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${thrown ? throwT * 540 : 0})`}>
              <ellipse cx={0} cy={0} rx={30} ry={40} fill={c} stroke="#000" strokeWidth={4} />
              <path d="M -28 -6 Q -14 -16 0 -6 T 28 -6" stroke="#fff" strokeWidth={5} fill="none" />
              <circle cx={-10} cy={14} r={5} fill="#fff" />
              <circle cx={10} cy={14} r={5} fill="#fff" />
            </g>
          );
        })}
        {/* NPC below */}
        <g transform="translate(720 640)">
          <circle cx={0} cy={-70} r={22} fill="#e9b48a" stroke="#000" strokeWidth={4} />
          <rect x={-22} y={-48} width={44} height={70} rx={10} fill="#3a6df0" stroke="#000" strokeWidth={4} />
          {throwT > 0.95 ? <text x={-50} y={-110} fontFamily={DISPLAY} fontSize={56} fill={YELLOW} stroke="#000" strokeWidth={3}>¡PLAF!</text> : null}
        </g>
      </svg>
    </Card>
  );
};

// 2. "Trinity Apartments" sign plus a kit of blood slides.
const Dexter: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flicker = frame % 23 < 2 ? 0.4 : 1;
  return (
    <Card accent="#ff3b3b">
      <div style={{position: "absolute", top: 50, left: 0, right: 0, textAlign: "center"}}>
        <div style={{fontFamily: DISPLAY, fontSize: 92, color: "#fff", opacity: flicker, textShadow: `0 0 24px ${CYAN}, 0 0 48px ${CYAN}`, letterSpacing: 4}}>
          TRINITY
        </div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, color: CYAN, letterSpacing: 10, opacity: flicker}}>APARTMENTS</div>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: "absolute", top: 0, left: 0}}>
        {/* Kit case */}
        <rect x={110} y={290} width={640} height={300} rx={24} fill="#2b2b33" stroke="#000" strokeWidth={6} />
        <rect x={130} y={310} width={600} height={260} rx={14} fill="#1a1a1f" />
        {Array.from({length: 6}).map((_, i) => {
          const s = spring({frame: frame - 18 - i * 6, fps, config: {damping: 12}});
          return (
            <g key={i} transform={`translate(${170 + i * 92} 330) scale(1 ${s})`}>
              <rect x={0} y={0} width={64} height={220} rx={6} fill="rgba(220,240,255,0.85)" stroke="#9cc" strokeWidth={3} />
              <circle cx={32} cy={110} r={14 + (i % 3) * 3} fill="#c40000" />
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

// 3. Tuner coupe silhouette with racing graphics sliding in.
const Car: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [6, 30], [-700, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const wheel = frame * 18;
  return (
    <Card accent="#39ff6a">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({length: 7}).map((_, i) => (
          <line key={i} x1={40 + ((frame * 30 + i * 140) % 900) - 120} y1={260 + i * 40} x2={((frame * 30 + i * 140) % 900) - 40} y2={260 + i * 40} stroke="rgba(255,255,255,0.35)" strokeWidth={6} strokeLinecap="round" />
        ))}
        <g transform={`translate(${x} 0)`}>
          <path d="M 110 480 L 150 410 Q 250 330 380 322 L 520 322 Q 600 330 660 400 L 760 420 Q 790 430 790 470 L 790 500 L 110 500 Z" fill="#39ff6a" stroke="#000" strokeWidth={8} />
          <path d="M 300 335 L 520 335 Q 580 345 615 395 L 270 395 Z" fill="#11202a" stroke="#000" strokeWidth={6} />
          <path d="M 160 470 Q 300 400 460 470 T 760 450" stroke="#0b3d1a" strokeWidth={14} fill="none" />
          <path d="M 180 450 Q 320 390 480 450" stroke={YELLOW} strokeWidth={6} fill="none" />
          <rect x={700} y={360} width={70} height={12} fill="#000" />
          {[220, 650].map((cx) => (
            <g key={cx} transform={`translate(${cx} 505) rotate(${wheel})`}>
              <circle r={62} fill="#111" stroke="#000" strokeWidth={6} />
              <circle r={36} fill="#c9c9c9" />
              {Array.from({length: 5}).map((_, k) => (
                <rect key={k} x={-5} y={-34} width={10} height={34} fill="#666" transform={`rotate(${k * 72})`} />
              ))}
            </g>
          ))}
        </g>
        <text x={W / 2} y={150} textAnchor="middle" fontFamily={DISPLAY} fontSize={84} fill="#fff" stroke="#000" strokeWidth={4} opacity={interpolate(frame, [26, 34], [0, 1], clamp)}>
          ¡SE PUEDE ROBAR!
        </text>
      </svg>
    </Card>
  );
};

// 4. Conspiracy board with pinned notes and red strings.
const Conspiracy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const notes = [
    {x: 70, y: 70, t: "¿ESTO ES\nUN JUEGO?", r: -6},
    {x: 520, y: 60, t: "¿QUIÉN ME\nCONTROLA?", r: 5},
    {x: 300, y: 300, t: "NPC\n#4821", r: -3},
    {x: 70, y: 480, t: "GUARDAR\nPARTIDA", r: 4},
    {x: 540, y: 470, t: "MISIÓN\nFALLIDA", r: -5},
  ];
  const pins = notes.map((n) => ({x: n.x + 120, y: n.y + 20}));
  const links: [number, number][] = [[0, 2], [1, 2], [2, 3], [2, 4], [0, 1], [3, 4]];
  return (
    <Card accent="#ff3b3b">
      <div style={{position: "absolute", inset: 0, background: "#a8743f", backgroundImage: "radial-gradient(rgba(0,0,0,0.18) 2px, transparent 2px)", backgroundSize: "18px 18px"}} />
      {notes.map((n, i) => {
        const s = spring({frame: frame - 6 - i * 6, fps, config: {damping: 11}});
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
              fontFamily: "'Permanent Marker', 'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 36,
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
          const p = interpolate(frame, [40 + i * 7, 52 + i * 7], [0, 1], clamp);
          const A = pins[a];
          const B = pins[b];
          return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * p} y2={A.y + (B.y - A.y) * p} stroke="#d40000" strokeWidth={6} />;
        })}
        {pins.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={12} fill="#e01010" stroke="#000" strokeWidth={3} />
        ))}
      </svg>
    </Card>
  );
};

// 5. Boat GPS screen showing a Los Santos-style map.
const Gps: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 12) % 2 === 0 ? 1 : 0.35;
  const pulse = 1 + 0.5 * ((frame % 30) / 30);
  return (
    <Card accent={CYAN}>
      <div style={{position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 40, color: CYAN, letterSpacing: 8}}>
        GPS · NAVEGACIÓN
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: "absolute", top: 0, left: 0}}>
        <rect x={70} y={110} width={720} height={520} rx={30} fill="#06222b" stroke="#000" strokeWidth={8} />
        {/* Sea grid */}
        {Array.from({length: 9}).map((_, i) => (
          <line key={`h${i}`} x1={70} y1={150 + i * 55} x2={790} y2={150 + i * 55} stroke="rgba(46,242,255,0.12)" strokeWidth={2} />
        ))}
        {/* Island outline */}
        <path
          d="M 300 600 Q 250 520 300 450 Q 280 370 360 320 Q 380 230 470 200 Q 560 190 590 260 Q 650 300 620 380 Q 660 450 600 520 Q 560 600 480 610 Z"
          fill="#1f5f3a"
          stroke={CYAN}
          strokeWidth={5}
          strokeDasharray={1600}
          strokeDashoffset={interpolate(frame, [6, 40], [1600, 0], clamp)}
        />
        <text x={455} y={470} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill="#fff" opacity={blink} stroke="#000" strokeWidth={3}>
          LOS SANTOS
        </text>
        {/* Boat position */}
        <circle cx={220} cy={560} r={16 * pulse} fill="none" stroke={YELLOW} strokeWidth={4} opacity={2 - pulse} />
        <circle cx={220} cy={560} r={14} fill={YELLOW} stroke="#000" strokeWidth={3} />
      </svg>
      <div style={{position: "absolute", top: 140, right: 110, fontFamily: DISPLAY, fontSize: 120, color: PINK, textShadow: "6px 6px 0 #000", opacity: interpolate(frame, [40, 50], [0, 1], clamp)}}>
        ?
      </div>
    </Card>
  );
};

export const SceneGraphicView: React.FC<{graphic: SceneGraphic}> = ({graphic}) => {
  switch (graphic) {
    case "eggs":
      return <Eggs />;
    case "dexter":
      return <Dexter />;
    case "car":
      return <Car />;
    case "conspiracy":
      return <Conspiracy />;
    case "gps":
      return <Gps />;
    default:
      return null;
  }
};
