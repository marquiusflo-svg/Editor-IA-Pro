import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {nb, useFonts} from "./GTAInfo";

/**
 * WoloByte house style: ~5 s scenes over cinematic AI stills (modern Vice City look),
 * a GTA-style impact title per scene, CapCut-style pop-in captions with highlighted
 * keywords, film grain, neon light leaks and a comment / follow close.
 */

export type StoryWord = {text: string; start: number; end: number};

export type StoryScene = {
  /** Full-screen image in public/. */
  bg: string;
  /** On-screen title. */
  title: string;
  /** "impact" = Anton with thick stroke (Pricedown look); "body" = Montserrat ExtraBold. */
  font?: "impact" | "body";
  /** Small line under the title. */
  sub?: string;
  /** Extra zoom anchored at the bottom, to push unwanted details at the top out of frame (e.g. 1.3). */
  crop?: number;
};

export type GTAStoryProps = {
  scenes: StoryScene[];
  /** Frames per scene, same length as scenes. */
  timing: number[];
  captions?: StoryWord[];
  /** Words (case/accents ignored) to highlight in the captions. */
  keywords?: string[];
  voiceTrack?: string;
  handle: string;
  autoSfx?: boolean;
};

export const gtaStoryDuration = (timing: number[]) => timing.reduce((a, b) => a + b, 0);

const PINK = "#ff2e9a";
const CYAN = "#2ef2ff";
const YELLOW = "#ffe500";
const ORANGE = "#ff8a1f";
const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Montserrat', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const norm = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@]/g, "");

// ---------- Background: Ken Burns stills, grade, light leak, grain ----------
const Still: React.FC<{src: string; length: number; seed: number; crop?: number}> = ({src, length, seed, crop = 1}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8], [0, 1], clamp);
  const zoomIn = seed % 2 === 0;
  const zoom = interpolate(frame, [0, length + 8], zoomIn ? [1.06, 1.2] : [1.2, 1.06], clamp);
  const dir = seed % 3 === 0 ? 1 : -1;
  const pan = interpolate(frame, [0, length + 8], [-30 * dir, 30 * dir], clamp);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom * crop}) translateX(${pan}px)`,
          transformOrigin: crop > 1 ? "50% 100%" : "50% 50%",
          filter: "saturate(1.25) contrast(1.08)",
        }}
      />
    </AbsoluteFill>
  );
};

const LightLeak: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 16], [0, 1], clamp);
  const op = interpolate(frame, [0, 4, 16], [0, 0.75, 0], clamp);
  const color = [PINK, CYAN, ORANGE][seed % 3];
  return (
    <AbsoluteFill
      style={{
        opacity: op,
        mixBlendMode: "screen",
        background: `linear-gradient(${110 + seed * 40}deg, transparent ${t * 100 - 40}%, ${color} ${t * 100}%, transparent ${t * 100 + 40}%)`,
      }}
    />
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill style={{opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none"}}>
      <svg width="100%" height="100%">
        <filter id={`grain${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Title ----------
const Title: React.FC<{scene: StoryScene; length: number; seed: number}> = ({scene, length, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 3, fps, config: {damping: 9, stiffness: 160}});
  const out = interpolate(frame, [length - 6, length], [1, 0], clamp);
  const impact = (scene.font ?? "impact") === "impact";
  const shadow = seed % 2 ? CYAN : PINK;
  const words = scene.title.split(" ");
  const size = impact ? (scene.title.length > 18 ? 118 : 138) : scene.title.length > 18 ? 84 : 96;
  const subIn = spring({frame: frame - 14, fps, config: {damping: 12}});
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 50,
        right: 50,
        textAlign: "center",
        opacity: out,
        transform: `scale(${0.4 + 0.6 * pop}) rotate(${(1 - pop) * -6}deg)`,
      }}
    >
      <div
        style={{
          fontFamily: impact ? DISPLAY : BODY,
          fontWeight: impact ? 400 : 800,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: impact ? 2 : 0,
          color: "#fff",
          textTransform: "uppercase",
          WebkitTextStroke: impact ? "16px #000" : "9px #000",
          paintOrder: "stroke fill",
          textShadow: `10px 10px 0 ${shadow}, 0 0 40px ${shadow}`,
        }}
      >
        {nb(words.join(" "))}
      </div>
      {scene.sub ? (
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            fontFamily: BODY,
            fontWeight: 800,
            fontSize: 54,
            color: "#000",
            background: YELLOW,
            borderRadius: 18,
            padding: "10px 30px",
            transform: `scale(${subIn})`,
            boxShadow: `8px 8px 0 ${PINK}`,
          }}
        >
          {scene.sub}
        </div>
      ) : null}
    </div>
  );
};

