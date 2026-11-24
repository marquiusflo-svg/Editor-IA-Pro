import {Composition, Folder} from "remotion";


import {ShowcaseComposition} from "./compositions/Showcase";

import {TikTokVideo} from "./templates/social/TikTokVideo";
import {InstagramReel} from "./templates/social/InstagramReel";
import {YouTubeShort} from "./templates/social/YouTubeShort";

import {Presentation} from "./templates/content/Presentation";
import {Testimonial} from "./templates/content/Testimonial";

import {Announcement} from "./templates/promo/Announcement";
import {BeforeAfterDemo} from "./compositions/BeforeAfterDemo";

import {TalkingHeadEdit} from "./templates/editing/TalkingHeadEdit";
import {PodcastClip} from "./templates/editing/PodcastClip";

import {GTAInfo, gtaInfoDuration} from "./templates/gta/GTAInfo";
import {GTAVersus, gtaVersusDuration} from "./templates/gta/GTAVersus";
import {VERSUS_CAPTIONS, VERSUS_ITEMS, VERSUS_TIMING, VERSUS_VOICE} from "./compositions/gtaVersusData";
import * as Autos from "./compositions/gtaAutosData";
import * as Autos2 from "./compositions/gtaAutos2Data";
import * as Miami from "./compositions/gtaMiamiData";
import * as FloridaMan from "./compositions/gtaFloridaManData";
import * as Lanzamiento from "./compositions/gtaLanzamientoData";
import * as Historia from "./compositions/gtaHistoriaData";
import * as YaEstaAqui from "./compositions/gtaYaEstaAquiData";
import * as Trece from "./compositions/gta13AnosData";
import * as Dinero from "./compositions/gtaDineroData";
import * as Secretos from "./compositions/gta5SecretosData";
import * as Perdibles from "./compositions/gtaPerdiblesData";
import * as Secretos2 from "./compositions/gta5Secretos2Data";
import {GTAStory, gtaStoryDuration} from "./templates/gta/GTAStory";

const GTA_5_DETALLES = [
  {title: "Grabado en PS5", subtitle: "El tráiler 2 se capturó 100% dentro del juego"},
  {title: "Tienen apellido", subtitle: "Lucía Caminos y Jason Duval"},
  {title: "Seis regiones", subtitle: "Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia y Mount Kalaga"},
  {title: "El caimán de la tienda", subtitle: "Un guiño a los videos virales de Florida"},
  {title: "Cada tráiler, su canción", subtitle: "Tom Petty en el 1 y The Pointer Sisters en el 2"},
];

// Frames per scene at 30 fps (sized for a ~5 s voiceover line per fact).
const GTA_5_TIMING = {hook: 90, facts: [150, 150, 165, 150, 180], cta: 90};

// Scene lengths matched to the creator's own narration (public/voice/5-detalles.m4a).
const GTA_5_VOZ_TIMING = {hook: 114, facts: [210, 203, 171, 195, 323], cta: 125};

// Scene lengths matched to the OmniVoice cloned narration (non-commercial use only).
const GTA_5_CLON_TIMING = {hook: 114, facts: [228, 168, 159, 213, 264], cta: 119};

const GTA_5_DATOS = [
  {title: "Récord en YouTube", subtitle: "Más de 90 millones de vistas en 24 horas"},
  {title: "Se filtró", subtitle: "Rockstar publicó el tráiler 1 antes de lo planeado"},
  {title: "Más de 10 años", subtitle: "El primer GTA nuevo desde GTA 5 (2013)"},
  {title: "Protagonista mujer", subtitle: "Lucía, la primera de la saga desde el salto al 3D"},
  {title: "Vice City regresa", subtitle: "Debutó en 2002 con GTA Vice City, en los años 80"},
];

// Scene lengths matched to the OmniVoice cloned narration (non-commercial use only).
const GTA_5_DATOS_TIMING = {hook: 124, facts: [244, 189, 171, 208, 238], cta: 119};

