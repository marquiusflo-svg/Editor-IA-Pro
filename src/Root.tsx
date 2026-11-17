import {Composition, Folder} from "remotion";

import {withWatermark} from "./components/overlays/withWatermark";

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
 * Every component is wrapped with withWatermark so the invisible forensic
 * watermark is baked into all renders by default.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={withWatermark(ShowcaseComposition)}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="GTA">
        <Composition
          id="GTAInfo"
          component={withWatermark(GTAInfo)}
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
          component={withWatermark(GTAInfo)}
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
          component={withWatermark(GTAInfo)}
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
          component={withWatermark(GTAInfo)}
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
      </Folder>

      <Folder name="Social">
        <Composition
          id="TikTok"
          component={withWatermark(TikTokVideo)}
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
          component={withWatermark(InstagramReel)}
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
          component={withWatermark(YouTubeShort)}
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
          component={withWatermark(Presentation)}
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
          component={withWatermark(Testimonial)}
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
          component={withWatermark(Announcement)}
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
          component={withWatermark(BeforeAfterDemo)}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Editing">
        <Composition
          id="TalkingHeadEdit"
          component={withWatermark(TalkingHeadEdit)}
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
          component={withWatermark(PodcastClip)}
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
