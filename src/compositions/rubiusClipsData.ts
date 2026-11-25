import type {SpeedClipProps} from "./SpeedClip";

/**
 * Rubius GTA 6 stream clips (Twitch, Nov 2026), rendered with SpeedClip.
 * Spanish streamer: captions are his own words (Whisper + his stream's live captions)
 * plus the game's Spanish dialogue. Source is 2560x1440; his facecam box moves
 * between streams. RubiusChoto uses a cartoon avatar instead of a cam, so it is a
 * plain centre crop with captions lower down.
 */
export const RUBIUS_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "Hueles a choto": Jason tells a local on a park bench that she smells.
    id: "RubiusChoto",
    frames: 300,
    props: {
      video: "assets/rb-choto-facecam.mp4",
      captionTop: 1300,
      keywords: ["choto.", "choto!", "momento.", "malo."],
      lines: [
        [1.5, 2.9, "Madre mía, hueles a choto."],
        [3.0, 6.4, "A ver, un momento. ¿Me estás poniendo a parir?"],
        [7.5, 8.9, "¡Hueles a choto!"],
        [9.3, 10.0, "Te ha tocado todo lo malo."],
      ],
    },
  },
  {
    // "la Doli owo": talking to his pet snake Dolores.
    id: "RubiusDolores",
    frames: 253,
    props: {
      video: "assets/rb-doli-facecam.mp4",
      captionTop: 646,
      keywords: ["Dolly!", "amor.", "hambre"],
      lines: [
        [0.0, 1.9, "¡Dolly!"],
        [2.0, 3.9, "Dolores, mi amor."],
        [4.0, 5.9, "¿No tienes hambre, pequeña?"],
        [6.0, 8.4, "¿No tienes hambre, Dolores?"],
      ],
    },
  },
  {
    // "El compras": a motorbike bug, "I'm bought by Rockstar".
    id: "RubiusComprado",
    frames: 900,
    props: {
      video: "assets/rb-compras-facecam.mp4",
      captionTop: 634,
      keywords: ["gym.", "bug?", "Rockstar.", "stamina."],
      lines: [
        [1.0, 2.9, "Si tengo que hacerlo..."],
        [4.5, 7.9, "Esto también cuenta como gym. Vamos."],
        [12.5, 13.9, "¿Y ese bug?"],
        [14.0, 15.9, "No lo he visto, chicos. Perdón,"],
        [16.0, 17.9, "estoy comprado por Rockstar."],
        [18.0, 19.4, "Y no veo bugs."],
        [21.5, 23.4, "¿Qué bug, gente?"],
        [25.5, 27.9, "Estaba mirando la barra de stamina."],
        [29.0, 30.0, "¡Quita! ¡Que voy con prisa!"],
      ],
    },
  },
  {
    // "easter egg": taking a selfie, the character turns by himself.
    id: "RubiusSelfie",
    frames: 922,
    props: {
      video: "assets/rb-easter-facecam.mp4",
      captionTop: 646,
      keywords: ["selfie", "personaje", "solo,", "like."],
      lines: [
        [0.5, 1.9, "Claro, si hago selfie apuntando aquí,"],
        [2.0, 3.6, "el personaje se girará solo,"],
        [3.7, 5.0, "o no, claro, no va a hacerlo él."],
        [5.1, 8.4, "Ahí estarán."],
        [8.5, 10.1, "Perdón."],
        [10.2, 11.7, "Ahí estarán."],
        [11.8, 18.0, "Denle al like."],
      ],
    },
  },
  {
    // "PS5 Pro lagazos": first steps in the prison at max quality.
    id: "RubiusPS5Pro",
    frames: 869,
    props: {
      video: "assets/rb-lag-facecam.mp4",
      captionTop: 634,
      keywords: ["PS5", "Pro,", "real", "chill"],
      lines: [
        [0.0, 2.0, "Por cierto, estamos en PS5 Pro,"],
        [2.1, 4.1, "o sea que vamos a jugar a la máxima calidad posible."],
        [4.2, 6.9, "¿Esto es real?"],
        [7.0, 9.6, "¿Qué narices?"],
        [9.7, 13.2, "Hola."],
        [13.3, 15.7, "Sube un poco el juego, ¿vale?"],
        [15.8, 18.1, "Voy a..."],
        [18.2, 23.7, "Al principio va a haber un poco de estar toqueteando ajustes y tal,"],
        [23.8, 26.6, "pero después ya estaremos chill, chicos."],
      ],
    },
  },
];
