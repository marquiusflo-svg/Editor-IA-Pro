import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * WebPro Ecuador — cinematic 9:16 promo (1080x1920, 30 fps, 31 s).
 * Built from the brand's own flyers in public/webpro/.
 * Music bed: scripts/webpro-music.py (120 bpm, cuts land on beats).
 */

// ---------- brand ----------
const BG = "#0a0c18";
const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";
const GRAD = "linear-gradient(90deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)";
const FONT = "'Poppins', sans-serif";
const PHONE = "+593 99 579 2471";
const EMAIL = "marquiusflo@gmail.com";

// ---------- timeline (frames @30fps) ----------
const T = {
  intro: {from: 0, dur: 115},
  hook: {from: 105, dur: 130},
  services: {from: 225, dur: 190},
  plans: {from: 405, dur: 370},
  cta: {from: 765, dur: 165},
};
export const WEBPRO_DURATION = 930;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading Poppins"));
  useEffect(() => {
    const faces = [400, 500, 600, 700, 800, 900].map(
      (w) => new FontFace("Poppins", `url(${staticFile(`fonts/Poppins-${w}.ttf`)})`, {weight: String(w)}),
    );
    Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
};

const GradText: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span
    style={{
      background: GRAD,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

// ---------- atmosphere ----------
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame / 70);
  const b = Math.cos(frame / 90);
  return (
    <AbsoluteFill style={{background: BG, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          left: 380 + a * 80,
          top: -620 + b * 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}cc 0%, ${BLUE}33 40%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          left: -800 - b * 70,
          top: 1050 + a * 70,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}bb 0%, ${VIOLET}33 40%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Floating dust motes catching the light. */
const Dust: React.FC<{count?: number}> = ({count = 40}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 0.3 + random(`s${i}`) * 0.9;
        const y = ((random(`y${i}`) * 2100 - frame * speed) % 2100 + 2100) % 2100 - 90;
        const size = 2 + random(`r${i}`) * 5;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / (15 + i) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 40 + i) * 20,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#c4b5fd" : "#bfdbfe",
              opacity: 0.35 * tw,
              filter: size > 5 ? "blur(2px)" : undefined,
              boxShadow: "0 0 12px rgba(165,180,252,0.9)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Film grain + vignette + subtle letterbox, applied over everything. */
const CinemaFinish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <AbsoluteFill
        style={{background: "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)"}}
      />
      <svg width="1080" height="1920" style={{position: "absolute", opacity: 0.09, mixBlendMode: "overlay"}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 24} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Anamorphic light streak that sweeps across at scene cuts. */
const LightSweep: React.FC<{at: number; color?: string}> = ({at, color = "#a5b4fc"}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at - 10, at + 14], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const o = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{pointerEvents: "none", mixBlendMode: "screen"}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, ${color}55, transparent 60%)`, opacity: o}} />
      <div
        style={{
          position: "absolute",
          top: 940,
          left: interpolate(p, [0, 1], [-1400, 1100]),
          width: 1400,
          height: 40,
          background: `linear-gradient(90deg, transparent, ${color}, #ffffff, ${color}, transparent)`,
          filter: "blur(10px)",
          opacity: o,
          transform: "rotate(-8deg)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Scene wrapper: enters by un-blurring/settling, exits by blurring forward. */
const Scene: React.FC<{dur: number; children: React.ReactNode; inF?: number; outF?: number}> = ({
  dur,
  children,
  inF = 12,
  outF = 12,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, inF], [0, 1], {...clamp, easing: easeOut});
  const exit = interpolate(frame, [dur - outF, dur], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        filter: `blur(${(1 - enter) * 18 + exit * 22}px)`,
        transform: `scale(${1 + (1 - enter) * 0.06 + exit * 0.12})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------- logo ----------
const FlagBar: React.FC<{width: number; progress: number}> = ({width, progress}) => (
  <div style={{width: width * progress, height: 9, borderRadius: 6, overflow: "hidden", display: "flex"}}>
    <div style={{flex: 2, background: "#FFD100"}} />
    <div style={{flex: 1, background: "#0072CE"}} />
    <div style={{flex: 1, background: "#EF3340"}} />
  </div>
);

const LogoIcon: React.FC<{size: number; glow?: number}> = ({size, glow = 1}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.27,
      background: `linear-gradient(135deg, ${BLUE}, ${VIOLET})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 ${60 * glow}px rgba(129,140,248,${0.7 * glow}), inset 0 2px 0 rgba(255,255,255,0.25)`,
      color: "white",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.36,
      letterSpacing: -size * 0.02,
    }}
  >
    {"</>"}
  </div>
);

const Logo: React.FC<{scale?: number; local: number}> = ({scale = 1, local}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame: local, fps, config: {damping: 13, stiffness: 110}});
  const word = interpolate(local, [8, 30], [0, 1], {...clamp, easing: easeOut});
  const track = interpolate(local, [18, 45], [0, 1], {...clamp, easing: easeOut});
  const bar = interpolate(local, [30, 50], [0, 1], {...clamp, easing: easeOut});
  return (
    <div style={{display: "flex", alignItems: "center", gap: 36 * scale, transform: `scale(${scale})`}}>
      <div style={{transform: `scale(${pop}) rotate(${(1 - pop) * -25}deg)`}}>
        <LogoIcon size={170} glow={pop} />
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 6}}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: -3,
            color: "white",
            clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
            transform: `translateX(${(1 - word) * -30}px)`,
          }}
        >
          Web<GradText>Pro</GradText>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 24, opacity: track}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 34,
              color: "#e5e7eb",
              letterSpacing: interpolate(track, [0, 1], [2, 17]),
            }}
          >
            ECUADOR
          </div>
          <FlagBar width={90} progress={bar} />
        </div>
      </div>
    </div>
  );
};

// ---------- 1. intro ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  // iris-open letterbox
  const bars = interpolate(frame, [0, 26], [960, 150], {...clamp, easing: ease});
  const push = interpolate(frame, [0, 115], [1.08, 1], {easing: Easing.out(Easing.quad)});
  const tag = interpolate(frame, [48, 66], [0, 1], {...clamp, easing: easeOut});
  const flare = interpolate(frame, [14, 30, 60], [0, 1, 0.35], clamp);
  return (
    <Scene dur={T.intro.dur} inF={1}>
      <Backdrop />
      <Dust />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", transform: `scale(${push})`}}>
        {/* lens flare behind the logo */}
        <div
          style={{
            position: "absolute",
            width: 1800,
            height: 10,
            background: "linear-gradient(90deg, transparent, #93c5fd, #fff, #c4b5fd, transparent)",
            filter: "blur(6px)",
            opacity: flare,
            top: 930,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(129,140,248,0.45), transparent 65%)",
            opacity: flare,
          }}
        />
        <Logo local={frame - 10} />
        <div
          style={{
            position: "absolute",
            top: 1130,
            opacity: tag,
            transform: `translateY(${(1 - tag) * 24}px)`,
            padding: "18px 40px",
            borderRadius: 999,
            border: "2px solid rgba(165,180,252,0.45)",
            background: "rgba(255,255,255,0.05)",
            color: "#dbeafe",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 6,
          }}
        >
          DISEÑO WEB PROFESIONAL
        </div>
      </AbsoluteFill>
      <div style={{position: "absolute", top: 0, left: 0, right: 0, height: bars, background: "black"}} />
      <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: bars, background: "black"}} />
    </Scene>
  );
};

// ---------- 2. hook ----------
const HOOK_LINES: {words: {t: string; grad?: boolean}[]; delay: number}[] = [
  {words: [{t: "¿Tu"}, {t: "negocio"}], delay: 6},
  {words: [{t: "aún"}, {t: "no"}, {t: "tiene"}], delay: 20},
  {words: [{t: "página", grad: true}, {t: "web?", grad: true}], delay: 36},
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, T.hook.dur], [1, 1.1]);
  const sub = interpolate(frame, [62, 80], [0, 1], {...clamp, easing: easeOut});
  return (
    <Scene dur={T.hook.dur}>
      <Backdrop />
      <Dust count={30} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 90px",
          transform: `scale(${push})`,
        }}
      >
        {HOOK_LINES.map((line, li) => (
          <div key={li} style={{display: "flex", gap: 30, flexWrap: "wrap"}}>
            {line.words.map((w, wi) => {
              const d = line.delay + wi * 5;
              const p = interpolate(frame, [d, d + 16], [0, 1], {...clamp, easing: easeOut});
              const style: React.CSSProperties = {
                display: "inline-block",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: li === 2 ? 150 : 132,
                lineHeight: 1.12,
                letterSpacing: -4,
                color: "white",
                opacity: p,
                filter: `blur(${(1 - p) * 14}px)`,
                transform: `translateY(${(1 - p) * 70}px) rotate(${(1 - p) * 4}deg)`,
              };
              return w.grad ? (
                <GradText key={wi} style={{...style, color: "transparent", paddingBottom: 12}}>
                  {w.t}
                </GradText>
              ) : (
                <span key={wi} style={style}>
                  {w.t}
                </span>
              );
            })}
          </div>
        ))}
        <div
          style={{
            marginTop: 50,
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.4,
            color: "rgba(226,232,240,0.9)",
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
          }}
        >
          Creamos sitios modernos, rápidos y listos para atraer más clientes.
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- camera over a flyer ----------
type Key = {f: number; x: number; y: number; s: number};

/** Image coordinates are in the flyer's own pixels (1125x2000 → 1080x1920). */
const IMG_SCALE = 1080 / 1125;

const camAt = (frame: number, keys: Key[]) => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const p = ease((frame - a.f) / (b.f - a.f));
      return {f: frame, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, s: a.s + (b.s - a.s) * p};
    }
  }
  return keys[keys.length - 1];
};

const FlyerCam: React.FC<{src: string; keys: Key[]; spot: (f: number) => number}> = ({src, keys, spot}) => {
  const frame = useCurrentFrame();
  const c = camAt(frame, keys);
  const fx = c.x * IMG_SCALE;
  const fy = c.y * IMG_SCALE;
  // 3D establishing tilt that settles into a flat dolly
  const tilt = interpolate(frame, [0, 45], [1, 0], {...clamp, easing: ease});
  // motion blur while the camera travels
  const n = camAt(frame + 1, keys);
  const vel = Math.abs(n.y - c.y) + Math.abs(n.s - c.s) * 400;
  const spotOpacity = spot(frame);
  return (
    <AbsoluteFill style={{perspective: 1800}}>
      <AbsoluteFill
        style={{
          transform: `rotateX(${tilt * 16}deg) rotateY(${tilt * -14}deg) rotateZ(${tilt * 3}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            width: 1080,
            height: 1920,
            transformOrigin: "0 0",
            transform: `translate(${540 - fx * c.s}px, ${960 - fy * c.s}px) scale(${c.s})`,
            filter: `blur(${Math.min(vel * 0.15, 3)}px)`,
            boxShadow: `0 60px 140px rgba(0,0,0,${0.7 * tilt}), 0 0 0 ${2 / c.s}px rgba(165,180,252,${0.4 * tilt})`,
            borderRadius: 30 * tilt,
          }}
        />
      </AbsoluteFill>
      {/* spotlight: dims everything outside the centre band */}
      <AbsoluteFill
        style={{
          opacity: spotOpacity,
          background:
            "linear-gradient(180deg, rgba(9,10,22,1) 0%, rgba(9,10,22,0.99) 29%, rgba(9,10,22,0) 39%, rgba(9,10,22,0) 61%, rgba(9,10,22,0.99) 71%, rgba(9,10,22,1) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Kicker label + headline that appears in the dimmed area above or below the spotlight. */
const Caption: React.FC<{
  from: number;
  to: number;
  kicker: string;
  title: React.ReactNode;
  top: number;
}> = ({from, to, kicker, title, top}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + 14], [0, 1], {...clamp, easing: easeOut});
  const q = interpolate(frame, [to - 10, to], [0, 1], clamp);
  if (frame < from || frame > to) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: p * (1 - q),
        transform: `translateY(${(1 - p) * 30 - q * 20}px)`,
        filter: `blur(${(1 - p) * 8}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 10,
          color: "#a5b4fc",
          marginBottom: 14,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 1.08,
          letterSpacing: -2,
          color: "white",
          padding: "0 60px",
          textShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ---------- 3. services ----------
const SERVICE_KEYS: Key[] = [
  {f: 0, x: 562, y: 1000, s: 0.78},
  {f: 40, x: 562, y: 1000, s: 0.86},
  {f: 70, x: 562, y: 824, s: 1.1},
  {f: 98, x: 562, y: 830, s: 1.13},
  {f: 118, x: 562, y: 1051, s: 1.1},
  {f: 140, x: 562, y: 1056, s: 1.13},
  {f: 160, x: 562, y: 1277, s: 1.1},
  {f: 190, x: 562, y: 1285, s: 1.16},
];

const Services: React.FC = () => (
  <Scene dur={T.services.dur}>
    <Backdrop />
    <FlyerCam
      src="webpro/servicios-916.png"
      keys={SERVICE_KEYS}
      spot={(f) => interpolate(f, [50, 70], [0, 1], clamp)}
    />
    <Caption
      from={58}
      to={190}
      top={330}
      kicker="TODO EN UN SOLO LUGAR"
      title={
        <>
          Lo que tu negocio <GradText>necesita</GradText>
        </>
      }
    />
    <Caption from={66} to={110} top={1390} kicker="" title={<span style={{fontSize: 50, fontWeight: 600}}>Webs · Tiendas · Landings</span>} />
    <Caption from={112} to={152} top={1390} kicker="" title={<span style={{fontSize: 50, fontWeight: 600}}>Marca · SEO · Reservas</span>} />
    <Caption from={154} to={190} top={1390} kicker="" title={<span style={{fontSize: 50, fontWeight: 600}}>WhatsApp · Correo · Hosting</span>} />
  </Scene>
);

// ---------- 4. plans ----------
// Card centres in the 1125x2000 pricing flyer.
const PLAN_KEYS: Key[] = [
  {f: 0, x: 562, y: 1000, s: 0.78},
  {f: 35, x: 562, y: 1000, s: 0.86},
  {f: 65, x: 562, y: 290, s: 1.08},
  {f: 100, x: 562, y: 296, s: 1.12},
  {f: 125, x: 562, y: 550, s: 1.1},
  {f: 175, x: 562, y: 556, s: 1.14},
  {f: 200, x: 562, y: 873, s: 1.1},
  {f: 255, x: 562, y: 879, s: 1.15},
  {f: 280, x: 562, y: 1198, s: 1.1},
  {f: 330, x: 562, y: 1204, s: 1.14},
  {f: 352, x: 562, y: 1418, s: 1.08},
  {f: 370, x: 562, y: 1420, s: 1.1},
];

const PriceTag: React.FC<{from: number; to: number; label: string; price: string; note: string; hot?: boolean}> = ({
  from,
  to,
  label,
  price,
  note,
  hot,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame > to) return null;
  const pop = spring({frame: frame - from - 6, fps, config: {damping: 12, stiffness: 140}});
  const out = interpolate(frame, [to - 10, to], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 1320,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: Math.min(1, pop * 1.4) * (1 - out),
        transform: `translateY(${(1 - pop) * 60}px)`,
      }}
    >
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: "#a5b4fc"}}>{label}</div>
      <div style={{display: "flex", alignItems: "baseline", gap: 18}}>
        <span style={{fontFamily: FONT, fontSize: 40, color: "#cbd5e1"}}>desde</span>
        <GradText style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, letterSpacing: -6, lineHeight: 1.15}}>
          {price}
        </GradText>
      </div>
      <div
        style={{
          marginTop: 4,
          padding: "12px 34px",
          borderRadius: 999,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 34,
          color: "white",
          background: hot ? `linear-gradient(90deg, ${BLUE}, ${VIOLET})` : "rgba(255,255,255,0.08)",
          border: hot ? "none" : "2px solid rgba(165,180,252,0.35)",
          boxShadow: hot ? "0 0 40px rgba(139,92,246,0.6)" : undefined,
        }}
      >
        {note}
      </div>
    </div>
  );
};

const Plans: React.FC = () => (
  <Scene dur={T.plans.dur}>
    <Backdrop />
    <FlyerCam
      src="webpro/planes-916.png"
      keys={PLAN_KEYS}
      spot={(f) => interpolate(f, [45, 65], [0, 1], clamp)}
    />
    <Caption
      from={52}
      to={112}
      top={330}
      kicker="PAGO EN 2 PARTES"
      title={
        <>
          50% al iniciar
          <br />
          <GradText>50% al entregar</GradText>
        </>
      }
    />
    <PriceTag from={115} to={192} label="EMPRENDEDOR" price="$180" note="Landing page lista para vender" />
    <PriceTag from={192} to={272} label="PROFESIONAL" price="$350" note="★ El más popular" hot />
    <PriceTag from={272} to={345} label="TIENDA ONLINE" price="$650" note="Vende las 24 horas" />
    <Caption
      from={345}
      to={372}
      top={330}
      kicker="EXTRAS"
      title={<span style={{fontSize: 52}}>Mantenimiento · Logo · Reservas</span>}
    />
    <Caption from={118} to={343} top={330} kicker="PLANES Y PRECIOS" title={<GradText>Elige tu plan</GradText>} />
  </Scene>
);

// ---------- 5. CTA ----------
const ContactRow: React.FC<{icon: string; text: string; local: number}> = ({icon, text, local}) => {
  const p = interpolate(local, [0, 16], [0, 1], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: p,
        transform: `translateX(${(1 - p) * -40}px)`,
      }}
    >
      <Img src={staticFile(icon)} style={{width: 96, height: 96, borderRadius: 24}} />
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: text.includes("@") ? 50 : 62, color: "#0f172a", letterSpacing: -1}}>
        {text}
      </div>
    </div>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = spring({frame: frame - 4, fps, config: {damping: 14, stiffness: 120}});
  const card = spring({frame: frame - 26, fps, config: {damping: 16, stiffness: 110}});
  const shine = interpolate(frame, [70, 100], [-0.3, 1.3], clamp);
  const pulse = 1 + Math.sin(frame / 6) * 0.015;
  return (
    <Scene dur={T.cta.dur} outF={18}>
      <Backdrop />
      <Dust count={30} />
      <AbsoluteFill style={{alignItems: "center", paddingTop: 230}}>
        <Logo local={frame + 60} scale={0.72} />
        <div
          style={{
            marginTop: 150,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: -5,
            color: "white",
            transform: `scale(${title}) translateY(${(1 - title) * 40}px)`,
            opacity: Math.min(1, title * 1.3),
            textShadow: "0 0 60px rgba(129,140,248,0.55)",
          }}
        >
          ¡Lánzate <GradText>hoy!</GradText>
        </div>
        <div
          style={{
            marginTop: 70,
            width: 940,
            padding: "56px 56px 60px",
            borderRadius: 48,
            background: "white",
            boxShadow: "0 40px 120px rgba(59,130,246,0.35), 0 0 0 1px rgba(255,255,255,0.4)",
            transform: `translateY(${(1 - card) * 200}px) scale(${(0.9 + card * 0.1) * pulse})`,
            opacity: Math.min(1, card * 1.5),
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#0f172a", letterSpacing: -1.5}}>
            ¡Escríbenos!
          </div>
          <div style={{fontFamily: FONT, fontSize: 36, color: "#475569", marginBottom: 40}}>
            Cotización gratis y sin compromiso
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 30}}>
            <ContactRow icon="webpro/icon-wa.png" text={PHONE} local={frame - 40} />
            <ContactRow icon="webpro/icon-mail.png" text={EMAIL} local={frame - 50} />
          </div>
          {/* glass shine */}
          <div
            style={{
              position: "absolute",
              top: -100,
              bottom: -100,
              width: 160,
              left: `${shine * 100}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
              transform: "rotate(18deg)",
              mixBlendMode: "overlay",
            }}
          />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- master ----------
export const WebProPromo: React.FC<{withSfx?: boolean}> = ({withSfx = true}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: BG}}>
      {Object.entries(T).map(([k, s]) => (
        <Sequence key={k} from={s.from} durationInFrames={s.dur}>
          {k === "intro" && <Intro />}
          {k === "hook" && <Hook />}
          {k === "services" && <Services />}
          {k === "plans" && <Plans />}
          {k === "cta" && <CTA />}
        </Sequence>
      ))}

      <LightSweep at={T.hook.from + 5} />
      <LightSweep at={T.services.from + 3} color="#93c5fd" />
      <LightSweep at={T.plans.from + 3} color="#c4b5fd" />
      <LightSweep at={T.cta.from + 3} />
      <CinemaFinish />

      <Audio src={staticFile("webpro/music.wav")} volume={(f) => interpolate(f, [0, 15, WEBPRO_DURATION - 40, WEBPRO_DURATION], [0, 0.68, 0.68, 0], clamp)} />
      {/* Real recorded SFX (Oculus Audio Pack 01, CC BY 4.0, see public/webpro/SFX-CREDITS.md),
          placed and levelled from public/webpro/sfx-pro-cues.json. */}
      {withSfx && <Audio src={staticFile("webpro/sfx-pro.wav")} volume={0.75} />}
    </AbsoluteFill>
  );
};
