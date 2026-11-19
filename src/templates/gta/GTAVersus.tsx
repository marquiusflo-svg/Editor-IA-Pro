import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {ParticleField} from "../../components/backgrounds/ParticleField";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {nb, neon, useFonts} from "./GTAInfo";

/**
 * "GTA 6 vs real life": a neon map of Florida draws itself, a pin drops on each place,
 * and a VS card pairs the in-game name with the real one at the moment the voice says it.
 * Word-by-word captions follow the narration.
 */

export type VersusItem = {
  game: string;
  real: string;
  lat?: number;
  lon?: number;
  /** Light up the whole state instead of one spot. */
  wholeState?: boolean;
  /** Frame (from the item's start) when the real name is revealed. */
  reveal: number;
};

export type CaptionWord = {text: string; start: number; end: number};

export type GTAVersusProps = {
  badge: string;
  hook: string;
  items: VersusItem[];
  cta: string;
  ctaSub: string;
  handle: string;
  timing: {hook: number; items: number[]; cta: number};
  captions?: CaptionWord[];
  voiceTrack?: string;
  autoSfx?: boolean;
  /**
   * Photo mode: full-screen images in public/ instead of the map, one per scene
   * ([hook, item1..itemN], the hook image returns for the CTA). Cards move to the top.
   */
  backgrounds?: string[];
  /** Label above the in-game name (default "En GTA 6"). */
  gameLabel?: string;
  /** Label above the right-hand (real) name. Defaults to "En la vida real". */
  realLabel?: string;
};

export const gtaVersusDuration = (t: GTAVersusProps["timing"]) =>
  t.hook + t.items.reduce((a, b) => a + b, 0) + t.cta;

const PINK = "#ff2e88";
const CYAN = "#3ee6ff";
const GOLD = "#ffd23f";
const BG = "#0d0221";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// ---------- Map geometry (equirectangular, scaled for Florida's latitude) ----------
const K = 100;
const COS = 0.883;
const MAP_LEFT = 189;
const MAP_TOP = 300;
const proj = (lat: number, lon: number) => ({x: (lon + 87.8) * K * COS, y: (31.15 - lat) * K});

