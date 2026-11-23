import type {SpeedClipProps} from "./SpeedClip";

/**
 * ohnePixel GTA 6 stream clips (Twitch, Nov 2026), rendered with SpeedClip.
 * Source clips are 2560x1440; his facecam is a frameless cutout bottom-left next to
 * the minimap. Spanish translations of his English speech and the game dialogue,
 * timed from Whisper word timestamps. OhnePixelDificultad has no facecam on stream,
 * so it is a plain centre crop with captions lower down.
 */
export const OHNEPIXEL_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "Ohnepixel agrees with Hasan": with four stars he flies a plane into a tower.
    id: "OhnePixelAvion",
    frames: 492,
    props: {
      video: "assets/op-hasan-facecam.mp4",
      captionTop: 670,
      keywords: ["civiles?", "arriesgado.", "mal!"],
      lines: [
        [0.0, 1.9, "Listos para atacar."],
        [2.0, 3.9, "¿Qué significa eso?"],
        [4.0, 7.9, "¿No van a disparar si estoy cerca de civiles?"],
        [8.5, 9.8, "Eso es demasiado arriesgado."],
        [9.9, 13.5, "No, no, no, no, no"],
        [13.6, 16.3, "No pude... ¡Qué mal!"],
      ],
    },
  },
  {
    // "ohnePixel on GTA VI difficulty": "you can be 10 years old".
    id: "OhnePixelDificultad",
    frames: 642,
    props: {
      video: "assets/op-dificultad-facecam.mp4",
      captionTop: 1300,
      keywords: ["fácil.", "daño", "10", "misión.", "puntería"],
      lines: [
        [0.0, 1.8, "Siento que es demasiado fácil."],
        [1.9, 2.8, "Dime."],
        [2.9, 4.9, "Es que se siente como que..."],
        [5.0, 5.9, "¿Pero qué...?"],
        [6.0, 8.9, "No recibí nada de daño ahí."],
        [9.0, 10.9, "¿Qué estamos diciendo? Eh..."],
        [11.0, 11.9, "¿Pero qué...?"],
        [12.0, 13.9, "Puedes tener 10 años, bro."],
        [14.0, 14.9, "No vas a fallar ninguna misión."],
        [15.0, 15.9, "Vale."],
        [16.0, 17.9, "Al menos de momento."],
        [18.0, 21.3, "Tu puntería puede ser horrible, bro."],
      ],
    },
  },
  {
    // "ohnePixel gets into a high-speed chase": against a lady on a mobility scooter.
    id: "OhnePixelPersecucion",
    frames: 720,
    props: {
      video: "assets/op-persecucion-facecam.mp4",
      captionTop: 712,
      keywords: ["Mandy,", "ayuda!", "premio!", "cayó!"],
      lines: [
        [0.0, 0.9, "No, no, no, no, no."],
        [1.0, 4.6, "Eso es para otro, ¡no soy yo!"],
        [4.7, 6.3, "¡Rayos!"],
        [6.4, 8.9, "¡Oh, no!"],
        [9.0, 12.1, "¡Mandy, ayuda!"],
        [12.2, 14.7, "¡Oh, rayos!"],
        [14.8, 17.1, "¡Premio!"],
        [17.2, 19.3, "¡Premio!"],
        [19.4, 22.1, "¡Cayó!"],
        [22.2, 24.0, "¡Bien!"],
      ],
    },
  },
  {
    // "bang": the pawn-shop plane ("America's #1 pawn shop") in the hangar.
    id: "OhnePixelEmpenos",
    frames: 420,
    props: {
      video: "assets/op-bang-facecam.mp4",
      captionTop: 670,
      keywords: ["empeños", "América'?", "Dios", "esto?"],
      lines: [
        [0.0, 2.1, "Espera, ¿por qué me llevo la de la casa de empeños?"],
        [2.2, 4.3, "¿'La casa de empeños número uno de América'?"],
        [4.4, 5.8, "Ni de broma. Bueno, qué más da."],
        [5.9, 7.3, "Por favor. Por favor. Por favor."],
        [7.4, 8.9, "¡Dios mío! ¡Dios mío!"],
        [9.0, 14.0, "¿Pero qué demonios es esto?"],
      ],
    },
  },
  {
    // "happy ohne": Lucía lays down the rules to Jason; ohne loves it.
    id: "OhnePixelMandona",
    frames: 900,
    props: {
      video: "assets/op-happy-facecam.mp4",
      captionTop: 670,
      keywords: ["cena.", "plan", "mandona,", "dinero"],
      lines: [
        [0.0, 0.9, "No es para ti."],
        [1.0, 2.5, "No es para nadie ahora mismo."],
        [2.6, 3.7, "Te llevaré a una buena cena."],
        [3.8, 4.6, "Iremos de compras."],
        [4.7, 9.3, "Tómate tu tiempo para hacer un plan que no sea una estupidez."],
        [9.4, 13.5, "Esto es una tontería."],
        [13.6, 14.9, "Me voy por mi cuenta."],
        [15.0, 16.0, "No, no lo harás."],
        [16.1, 18.9, "Ahora es mandona, bro."],
        [19.0, 24.4, "Es mandona, bro."],
        [24.5, 25.6, "Vamos, bro."],
        [25.7, 27.3, "Hagamos dinero."],
        [27.4, 30.0, "Se me da bien hacer dinero, bro, confía."],
      ],
    },
  },
];