const GTA_SECRETOS_T2 = [
  {title: "Llegó tras el retraso", subtitle: "Salió el 6 de mayo de 2025, días después del anuncio"},
  {title: "475 millones", subtitle: "De vistas en 24 horas, según Rockstar"},
  {title: "Jason, exsoldado", subtitle: "Del ejército a trabajar para narcos en los Cayos"},
  {title: "Lucía, a los golpes", subtitle: "Defender a su familia la llevó a la cárcel de Leonida"},
  {title: "Caras nuevas", subtitle: "Cal Hampton, Boobie Ike, Dre'Quan Priest y Raúl Bautista"},
];

// Scene lengths matched to the OmniVoice cloned narration (non-commercial use only).
const GTA_SECRETOS_T2_TIMING = {hook: 146, facts: [262, 236, 209, 228, 232], cta: 119};

// Same video narrated with the second (phone) reference recording, with sound effects.
const GTA_SECRETOS_T2_VOZ2_TIMING = {hook: 143, facts: [276, 228, 210, 238, 240], cta: 126};

const GTA_FACTS = [
  {title: "Vuelve Vice City", subtitle: "En Leonida, un estado inspirado en Florida"},
  {title: "Dos protagonistas", subtitle: "Lucía y Jason, una pareja criminal"},
  {title: "Solo nueva generación", subtitle: "Llega a PS5 y Xbox Series X|S"},
];

