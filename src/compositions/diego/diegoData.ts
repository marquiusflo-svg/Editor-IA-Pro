// "Glow-up gamer en 30 días" — Día 1. Provisional timings (30 fps) until the
// TTS voice processed in scripts (pitch/tempo/EQ); timings match public/voice/diego-dia1.m4a.

export type DWord = {text: string; start: number; end: number};

/** Voiceover script (spoken form) with the frame range each line occupies. */
export const DIEGO_LINES: {text: string; start: number; end: number}[] = [
  {text: "Este es Diego.", start: 5, end: 32},
  {text: "Su novia Sofi vive a dos mil kilómetros…", start: 36, end: 96},
  {text: "y en treinta días se van a ver por primera vez.", start: 101, end: 167},
  {text: "Pero Diego no está en forma.", start: 182, end: 224},
  {text: "Así que tú decides su glow up.", start: 239, end: 283},
  {text: "¿Gym o dieta?", start: 292, end: 316},
  {text: "Comenta una palabra.", start: 329, end: 360},
  {text: "Lo más votado, Diego lo hace mañana.", start: 364, end: 427},
  {text: "Sigue a Diego para ver si lo logra.", start: 436, end: 489},
];

/** Scene cuts (frames). */
export const CUT_CALL = 98; // video call with Sofi
export const CUT_BACK = 178; // back to Diego, "no está en forma"
export const CUT_VOTE = 288; // GYM vs DIETA
export const DIEGO_DURATION = 520;

export const DIEGO_KEYWORDS = ["diego", "sofi", "2000 km", "30", "primera", "forma", "tú", "glow up", "gym", "dieta", "palabra", "mañana", "sigue", "logra"];

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
export const DIEGO_VOICE: string | undefined = "voice/diego-dia1.m4a";
