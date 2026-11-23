import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
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

/**
 * "Elige tu Miedo" house style: interactive horror stories.
 * Cinematic painted stills with slow creeping camera, cold grade with a blood-red accent,
 * drifting fog, light flicker, film grain, word-by-word captions, and a mandatory
 * A/B decision at the end. Part 2+ opens with the vote results of the previous part.
 */

export type HorrorWord = {text: string; start: number; end: number};

export type HorrorScene = {
  /** Full-screen image in public/. */
  bg: string;
  /** Big cinematic title (Cinzel). */
  title?: string;
  /** Small red line above the title. */
  kicker?: string;
  /** scare = red flash + shake on entry; choice = A/B cards; close = comment CTA; results = vote bars. */
  kind?: "normal" | "scare" | "choice" | "close" | "results";
  /** Camera move over the still. */
  move?: "in" | "out" | "left" | "right" | "up";
};

export type HorrorChoice = {letter: "A" | "B"; text: string; /** frame (relative to the choice scene) where it appears */ at: number};

export type HorrorResults = {
  a: {text: string; pct: number};
  b: {text: string; pct: number};
};

export type HorrorStoryProps = {
  scenes: HorrorScene[];
  /** Frames per scene. */
  timing: number[];
  captions?: HorrorWord[];
  keywords?: string[];
  voiceTrack?: string;
  ambience?: string;
  /** [file, absolute frame, volume] */
  sfx?: [string, number, number][];
  handle: string;
  series: string;
  part: number;
  choices?: HorrorChoice[];
  results?: HorrorResults;
};

export const horrorDuration = (timing: number[]) => timing.reduce((a, b) => a + b, 0);

const RED = "#e0101c";
const BONE = "#efe8dc";
const TITLE = "'Cinzel', 'Times New Roman', serif";
const BODY = "'Montserrat', sans-serif";
const COND = "'Oswald', 'Arial Narrow', sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const norm = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@]/g, "");

export const useHorrorFonts = () => {
  const [handle] = useState(() => delayRender("Loading horror fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Cinzel", `url(${staticFile("fonts/Cinzel.ttf")})`, {weight: "400 900"}),
      new FontFace("Oswald", `url(${staticFile("fonts/Oswald.ttf")})`, {weight: "200 700"}),
      new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat.ttf")})`, {weight: "100 900"}),
    ];
    Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
};

