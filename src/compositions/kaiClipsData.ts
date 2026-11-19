import type {SpeedClipProps} from "./SpeedClip";

/**
 * Kai Cenat GTA 6 stream clips (Twitch, 15-18 Nov 2026), rendered with SpeedClip.
 * Kai's facecam is a green-screen cutout bottom-left: cropped 440x300 at (0,700)
 * and scaled to the top 736 px; gameplay is a centre crop below.
 * Lines translate the game's dialogue (timed from its on-screen subtitles).
 */
const top = 690;

export const KAI_CLIPS: {id: string; frames: number; props: SpeedClipProps}[] = [
  {
    // "gtavi": the getaway, they get spotted and floor it.
    id: "KaiPersecucion",
    frames: 1074,
    props: {
      video: "assets/kai-gtavi-facecam.mp4",
      captionTop: top,
      keywords: ["profesional", "Lucía", "vámonos!", "muévete!"],
      lines: [
        [0.0, 2.0, "Un profesional se adapta. ¿Eres una profesional, Lucía?"],
        [2.5, 3.4, "Claro."],
        [4.0, 6.4, "Bien, necesito una profesional."],
        [8.0, 9.9, "¡Rayos...!"],
        [10.0, 10.9, "Lo veo."],
        [11.0, 12.9, "Creo que también nos vio. ¡Vámonos!"],
        [16.5, 17.9, "¡Vámonos!"],
        [19.0, 20.9, "¡Muévete! ¡Muévete!"],
      ],
    },
  },
  {
    // "Kai Crazy Reaction to GTA VI": the pickup at the back of the shop.
    id: "KaiRecogida",
    frames: 900,
    props: {
      video: "assets/kai-reaccion-facecam.mp4",
      captionTop: top,
      keywords: ["recoger", "derecha"],
      lines: [
        [8.0, 9.9, "¿Dijiste que venías a recoger o a dejar algo?"],
        [10.0, 11.9, "A recoger."],
        [19.5, 21.4, "Todo recto, primera puerta a la derecha."],
        [22.0, 23.4, "Sí."],
      ],
    },
  },
  {
    // "wtf is gta bro": street fight, then the elevator talk about Brian.
    id: "KaiBrian",
    frames: 900,
    props: {
      video: "assets/kai-wtf-facecam.mp4",
      captionTop: top,
      keywords: ["volvió", "arma", "Brian", "Snapmatic", "encantador"],
      lines: [
        [0.5, 2.4, "Mira quién volvió."],
        [16.5, 16.9, "¿Qué?"],
        [17.0, 20.4, "A veces me siento más cómodo cuando tengo que usar un arma, ¿sabes?"],
        [21.0, 22.9, "Tú solo sé encantador, ¿vale?"],
        [23.0, 24.4, "Sí."],
        [24.5, 27.4, "Y no te preocupes por Brian. Ya se retiró."],
        [27.5, 30.0, "Mira el Snapmatic de Lori. Parece que les encanta."],
      ],
    },
  },
  {
    // "kai plays gta 6 first": Jason and Lucía plan the car handover.
    id: "KaiPrimeraMision",
    frames: 1800,
    props: {
      video: "assets/kai-primero-facecam.mp4",
      captionTop: top,
      keywords: ["problemas", "bala", "confiar", "pago", "policía", "criminal", "Jason", "Lucía", "ahora"],
      lines: [
        [0.0, 0.9, "Bien. Voy para allá."],
        [1.0, 3.9, "Oye, estuve pensando, y"],
        [4.0, 7.9, "no creo que debamos contarle nuestros problemas. Todavía no."],
        [8.0, 9.4, "¿No era ese el punto de todo esto?"],
        [9.5, 12.9, "Mira, podría vendernos. O meternos una bala en la cabeza."],
        [13.0, 15.9, "En serio, ¿qué razón tenemos para confiar en este tipo?"],
        [16.0, 18.4, "Bueno, ¿y cómo quieres jugarla?"],
        [18.5, 22.9, "Con calma. Solo di: 'Hola, encantado. Aquí está tu coche.'"],
        [23.0, 27.4, "'¿Y nuestro pago? Avísanos si hay más trabajos criminales.'"],
        [27.5, 29.9, "Vale. Nos vemos allí."],
        [30.0, 30.9, "Sí."],
        [32.5, 33.9, "¿Me extrañaste?"],
        [34.0, 36.4, "He estado ocupado. ¿Le vas a escribir a este tipo?"],
        [36.5, 37.9, "Podría ser un policía, quién sabe."],
        [38.0, 40.9, "No es policía, ¿vale? Solo es precavido."],
        [41.5, 43.9, "Por eso ha sobrevivido tanto. Podríamos aprender algo."],
        [45.0, 46.4, "Quizás tú sí."],
        [46.5, 48.4, "Sí, tú eres la criminal perfecta."],
        [50.5, 52.9, "¿Jason? ¿Lucía?"],
        [53.0, 53.9, "Sí."],
        [54.0, 55.4, "Tenemos que irnos."],
        [55.5, 55.9, "¿Irnos?"],
        [56.0, 57.9, "Sí, irnos. ¡Ahora mismo!"],
        [58.0, 60.0, "¿Para qué crees que necesitaba que me llevaran?"],
      ],
    },
  },
  {
    // "kai gets emotional": the rooftop story about the fairground.
    id: "KaiFeria",
    frames: 900,
    props: {
      video: "assets/kai-emocion-facecam.mp4",
      captionTop: top,
      keywords: ["Lori", "feria", "niño?", "noria.", "verano", "manos", "carrusel."],
      lines: [
        [0.5, 2.9, "Sí, disfrutemos la vista."],
        [4.0, 8.4, "Nunca puedo fumarme uno de estos delante de Lori."],
        [9.5, 16.9, "¿Te conté de la feria que llegó a mi pueblo cuando era niño?"],
        [17.0, 17.9, "No creo."],
        [18.0, 21.4, "Tenían laberintos de paja y una noria."],
        [21.5, 24.9, "Fue lo mejor de todo el verano para nosotros."],
        [25.0, 26.4, "¡Todos, las manos donde podamos verlas!"],
        [26.5, 30.0, "Y tenían un carrusel precioso."],
      ],
    },
  },
];
