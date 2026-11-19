import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";

import {useFonts} from "../templates/gta/GTAInfo";
import {Captions, StoryWord} from "../templates/gta/GTAStory";

/**
 * IShowSpeed Twitch clip, vertical with his facecam on top (692 px) and gameplay
 * below, with WoloByte CapCut-style Spanish captions on the seam.
 * Lines are Spanish translations of the dialogue, timed from the stream's own
 * captions; words are spread evenly over each line. Strong swearing is softened.
 */

const FPS = 30;

/** [start s, end s, Spanish line]. Use "GTA 6" freely: it stays one caption word. */
export type ClipLine = [number, number, string];

export type SpeedClipProps = {
  /** Facecam-layout video in public/. */
  video: string;
  lines: ClipLine[];
  keywords: string[];
};

export const linesToWords = (lines: ClipLine[]): StoryWord[] =>
  lines.flatMap(([s, e, text]) => {
    const words = text.replace(/GTA 6/g, "GTA 6").split(" ");
    const step = ((e - s) * FPS) / words.length;
    return words.map((w, i) => ({
      text: w,
      start: Math.round(s * FPS + i * step),
      end: Math.round(s * FPS + (i + 1) * step),
    }));
  });

export const SpeedClip: React.FC<SpeedClipProps> = ({video, lines, keywords}) => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <OffthreadVideo src={staticFile(video)} />
      <Captions words={linesToWords(lines)} keywords={keywords} top={600} />
    </AbsoluteFill>
  );
};