// ---------- Background still with a slow, creeping camera ----------
const Still: React.FC<{scene: HorrorScene; length: number}> = ({scene, length}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, length + 12], [0, 1], clamp);
  const move = scene.move ?? "in";
  let scale = 1.08 + 0.14 * p;
  let x = 0;
  let y = 0;
  if (move === "out") scale = 1.24 - 0.14 * p;
  if (move === "left") x = interpolate(p, [0, 1], [40, -40]);
  if (move === "right") x = interpolate(p, [0, 1], [-40, 40]);
  if (move === "up") y = interpolate(p, [0, 1], [50, -50]);
  // Fade up from black: horror cuts breathe.
  const fade = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img
        src={staticFile(scene.bg)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          filter: "saturate(0.82) contrast(1.12) brightness(0.92)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Drifting fog (static turbulence, moved) ----------
const Fog: React.FC = () => {
  const frame = useCurrentFrame();
  const layer = (speed: number, opacity: number, freq: string, seed: number, y: number) => (
    <AbsoluteFill style={{opacity, mixBlendMode: "screen"}}>
      <svg
        width="2160"
        height="1920"
        style={{position: "absolute", left: -1080 + ((frame * speed) % 1080), top: y}}
      >
        <filter id={`fog${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="3" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 1.6 -0.75" />
        </filter>
        <rect width="2160" height="1920" filter={`url(#fog${seed})`} />
      </svg>
    </AbsoluteFill>
  );
  return (
    <>
      {layer(0.8, 0.22, "0.0016 0.004", 3, 300)}
      {layer(1.6, 0.16, "0.0028 0.006", 7, 700)}
    </>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill style={{opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none"}}>
      <svg width="100%" height="100%">
        <filter id={`grain${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Title: tracking-in, blur-to-sharp, red glow ----------
const Title: React.FC<{scene: HorrorScene; length: number}> = ({scene, length}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [4, 30], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const out = interpolate(frame, [length - 10, length], [1, 0], clamp);
  if (!scene.title) return null;
  const t = scene.title;
  const size = t.length > 22 ? 80 : t.length > 14 ? 90 : 124;
  return (
    <div style={{position: "absolute", top: 250, left: 36, right: 36, textAlign: "center", opacity: out * inP}}>
      {scene.kicker ? (
        <div
          style={{
            fontFamily: COND,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 14,
            color: RED,
            marginBottom: 18,
            textShadow: "0 0 18px rgba(224,16,28,0.7), 0 3px 6px #000",
          }}
        >
          {scene.kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.08,
          color: BONE,
          textTransform: "uppercase",
          letterSpacing: interpolate(inP, [0, 1], [26, 3]),
          filter: `blur(${(1 - inP) * 10}px)`,
          textShadow: `0 0 30px rgba(224,16,28,0.55), 0 0 80px rgba(224,16,28,0.35), 0 6px 14px #000, 0 2px 2px #000`,
        }}
      >
        {t}
      </div>
      <div
        style={{
          margin: "26px auto 0",
          height: 4,
          width: `${inP * 46}%`,
          background: `linear-gradient(90deg, transparent, ${RED}, transparent)`,
        }}
      />
    </div>
  );
};

// ---------- Captions: word by word, keywords in blood red with a tremor ----------
const Captions: React.FC<{words: HorrorWord[]; keywords: string[]}> = ({words, keywords}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const keys = new Set(keywords.map(norm));
  const idx = words.findIndex((w, i) => frame >= w.start && frame < (words[i + 1]?.start ?? w.end + 12));
  if (idx < 0) return null;
  let s0 = 0;
  const pages: [number, number][] = [];
  for (let i = 0; i < words.length; i++) {
    if (/[.?!,:…]$/.test(words[i].text) || i - s0 === 3 || i === words.length - 1) {
      pages.push([s0, i]);
      s0 = i + 1;
    }
  }
  const [a, b] = pages.find(([s, e]) => idx >= s && idx <= e) ?? [idx, idx];
  if (frame > words[b].end + 14) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1400,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0px 30px",
      }}
    >
      {words.slice(a, b + 1).map((w, k) => {
        const i = a + k;
        if (i > idx) return null;
        const key = keys.has(norm(w.text));
        const p = spring({frame: frame - w.start, fps, config: {damping: 16, stiffness: 200}});
        const jx = key ? (random(`x${i}-${frame}`) - 0.5) * 4 : 0;
        const jy = key ? (random(`y${i}-${frame}`) - 0.5) * 4 : 0;
        return (
          <span
            key={i}
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: key ? 80 : 68,
              textTransform: "uppercase",
              color: key ? RED : "#fff",
              display: "inline-block",
              opacity: p,
              transform: `translate(${jx}px, ${jy + (1 - p) * 24}px) scale(${0.7 + 0.3 * p})`,
              WebkitTextStroke: "8px #000",
              paintOrder: "stroke fill",
              textShadow: key ? "0 0 24px rgba(224,16,28,0.8), 0 6px 0 rgba(0,0,0,0.6)" : "0 6px 0 rgba(0,0,0,0.6)",
            }}
          >
            {w.text.replace(/[,.:…]+$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- A/B decision cards ----------
const ChoiceCards: React.FC<{choices: HorrorChoice[]; length: number; dim?: boolean}> = ({choices, length, dim}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = spring({frame: frame - 2, fps, config: {damping: 14}});
  const out = interpolate(frame, [length - 8, length], [1, 0], clamp);
  return (
    <div style={{position: "absolute", top: 230, left: 60, right: 60, opacity: out * (dim ? 0.95 : 1)}}>
      <div
        style={{
          textAlign: "center",
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 92,
          color: BONE,
          letterSpacing: 4,
          transform: `scale(${0.8 + 0.2 * head})`,
          opacity: head,
          textShadow: `0 0 30px rgba(224,16,28,0.7), 0 6px 14px #000`,
        }}
      >
        TÚ DECIDES
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 34, marginTop: 50}}>
        {choices.map((c) => {
          const p = spring({frame: frame - c.at, fps, config: {damping: 13, stiffness: 140}});
          const isA = c.letter === "A";
          return (
            <div
              key={c.letter}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "26px 34px",
                background: "rgba(8,6,8,0.78)",
                border: `4px solid ${isA ? RED : BONE}`,
                borderRadius: 22,
                boxShadow: isA ? `0 0 40px rgba(224,16,28,0.45)` : `0 0 30px rgba(239,232,220,0.25)`,
                opacity: p,
                transform: `translateX(${(1 - p) * (isA ? -260 : 260)}px)`,
              }}
            >
              <div
                style={{
                  flex: "0 0 120px",
                  height: 120,
                  borderRadius: 18,
                  background: isA ? RED : BONE,
                  color: isA ? "#fff" : "#111",
                  fontFamily: TITLE,
                  fontWeight: 900,
                  fontSize: 96,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {c.letter}
              </div>
              <div style={{fontFamily: COND, fontWeight: 600, fontSize: 58, lineHeight: 1.1, color: "#fff", textTransform: "uppercase"}}>
                {c.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Comment CTA ----------
const CloseCTA: React.FC<{handle: string; part: number; choices?: HorrorChoice[]}> = ({handle, part, choices}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: frame - 4, fps, config: {damping: 11}});
  const b = spring({frame: frame - 26, fps, config: {damping: 12}});
  const pulse = 1 + 0.04 * Math.sin(frame / 5);
  return (
    <div style={{position: "absolute", top: 240, left: 50, right: 50, textAlign: "center"}}>
      <div
        style={{
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 104,
          lineHeight: 1.05,
          color: BONE,
          transform: `scale(${a * pulse})`,
          textShadow: `0 0 34px rgba(224,16,28,0.75), 0 6px 14px #000`,
        }}
      >
        COMENTA
        <br />
        <span style={{color: RED}}>A</span> o <span style={{color: BONE}}>B</span> 👇
      </div>
      {choices ? (
        <div style={{display: "flex", justifyContent: "center", gap: 24, marginTop: 34, opacity: a}}>
          {choices.map((c) => (
            <div
              key={c.letter}
              style={{
                fontFamily: COND,
                fontWeight: 600,
                fontSize: 36,
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 14,
                border: `3px solid ${c.letter === "A" ? RED : BONE}`,
                background: "rgba(0,0,0,0.65)",
                maxWidth: 440,
                textTransform: "uppercase",
              }}
            >
              {c.letter}: {c.text}
            </div>
          ))}
        </div>
      ) : null}
      <div
        style={{
          marginTop: 40,
          fontFamily: COND,
          fontWeight: 500,
          fontSize: 46,
          color: "#fff",
          letterSpacing: 2,
          opacity: b,
          textShadow: "0 4px 10px #000",
        }}
      >
        LA MÁS VOTADA DECIDE LA <span style={{color: RED, fontWeight: 700}}>PARTE {part + 1}</span>
      </div>
      <div style={{marginTop: 40, display: "flex", justifyContent: "center", opacity: b, transform: `scale(${0.85 + 0.15 * b})`}}>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 800,
            fontSize: 50,
            color: "#fff",
            background: RED,
            borderRadius: 60,
            padding: "14px 44px",
            boxShadow: "0 0 40px rgba(224,16,28,0.6)",
          }}
        >
          Sígueme {handle}
        </div>
      </div>
    </div>
  );
};

// ---------- Vote results (opens part 2+) ----------
const Results: React.FC<{results: HorrorResults; part: number}> = ({results, part}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = spring({frame: frame - 2, fps, config: {damping: 14}});
  const fill = interpolate(frame, [18, 60], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const winner = results.a.pct >= results.b.pct ? "A" : "B";
  const stamp = spring({frame: frame - 66, fps, config: {damping: 9, stiffness: 180}});
  const row = (letter: "A" | "B", r: {text: string; pct: number}) => {
    const win = letter === winner;
    return (
      <div key={letter} style={{marginTop: 40}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: COND, color: "#fff"}}>
          <span style={{fontSize: 48, fontWeight: 600, textTransform: "uppercase", maxWidth: 720}}>
            <span style={{color: letter === "A" ? RED : BONE}}>{letter}</span> · {r.text}
          </span>
          <span style={{fontSize: 72, fontWeight: 700, color: win ? RED : "#bbb"}}>{Math.round(r.pct * fill)}%</span>
        </div>
        <div style={{height: 34, background: "rgba(255,255,255,0.12)", borderRadius: 17, overflow: "hidden", marginTop: 10}}>
          <div
            style={{
              height: "100%",
              width: `${r.pct * fill}%`,
              background: win ? `linear-gradient(90deg, #7a0008, ${RED})` : "#777",
              boxShadow: win ? "0 0 30px rgba(224,16,28,0.7)" : "none",
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <div style={{position: "absolute", top: 230, left: 60, right: 60}}>
      <div style={{textAlign: "center", fontFamily: COND, fontWeight: 600, fontSize: 40, letterSpacing: 12, color: RED, opacity: head}}>
        PARTE {part - 1} · VOTARON
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 96,
          color: BONE,
          opacity: head,
          textShadow: `0 0 30px rgba(224,16,28,0.6), 0 6px 14px #000`,
        }}
      >
        RESULTADOS
      </div>
      <div style={{padding: "10px 34px 40px", background: "rgba(6,4,6,0.72)", borderRadius: 24, marginTop: 30, border: "2px solid rgba(255,255,255,0.12)"}}>
        {row("A", results.a)}
        {row("B", results.b)}
      </div>
      <div style={{display: "flex", justifyContent: "center", marginTop: 40}}>
        <div
          style={{
            fontFamily: TITLE,
            fontWeight: 900,
            fontSize: 64,
            color: "#fff",
            border: `6px solid ${RED}`,
            padding: "8px 34px",
            borderRadius: 10,
            transform: `scale(${2 - stamp}) rotate(-6deg)`,
            opacity: stamp,
            background: "rgba(224,16,28,0.25)",
          }}
        >
          GANÓ LA {winner}
        </div>
      </div>
    </div>
  );
};

// ---------- Composition ----------
export const HorrorStory: React.FC<HorrorStoryProps> = ({
  scenes,
  timing,
  captions,
  keywords = [],
  voiceTrack,
  ambience,
  sfx = [],
  handle,
  series,
  part,
  choices,
  results,
}) => {
  useHorrorFonts();
  const frame = useCurrentFrame();
  const total = horrorDuration(timing);
  const starts = timing.map((_, i) => timing.slice(0, i).reduce((a, b) => a + b, 0));
  const cur = Math.max(0, starts.filter((s) => frame >= s).length - 1);
  const local = frame - starts[cur];
  const kind = scenes[cur]?.kind ?? "normal";

  // Light flicker: always a faint breathing; strong stutter on scare scenes.
  let flicker = 1 - 0.04 * random(`f${Math.floor(frame / 2)}`);
  if (kind === "scare" && local < 24) flicker *= random(`s${frame}`) > 0.55 ? 1 : 0.45;
  const shake = kind === "scare" && local < 14 ? (14 - local) * 1.4 : 0;
  const sx = (random(`sx${frame}`) - 0.5) * shake;
  const sy = (random(`sy${frame}`) - 0.5) * shake;
  const redFlash = kind === "scare" ? interpolate(local, [0, 3, 14], [0, 0.45, 0], clamp) : 0;
  const capsHidden = kind === "choice" || kind === "close" || kind === "results";

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`, filter: `brightness(${flicker})`}}>
        {scenes.map((sc, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={timing[i] + 10}>
            <Still scene={sc} length={timing[i]} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* Cold grade: teal shadows, keep reds */}
      <AbsoluteFill style={{mixBlendMode: "soft-light", background: "linear-gradient(180deg, #0b2a33aa 0%, #00000000 50%, #1a0004aa 100%)"}} />
      <Fog />
      {/* Readability: dark top for titles, dark bottom for captions */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 32%, rgba(0,0,0,0) 46%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)"}} />
      {kind === "choice" || kind === "close" || kind === "results" ? (
        <AbsoluteFill style={{background: "rgba(0,0,0,0.35)"}} />
      ) : null}
      <AbsoluteFill style={{background: RED, opacity: redFlash, mixBlendMode: "screen"}} />

      {scenes.map((sc, i) => {
        const k = sc.kind ?? "normal";
        return (
          <Sequence key={`o${i}`} from={starts[i]} durationInFrames={timing[i]} layout="none">
            {k === "choice" && choices ? (
              <ChoiceCards choices={choices} length={timing[i]} />
            ) : k === "close" ? (
              <CloseCTA handle={handle} part={part} choices={choices} />
            ) : k === "results" && results ? (
              <Results results={results} part={part} />
            ) : (
              <Title scene={sc} length={timing[i]} />
            )}
          </Sequence>
        );
      })}

      {captions && !capsHidden ? <Captions words={captions} keywords={keywords} /> : null}

      {/* Series badge */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontFamily: COND,
          fontWeight: 500,
          fontSize: 34,
          letterSpacing: 8,
          color: "rgba(255,255,255,0.85)",
          textShadow: "0 2px 8px #000",
        }}
      >
        <span style={{color: RED, marginRight: 14}}>●</span>
        {series.toUpperCase()} · PARTE {part}
      </div>

      <Grain />
      {/* Letterbox-thin progress line */}
      <div style={{position: "absolute", bottom: 0, left: 0, height: 8, width: `${(frame / total) * 100}%`, background: RED, boxShadow: `0 0 16px ${RED}`}} />

      {ambience ? <Audio src={staticFile(ambience)} volume={0.55} loop /> : null}
      {voiceTrack ? <Audio src={staticFile(voiceTrack)} /> : null}
      {sfx.map(([src, at, vol], i) => (
        <Sequence key={`sfx${i}`} from={at} layout="none">
          <Audio src={staticFile(src)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
