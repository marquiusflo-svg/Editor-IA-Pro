import type {SpeedClipProps} from "./SpeedClip";

/**
 * IlloJuan GTA 6 stream clips (Twitch, Nov 2026), rendered with SpeedClip.
 * Spanish streamer: captions are his own words (Whisper + his stream's live captions)
 * plus the game's Spanish dialogue. Source is 2560x1440; his framed facecam sits on
 * the left and moves between scenes, so each clip has its own crop.
 */
export const ILLOJUAN_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "gta 6 borrado": closing the game by muscle memory, he deletes GTA 6.
    id: "IlloJuanBorrado",
    frames: 717,
    props: {
      video: "assets/ij-borrado-facecam.mp4",
      captionTop: 676,
      keywords: ["continuar", "borrar", "juego!", "histórico", "olla."],
      lines: [
        [0.1, 2.3, "¿Por qué pone 'continuar' en esta pantalla?"],
        [2.4, 4.7, "Sería impresionante que me hubiera echado."],
        [4.8, 7.5, "¿Por qué pone 'continuar' en plan una X y ya está?"],
        [7.6, 9.9, "¿Estás normal? Te voy a cerrar."],
        [10.0, 12.6, "¿Es así o no?"],
        [12.7, 15.0, "Y yo me acabo de cerrar el proceso y todo."],
        [15.1, 17.9, "¡Acabo de borrar el juego!"],
        [18.0, 21.9, "Histórico lo mío,"],
        [22.0, 23.9, "se me ha ido la olla."],
      ],
    },
  },
  {
    // "toma gato": Jason pets the store cat, it rolls over.
    id: "IlloJuanGato",
    frames: 399,
    props: {
      video: "assets/ij-gato-facecam.mp4",
      captionTop: 580,
      keywords: ["monada...", "pata?", "mira!", "arriba."],
      lines: [
        [0.0, 1.1, "Eres una monada..."],
        [1.2, 1.6, "¿Una pata?"],
        [1.7, 2.6, "¡Mira, mira, mira, mira!"],
        [2.7, 5.6, "¡Se pone boca arriba!"],
        [11.5, 13.3, "No te tienes que poner..."],
      ],
    },
  },
  {
    // "Trevor en la radio de GTA VI": a radio news segment about Trevor.
    id: "IlloJuanTrevor",
    frames: 900,
    props: {
      video: "assets/ij-trevor-facecam.mp4",
      captionTop: 682,
      keywords: ["Trevor!", "radio!", "Trevor", "escuchando?"],
      lines: [
        [0.0, 1.6, "¡Es Trevor!"],
        [1.7, 4.3, "¿Lo estáis escuchando?"],
        [4.4, 8.2, "¡Trevor hablando en la radio!"],
        [8.3, 10.2, "¡Es Trevor!"],
        [10.3, 20.0, "¡Trevor hablando en la radio!"],
      ],
    },
  },
  {
    // "Easter Eggazo": a hidden lab of mutant crabs.
    id: "IlloJuanCangrejos",
    frames: 1800,
    props: {
      video: "assets/ij-easter-facecam.mp4",
      captionTop: 682,
      keywords: ["riesgo", "juego?", "código", "cangrejos", "mutantes,"],
      lines: [
        [0.0, 1.9, "Riesgo muy alto."],
        [2.0, 4.9, "¡Una pasada!"],
        [6.5, 9.9, "¿Pero qué es este juego?"],
        [10.0, 13.9, "¿Qué es este juego?"],
        [30.5, 33.4, "Pero espera, espera, espera,"],
        [33.5, 36.9, "que el código quiero ver."],
        [37.0, 39.9, "Vale."],
        [44.5, 47.9, "Empresa... no sé qué. Estaban haciendo"],
        [48.0, 50.9, "cangrejos mutantes, tío."],
        [51.0, 53.4, "Ganancia, unidades, alimentos,"],
        [53.5, 55.9, "combustible de barco."],
        [56.0, 57.5, "Vale."],
      ],
    },
  },
  {
    // "Canción de mi país": a Spanish song plays on the radio in the swamp at sunset.
    id: "IlloJuanCancion",
    frames: 533,
    props: {
      video: "assets/ij-cancion-facecam.mp4",
      captionTop: 682,
      keywords: ["canción", "país,", "país.", "Dios"],
      lines: [
        [6.6, 8.9, "Es una canción de mi país, ¿sabes?"],
        [9.0, 11.3, "Por eso la pongo, porque es de mi país."],
        [16.3, 17.7, "¡Cómo se ve esto, Dios mío!"],
      ],
    },
  },
];