const FLORIDA: [number, number][] = [
  [31.0, -87.6], [31.0, -85.0], [30.7, -84.9], [30.65, -83.6], [30.6, -82.4], [30.7, -82.05], [30.7, -81.45],
  [30.3, -81.4], [29.9, -81.3], [29.2, -81.0], [28.6, -80.6], [28.0, -80.5], [27.2, -80.2], [26.7, -80.03],
  [26.1, -80.1], [25.77, -80.13], [25.4, -80.3], [25.2, -80.4], [25.1, -80.9], [25.3, -81.15], [25.9, -81.7],
  [26.4, -81.9], [26.7, -82.2], [27.3, -82.55], [27.7, -82.75], [28.2, -82.75], [28.9, -82.7], [29.15, -83.05],
  [29.7, -83.5], [30.05, -84.0], [29.9, -84.4], [29.65, -84.9], [29.7, -85.35], [30.1, -85.7], [30.35, -86.3],
  [30.38, -86.9], [30.3, -87.3], [30.28, -87.55],
];
const KEYS: [number, number][] = [
  [25.1, -80.45], [24.92, -80.63], [24.8, -80.85], [24.72, -81.05], [24.67, -81.4], [24.6, -81.6], [24.56, -81.78],
];
const FLORIDA_PATH =
  FLORIDA.map(([la, lo], i) => {
    const p = proj(la, lo);
    return `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ") + " Z";
const OKEE = proj(26.95, -80.83);

// ---------- Background: Vice City dusk with ocean and palms ----------
const Palm: React.FC<{x: number; flip?: boolean; scale?: number; sway: number}> = ({x, flip, scale = 1, sway}) => (
  <svg
    width={420 * scale}
    height={900 * scale}
    viewBox="0 0 420 900"
    style={{position: "absolute", left: x, top: 1330 - 900 * scale, transform: flip ? "scaleX(-1)" : undefined}}
  >
    <path d="M200 900 C 190 700, 170 500, 215 230" stroke="#07010f" strokeWidth={26} fill="none" strokeLinecap="round" />
    <g transform={`rotate(${sway} 215 230)`} fill="#07010f">
      {[-160, -120, -75, -30, 15, 60, 110, 150].map((a, i) => (
        <path
          key={i}
          transform={`rotate(${a} 215 230)`}
          d="M215 230 C 260 200, 330 205, 395 250 C 330 228, 270 228, 215 240 Z"
        />
      ))}
    </g>
  </svg>
);

const ViceBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 22) * 3;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #0d0221 0%, #2a0a4a 30%, #6a1466 52%, ${PINK} 64%, #ff8a3d 69%, #2a0a4a 69.2%, #0b0626 100%)`,
        }}
      />
      {/* Sun glow on the horizon */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 1050,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,214,120,0.55) 0%, rgba(255,46,136,0.25) 40%, transparent 70%)",
        }}
      />
      {/* Ocean: moving light streaks */}
      {new Array(14).fill(0).map((_, i) => {
        const y = 1335 + i * i * 3.2 + i * 8;
        const w = 120 + random(`w${i}`) * 380;
        const x = ((random(`x${i}`) * 1400 + frame * (1.2 + i * 0.15)) % 1500) - 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: 3 + i * 0.35,
              borderRadius: 3,
              background: i % 2 ? "rgba(255,138,61,0.35)" : "rgba(255,46,136,0.3)",
            }}
          />
        );
      })}
      <Palm x={-170} sway={sway} />
      <Palm x={860} flip sway={-sway} scale={0.85} />
      <ParticleField count={35} color="rgba(255,220,255,0.45)" speed={0.35} direction="up" />
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)"}} />
    </AbsoluteFill>
  );
};

