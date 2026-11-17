import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {ParticleField} from "../../components/backgrounds/ParticleField";
import {ProgressBar} from "../../components/overlays/ProgressBar";

/**
 * Vertical (9:16) info video in a neon "Vice City sunset" style:
 * a hook, N numbered facts and a closing call to action.
 * Edit the text in Remotion Studio's props panel or in Root.tsx defaultProps.
 */

export type GTAFact = {title: string; subtitle: string};

export type GTAInfoProps = {
  hook: string;
  hookSub: string;
  facts: GTAFact[];
  cta: string;
  handle: string;
  /** Optional per-scene lengths in frames (e.g. to fit a voiceover). */
  timing?: {hook: number; facts: number[]; cta: number};
  /** Optional voiceover files in public/ (one per scene), e.g. "voice/01.mp3". */
  voice?: {hook?: string; facts?: string[]; cta?: string};
  /** Background style: neon sunset (default) or rainy night city with police lights. */
  theme?: "sunset" | "night";
  /** Optional single narration file in public/ that plays from frame 0. */
  voiceTrack?: string;
};

export const HOOK_FRAMES = 75;
export const FACT_FRAMES = 105;
export const CTA_FRAMES = 75;

export const resolveTiming = (p: Pick<GTAInfoProps, "facts" | "timing">) => ({
  hook: p.timing?.hook ?? HOOK_FRAMES,
  facts: p.facts.map((_, i) => p.timing?.facts[i] ?? FACT_FRAMES),
  cta: p.timing?.cta ?? CTA_FRAMES,
});

export const gtaInfoDuration = (p: Pick<GTAInfoProps, "facts" | "timing">) => {
  const t = resolveTiming(p);
  return t.hook + t.facts.reduce((a, b) => a + b, 0) + t.cta;
};

type Palette = {primary: string; secondary: string; tertiary: string; cta: string; bg: string};

const SUNSET: Palette = {primary: "#ff2e88", secondary: "#3ee6ff", tertiary: "#ff9a3d", cta: "#7b2cff", bg: "#12002b"};
const NIGHT: Palette = {primary: "#ff2d3d", secondary: "#2f7bff", tertiary: "#ffd23f", cta: "#2f7bff", bg: "#03050d"};
const PaletteCtx = React.createContext<Palette>(SUNSET);
const usePalette = () => React.useContext(PaletteCtx);

const PINK = "#ff2e88";
const ORANGE = "#ff9a3d";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";

/** Loads the bundled fonts (public/fonts) and blocks rendering until ready. */
const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat.ttf")})`, {weight: "100 900"}),
    ];
    Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
      .catch(() => undefined) // fall back to Impact instead of hanging
      .then(() => continueRender(handle));
  }, [handle]);
};

/** Keep "GTA 6" on one line. */
const nb = (t: string) => t.replace(/GTA 6/gi, (m) => m.replace(" ", "\u00a0"));

const neon = (c: string) =>
  `0 0 10px ${c}, 0 0 30px ${c}, 0 0 60px ${c}`;

/** Synthwave sunset: gradient sky, striped sun and a moving perspective grid. */
const SunsetBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const gridOffset = (frame * 4) % 80;
  const sunBob = Math.sin(frame / 40) * 8;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #12002b 0%, #3a0a5e 35%, ${PINK} 58%, ${ORANGE} 66%, #12002b 66.2%)`,
        }}
      />
      {/* Sun */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 760 + sunBob,
          width: 620,
          height: 620,
          marginLeft: -310,
          borderRadius: "50%",
          background: `linear-gradient(180deg, #ffe66d 0%, ${ORANGE} 45%, ${PINK} 100%)`,
          boxShadow: `0 0 120px ${PINK}`,
          WebkitMaskImage:
            "repeating-linear-gradient(180deg, #000 0 34px, transparent 34px 44px)",
          clipPath: "inset(0 0 50% 0)",
          opacity: 0.95,
        }}
      />
      {/* Grid floor */}
      <div
        style={{
          position: "absolute",
          left: -600,
          right: -600,
          top: 1267,
          height: 900,
          transform: "perspective(500px) rotateX(62deg)",
          transformOrigin: "top center",
          backgroundImage: `linear-gradient(${PINK} 3px, transparent 3px), linear-gradient(90deg, ${PINK} 3px, transparent 3px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `0 ${gridOffset}px`,
          opacity: 0.7,
          filter: `drop-shadow(0 0 6px ${PINK})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(18,0,43,0) 60%, rgba(18,0,43,0.9) 100%)",
        }}
      />
      <ParticleField count={40} color="rgba(255,200,255,0.5)" speed={0.4} direction="up" />
    </AbsoluteFill>
  );
};

