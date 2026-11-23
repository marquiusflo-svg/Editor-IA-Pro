// "Glow-up en 30 días" — Día 1. Provisional timings (30 fps) until the cloned
// voice track is recorded; then re-time from the transcription.

export type GlowWord = {text: string; start: number; end: number};

/** Script lines for the voiceover, with the frame range each line occupies. */
export const GLOW_LINES: {text: string; start: number; end: number}[] = [
  {text: "Este es Beto.", start: 5, end: 40},
  {text: "Tiene treinta días para cambiar…", start: 45, end: 105},
  {text: "pero no sabe por dónde empezar.", start: 110, end: 170},
  {text: "Así que tú decides.", start: 175, end: 215},
  {text: "¿Ducha o peluquería?", start: 225, end: 275},
  {text: "Comenta una palabra.", start: 280, end: 322},
  {text: "Lo más votado, Beto lo hace mañana.", start: 328, end: 392},
  {text: "Sígueme en @WoloByte para ver su cambio.", start: 398, end: 455},
];

/** Frame where the split-screen vote scene starts. */
export const GLOW_VOTE_START = 218;
export const GLOW_DURATION = 470;

export const GLOW_KEYWORDS = ["Beto", "treinta", "empezar", "tú", "Ducha", "peluquería", "palabra", "mañana", "@WoloByte"];

/** Spread each line's words over its range, weighted by length. */
const spread = (): GlowWord[] =>
  GLOW_LINES.flatMap(({text, start, end}) => {
    const words = text.replace("treinta", "30").split(" ");
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

export const GLOW_CAPTIONS: GlowWord[] = spread();

/** Set to "voice/glowup-dia1.m4a" once the cloned voice is in public/voice/. */
export const GLOW_VOICE: string | undefined = undefined;