// ---------- Photo mode: cinematic stills with slow zoom and crossfades ----------
const PhotoScene: React.FC<{src: string; length: number; seed: number}> = ({src, length, seed}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], clamp);
  const zoom = interpolate(frame, [0, length + 12], [1.12, 1.0], clamp);
  const dir = seed % 2 ? 1 : -1;
  const pan = interpolate(frame, [0, length + 12], [-18 * dir, 18 * dir], clamp);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img
        src={staticFile(src)}
        style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateX(${pan}px)`}}
      />
    </AbsoluteFill>
  );
};

const PhotoBackground: React.FC<{images: string[]; segments: [number, number][]}> = ({images, segments}) => (
  <AbsoluteFill style={{backgroundColor: "#000"}}>
    {segments.map(([from, len], i) => (
      <Sequence key={i} from={Math.max(0, from - 12)} durationInFrames={len + 24}>
        <PhotoScene src={images[i < images.length ? i : 0]} length={len} seed={i} />
      </Sequence>
    ))}
    {/* Readability: dark top for the cards, dark bottom for the captions, soft vignette */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.7) 100%)",
      }}
    />
    <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)"}} />
  </AbsoluteFill>
);

// ---------- Map with pins ----------
const Pin: React.FC<{x: number; y: number; age: number; current: boolean; color: string}> = ({x, y, age, current, color}) => {
  const {fps} = useVideoConfig();
  const drop = spring({frame: age, fps, config: {damping: 9, stiffness: 160}});
  const ty = (1 - drop) * -260;
  const ring = (age % 36) / 36;
  const size = current ? 54 : 30;
  return (
    <g transform={`translate(${x} ${y})`} opacity={current ? 1 : 0.55}>
      {current && age > 6 ? (
        <circle r={10 + ring * 70} fill="none" stroke={color} strokeWidth={4} opacity={1 - ring} />
      ) : null}
      <g transform={`translate(0 ${ty})`}>
        <path
          d={`M0 0 C ${-size * 0.15} ${-size * 0.4}, ${-size * 0.5} ${-size * 0.55}, ${-size * 0.5} ${-size * 0.9}
              A ${size * 0.5} ${size * 0.5} 0 1 1 ${size * 0.5} ${-size * 0.9}
              C ${size * 0.5} ${-size * 0.55}, ${size * 0.15} ${-size * 0.4}, 0 0 Z`}
          fill={color}
          stroke="#fff"
          strokeWidth={current ? 4 : 2}
          style={{filter: `drop-shadow(0 0 10px ${color})`}}
        />
        <circle cy={-size * 0.9} r={size * 0.2} fill="#fff" />
      </g>
    </g>
  );
};

const FloridaMap: React.FC<{
  items: VersusItem[];
  starts: number[];
  ctaStart: number;
}> = ({items, starts, ctaStart}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [4, 50], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const active = starts.reduce((acc, s, i) => (frame >= s ? i : acc), -1);
  const stateGlow = items.some((it, i) => it.wholeState && i === active)
    ? 0.35 + 0.15 * Math.sin((frame - starts[active]) / 5)
    : 0.08;
  const allPulse = frame >= ctaStart ? 0.5 + 0.5 * Math.sin((frame - ctaStart) / 4) : 0;

  return (
    <svg
      width={710}
      height={690}
      viewBox="-4 -4 710 690"
      style={{position: "absolute", left: MAP_LEFT, top: MAP_TOP, overflow: "visible"}}
    >
      <path d={FLORIDA_PATH} fill={CYAN} opacity={stateGlow * draw} />
      <path
        d={FLORIDA_PATH}
        fill="none"
        stroke={CYAN}
        strokeWidth={6}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        style={{filter: `drop-shadow(0 0 12px ${CYAN}) drop-shadow(0 0 4px #fff)`}}
      />
      <ellipse cx={OKEE.x} cy={OKEE.y} rx={22} ry={18} fill="none" stroke={CYAN} strokeWidth={3} opacity={draw * 0.7} />
      {KEYS.map(([la, lo], i) => {
        const p = proj(la, lo);
        return <circle key={i} cx={p.x} cy={p.y} r={6} fill={CYAN} opacity={draw} />;
      })}
      {items.map((it, i) => {
        if (it.wholeState || it.lat === undefined || it.lon === undefined || frame < starts[i]) return null;
        const p = proj(it.lat, it.lon);
        const color = i === active && frame < ctaStart ? PINK : GOLD;
        return (
          <g key={i} opacity={frame >= ctaStart ? 0.7 + 0.3 * allPulse : 1}>
            <Pin x={p.x} y={p.y} age={frame - starts[i] - 4} current={i === active && frame < ctaStart} color={color} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Cards ----------
const Label: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: 34,
      letterSpacing: 6,
      color,
      textTransform: "uppercase",
      background: "rgba(13,2,33,0.8)",
      borderRadius: 30,
      padding: "6px 24px",
      marginBottom: 6,
    }}
  >
    {text}
  </div>
);

const VersusCard: React.FC<{item: VersusItem; length: number; top?: number; label?: string; realLabel?: string}> = ({item, length, top = 1040, label = "En GTA 6", realLabel = "En la vida real"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [length - 8, length], [1, 0], clamp);
  const gameIn = spring({frame: frame - 4, fps, config: {damping: 13}});
  const vsIn = spring({frame: frame - (item.reveal - 6), fps, config: {damping: 7, stiffness: 180}});
  const realIn = spring({frame: frame - item.reveal, fps, config: {damping: 12}});
  return (
    <div style={{position: "absolute", left: 0, right: 0, top, opacity: out, textAlign: "center"}}>
      <div style={{transform: `translateX(${(1 - gameIn) * -700}px)`, opacity: gameIn}}>
        <Label text={label} color={PINK} />
        <div style={{fontFamily: DISPLAY, fontSize: item.game.length > 14 ? 88 : 112, lineHeight: 1.02, color: "#fff", textShadow: neon(PINK), padding: "0 60px"}}>
          {nb(item.game.toUpperCase())}
        </div>
      </div>
      <div
        style={{
          margin: "14px auto",
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: GOLD,
          color: BG,
          fontFamily: DISPLAY,
          fontSize: 54,
          lineHeight: "96px",
          transform: `scale(${vsIn}) rotate(${(1 - vsIn) * 180}deg)`,
          boxShadow: neon(GOLD),
        }}
      >
        VS
      </div>
      <div style={{transform: `translateX(${(1 - realIn) * 700}px)`, opacity: realIn}}>
        <Label text={realLabel} color={CYAN} />
        <div style={{fontFamily: DISPLAY, fontSize: item.real.length > 14 ? 88 : 112, lineHeight: 1.02, color: "#fff", textShadow: neon(CYAN), padding: "0 60px"}}>
          {item.real.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const HookCard: React.FC<{text: string; length: number; top?: number}> = ({text, length, top = 1080}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 8, stiffness: 150}});
  const out = interpolate(frame, [length - 8, length], [1, 0], clamp);
  const shake = frame < 18 ? Math.sin(frame * 2.7) * (18 - frame) * 0.7 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top,
        textAlign: "center",
        fontFamily: DISPLAY,
        fontSize: 132,
        lineHeight: 1.0,
        color: "#fff",
        textTransform: "uppercase",
        textShadow: neon(PINK),
        opacity: out,
        transform: `scale(${pop}) translateX(${shake}px) rotate(-2deg)`,
      }}
    >
      {nb(text)}
    </div>
  );
};

