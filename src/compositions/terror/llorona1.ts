// "Elige tu Miedo" — La Llorona, parte 1. Timing and captions follow public/terror/voice/llorona-1.wav.
import type {HorrorScene, HorrorStoryProps} from "../../templates/terror/HorrorStory";
import data from "./lloronaData";

const scenes: HorrorScene[] = [
  {bg: "terror/bg/llorona-0.png", kicker: "SI LA OYES LEJOS…", title: "Está detrás de ti", move: "in"},
  {bg: "terror/bg/llorona-1.png", kicker: "CUENTA LA LEYENDA", title: "La Llorona", move: "out"},
  {bg: "terror/bg/llorona-2.png", title: "¡Ay, mis hijos!", move: "up"},
  {bg: "terror/bg/llorona-3.png", kicker: "CAMINO VIEJO DEL RÍO", title: "3:17 a.m.", move: "in"},
  {bg: "terror/bg/llorona-4.png", title: "Un llanto lejano", move: "in"},
  {bg: "terror/bg/llorona-5.png", kicker: "LA ABUELA LO SABÍA", title: "Lejos es cerca", move: "right"},
  {bg: "terror/bg/llorona-6.png", title: "No está solo", move: "in"},
  {bg: "terror/bg/llorona-7.png", title: "No mires", kind: "scare", move: "in"},
  {bg: "terror/bg/llorona-8.png", kind: "choice", move: "in"},
  {bg: "terror/bg/llorona-9.png", kind: "close", move: "out"},
];

const s = data.starts;
const sfx: [string, number, number][] = [
  ["terror/sfx/boom.wav", 2, 0.7],
  ...s.slice(1).map((f): [string, number, number] => ["terror/sfx/whoosh.wav", Math.max(0, f - 8), 0.35]),
  ["terror/sfx/hit.wav", s[4] + 20, 0.5],
  ["terror/sfx/heartbeat.wav", s[6] + 10, 0.8],
  ["terror/sfx/riser.wav", s[7] - 60, 0.35],
  ["terror/sfx/boom.wav", s[7], 0.9],
  ["terror/sfx/hit.wav", s[8] + data.choiceAt[0], 0.45],
  ["terror/sfx/hit.wav", s[8] + data.choiceAt[1], 0.45],
  ["terror/sfx/sting.wav", s[9] + 4, 0.6],
];

export const LLORONA_1: HorrorStoryProps = {
  scenes,
  timing: data.timing,
  captions: data.captions,
  keywords: [
    "llanto", "mujer", "lejos", "detrás", "leyenda", "hijos", "río", "tarde", "blanco", "hijos!", "Daniel",
    "diecisiete", "madrugada", "apaga", "silencio", "abuela", "cerca", "niebla", "espaldas", "inmóvil",
    "despacio", "cabeza",
  ],
  voiceTrack: "terror/voice/llorona-1.wav",
  ambience: "terror/sfx/ambience.wav",
  sfx,
  handle: "@eligetumiedo",
  series: "La Llorona",
  part: 1,
  choices: [
    {letter: "A", text: "Corre sin mirar atrás", at: data.choiceAt[0]},
    {letter: "B", text: "Se queda quieto y cierra los ojos", at: data.choiceAt[1]},
  ],
};
