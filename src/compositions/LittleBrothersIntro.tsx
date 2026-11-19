import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/** 3-second 8-bit intro for the Little Brothers gameplay channel (1920x1080, 30 fps). */
export const LITTLE_BROTHERS_INTRO_FRAMES = 90;

const BG = "#0f0a1e";
const CYAN = "#22d3ee";
const PINK = "#f472b6";
const YELLOW = "#facc15";
const PIXEL = "'Press Start 2P', monospace";

const usePixelFont = () => {
  const [handle] = useState(() => delayRender("Loading Press Start 2P"));
  useEffect(() => {
    new FontFace("Press Start 2P", `url(${staticFile("fonts/PressStart2P-Regular.ttf")})`)
      .load()
      .then((f) => document.fonts.add(f))
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
};

/** Night sky, twinkling pixel stars and a scrolling neon floor grid. */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const horizon = 860;
  const scroll = (frame * 3) % 40;
  const lines = [];
  for (let i = 0; i < 9; i++) {
    const t = (i * 40 + scroll) / 360;
    const y = horizon + t * t * 260;
    lines.push(<rect key={i} x={0} y={y} width={1920} height={3} fill={PINK} opacity={0.2 + t * 0.5} />);
  }
  const rays = [];
  for (let k = -16; k <= 16; k++) {
    rays.push(
      <line key={k} x1={960 + k * 30} y1={horizon} x2={960 + k * 200} y2={1080} stroke={CYAN} strokeWidth={2} opacity={0.25} />,
    );
  }
  const stars = Array.from({length: 60}, (_, i) => {
    const x = Math.floor(random(`sx${i}`) * 1900);
    const y = Math.floor(random(`sy${i}`) * 820);
    const on = Math.sin(frame / 4 + i) > -0.3;
    const c = [CYAN, PINK, YELLOW, "#fff"][i % 4];
    return <rect key={i} x={x - (x % 8)} y={y - (y % 8)} width={8} height={8} fill={c} opacity={on ? 0.85 : 0.2} />;
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${BG} 0%, #2a1650 60%, #5b1a6e 79.6%, ${BG} 79.7%, #1a0b2e 100%)`}} />
      <svg width={1920} height={1080} style={{position: "absolute"}} shapeRendering="crispEdges">
        {stars}
        <rect x={0} y={horizon - 3} width={1920} height={5} fill={PINK} />
        {rays}
        {lines}
      </svg>
    </AbsoluteFill>
  );
};

/** A pixel face that drops in from above and bobs once it lands. */
const Face: React.FC<{src: string; x: number; y: number; delay: number; size: number}> = ({src, x, y, delay, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 160, mass: 0.8}});
  const landed = frame - delay - 8;
  const squash = landed >= 0 && landed < 6 ? Math.sin((landed / 6) * Math.PI) * 0.12 : 0;
  const bob = landed > 6 ? Math.round(Math.sin((frame - delay) / 5) * 2) * 4 : 0;
  const ty = interpolate(drop, [0, 1], [-700, 0]) + bob;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        imageRendering: "pixelated",
        transform: `translateY(${ty}px) scale(${1 + squash}, ${1 - squash})`,
        transformOrigin: "50% 90%",
      }}
    />
  );
};

/** Text with the hard offset shadow used on the logo. */
const PixelText: React.FC<{text: string; size: number; shadow: string; style?: React.CSSProperties}> = ({text, size, shadow, style}) => (
  <div
    style={{
      fontFamily: PIXEL,
      fontSize: size,
      color: "#fff",
      textShadow: `${Math.round(size / 14)}px ${Math.round(size / 14)}px 0 ${shadow}`,
      whiteSpace: "pre",
      ...style,
    }}
  >
    {text}
  </div>
);

/** Closing transition: the screen fills with pixel blocks. */
const PixelWipe: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const cell = 80;
  const blocks = [];
  for (let gy = 0; gy < 1080 / cell; gy++) {
    for (let gx = 0; gx < 1920 / cell; gx++) {
      const d = Math.abs(gx - 11.5) / 12 + Math.abs(gy - 6.5) / 7;
      const s = interpolate(t, [d * 4, d * 4 + 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
      if (s <= 0) continue;
      blocks.push(
        <rect key={`${gx}-${gy}`} x={gx * cell + (cell * (1 - s)) / 2} y={gy * cell + (cell * (1 - s)) / 2} width={cell * s} height={cell * s} fill={BG} />,
      );
    }
  }
  return (
    <svg width={1920} height={1080} style={{position: "absolute"}} shapeRendering="crispEdges">
      {blocks}
    </svg>
  );
};

export const LittleBrothersIntro: React.FC = () => {
  usePixelFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const little = "LITTLE";
  const lettersShown = Math.max(0, Math.min(little.length, Math.floor((frame - 26) / 2) + 1));
  const brothersIn = spring({frame: frame - 36, fps, config: {damping: 13, stiffness: 140}});
  const glitch = frame >= 36 && frame < 44 ? (frame % 2 === 0 ? 12 : -12) : 0;
  const pressVisible = frame >= 50 && Math.floor((frame - 50) / 5) % 2 === 0;
  const flash = interpolate(frame, [0, 6], [1, 0], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: "hidden"}}>
      <Audio src={staticFile("assets/little-brothers/intro-sfx.wav")} />
      <Background />

      <Face src="assets/little-brothers/azul.svg" x={960 - 300} y={340} delay={4} size={336} />
      <Face src="assets/little-brothers/rosado.svg" x={960 + 300} y={340} delay={9} size={336} />
      <Face src="assets/little-brothers/plomo.svg" x={960} y={260} delay={14} size={336} />

      <AbsoluteFill style={{alignItems: "center"}}>
        <PixelText
          text={little.slice(0, lettersShown).padEnd(little.length, " ")}
          size={120}
          shadow={PINK}
          style={{position: "absolute", top: 560}}
        />
        <PixelText
          text="BROTHERS"
          size={104}
          shadow={CYAN}
          style={{
            position: "absolute",
            top: 720,
            opacity: frame >= 36 ? 1 : 0,
            transform: `translateX(${interpolate(brothersIn, [0, 1], [1400, 0]) + glitch}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 900,
            fontFamily: PIXEL,
            fontSize: 36,
            color: YELLOW,
            opacity: pressVisible ? 1 : 0,
          }}
        >
          PRESS START ▶ 3P
        </div>
      </AbsoluteFill>

      <PixelWipe start={76} />
      <AbsoluteFill style={{backgroundColor: BG, opacity: flash}} />
    </AbsoluteFill>
  );
};