/** Rainy night city: skyline with lit windows, red/blue police strobes and rain. */
const NightBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const pal = usePalette();
  const buildings = React.useMemo(() => {
    const out: {x: number; w: number; h: number; seed: string}[] = [];
    let x = -20;
    let i = 0;
    while (x < width + 20) {
      const w = 90 + random(`bw${i}`) * 130;
      out.push({x, w, h: 380 + random(`bh${i}`) * 520, seed: `b${i}`});
      x += w + 6;
      i++;
    }
    return out;
  }, [width]);
  const drops = React.useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => ({
        x: random(`rx${i}`) * (width + 300) - 150,
        y: random(`ry${i}`) * height,
        len: 40 + random(`rl${i}`) * 60,
        speed: 38 + random(`rs${i}`) * 22,
        o: 0.15 + random(`ro${i}`) * 0.35,
      })),
    [width, height],
  );
  // Police strobe: red and blue alternate in quick double-flashes.
  const phase = frame % 24;
  const red = phase < 3 || (phase >= 5 && phase < 8) ? 1 : 0.25;
  const blue = (phase >= 12 && phase < 15) || (phase >= 17 && phase < 20) ? 1 : 0.25;
  const ground = 1450;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: "linear-gradient(180deg, #02030a 0%, #0a1430 45%, #1b2350 72%, #05070f 100%)"}} />
      <div style={{position: "absolute", left: -300, top: 820, width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, ${pal.primary} 0%, transparent 65%)`, opacity: 0.8 * red, filter: "blur(30px)"}} />
      <div style={{position: "absolute", right: -300, top: 820, width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, ${pal.secondary} 0%, transparent 65%)`, opacity: 0.85 * blue, filter: "blur(30px)"}} />
      {buildings.map((b) => {
        const cols = Math.floor(b.w / 34);
        const rows = Math.floor(b.h / 46);
        return (
          <div key={b.seed} style={{position: "absolute", left: b.x, top: ground - b.h, width: b.w, height: b.h,
            background: "linear-gradient(180deg, #0b1022, #05070f)", borderTop: "2px solid rgba(120,150,255,0.15)"}}>
            {new Array(rows * cols).fill(0).map((_, k) => {
              const lit = random(`${b.seed}w${k}`) > 0.62;
              if (!lit) return null;
              const flicker = random(`${b.seed}f${k}`) > 0.97 && Math.floor(frame / 9) % 2 === 0 ? 0.3 : 1;
              return (
                <div key={k} style={{position: "absolute", left: 10 + (k % cols) * 34, top: 16 + Math.floor(k / cols) * 46,
                  width: 16, height: 22, background: random(`${b.seed}c${k}`) > 0.8 ? "#9fd3ff" : "#ffd27a",
                  opacity: 0.75 * flicker, boxShadow: "0 0 8px rgba(255,210,122,0.6)"}} />
              );
            })}
          </div>
        );
      })}
      {/* Wet street reflecting the strobes */}
      <div style={{position: "absolute", left: 0, right: 0, top: ground, bottom: 0,
        background: `linear-gradient(180deg, rgba(10,14,30,0.95), #02030a), linear-gradient(90deg, ${pal.primary}55, transparent 40%, transparent 60%, ${pal.secondary}55)`,
        backgroundBlendMode: "screen"}} />
      <div style={{position: "absolute", left: 0, right: 0, top: ground, height: 6,
        background: `linear-gradient(90deg, ${pal.primary}, #ffffff, ${pal.secondary})`, opacity: 0.35, filter: "blur(2px)"}} />
      {drops.map((d, i) => {
        const y = ((d.y + frame * d.speed) % (height + 200)) - 100;
        const x = d.x + (y / height) * 120;
        return (
          <div key={i} style={{position: "absolute", left: x, top: y, width: 2, height: d.len,
            background: "linear-gradient(180deg, transparent, rgba(200,220,255,0.9))", opacity: d.o, transform: "rotate(-6deg)"}} />
        );
      })}
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)"}} />
    </AbsoluteFill>
  );
};

