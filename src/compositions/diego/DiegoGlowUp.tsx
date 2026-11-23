import React from "react";
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {useFonts} from "../../templates/gta/GTAInfo";
import {DiegoPose, DiegoRoom, SofiCall} from "./Diego3D";
import {CUT_BACK, CUT_CALL, CUT_VOTE, DIEGO_CAPTIONS, DIEGO_KEYWORDS, DIEGO_VOICE, type DWord} from "./diegoData";

const PINK = "#ff2e88";
const CYAN = "#3ee6ff";
const LIME = "#c6ff3d";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const outline = (w: number) => ({WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill"}) as const;

const Heart: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = PINK, style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.2 4 6.2 4c2.2 0 3.6 1.3 4.3 2.4h1C12.2 5.3 13.6 4 15.8 4c4 0 5.9 4.4 4.2 7.7C19.5 16.4 12 21 12 21z" fill={color} stroke="#000" strokeWidth={1.4} />
  </svg>
);

// ───────────────────────── FX ─────────────────────────

/** Animated film grain + vignette over everything. */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <svg width="100%" height="100%" style={{position: "absolute", opacity: 0.09, mixBlendMode: "overlay"}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 50} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)"}} />
    </AbsoluteFill>
  );
};

/** RGB-split glitch + flash on a cut. Mount inside a Sequence starting at the cut. */
const GlitchCut: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 10) return null;
  const flash = interpolate(f, [0, 3, 10], [0.9, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {[...Array(9)].map((_, i) => {
        const y = random(`y${i}-${f}`) * 1920;
        const h = 20 + random(`h${i}-${f}`) * 140;
        const c = [PINK, CYAN, LIME][i % 3];
        return <div key={i} style={{position: "absolute", left: (random(`x${i}-${f}`) - 0.5) * 300, top: y, width: 1300, height: h, background: c, opacity: 0.55 * (1 - f / 10), mixBlendMode: "screen"}} />;
      })}
      <AbsoluteFill style={{background: "#fff", opacity: flash}} />
    </AbsoluteFill>
  );
};

/** Camera shake wrapper (strength decays over `dur` frames from `at`). */
const useShake = (hits: number[], dur = 12, amp = 18) => {
  const f = useCurrentFrame();
  const h = hits.find((x) => f >= x && f < x + dur);
  if (h === undefined) return "none";
  const k = 1 - (f - h) / dur;
  return `translate(${(random(`sx${f}`) - 0.5) * amp * k}px, ${(random(`sy${f}`) - 0.5) * amp * k}px)`;
};

/** Floating bokeh / dust particles. */
const Bokeh: React.FC<{colors?: string[]; count?: number}> = ({colors = [PINK, CYAN, "#b14bff"], count = 22}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {[...Array(count)].map((_, i) => {
        const x = random(`bx${i}`) * 1080;
        const y = (random(`by${i}`) * 2100 - f * (0.6 + random(`bs${i}`) * 1.4)) % 2100;
        const s = 8 + random(`bz${i}`) * 34;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < 0 ? y + 2100 : y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: colors[i % colors.length],
              opacity: 0.25 + 0.25 * Math.sin(f / 10 + i),
              filter: `blur(${s / 5}px)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ───────────────────────── HUD + captions ─────────────────────────

const MeetHud: React.FC<{glitchy?: boolean}> = ({glitchy}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 8, fps, config: {damping: 12}});
  const beat = 1 + Math.max(0, Math.sin(f / 4)) * 0.12;
  const barColor = glitchy && Math.sin(f / 2) > 0 ? "#ff3b3b" : PINK;
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 50,
        right: 50,
        padding: "22px 28px",
        borderRadius: 30,
        background: "linear-gradient(135deg, #1a0f2ee6, #0d0d14e6)",
        border: `4px solid ${PINK}`,
        boxShadow: `0 0 40px ${PINK}88, 0 10px 0 #000`,
        transform: `translateY(${(1 - s) * -320}px)`,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 18}}>
        <Heart size={64} style={{transform: `scale(${beat})`}} />
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 36, color: "#fff", lineHeight: 1.1}}>
          SE CONOCEN EN
          <div style={{fontFamily: DISPLAY, fontSize: 72, color: LIME, ...outline(3), letterSpacing: 1}}>30 DÍAS</div>
        </div>
        <div style={{marginLeft: "auto", textAlign: "right", fontFamily: BODY, fontWeight: 900}}>
          <div style={{fontSize: 28, color: "#ffffffaa"}}>GLOW UP</div>
          <div style={{fontFamily: DISPLAY, fontSize: 80, color: barColor, lineHeight: 1}}>0%</div>
        </div>
      </div>
      <div style={{marginTop: 14, height: 22, borderRadius: 11, background: "#2a2238", overflow: "hidden", border: "3px solid #ffffff55"}}>
        <div style={{width: 10, height: "100%", background: barColor, boxShadow: `0 0 20px ${barColor}`}} />
      </div>
    </div>
  );
};

