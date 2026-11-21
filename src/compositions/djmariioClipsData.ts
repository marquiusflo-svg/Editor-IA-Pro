import type {SpeedClipProps} from "./SpeedClip";

/**
 * DjMaRiiO GTA 6 stream clips (Twitch, 17-20 Nov 2026), rendered with SpeedClip.
 * He streams in Spanish, so captions are his own words (from his stream's live
 * captions, cross-checked with Whisper) plus the game's Spanish dialogue; no translation.
 * His facecam box moves between streams, so each clip was cropped separately and
 * captionTop sits just above the facecam/gameplay seam.
 */
export const DJMARIIO_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "hay hay hay el animalito": landing the seaplane, he hits a bird.
    id: "DjMarioPajaro",
    frames: 561,
    props: {
      video: "assets/dj-animalito-facecam.mp4",
      captionTop: 480,
      keywords: ["animalito!", "pájaro!", "pelicánger!", "suscríbete!"],
      lines: [
        [0.0, 0.9, "Suave como la seda."],
        [1.0, 2.4, "¡Suscríbete!"],
        [4.0, 6.4, "¡Ok! ¡Suscríbete!"],
        [7.5, 8.4, "¡Ay, ay, ay!"],
        [8.5, 10.4, "¡Era animalito!"],
        [11.0, 12.4, "¡Ay, ya! ¡Ay!"],
        [12.5, 14.4, "¡He matado a un pájaro!"],
        [14.5, 15.4, "¡No sé qué era!"],
        [15.5, 17.9, "¡Lo siento, pelicánger!"],
      ],
    },
  },
  {
    // Street race: the car flies off the track.
    id: "DjMarioCarrera",
    frames: 900,
    props: {
      video: "assets/dj-d21-facecam.mp4",
      captionTop: 494,
      keywords: ["hostia!", "increíble!", "vamos!", "listo!"],
      lines: [
        [0.0, 1.4, "¡Vaya hostia!"],
        [4.0, 4.9, "Lucía: Mierda..."],
        [5.5, 6.9, "¡Vaya hostia!"],
        [9.0, 10.4, "¡Vaya hostia!"],
        [12.0, 13.4, "¡Increíble!"],
        [14.5, 17.9, "¡Ya estoy a punto, gente! ¡Vamos!"],
        [19.5, 21.9, "¡Sí!"],
        [24.5, 27.9, "Como si no estuviera, ¡yo paso y listo!"],
      ],
    },
  },
  {
    // Night boat escape with Jason, the coast guard boards them: mission failed.
    id: "DjMarioGuardiaCostera",
    frames: 900,
    props: {
      video: "assets/dj-pd4-facecam.mp4",
      captionTop: 442,
      keywords: ["aguanta!", "alto", "guardia", "costera.", "abordaje."],
      lines: [
        [0.5, 1.9, "¡Aguanta!"],
        [7.0, 8.4, "¡Sácanos de aquí!"],
        [8.5, 9.9, "¡Ya voy!"],
        [10.5, 11.9, "¡Alto ahí!"],
        [12.0, 12.9, "¡Maldita sea!"],
        [13.0, 14.4, "Aquí la guardia costera."],
        [14.5, 18.4, "Apagad el motor, soltad las armas y preparaos para el abordaje."],
      ],
    },
  },
  {
    // Working out at the outdoor gym.
    id: "DjMarioGimnasio",
    frames: 900,
    props: {
      video: "assets/dj-pd2-facecam.mp4",
      captionTop: 480,
      keywords: ["fuerza", "sentadillas", "dominadas!", "ojo!"],
      lines: [
        [0.0, 1.0, "¡Vale!"],
        [3.0, 4.0, "¡Bien!"],
        [6.0, 7.9, "Entrenamiento de fuerza, más 11%"],
        [8.0, 10.9, "Sentadillas bloqueado, ya no puedo hacer más sentadillas"],
        [11.0, 11.9, "¡Dominadas!"],
        [12.0, 13.9, "¡Ojo! ¡Ojo!"],
        [16.0, 18.9, "Mantén pulsado para subir y suelta poco a poco."],
      ],
    },
  },
  {
    // "UNBOXING DE IRAI?": chat asks about the baby instead of GTA.
    id: "DjMarioBebe",
    frames: 440,
    props: {
      video: "assets/dj-unboxing-facecam.mp4",
      captionTop: 506,
      keywords: ["Noe", "bien", "grandote.", "unboxing,"],
      lines: [
        [0.0, 0.9, "Lo tenéis, chicos."],
        [1.0, 2.4, "Para los que preguntáis por Noe"],
        [2.5, 3.4, "y el bollombo,"],
        [3.5, 4.4, "va todo bien"],
        [4.5, 5.4, "y va bastante"],
        [5.5, 6.9, "grandote."],
        [9.0, 10.4, "Pues hoy no se puede,"],
        [10.5, 12.4, "en principio. En principio"],
        [12.5, 13.4, "no se puede"],
        [13.5, 14.6, "hoy un unboxing, ¿no?"],
      ],
    },
  },
];