/** Fade in/out wrapper for a scene of the given length. */
const useSceneOpacity = (length: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 8, length - 10, length], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const Hook: React.FC<{hook: string; sub: string; length: number}> = ({hook, sub, length}) => {
  const {primary: PINK, secondary: CYAN, bg} = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = useSceneOpacity(length);
  const pop = spring({frame, fps, config: {damping: 9, stiffness: 140}});
  const shake = frame < 20 ? Math.sin(frame * 2.5) * (20 - frame) * 0.6 : 0;
  const subIn = interpolate(frame, [15, 30], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 300, opacity}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 136,
          lineHeight: 1,
          color: "#fff",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "0 70px",
          transform: `scale(${pop}) translateX(${shake}px) rotate(-3deg)`,
          textShadow: neon(PINK),
        }}
      >
        {nb(hook)}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 50,
          color: CYAN,
          letterSpacing: 6,
          background: `${bg}cc`,
          padding: "12px 36px",
          borderRadius: 50,
          textTransform: "uppercase",
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 30}px)`,
          textShadow: neon(CYAN),
        }}
      >
        {sub}
      </div>
    </AbsoluteFill>
  );
};

const Fact: React.FC<{index: number; fact: GTAFact; length: number}> = ({index, fact, length}) => {
  const {primary: PINK, secondary: CYAN, tertiary: ORANGE, bg} = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = useSceneOpacity(length);
  const numPop = spring({frame, fps, config: {damping: 10, stiffness: 120}});
  const titleIn = spring({frame: frame - 8, fps, config: {damping: 14}});
  const barW = interpolate(frame, [14, 34], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subIn = interpolate(frame, [22, 38], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const accent = [PINK, CYAN, ORANGE][index % 3];

  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 220, opacity}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 300,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `6px ${accent}`,
          filter: `drop-shadow(0 0 20px ${accent})`,
          transform: `scale(${numPop}) rotate(${(1 - numPop) * -20}deg)`,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: DISPLAY,
          fontSize: 120,
          lineHeight: 1.02,
          color: "#fff",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "0 70px",
          transform: `translateX(${(1 - titleIn) * -500}px)`,
          opacity: titleIn,
          textShadow: "0 6px 0 rgba(0,0,0,0.35)",
        }}
      >
        {nb(fact.title)}
      </div>
      <div
        style={{
          marginTop: 30,
          height: 10,
          width: `${barW * 6}px`,
          background: accent,
          borderRadius: 5,
          boxShadow: neon(accent),
        }}
      />
      <div
        style={{
          marginTop: 36,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 52,
          lineHeight: 1.25,
          color: "#fff",
          textAlign: "center",
          padding: "18px 40px",
          margin: "36px 80px 0",
          background: `${bg}99`,
          borderRadius: 24,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 40}px)`,
        }}
      >
        {fact.subtitle}
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{cta: string; handle: string}> = ({cta, handle}) => {
  const {cta: PURPLE, secondary: CYAN, bg} = usePalette();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 8, stiffness: 150}});
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 420, opacity: fadeIn}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 130,
          lineHeight: 1.02,
          color: "#fff",
          textAlign: "center",
          textTransform: "uppercase",
          padding: "0 70px",
          transform: `scale(${pop})`,
          textShadow: neon(PURPLE),
        }}
      >
        {nb(cta)}
      </div>
      <div
        style={{
          marginTop: 50,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 56,
          color: bg,
          background: CYAN,
          padding: "20px 50px",
          borderRadius: 60,
          transform: `scale(${pop * pulse})`,
          boxShadow: neon(CYAN),
        }}
      >
        {handle}
      </div>
    </AbsoluteFill>
  );
};

export const GTAInfo: React.FC<GTAInfoProps> = (props) => {
  const {hook, hookSub, facts, cta, handle, voice, voiceTrack, theme} = props;
  const pal = theme === "night" ? NIGHT : SUNSET;
  useFonts();
  const t = resolveTiming(props);
  const factStart = (i: number) => t.hook + t.facts.slice(0, i).reduce((a, b) => a + b, 0);
  const ctaStart = factStart(facts.length);
  const vo = (src?: string) => (src ? <Audio src={staticFile(src)} /> : null);

  return (
    <PaletteCtx.Provider value={pal}>
    <AbsoluteFill style={{backgroundColor: pal.bg}}>
      {theme === "night" ? <NightBackground /> : <SunsetBackground />}
      {voiceTrack ? <Audio src={staticFile(voiceTrack)} /> : null}
      <Sequence durationInFrames={t.hook}>
        <Hook hook={hook} sub={hookSub} length={t.hook} />
        {vo(voice?.hook)}
      </Sequence>
      {facts.map((fact, i) => (
        <Sequence key={i} from={factStart(i)} durationInFrames={t.facts[i]}>
          <Fact index={i} fact={fact} length={t.facts[i]} />
          {vo(voice?.facts?.[i])}
        </Sequence>
      ))}
      <Sequence from={ctaStart}>
        <CTA cta={cta} handle={handle} />
        {vo(voice?.cta)}
      </Sequence>
      <ProgressBar color={pal.primary} height={10} position="top" />
    </AbsoluteFill>
    </PaletteCtx.Provider>
  );
};