const CtaCard: React.FC<{cta: string; sub: string; handle: string; top?: number}> = ({cta, sub, handle, top = 1040}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 8, stiffness: 150}});
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <div style={{position: "absolute", left: 40, right: 40, top, textAlign: "center"}}>
      <div style={{fontFamily: DISPLAY, fontSize: 120, lineHeight: 1.02, color: "#fff", textShadow: neon(PINK), transform: `scale(${pop})`}}>
        {cta.toUpperCase()}
      </div>
      <div style={{marginTop: 18, fontFamily: BODY, fontWeight: 800, fontSize: 46, color: GOLD, letterSpacing: 4, opacity: pop}}>
        {sub.toUpperCase()}
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 30,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 56,
          color: BG,
          background: CYAN,
          padding: "18px 48px",
          borderRadius: 60,
          transform: `scale(${pop * pulse})`,
          boxShadow: neon(CYAN),
        }}
      >
        {handle}
      </div>
    </div>
  );
};

// ---------- Karaoke captions ----------
const Captions: React.FC<{words: CaptionWord[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const idx = words.findIndex((w) => frame >= w.start && frame < w.end + 6);
  if (idx < 0) return null;
  // Pages of up to 4 words, split on sentence ends.
  let pageStart = 0;
  const pages: [number, number][] = [];
  for (let i = 0; i < words.length; i++) {
    const end = /[.?!,:]$/.test(words[i].text) || i - pageStart === 3 || i === words.length - 1;
    if (end) {
      pages.push([pageStart, i]);
      pageStart = i + 1;
    }
  }
  const [a, b] = pages.find(([s, e]) => idx >= s && idx <= e) ?? [idx, idx];
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1590,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 30px",
      }}
    >
      {words.slice(a, b + 1).map((w, k) => {
        const i = a + k;
        const on = i === idx;
        const pop = on ? interpolate(frame - w.start, [0, 4], [1.18, 1.08], clamp) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 62,
              textTransform: "uppercase",
              color: on ? GOLD : "#fff",
              transform: `scale(${pop})`,
              display: "inline-block",
              WebkitTextStroke: "3px #0d0221",
              paintOrder: "stroke fill",
              textShadow: "0 6px 0 rgba(0,0,0,0.45)",
              opacity: i <= idx ? 1 : 0.85,
            }}
          >
            {w.text.replace(/[,.:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Composition ----------
export const GTAVersus: React.FC<GTAVersusProps> = (props) => {
  const {badge, hook, items, cta, ctaSub, handle, timing, captions, voiceTrack, autoSfx, backgrounds, gameLabel, realLabel} = props;
  const photo = Boolean(backgrounds && backgrounds.length);
  useFonts();
  const frame = useCurrentFrame();
  const starts = items.map((_, i) => timing.hook + timing.items.slice(0, i).reduce((a, b) => a + b, 0));
  const ctaStart = timing.hook + timing.items.reduce((a, b) => a + b, 0);
  const active = starts.reduce((acc, s, i) => (frame >= s && frame < ctaStart ? i : acc), -1);

  // Sound cues [file, frame, volume] and the punch-zoom hits they drive.
  const cues: [string, number, number][] = [];
  if (autoSfx) {
    cues.push(["sfx/impact.wav", 0, 0.45]);
    items.forEach((it, i) => {
      cues.push(["sfx/whoosh.wav", Math.max(0, starts[i] - 7), 0.35], ["sfx/pop.wav", starts[i] + 8, 0.35]);
      cues.push(["sfx/hit.wav", starts[i] + it.reveal, 0.45]);
    });
    cues.push(["sfx/whoosh.wav", ctaStart - 7, 0.35], ["sfx/sting.wav", ctaStart + 2, 0.4]);
  }
  const hits = [0, ...items.map((it, i) => starts[i] + it.reveal), ctaStart];
  const lastHit = hits.filter((h) => frame >= h).pop() ?? -100;
  const punch = 1 + 0.04 * Math.exp(-(frame - lastHit) / 4);
  const shake = frame - lastHit < 8 ? Math.sin((frame - lastHit) * 3.1) * (8 - (frame - lastHit)) * 1.2 : 0;

  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {photo ? (
        <PhotoBackground
          images={backgrounds as string[]}
          segments={[[0, timing.hook], ...items.map((_, i) => [starts[i], timing.items[i]] as [number, number]), [ctaStart, timing.cta]]}
        />
      ) : (
        <ViceBackground />
      )}
      <AbsoluteFill style={{transform: `scale(${punch}) translate(${shake}px, ${shake * 0.4}px)`}}>
        {photo ? null : <FloridaMap items={items} starts={starts} ctaStart={ctaStart} />}
        {/* Top badge + counter */}
        <div style={{position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18}}>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: 3,
              color: "#fff",
              background: "rgba(13,2,33,0.75)",
              border: `3px solid ${PINK}`,
              borderRadius: 50,
              padding: "12px 34px",
              boxShadow: neon(PINK),
            }}
          >
            {nb(badge.toUpperCase())}
          </div>
          {active >= 0 ? (
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 48,
                color: BG,
                background: GOLD,
                borderRadius: 50,
                padding: "8px 28px",
                boxShadow: neon(GOLD),
              }}
            >
              {active + 1}/{items.length}
            </div>
          ) : null}
        </div>
        <Sequence durationInFrames={timing.hook} layout="none">
          <HookCard text={hook} length={timing.hook} top={photo ? 330 : 1080} />
        </Sequence>
        {items.map((it, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={timing.items[i]} layout="none">
            <VersusCard item={it} length={timing.items[i]} top={photo ? 280 : 1040} label={gameLabel} realLabel={realLabel} />
          </Sequence>
        ))}
        <Sequence from={ctaStart} layout="none">
          <CtaCard cta={cta} sub={ctaSub} handle={handle} top={photo ? 300 : 1040} />
        </Sequence>
      </AbsoluteFill>
      {captions ? <Captions words={captions} /> : null}
      <ProgressBar color={PINK} height={10} position="top" />
      {voiceTrack ? <Audio src={staticFile(voiceTrack)} /> : null}
      {cues.map(([src, at, vol], i) => (
        <Sequence key={`sfx${i}`} from={at} layout="none">
          <Audio src={staticFile(src)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