const isKey = (w: string) => {
  const c = w.replace(/[¿?¡!.,…]/g, "").replace(/ /g, " ").toLowerCase();
  return DIEGO_KEYWORDS.includes(c);
};

const Captions: React.FC<{words: DWord[]; top: number}> = ({words, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = words.findIndex((w) => frame >= w.start && frame < w.end + 6);
  if (idx < 0) return null;
  const g0 = idx - (idx % 3);
  const group = words.slice(g0, g0 + 3).filter((w) => w.start <= frame);
  return (
    <div style={{position: "absolute", top, left: 30, right: 30, textAlign: "center"}}>
      {group.map((w, i) => {
        const active = g0 + i === idx;
        const s = spring({frame: frame - w.start, fps, config: {damping: 10, stiffness: 260}});
        const key = isKey(w.text);
        return (
          <span
            key={w.start}
            style={{
              display: "inline-block",
              margin: "6px 8px",
              padding: "0 16px",
              borderRadius: 16,
              background: active ? (key ? LIME : PINK) : "transparent",
              fontFamily: BODY,
              fontWeight: 900,
              fontSize: 82,
              textTransform: "uppercase",
              color: active ? "#0d0d14" : "#fff",
              ...(active ? {} : outline(4)),
              textShadow: active ? "none" : "0 6px 0 #000",
              boxShadow: active ? `0 8px 0 #000, 0 0 30px ${key ? LIME : PINK}99` : "none",
              transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${active ? -2 : 0}deg)`,
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

const IntroScene: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = interpolate(f, [0, 40], [-60, 160], clamp);
  return (
    <AbsoluteFill>
      <DiegoRoom width={1080} height={1920} shot="intro" local={f} />
      {/* light sweep */}
      <AbsoluteFill style={{background: `linear-gradient(110deg, transparent ${sweep - 20}%, #ffffff33 ${sweep}%, transparent ${sweep + 20}%)`, mixBlendMode: "screen"}} />
      <Bokeh />
      <MeetHud />
      {/* name tag */}
      <NameTag frame={f} />
    </AbsoluteFill>
  );
};

const NameTag: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 12, fps, config: {damping: 12}});
  return (
    <div style={{position: "absolute", right: 50, top: 1130, transform: `translateX(${(1 - s) * 600}px)`, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8}}>
      <div style={{fontFamily: DISPLAY, fontSize: 120, color: "#fff", ...outline(6), textShadow: `0 8px 0 #000, 0 0 40px ${CYAN}`}}>DIEGO</div>
      <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 32, background: CYAN, color: "#0d0d14", padding: "6px 16px", borderRadius: 10}}>
        GAMER · 12 H/DÍA · NIVEL SOFÁ
      </div>
    </div>
  );
};

const CallScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pip = spring({frame: f - 10, fps, config: {damping: 13}});
  const map = spring({frame: f - 4, fps, config: {damping: 14}});
  const dot = interpolate(f, [10, 70], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const sec = 2 * 60 * 60 + 17 * 60 + Math.floor(f / 30);
  const time = `${Math.floor(sec / 3600)}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <SofiCall width={1080} height={1920} />
      <Bokeh colors={[PINK, "#ffd36b", "#b14bff"]} count={16} />
      {/* call chrome */}
      <div style={{position: "absolute", top: 90, left: 40, right: 40, display: "flex", alignItems: "center", gap: 16, fontFamily: BODY, fontWeight: 900, color: "#fff"}}>
        <div style={{width: 26, height: 26, borderRadius: 13, background: "#ff3b3b", opacity: Math.sin(f / 5) > 0 ? 1 : 0.3}} />
        <div style={{fontSize: 38}}>Sofi_GG</div>
        <Heart size={40} />
        <div style={{marginLeft: "auto", fontSize: 34, background: "#0008", padding: "6px 16px", borderRadius: 12}}>{time}</div>
      </div>
      {/* distance map strip */}
      <div style={{position: "absolute", top: 190, left: 60, right: 60, height: 150, borderRadius: 24, background: "#0d0d14cc", border: "3px solid #ffffff44", transform: `scale(${map})`}}>
        <svg width="100%" height="100%" viewBox="0 0 960 150">
          <path d="M 80 100 Q 480 -10 880 100" stroke="#ffffff88" strokeWidth={5} strokeDasharray="14 12" fill="none" />
          <circle cx={80} cy={100} r={16} fill={CYAN} stroke="#000" strokeWidth={4} />
          <circle cx={880} cy={100} r={16} fill={PINK} stroke="#000" strokeWidth={4} />
          {(() => {
            const x = (1 - dot) * (1 - dot) * 80 + 2 * (1 - dot) * dot * 480 + dot * dot * 880;
            const y = (1 - dot) * (1 - dot) * 100 + 2 * (1 - dot) * dot * -10 + dot * dot * 100;
            return <circle cx={x} cy={y} r={11} fill={LIME} />;
          })()}
          <text x={80} y={140} fill="#fff" fontFamily={BODY} fontWeight={900} fontSize={22} textAnchor="middle">DIEGO</text>
          <text x={880} y={140} fill="#fff" fontFamily={BODY} fontWeight={900} fontSize={22} textAnchor="middle">SOFI</text>
          <text x={480} y={78} fill={LIME} fontFamily={DISPLAY} fontSize={56} textAnchor="middle">2000 KM</text>
        </svg>
      </div>
      {/* Diego PiP */}
      <div style={{position: "absolute", right: 50, top: 1040, width: 330, height: 440, borderRadius: 28, overflow: "hidden", border: `5px solid ${CYAN}`, boxShadow: `0 0 30px ${CYAN}88`, transform: `scale(${0.3 + 0.7 * pip})`, opacity: Math.min(1, pip * 1.5), transformOrigin: "100% 0%"}}>
        <DiegoRoom width={330} height={440} shot="pip" local={f} />
      </div>
      {/* floating hearts */}
      {[...Array(7)].map((_, i) => {
        const y = 1500 - ((f * (3 + (i % 3)) + i * 140) % 900);
        return <Heart key={i} size={50 + (i % 3) * 20} style={{position: "absolute", left: 60 + i * 50 + Math.sin(f / 10 + i) * 30, top: y, opacity: 0.85}} />;
      })}
    </AbsoluteFill>
  );
};

const BellyScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = spring({frame: f - 22, fps, config: {damping: 8, stiffness: 180}});
  return (
    <AbsoluteFill>
      <DiegoRoom width={1080} height={1920} shot="belly" local={f} />
      <AbsoluteFill style={{background: "#ff000014", mixBlendMode: "multiply"}} />
      <MeetHud glitchy />
      {/* stat stamp */}
      <div style={{position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
        <div style={{transform: `scale(${interpolate(stamp, [0, 1], [2.4, 1])}) rotate(-6deg)`, opacity: stamp, fontFamily: DISPLAY, fontSize: 104, color: "#ff3b3b", border: "8px solid #ff3b3b", padding: "0 36px", borderRadius: 18, background: "#0d0d14cc", textShadow: "0 0 30px #ff3b3b"}}>
          NO ESTÁ LISTO
        </div>
      </div>
      <div style={{position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, fontFamily: BODY, fontWeight: 900, fontSize: 32}}>
        {["STAMINA 2/10", "ENERGÉTICAS 6/DÍA", "SOL: 0 H"].map((x, i) => (
          <div key={x} style={{background: "#0d0d14dd", color: i === 1 ? LIME : "#fff", padding: "8px 16px", borderRadius: 12, opacity: interpolate(f, [30 + i * 6, 38 + i * 6], [0, 1], clamp)}}>
            {x}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const VotePanel: React.FC<{color: string; title: string; sub: string; item: "dumbbell" | "salad"; top: number; delay: number; flip?: boolean}> = ({color, title, sub, item, top, delay, flip}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 13}});
  return (
    <div style={{position: "absolute", left: 0, right: 0, top, height: 760, background: color, overflow: "hidden"}}>
      <AbsoluteFill style={{background: "repeating-linear-gradient(135deg, #ffffff10 0 40px, transparent 40px 80px)"}} />
      <AbsoluteFill style={{background: "radial-gradient(circle at 25% 60%, #ffffff40, transparent 55%)"}} />
      <div style={{position: "absolute", [flip ? "right" : "left"]: -20, top: 0, width: 560, height: 760, transform: `translateX(${(1 - s) * (flip ? 600 : -600)}px)`}}>
        <DiegoPose width={560} height={760} item={item} tOff={delay * 5} />
      </div>
      <div style={{position: "absolute", [flip ? "left" : "right"]: 40, width: 470, top: 220, textAlign: flip ? "left" : "right", opacity: s, transform: `translateY(${(1 - s) * 80}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 190, lineHeight: 0.9, color: "#fff", ...outline(8), textShadow: "0 10px 0 #000"}}>{title}</div>
        <div style={{marginTop: 18, fontFamily: BODY, fontWeight: 900, fontSize: 36, color: "#fff", textShadow: "0 3px 0 #000", lineHeight: 1.2}}>{sub}</div>
      </div>
    </div>
  );
};

const VoteScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vs = spring({frame: f - 16, fps, config: {damping: 7}});
  const head = spring({frame: f - 4, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: "#0d0d14"}}>
      <VotePanel color="#ff2e88" title="GYM" sub="Pesas todos los días. Adiós, sofá." item="dumbbell" top={200} delay={6} />
      <VotePanel color="#0fa36b" title="DIETA" sub="Cero energéticas, cero papitas." item="salad" top={960} delay={12} flip />
      <div style={{position: "absolute", top: 40, width: "100%", textAlign: "center", transform: `scale(${head})`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 100, color: LIME, ...outline(6), textShadow: "0 8px 0 #000"}}>TÚ DECIDES SU GLOW UP</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 850,
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
          transform: `scale(${vs}) rotate(${Math.sin(f / 3) * 5}deg)`,
          boxShadow: `0 0 ${40 + Math.sin(f / 4) * 20}px ${LIME}`,
        }}
      >
        VS
      </div>
      <div style={{position: "absolute", left: 0, right: 0, top: 1720, bottom: 0, background: "#0d0d14"}}>
        <div style={{position: "absolute", bottom: 28, width: "100%", textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#ffffffaa"}}>
          comenta GYM o DIETA · @WoloByte
        </div>
      </div>
      <Bokeh colors={["#ffffff", LIME]} count={12} />
    </AbsoluteFill>
  );
};

