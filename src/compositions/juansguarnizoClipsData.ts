import type {SpeedClipProps} from "./SpeedClip";

/**
 * JuanSGuarnizo GTA 6 stream clips (Twitch, Nov 2026), rendered with SpeedClip.
 * Spanish streamer: captions are his own words (from his stream's live captions)
 * and the game's Spanish dialogue. Facecam box top-left, cropped 340x250 at (40,90).
 */
const top = 734;

export const JUANSGUARNIZO_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "Odia a Lucia": dirt-bike race against Billy's gang.
    id: "JuanCarreraMotos",
    frames: 523,
    props: {
      video: "assets/jg-lucia-facecam.mp4",
      captionTop: top,
      keywords: ["gana!", "mames!", "enojaron."],
      lines: [
        [0.5, 3.4, "¡Bum! ¡A ver quién gana!"],
        [3.5, 4.3, "¡Ey! ¡Rayos!"],
        [4.4, 6.9, "¡Ay! Se ve que se enojaron."],
        [7.0, 9.9, "¡No mames!"],
        [10.0, 12.9, "¡No mames, no mames!"],
      ],
    },
  },
  {
    // "queriendo salvar a un mutante": a rescue that ends in "MORISTE".
    id: "JuanMutante",
    frames: 900,
    props: {
      video: "assets/jg-mutante-facecam.mp4",
      captionTop: top,
      keywords: ["ayudaste.", "todos.", "recoger?", "pelear"],
      lines: [
        [1.0, 2.4, "Pero ni ayudaste."],
        [2.5, 5.9, "Pues yo pensé que se los iba a papear a todos."],
        [7.0, 8.9, "¿Cómo que recoger?"],
        [22.0, 23.9, "Yo pensé que se los iba..."],
        [24.0, 26.9, "¡Daba para pelear a todos!"],
      ],
    },
  },
  {
    // "con delicadesa": landing the seaplane "gently".
    id: "JuanAterrizaje",
    frames: 900,
    props: {
      video: "assets/jg-delicadeza-facecam.mp4",
      captionTop: top,
      keywords: ["calma,", "delicadeza.", "rebote.", "agua."],
      lines: [
        [0.5, 2.4, "Con más calma, por favor."],
        [3.0, 5.9, "Tranqui, voy a aterrizar con delicadeza."],
        [11.5, 12.9, "En mi cabeza"],
        [13.0, 14.9, "iba a ser como un rebote."],
        [16.5, 17.9, "Claro."],
        [20.0, 23.9, "Mójale los pies a esta lindura."],
        [25.0, 27.9, "Vas. Aterrízalo en el agua. Órale."],
      ],
    },
  },
  {
    // "jajajajajaja xd": the robbery bag's dye pack explodes on Lucía.
    id: "JuanBolsaExplota",
    frames: 1281,
    props: {
      video: "assets/jg-jaja-facecam.mp4",
      captionTop: top,
      keywords: ["ojos!", "bolsa", "explotó!", "policía!"],
      lines: [
        [5.0, 6.9, "¡Rayos, rayos!"],
        [8.5, 10.4, "¿Cualquier cosa? No"],
        [10.5, 11.9, "pero ¿pero qué?"],
        [12.0, 15.9, "¿Pero qué acaba de pasar? ¡Perdón!"],
        [18.5, 19.9, "¿Hola?"],
        [20.0, 21.9, "¡Mis ojos! ¡Ay, mis ojos!"],
        [24.5, 25.9, "¡Ah, no veo nada!"],
        [26.5, 27.9, "¡Policía! ¡No huyas!"],
        [31.0, 34.4, "¿Qué? ¡La bolsa explotó!"],
        [36.5, 40.0, "No, esperen. ¡Esperen! ¡Tengo que regresar!"],
      ],
    },
  },
  {
    // "tenía un hijo?": the baby left at the café, police call child services.
    id: "JuanBebe",
    frames: 1156,
    props: {
      video: "assets/jg-hijo-facecam.mp4",
      captionTop: top,
      keywords: ["frijoles.", "menores", "guardería!", "hijo?"],
      lines: [
        [0.5, 2.9, "Algo sobre una cafetería. Que se le quedó algo."],
        [3.0, 5.9, "Recibido. Sí, recibido. Ya llegamos."],
        [6.0, 7.4, "Oye, les estuve llamando."],
        [7.5, 8.9, "Se fue y lo dejó aquí."],
        [9.0, 10.4, "No sabemos qué hacer, ¿entienden?"],
        [10.5, 11.9, "Se me están quemando los frijoles."],
        [12.0, 14.9, "Envíen a protección de menores ahora mismo."],
        [15.5, 16.9, "¿Van a tardar mucho en llevárselo?"],
        [17.0, 18.9, "¡Esto no es una guardería!"],
        [19.5, 20.9, "OK, ya llamé a los servicios sociales."],
        [21.0, 22.9, "Mandarán a alguien en cuanto puedan."],
        [23.0, 24.9, "Mientras tanto, tendrán que aguantar."],
        [26.5, 28.4, "No tengo esperanza, ¿o sí?"],
        [32.4, 36.9, "¿Tenía un hijo? ¿Tenía un hijo?"],
      ],
    },
  },
];