// ---------- CapCut-style captions ----------
export const Captions: React.FC<{words: StoryWord[]; keywords: string[]; top?: number}> = ({words, keywords, top = 1440}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const keys = new Set(keywords.map(norm));
  const idx = words.findIndex((w, i) => frame >= w.start && frame < (words[i + 1]?.start ?? w.end + 12));
  if (idx < 0) return null;
  // Pages of up to 3 words, split on punctuation.
  let s0 = 0;
  const pages: [number, number][] = [];
  for (let i = 0; i < words.length; i++) {
    if (/[.?!,:]$/.test(words[i].text) || i - s0 === 2 || i === words.length - 1) {
      pages.push([s0, i]);
      s0 = i + 1;
    }
  }
  const [a, b] = pages.find(([s, e]) => idx >= s && idx <= e) ?? [idx, idx];
  if (frame > words[b].end + 12) return null;
  let hl = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px 48px",
      }}
    >
      {words.slice(a, b + 1).map((w, k) => {
        const i = a + k;
        if (i > idx) return null;
        const key = keys.has(norm(w.text));
        const color = key ? (hl++ % 2 === 0 ? YELLOW : PINK) : "#fff";
        const p = spring({frame: frame - w.start, fps, config: {damping: 15, stiffness: 220}});
        return (
          <span
            key={i}
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: key ? 84 : 72,
              textTransform: "uppercase",
              color,
              display: "inline-block",
              transform: `scale(${0.5 + 0.5 * p}) translateY(${(1 - p) * 30}px)`,
              WebkitTextStroke: "10px #000",
              paintOrder: "stroke fill",
              textShadow: "0 8px 0 rgba(0,0,0,0.55)",
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
export const GTAStory: React.FC<GTAStoryProps> = ({scenes, timing, captions, keywords = [], voiceTrack, handle, autoSfx}) => {
  useFonts();
  const frame = useCurrentFrame();
  const total = gtaStoryDuration(timing);
  const starts = timing.map((_, i) => timing.slice(0, i).reduce((a, b) => a + b, 0));
  const last = scenes.length - 1;

  const cues: [string, number, number][] = [];
  if (autoSfx) {
    starts.forEach((s, i) => {
      if (i > 0) cues.push(["sfx/whoosh.wav", Math.max(0, s - 6), 0.35]);
      cues.push([i === 0 ? "sfx/impact.wav" : "sfx/hit.wav", s + 3, i === 0 ? 0.5 : 0.35]);
    });
    cues.push(["sfx/pop.wav", starts[last] + 40, 0.35], ["sfx/sting.wav", total - 75, 0.35]);
  }
  const lastHit = [...starts].reverse().find((s) => frame >= s + 3) ?? -100;
  const dt = frame - lastHit - 3;
  const punch = 1 + 0.035 * Math.exp(-Math.max(0, dt) / 4);

  const handleIn = spring({frame: frame - (starts[last] + 20), fps: 30, config: {damping: 11}});

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        {scenes.map((sc, i) => (
          <Sequence key={i} from={Math.max(0, starts[i] - 8)} durationInFrames={timing[i] + 16}>
            <Still src={sc.bg} length={timing[i]} seed={i} crop={sc.crop} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* Grade: tropical warm bottom, magenta/cyan top, readability */}
      <AbsoluteFill
        style={{
          mixBlendMode: "soft-light",
          background: `linear-gradient(180deg, ${PINK}55 0%, transparent 40%, transparent 60%, ${ORANGE}44 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)"}} />
      {starts.map((s, i) =>
        i === 0 ? null : (
          <Sequence key={`l${i}`} from={s - 4} durationInFrames={18} layout="none">
            <LightLeak seed={i} />
          </Sequence>
        ),
      )}
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        {scenes.map((sc, i) => (
          <Sequence key={`t${i}`} from={starts[i]} durationInFrames={timing[i]} layout="none">
            <Title scene={sc} length={i === last ? timing[i] + 30 : timing[i]} seed={i} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {captions ? <Captions words={captions} keywords={keywords} /> : null}
      {/* Handle pill on the close */}
      {frame >= starts[last] + 20 ? (
        <div style={{position: "absolute", top: 1240, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 58,
              color: "#fff",
              background: PINK,
              borderRadius: 60,
              padding: "14px 44px",
              border: "5px solid #000",
              boxShadow: `8px 8px 0 ${CYAN}`,
              transform: `scale(${handleIn})`,
            }}
          >
            Sígueme {handle}
          </div>
        </div>
      ) : null}
      <Grain />
      {/* Thin neon progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 10,
          width: `${(frame / total) * 100}%`,
          background: `linear-gradient(90deg, ${PINK}, ${CYAN})`,
        }}
      />
      {voiceTrack ? <Audio src={staticFile(voiceTrack)} /> : null}
      {cues.map(([src, at, vol], i) => (
        <Sequence key={`sfx${i}`} from={at} layout="none">
          <Audio src={staticFile(src)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
