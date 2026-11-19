// Placeholder timings (no voice yet). Re-sync to the voice track once the owner records it.
import type {StoryScene, StoryWord} from "../templates/gta/GTAStory";

// Official screenshots from rockstargames.com/VI/downloads/screenshots (credit @RockstarGames), cropped to 9:16.
export const YA_SCENES: StoryScene[] = [
  {bg: "bg/ya-0.jpg", title: "GTA 6 YA ESTÁ AQUÍ", font: "impact"},
  {bg: "bg/ya-1.jpg", title: "Hoy en PS5 y Xbox Series X|S", font: "body"},
  {bg: "bg/ya-2.jpg", title: "13 años después… Leonida", font: "body"},
  {bg: "bg/ya-3.jpg", title: "¿Qué harás primero?", font: "impact", sub: "Comenta 👇"},
];

export const YA_KEYWORDS = ["aqui", "hoy", "PlayStation", "Xbox", "trece", "Leonida", "primero", "comentarios", "@WoloByte"];

export const YA_TIMING: number[] = [90, 105, 105, 150];

export const YA_CAPTIONS: StoryWord[] = [{"text": "¡GTA 6", "start": 4, "end": 23}, {"text": "ya", "start": 23, "end": 42}, {"text": "está", "start": 42, "end": 61}, {"text": "aquí!", "start": 61, "end": 80}, {"text": "Desde", "start": 94, "end": 101}, {"text": "hoy", "start": 101, "end": 108}, {"text": "lo", "start": 108, "end": 115}, {"text": "puedes", "start": 115, "end": 122}, {"text": "jugar", "start": 122, "end": 129}, {"text": "en", "start": 129, "end": 136}, {"text": "PlayStation 5", "start": 136, "end": 143}, {"text": "y", "start": 143, "end": 150}, {"text": "Xbox", "start": 150, "end": 157}, {"text": "Series", "start": 157, "end": 164}, {"text": "X", "start": 164, "end": 171}, {"text": "y", "start": 171, "end": 178}, {"text": "S.", "start": 178, "end": 185}, {"text": "Trece", "start": 199, "end": 208}, {"text": "años", "start": 208, "end": 217}, {"text": "después", "start": 217, "end": 226}, {"text": "de", "start": 226, "end": 235}, {"text": "GTA 5,", "start": 235, "end": 244}, {"text": "por", "start": 244, "end": 254}, {"text": "fin", "start": 254, "end": 263}, {"text": "llegamos", "start": 263, "end": 272}, {"text": "a", "start": 272, "end": 281}, {"text": "Leonida.", "start": 281, "end": 290}, {"text": "¿Qué", "start": 304, "end": 310}, {"text": "es", "start": 310, "end": 316}, {"text": "lo", "start": 316, "end": 323}, {"text": "primero", "start": 323, "end": 329}, {"text": "que", "start": 329, "end": 335}, {"text": "vas", "start": 335, "end": 341}, {"text": "a", "start": 341, "end": 347}, {"text": "hacer", "start": 347, "end": 353}, {"text": "en", "start": 353, "end": 360}, {"text": "GTA 6?", "start": 360, "end": 366}, {"text": "Te", "start": 366, "end": 372}, {"text": "leo", "start": 372, "end": 378}, {"text": "en", "start": 378, "end": 384}, {"text": "los", "start": 384, "end": 391}, {"text": "comentarios,", "start": 391, "end": 397}, {"text": "y", "start": 397, "end": 403}, {"text": "sígueme", "start": 403, "end": 409}, {"text": "en", "start": 409, "end": 415}, {"text": "@WoloByte", "start": 415, "end": 421}, {"text": "para", "start": 421, "end": 428}, {"text": "más", "start": 428, "end": 434}, {"text": "contenido.", "start": 434, "end": 440}];

export const YA_VOICE: string | undefined = undefined;
