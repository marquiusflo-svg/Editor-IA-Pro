import type {SpeedClipProps} from "./SpeedClip";

/**
 * IShowSpeed GTA 6 early-access stream clips (Twitch, 18 Nov 2026).
 * Each entry: composition id, length in frames (30 fps) and SpeedClip props.
 */
export const SPEED_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "first robbery speed": robbing the bank teller.
    id: "SpeedAtraco",
    frames: 900,
    props: {
      video: "assets/ishowspeed-first-robbery-facecam.mp4",
      keywords: ["atraco", "dinero", "ya", "todo", "rápido", "momento"],
      lines: [
        [0.0, 1.8, "¡Manos arriba, esto es un atraco!"],
        [2.0, 4.6, "¡Es un atraco! ¡Fiesta de atraco!"],
        [9.0, 10.2, "Espera. Un momento."],
        [10.5, 12.0, "¡Manos arriba! ¡Es un atraco!"],
        [12.3, 13.4, "¡Maldita sea!"],
        [14.4, 17.0, "No quiero herir a nadie. ¡Solo necesito dinero rápido!"],
        [17.1, 19.8, "¡Tú! ¡El dinero en el mostrador, YA!"],
        [20.0, 21.4, "¡Dame ese dinero, chico!"],
        [21.5, 23.0, "¡Date prisa, rápido!"],
        [23.0, 24.4, "¡Dámelo todo!"],
        [24.5, 25.4, "Tómalo, es todo lo que hay."],
        [25.5, 27.0, "Más te vale que sea todo."],
        [27.4, 28.9, "¡La tengo!"],
        [29.0, 30.0, "¡Quítate de encima!"],
      ],
    },
  },
  {
    // "here": counting down the last seconds of the GTA 6 download.
    id: "SpeedDescarga",
    frames: 1800,
    props: {
      video: "assets/speed-here-facecam.mp4",
      keywords: ["espera", "1", "GTA 6", "aquí", "¿29?", "llegó"],
      lines: [
        [1.5, 4.4, "28... ¡Oh, espera!"],
        [4.5, 5.4, "20... espera, 26"],
        [5.5, 9.0, "25 24 23"],
        [9.0, 11.4, "22 21 ¿29?"],
        [11.5, 15.0, "19 18 17"],
        [15.0, 17.4, "16 15 14"],
        [17.5, 21.0, "13 12 11"],
        [21.0, 24.0, "10 9 8"],
        [24.0, 27.0, "7 6 5"],
        [27.0, 30.0, "4 3 2"],
        [30.0, 33.0, "¡1! ¡GTA 6!"],
        [44.0, 46.0, "Activar narración..."],
        [46.0, 49.0, "Narración desactivada."],
        [50.0, 53.4, "¡GTA 6!"],
        [53.5, 55.4, "¡Ya está aquí!"],
        [58.5, 60.0, "¡Ya llegó!"],
      ],
    },
  },
  {
    // "WOAH Jason stepbro": Mandy scrolling Snapmatic, Jason fixing the sink.
    id: "SpeedJason",
    frames: 1680,
    props: {
      video: "assets/speed-jason-facecam.mp4",
      keywords: ["Mandy", "Snapmatic", "todo", "acosar", "alquiler", "ups"],
      lines: [
        [3.0, 3.9, "Mandy..."],
        [4.0, 5.9, "Es una locura lo que puedes descubrir"],
        [6.0, 8.4, "con un poco de scroll en Snapmatic."],
        [8.5, 11.9, "Puedes, literalmente, saberlo todo de una persona."],
        [12.5, 15.9, "Todo lo que quieras saber, como..."],
        [16.5, 18.9, "qué música escucha, o..."],
        [19.5, 21.4, "con quién salía, o..."],
        [21.5, 24.4, "dónde entrena..."],
        [24.5, 26.9, "Sí... creo que eso se llama acosar, Mandy."],
        [31.5, 32.4, "Ajá..."],
        [39.5, 40.4, "Las tuberías."],
        [47.0, 47.6, "Uf."],
        [48.0, 49.9, "¡Ups! Me olvidé de eso."],
        [51.0, 51.4, "Espera, ¿eso era...?"],
        [51.5, 53.9, "Entonces... mandé el alquiler..."],
        [55.5, 56.0, "Bien. Eh, gracias."],
      ],
    },
  },
  {
    // "SPEED PLAY GTA VI EARLY ACCESS": car chase ends, Lucía and the stolen car.
    id: "SpeedEarlyAccess",
    frames: 900,
    props: {
      video: "assets/speed-earlyaccess-facecam.mp4",
      keywords: ["loco", "quieto", "dios", "suerte", "robé", "robaste", "madre"],
      lines: [
        [0.5, 2.0, "Oye, estás loco, ¿lo sabías?"],
        [2.0, 2.8, "¡Vete al diablo!"],
        [6.0, 7.0, "¡Eh! ¡Quieto ahí!"],
        [7.0, 9.0, "¡Dios mío!"],
        [9.0, 11.0, "No te muevas. Idiota."],
        [11.0, 12.4, "Es tu culpa."],
        [12.5, 17.8, "¡Dios mío, Dios mío, Dios mío!"],
        [19.0, 20.9, "Escucha, bro. Es tu día de suerte."],
        [21.0, 22.9, "¿Ah, sí? ¿Por qué?"],
        [23.0, 25.4, "En realidad no es mi coche. Lo robé."],
        [25.5, 27.4, "¿Lo robaste? ¿No era el coche de tu madre?"],
        [27.5, 30.0, "Lo robé para mi madre. ¡Guau!"],
      ],
    },
  },
  {
    // "speed reacts to gta vi": continues SpeedEarlyAccess (the stolen car lie).
    id: "SpeedReacciona",
    frames: 900,
    props: {
      video: "assets/speed-reacts-facecam.mp4",
      keywords: ["robé", "robaste", "madre", "mentira", "novio", "placas"],
      lines: [
        [0.0, 1.4, "En realidad no es mi coche. Lo robé."],
        [1.5, 3.4, "¿Lo robaste? ¿No era el coche de tu madre?"],
        [3.5, 5.9, "Lo robé para mi madre. ¡Guau!"],
        [6.0, 7.5, "Relájate, colega."],
        [7.5, 9.0, "¡Di una sola mentira!"],
        [9.0, 10.9, "Sígueme y salimos de este lío, ¿vale?"],
        [11.0, 12.4, "¡Guau! Cállate."],
        [12.5, 14.5, "¡Di una mentira!"],
        [15.5, 16.9, "¿Estás bien, señorita?"],
        [17.0, 17.9, "¿Conoces a este tipo?"],
        [18.0, 20.9, "Sí, es... mi novio."],
        [22.0, 23.9, "Es un coche nuevo."],
        [24.0, 26.4, "Nos peleábamos por quién conducía."],
        [26.5, 28.9, "¿En serio? Hay que cambiar las placas."],
        [29.0, 30.0, "Sí, él quería conducir."],
      ],
    },
  },
];