/**
 * Remotion entry component registering every composition shown in Studio.
 *
 * Each <Composition> declares the canvas (width/height in px), frame rate, and
 * total length (durationInFrames, at the given fps), plus defaultProps that seed
 * Studio's props editor. Compositions are grouped into <Folder>s purely for
 * organization in the Studio sidebar.
 *
 * Compositions render without any invisible watermark overlay.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={ShowcaseComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="GTA">
        <Composition
          id="GTAInfo"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_FACTS})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "3 cosas que ya sabemos de GTA 6",
            hookSub: "¿Las conocías?",
            facts: GTA_FACTS,
            cta: "Sígueme para más GTA 6",
            handle: "@tuusuario",
          }}
        />
        <Composition
          id="GTA5Detalles"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_5_DETALLES, timing: GTA_5_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 detalles de GTA 6 que nadie notó",
            hookSub: "¿Cuántos conocías?",
            facts: GTA_5_DETALLES,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            timing: GTA_5_TIMING,
          }}
        />
        <Composition
          id="GTA5DetallesVoz"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_5_DETALLES, timing: GTA_5_VOZ_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 detalles de GTA 6 que nadie notó",
            hookSub: "¿Cuántos conocías?",
            facts: GTA_5_DETALLES,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            timing: GTA_5_VOZ_TIMING,
            voiceTrack: "voice/5-detalles.m4a",
          }}
        />
        <Composition
          id="GTA5DetallesClon"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_5_DETALLES, timing: GTA_5_CLON_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 detalles de GTA 6 que nadie notó",
            hookSub: "¿Cuántos conocías?",
            facts: GTA_5_DETALLES,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            timing: GTA_5_CLON_TIMING,
            voiceTrack: "voice/5-detalles-clon.m4a",
          }}
        />
        <Composition
          id="GTA5DatosClon"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_5_DATOS, timing: GTA_5_DATOS_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 datos curiosos de GTA 6",
            hookSub: "Tienes que saberlos",
            facts: GTA_5_DATOS,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            timing: GTA_5_DATOS_TIMING,
            voiceTrack: "voice/5-datos-clon.m4a",
          }}
        />
        <Composition
          id="GTASecretosTrailer2"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_SECRETOS_T2, timing: GTA_SECRETOS_T2_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 secretos del tráiler 2 de GTA 6",
            hookSub: "¿Los viste?",
            facts: GTA_SECRETOS_T2,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            theme: "night" as const,
            timing: GTA_SECRETOS_T2_TIMING,
            voiceTrack: "voice/secretos-trailer2-clon.m4a",
          }}
        />
        <Composition
          id="GTASecretosTrailer2SFX"
          component={GTAInfo}
          durationInFrames={gtaInfoDuration({facts: GTA_SECRETOS_T2, timing: GTA_SECRETOS_T2_VOZ2_TIMING})}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "5 secretos del tráiler 2 de GTA 6",
            hookSub: "¿Los viste?",
            facts: GTA_SECRETOS_T2,
            cta: "Sígueme para más GTA 6",
            handle: "@WoloByte",
            theme: "night" as const,
            timing: GTA_SECRETOS_T2_VOZ2_TIMING,
            voiceTrack: "voice/secretos-trailer2-voz2.m4a",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTAvsVidaReal"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "GTA 6 vs vida real",
            hook: "¿El mapa de GTA 6 es real?",
            items: VERSUS_ITEMS,
            cta: "¿A cuál irías primero?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: VERSUS_TIMING,
            captions: VERSUS_CAPTIONS,
            voiceTrack: VERSUS_VOICE,
            autoSfx: true,
          }}
        />
        <Composition
          id="GTAAutosVsReales"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(Autos.VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "Autos de GTA vs reales",
            hook: "¿Las marcas de GTA son reales?",
            items: Autos.VERSUS_ITEMS,
            cta: "¿Cuál es tu favorita?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: Autos.VERSUS_TIMING,
            captions: Autos.VERSUS_CAPTIONS,
            voiceTrack: Autos.VERSUS_VOICE,
            autoSfx: true,
            backgrounds: Autos.AUTOS_BACKGROUNDS,
            gameLabel: "En GTA",
          }}
        />
        <Composition
          id="GTAAutosVsReales2"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(Autos2.VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "Autos de GTA · Parte 2",
            hook: "Más marcas de GTA que son reales",
            items: Autos2.VERSUS_ITEMS,
            cta: "¿Cuál te gusta más?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: Autos2.VERSUS_TIMING,
            captions: Autos2.VERSUS_CAPTIONS,
            voiceTrack: Autos2.VERSUS_VOICE,
            autoSfx: true,
            backgrounds: Autos2.AUTOS_BACKGROUNDS,
            gameLabel: "En GTA",
          }}
        />
        <Composition
          id="GTAViceCityVsMiami"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(Miami.VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "Vice City vs Miami real",
            hook: "¿Vice City existe de verdad?",
            items: Miami.VERSUS_ITEMS,
            cta: "¿Qué lugar quieres ver?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: Miami.VERSUS_TIMING,
            captions: Miami.VERSUS_CAPTIONS,
            voiceTrack: Miami.VERSUS_VOICE,
            autoSfx: true,
            backgrounds: Miami.MIAMI_BACKGROUNDS,
            gameLabel: "En GTA Vice City",
          }}
        />
        <Composition
          id="GTAFloridaMan"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(FloridaMan.VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "GTA 6 vs Florida Man",
            hook: "¿El tráiler de GTA 6 pasó de verdad?",
            items: FloridaMan.VERSUS_ITEMS,
            cta: "¿Cuál es el más Florida?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: FloridaMan.VERSUS_TIMING,
            captions: FloridaMan.VERSUS_CAPTIONS,
            voiceTrack: FloridaMan.VERSUS_VOICE,
            autoSfx: true,
            backgrounds: FloridaMan.FLORIDA_BACKGROUNDS,
            gameLabel: "En el tráiler",
          }}
        />
        <Composition
          id="GTA6vsGTA5Lanzamiento"
          component={GTAVersus}
          durationInFrames={gtaVersusDuration(Lanzamiento.VERSUS_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            badge: "GTA 6 vs GTA 5",
            hook: "GTA 6 ya salió: ¿supera a GTA 5?",
            items: Lanzamiento.VERSUS_ITEMS,
            cta: "¿Ya lo estás jugando?",
            ctaSub: "Comenta",
            handle: "@WoloByte",
            timing: Lanzamiento.VERSUS_TIMING,
            captions: Lanzamiento.VERSUS_CAPTIONS,
            voiceTrack: Lanzamiento.VERSUS_VOICE,
            autoSfx: true,
            backgrounds: Lanzamiento.LANZ_BACKGROUNDS,
            gameLabel: "GTA 6",
            realLabel: "GTA 5",
          }}
        />
        <Composition
          id="GTA6HistoriaVsGTA5"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Historia.STORY_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Historia.STORY_SCENES,
            timing: Historia.STORY_TIMING,
            captions: Historia.STORY_CAPTIONS,
            keywords: Historia.STORY_KEYWORDS,
            voiceTrack: Historia.STORY_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6YaEstaAqui"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(YaEstaAqui.YA_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: YaEstaAqui.YA_SCENES,
            timing: YaEstaAqui.YA_TIMING,
            captions: YaEstaAqui.YA_CAPTIONS,
            keywords: YaEstaAqui.YA_KEYWORDS,
            voiceTrack: YaEstaAqui.YA_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6TreceAnos"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Trece.TRECE_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Trece.TRECE_SCENES,
            timing: Trece.TRECE_TIMING,
            captions: Trece.TRECE_CAPTIONS,
            keywords: Trece.TRECE_KEYWORDS,
            voiceTrack: Trece.TRECE_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6Dinero"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Dinero.DINERO_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Dinero.DINERO_SCENES,
            timing: Dinero.DINERO_TIMING,
            captions: Dinero.DINERO_CAPTIONS,
            keywords: Dinero.DINERO_KEYWORDS,
            voiceTrack: Dinero.DINERO_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6CincoSecretos"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Secretos.SEC_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Secretos.SEC_SCENES,
            timing: Secretos.SEC_TIMING,
            captions: Secretos.SEC_CAPTIONS,
            keywords: Secretos.SEC_KEYWORDS,
            voiceTrack: Secretos.SEC_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6Perdibles"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Perdibles.PER_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Perdibles.PER_SCENES,
            timing: Perdibles.PER_TIMING,
            captions: Perdibles.PER_CAPTIONS,
            keywords: Perdibles.PER_KEYWORDS,
            voiceTrack: Perdibles.PER_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
        <Composition
          id="GTA6CincoSecretos2"
          component={GTAStory}
          durationInFrames={gtaStoryDuration(Secretos2.SEC2_TIMING)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            scenes: Secretos2.SEC2_SCENES,
            timing: Secretos2.SEC2_TIMING,
            captions: Secretos2.SEC2_CAPTIONS,
            keywords: Secretos2.SEC2_KEYWORDS,
            voiceTrack: Secretos2.SEC2_VOICE,
            handle: "@WoloByte",
            autoSfx: true,
          }}
        />
      </Folder>

      <Folder name="Social">
        <Composition
          id="TikTok"
          component={TikTokVideo}
          durationInFrames={270}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "Did you know this?",
            body: "AI can edit videos now using just code.",
            cta: "Follow for more",
          }}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReel}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Your headline here",
            subtext: "Supporting text goes here",
            brandName: "Brand",
          }}
        />
        <Composition
          id="YouTubeShort"
          component={YouTubeShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "Your Title Here",
            subtitle: "Subtitle goes here",
          }}
        />
      </Folder>

      <Folder name="Content">
        <Composition
          id="Presentation"
          component={Presentation}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            slides: [
              {title: "Welcome", body: "This is slide one"},
              {title: "The Problem", body: "Here's what we're solving"},
              {title: "The Solution", body: "Here's how we solve it"},
            ],
          }}
        />
        <Composition
          id="Testimonial"
          component={Testimonial}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote:
              "This product completely changed how we work. Highly recommended.",
            author: "Jane Doe",
            role: "CEO at Company",
          }}
        />
      </Folder>

      <Folder name="Promo">
        <Composition
          id="Announcement"
          component={Announcement}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            preTitle: "Introducing",
            title: "Something Amazing",
            subtitle: "The future is here",
            cta: "Learn More",
          }}
        />
        <Composition
          id="BeforeAfter"
          component={BeforeAfterDemo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Editing">
        <Composition
          id="TalkingHeadEdit"
          component={TalkingHeadEdit}
          durationInFrames={900}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            showCaptions: true,
            captionPreset: "bold" as const,
            removeSilence: false,
          }}
        />
        <Composition
          id="PodcastClip"
          component={PodcastClip}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            clipStartSeconds: 0,
            clipEndSeconds: 30,
            showCaptions: true,
            captionPreset: "bold" as const,
          }}
        />
      </Folder>
    </>
  );
};
