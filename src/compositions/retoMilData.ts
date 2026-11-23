// "Reto $1000 en 30 días" — Día 1. Provisional timings (30 fps) until the cloned
// voice track is recorded; then re-time from the transcription.

export type RetoWord = {text: string; start: number; end: number};

/** Voiceover script (spoken form) with the frame range each line occupies. */
export const RETO_LINES: {text: string; start: number; end: number}[] = [
  {text: "Este es Lalo.", start: 5, end: 40},
  {text: "Tiene cero dólares…", start: 45, end: 90},
  {text: "y treinta días para juntar mil.", start: 95, end: 150},
  {text: "Pero no tiene ni idea de cómo hacerlo.", start: 155, end: 215},
  {text: "Así que tú decides.", start: 220, end: 255},
  {text: "¿Limonada o lavar coches?", start: 268, end: 320},
  {text: "Comenta tu elección.", start: 325, end: 365},
  {text: "Lo más votado, Lalo lo hace mañana.", start: 370, end: 430},
  {text: "Sígueme en @WoloByte para ver si lo logra.", start: 436, end: 500},
];

/** Frame where the vote scene starts. */
export const RETO_VOTE_START = 260;
export const RETO_DURATION = 515;

/** Spoken numbers are shown as digits on screen. */
const ON_SCREEN: Record<string, string> = {cero: "$0", treinta: "30", "mil.": "$1000."};

export const RETO_KEYWORDS = ["lalo", "$0", "30", "$1000", "idea", "tú", "limonada", "coches", "elección", "mañana", "@wolobyte", "logra"];

/** Spread each line's words over its range, weighted by length. */
const spread = (): RetoWord[] =>
  RETO_LINES.flatMap(({text, start, end}) => {
    const words = text
      .replace("cero dólares", "cero")
      .split(" ")
      .map((w) => ON_SCREEN[w] ?? w);
    const weights = words.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = start;
    return words.map((w, i) => {
      const d = ((end - start) * weights[i]) / total;
      const word = {text: w, start: Math.round(t), end: Math.round(t + d)};
      t += d;
      return word;
    });
  });

export const RETO_CAPTIONS: RetoWord[] = spread();

/** Set to "voice/reto-mil-dia1.m4a" once the cloned voice is in public/voice/. */
export const RETO_VOICE: string | undefined = undefined;