// ───────────────────────── Root ─────────────────────────

export const DiegoGlowUp: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const shake = useShake([CUT_CALL, CUT_BACK + 22, CUT_VOTE, CUT_VOTE + 16]);
  const capTop = frame < CUT_CALL ? 1560 : frame < CUT_BACK ? 1560 : frame < CUT_VOTE ? 1560 : 1735;
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <AbsoluteFill style={{transform: shake}}>
        <Sequence durationInFrames={CUT_CALL}>
          <IntroScene />
        </Sequence>
        <Sequence from={CUT_CALL} durationInFrames={CUT_BACK - CUT_CALL}>
          <CallScene />
        </Sequence>
        <Sequence from={CUT_BACK} durationInFrames={CUT_VOTE - CUT_BACK}>
          <BellyScene />
        </Sequence>
        <Sequence from={CUT_VOTE}>
          <VoteScene />
        </Sequence>
        <Captions words={DIEGO_CAPTIONS} top={capTop} />
      </AbsoluteFill>

      {[CUT_CALL, CUT_BACK, CUT_VOTE].map((c) => (
        <Sequence key={c} from={c} durationInFrames={12}>
          <GlitchCut />
        </Sequence>
      ))}
      <Grain />

      {/* sound design */}
      <Sequence from={0}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /></Sequence>
      <Sequence from={CUT_CALL - 4}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} /></Sequence>
      <Sequence from={CUT_CALL + 20}><Audio src={staticFile("sfx/pop.wav")} volume={0.5} /></Sequence>
      <Sequence from={CUT_BACK + 22}><Audio src={staticFile("sfx/sting.wav")} volume={0.55} /></Sequence>
      <Sequence from={CUT_VOTE}><Audio src={staticFile("sfx/impact.wav")} volume={0.65} /></Sequence>
      <Sequence from={CUT_VOTE + 16}><Audio src={staticFile("sfx/hit.wav")} volume={0.6} /></Sequence>
      {DIEGO_VOICE && <Audio src={staticFile(DIEGO_VOICE)} />}
    </AbsoluteFill>
  );
};
