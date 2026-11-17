import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
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

const PINK = "#ff2e88";
const PURPLE = "#7b2cff";
const ORANGE = "#ff9a3d";
const CYAN = "#3ee6ff";
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

/** Fade in/out wrapper for a scene of the given length. */
const useSceneOpacity = (length: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 8, length - 10, length], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const Hook: React.FC<{hook: string; sub: string; length: number}> = ({hook, sub, length}) => {
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
          background: "rgba(18,0,43,0.7)",
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
          background: "rgba(18,0,43,0.55)",
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
          color: "#12002b",
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
  const {hook, hookSub, facts, cta, handle, voice} = props;
  useFonts();
  const t = resolveTiming(props);
  const factStart = (i: number) => t.hook + t.facts.slice(0, i).reduce((a, b) => a + b, 0);
  const ctaStart = factStart(facts.length);
  const vo = (src?: string) => (src ? <Audio src={staticFile(src)} /> : null);

  return (
    <AbsoluteFill style={{backgroundColor: "#12002b"}}>
      <SunsetBackground />
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
      <ProgressBar color={PINK} height={10} position="top" />
    </AbsoluteFill>
  );
};
