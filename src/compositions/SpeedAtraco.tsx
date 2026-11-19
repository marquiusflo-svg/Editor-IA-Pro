import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";

import {useFonts} from "../templates/gta/GTAInfo";
import {Captions, StoryWord} from "../templates/gta/GTAStory";

/**
 * IShowSpeed's first GTA 6 bank robbery (Twitch clip, 30 s), vertical with his
 * facecam on top and gameplay below, with WoloByte CapCut-style Spanish captions.
 * Lines are Spanish translations of the dialogue (game character + Speed), timed
 * from the stream's own captions; strong swearing is softened.
 */

const FPS = 30;

// [start s, end s, Spanish line]
const LINES: [number, number, string][] = [
  [0.0, 1.8, "¡Manos arriba, esto es un atraco!"],
  [2.0, 4.6, "¡Es un atraco! ¡Fiesta de atraco!"],
  [9.0, 10.2, "Espera. Un momento."],
  [10.5, 12.0, "¡Manos arriba! ¡Es un atraco!"],
  [12.3, 13.4, "¡Maldita sea!"],
  [14.4, 17.0, "No quiero herir a nadie. ¡Solo necesito dinero rápido!"],
  [17.1, 19.8, "¡Tú! ¡El dinero en el mostrador, YA!"],
  [20.0, 21.4, "¡Dame ese dinero, chico!"],
  [21.5, 23.0, "¡Date prisa, rápido!"],
  [23.0, 24.4, "¡Dámelo todo!"],
  [24.5, 25.4, "Tómalo, es todo lo que hay."],
  [25.5, 27.0, "Más te vale que sea todo."],
  [27.4, 28.9, "¡La tengo!"],
  [29.0, 30.0, "¡Quítate de encima!"],
];

// Spread each line's words evenly over its time span.
export const SPEED_CAPTIONS: StoryWord[] = LINES.flatMap(([s, e, text]) => {
  const words = text.split(" ");
  const step = ((e - s) * FPS) / words.length;
  return words.map((w, i) => ({
    text: w,
    start: Math.round(s * FPS + i * step),
    end: Math.round(s * FPS + (i + 1) * step),
  }));
});

const KEYWORDS = ["atraco", "atraco!", "dinero", "YA!", "todo", "rápido!", "rápido", "momento"];

export const speedAtracoDuration = 900;

export const SpeedAtraco: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <OffthreadVideo src={staticFile("assets/ishowspeed-first-robbery-facecam.mp4")} />
      {/* Sits on the seam between facecam (top 692 px) and gameplay. */}
      <Captions words={SPEED_CAPTIONS} keywords={KEYWORDS} top={600} />
    </AbsoluteFill>
  );
};
