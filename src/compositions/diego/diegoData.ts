// "Glow-up gamer en 30 días" — Día 1. Provisional timings (30 fps) until the
// cloned voice is recorded; then re-time from the transcription.

export type DWord = {text: string; start: number; end: number};

/** Voiceover script (spoken form) with the frame range each line occupies. */
export const DIEGO_LINES: {text: string; start: number; end: number}[] = [
  {text: "Este es Diego.", start: 5, end: 40},
  {text: "Su novia Sofi vive a dos mil kilómetros…", start: 48, end: 122},
  {text: "y en treinta días se van a ver por primera vez.", start: 132, end: 205},
  {text: "Pero Diego no está en forma.", start: 218, end: 262},
  {text: "Así que tú decides su glow up.", start: 270, end: 316},
  {text: "¿Gym o dieta?", start: 332, end: 365},
  {text: "Comenta una palabra.", start: 372, end: 410},
  {text: "Lo más votado, Diego lo hace mañana.", start: 418, end: 478},
  {text: "Sígueme en @WoloByte para ver si lo logra.", start: 486, end: 548},
];

/** Scene cuts (frames). */
export const CUT_CALL = 125; // video call with Sofi
export const CUT_BACK = 212; // back to Diego, "no está en forma"
export const CUT_VOTE = 322; // GYM vs DIETA
export const DIEGO_DURATION = 565;

export const DIEGO_KEYWORDS = ["diego", "sofi", "2000 km", "30", "primera", "forma", "tú", "glow up", "gym", "dieta", "palabra", "mañana", "@wolobyte", "logra"];

/** Spoken → on-screen forms (numbers as digits, "glow up" as one token). */
const toScreen = (t: string) =>
  t
    .replace("dos mil kilómetros", "2000 KM")
    .replace("treinta", "30")
    .replace("glow up", "GLOW UP");

const spread = (): DWord[] =>
  DIEGO_LINES.flatMap(({text, start, end}) => {
    const words = toScreen(text).split(" ");
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

export const DIEGO_CAPTIONS: DWord[] = spread();

/** Set to "voice/diego-dia1.m4a" once the cloned voice is in public/voice/. */
export const DIEGO_VOICE: string | undefined = undefined;
