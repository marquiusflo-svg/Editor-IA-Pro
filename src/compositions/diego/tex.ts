import * as THREE from "three";

// Procedural canvas textures. Everything is seeded so every frame (and every
// render worker) draws exactly the same pixels.

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const cache = new Map<string, THREE.Texture>();

const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, r: () => number) => void, opts: {repeat?: [number, number]; color?: boolean} = {}) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c, rng(key.split("").reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7)));
  const t = new THREE.CanvasTexture(cv);
  if (opts.color !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  cache.set(key, t);
  return t;
};

const blot = (c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, r2: () => number) => {
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rr = r * (0.65 + r2() * 0.5);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr * 0.85;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
  c.fill();
};

/** Skin albedo: base tone + mottling, freckles, pimples, redness. */
export const skinTex = (base: string, key: string, rough = true) =>
  make(`skin-${key}`, 1024, 1024, (c, r) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = `rgba(${r() > 0.5 ? "190,90,80" : "255,225,205"},${0.02 + r() * 0.035})`;
      c.beginPath();
      c.arc(r() * 1024, r() * 1024, 8 + r() * 40, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 2600; i++) {
      c.fillStyle = `rgba(120,60,40,${0.05 + r() * 0.08})`;
      c.fillRect(r() * 1024, r() * 1024, 1.5, 1.5);
    }
    if (rough) {
      for (let i = 0; i < 16; i++) {
        const x = r() * 1024;
        const y = r() * 1024;
        const g = c.createRadialGradient(x, y, 0, x, y, 7 + r() * 6);
        g.addColorStop(0, "rgba(205,40,40,0.85)");
        g.addColorStop(0.35, "rgba(220,70,60,0.45)");
        g.addColorStop(1, "rgba(220,70,60,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, 14, 0, Math.PI * 2);
        c.fill();
      }
    }
  });

/** Grayscale micro-bump (pores). */
export const poreBump = () =>
  make(
    "pores",
    512,
    512,
    (c, r) => {
      c.fillStyle = "#808080";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) {
        const v = 90 + Math.floor(r() * 80);
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2);
      }
    },
    {repeat: [3, 3], color: false},
  );

/** Iris with radial fibers, limbal ring, pupil and catchlight. */
export const irisTex = (color: string, key: string) =>
  make(`iris-${key}`, 256, 256, (c, r) => {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, 256, 256);
    const g = c.createRadialGradient(128, 128, 20, 128, 128, 120);
    g.addColorStop(0, color);
    g.addColorStop(0.75, color);
    g.addColorStop(1, "#140a06");
    c.fillStyle = g;
    c.beginPath();
    c.arc(128, 128, 120, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 160; i++) {
      const a = r() * Math.PI * 2;
      c.strokeStyle = `rgba(${r() > 0.5 ? "255,230,180" : "20,10,5"},${0.15 + r() * 0.25})`;
      c.lineWidth = 1 + r() * 1.5;
      c.beginPath();
      c.moveTo(128 + Math.cos(a) * 42, 128 + Math.sin(a) * 42);
      c.lineTo(128 + Math.cos(a) * (95 + r() * 20), 128 + Math.sin(a) * (95 + r() * 20));
      c.stroke();
    }
    c.fillStyle = "#050302";
    c.beginPath();
    c.arc(128, 128, 44, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.ellipse(92, 88, 20, 14, -0.5, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(160, 165, 7, 0, Math.PI * 2);
    c.fill();
  });

/** Black gamer tee with neon "AFK" print and snack stains. Front is u=0.5. */
export const teeTex = (print = true, printY = 360) =>
  make(`tee-${print}-${printY}`, 1024, 1024, (c, r) => {
    c.fillStyle = "#1d1e26";
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 4000; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.03})`;
      c.fillRect(r() * 1024, r() * 1024, 2, 2);
    }
    // print
    if (print) {
    c.save();
    c.translate(512, printY);
    c.font = "900 150px Impact, sans-serif";
    c.textAlign = "center";
    c.lineWidth = 10;
    c.strokeStyle = "#ff2e88";
    c.strokeText("AFK", 0, 0);
    c.fillStyle = "#3ee6ff";
    c.fillText("AFK", 0, 0);
    c.font = "800 44px sans-serif";
    c.fillStyle = "#c6ff3d";
    c.fillText("SINCE 2014", 0, 60);
    c.restore();
    }
    // stains
    const stains = ["rgba(230,110,20,0.55)", "rgba(110,60,20,0.5)", "rgba(170,40,40,0.4)"];
    for (let i = 0; i < 12; i++) blot(c, 360 + r() * 320, 480 + r() * 380, 8 + r() * 22, stains[i % 3], r);
  });

/** Striped boxer shorts. */
export const boxerTex = () =>
  make(
    "boxer",
    256,
    256,
    (c) => {
      c.fillStyle = "#f3f0e6";
      c.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 32) {
        c.fillStyle = "#2f6bff";
        c.fillRect(x, 0, 10, 256);
        c.fillStyle = "#ff3b5c";
        c.fillRect(x + 16, 0, 4, 256);
      }
    },
    {repeat: [4, 1]},
  );

export const woodTex = () =>
  make(
    "wood",
    1024,
    1024,
    (c, r) => {
      const plankH = 128;
      for (let y = 0; y < 1024; y += plankH) {
        const off = r() * 600;
        for (let x = -off; x < 1024; x += 600) {
          const tone = 70 + r() * 30;
          c.fillStyle = `rgb(${tone + 40},${tone + 12},${tone - 18})`;
          c.fillRect(x, y, 600, plankH);
          for (let k = 0; k < 40; k++) {
            c.strokeStyle = `rgba(40,20,10,${0.08 + r() * 0.12})`;
            c.lineWidth = 1 + r() * 2;
            const yy = y + r() * plankH;
            c.beginPath();
            c.moveTo(x, yy);
            c.bezierCurveTo(x + 200, yy + (r() - 0.5) * 14, x + 400, yy + (r() - 0.5) * 14, x + 600, yy);
            c.stroke();
          }
          c.fillStyle = "rgba(0,0,0,0.55)";
          c.fillRect(x, y, 3, plankH);
        }
        c.fillStyle = "rgba(0,0,0,0.6)";
        c.fillRect(0, y, 1024, 3);
      }
    },
    {repeat: [3, 3]},
  );

export const wallTex = (base: string, key: string) =>
  make(
    `wall-${key}`,
    512,
    512,
    (c, r) => {
      c.fillStyle = base;
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 500; i++) {
        c.fillStyle = `rgba(0,0,0,${r() * 0.05})`;
        c.beginPath();
        c.arc(r() * 512, r() * 512, 4 + r() * 30, 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 6; i++) {
        const x = r() * 512;
        const g = c.createLinearGradient(x, 0, x, 300);
        g.addColorStop(0, "rgba(40,30,20,0.12)");
        g.addColorStop(1, "rgba(40,30,20,0)");
        c.fillStyle = g;
        c.fillRect(x, 0, 6 + r() * 10, 300);
      }
    },
    {repeat: [3, 2]},
  );

export const rugTex = () =>
  make("rug", 512, 512, (c, r) => {
    c.fillStyle = "#3b1f5c";
    c.fillRect(0, 0, 512, 512);
    for (let ring = 250; ring > 0; ring -= 34) {
      c.strokeStyle = ring % 68 === 0 ? "#7b3fe4" : "#2a1446";
      c.lineWidth = 14;
      c.beginPath();
      c.arc(256, 256, ring, 0, Math.PI * 2);
      c.stroke();
    }
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.05})`;
      c.fillRect(r() * 512, r() * 512, 1, 3);
    }
    for (let i = 0; i < 8; i++) blot(c, r() * 512, r() * 512, 10 + r() * 22, "rgba(30,15,10,0.35)", r);
  });

/** Game poster: bold title over a gradient + shapes. */
export const posterTex = (title: string, a: string, b: string, key: string) =>
  make(`poster-${key}`, 512, 720, (c, r) => {
    const g = c.createLinearGradient(0, 0, 0, 720);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 720);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.12})`;
      c.beginPath();
      c.arc(r() * 512, r() * 720, 20 + r() * 90, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#0d0d14";
    c.beginPath();
    c.moveTo(256, 180);
    c.lineTo(420, 520);
    c.lineTo(92, 520);
    c.closePath();
    c.fill();
    c.font = "900 96px Impact, sans-serif";
    c.textAlign = "center";
    c.lineWidth = 8;
    c.strokeStyle = "#0d0d14";
    c.strokeText(title, 256, 640);
    c.fillStyle = "#ffffff";
    c.fillText(title, 256, 640);
    c.strokeStyle = "rgba(255,255,255,0.6)";
    c.lineWidth = 6;
    c.strokeRect(12, 12, 488, 696);
  });

/** In-game frame for the monitor: sunset, mountains, crosshair, HUD. */
export const gameTex = (key: string, hue: number) =>
  make(`game-${key}`, 640, 360, (c, r) => {
    const g = c.createLinearGradient(0, 0, 0, 360);
    g.addColorStop(0, `hsl(${hue},80%,35%)`);
    g.addColorStop(0.6, `hsl(${hue + 40},90%,60%)`);
    g.addColorStop(1, "#1a0d24");
    c.fillStyle = g;
    c.fillRect(0, 0, 640, 360);
    c.fillStyle = "#ffe07a";
    c.beginPath();
    c.arc(420, 200, 50, 0, Math.PI * 2);
    c.fill();
    for (let layer = 0; layer < 3; layer++) {
      c.fillStyle = `rgba(20,10,40,${0.5 + layer * 0.2})`;
      c.beginPath();
      c.moveTo(0, 360);
      for (let x = 0; x <= 640; x += 40) c.lineTo(x, 220 + layer * 40 + (r() - 0.5) * 70);
      c.lineTo(640, 360);
      c.fill();
    }
    c.strokeStyle = "#ffffff";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(310, 180);
    c.lineTo(330, 180);
    c.moveTo(320, 170);
    c.lineTo(320, 190);
    c.stroke();
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(16, 300, 180, 40);
    c.fillStyle = "#3ee66b";
    c.fillRect(22, 306, 120, 12);
    c.fillStyle = "#3ea0ff";
    c.fillRect(22, 324, 90, 10);
    c.font = "bold 22px sans-serif";
    c.fillStyle = "#fff";
    c.fillText("KILLS 0  ·  DEATHS 27", 400, 40);
  });

/** Night skyline seen through a window. */
export const nightTex = () =>
  make("night", 512, 512, (c, r) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#0a1030");
    g.addColorStop(1, "#3a1a50");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    c.fillStyle = "#fff6d8";
    c.beginPath();
    c.arc(380, 110, 40, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 80; i++) {
      c.fillStyle = `rgba(255,255,255,${r()})`;
      c.fillRect(r() * 512, r() * 250, 2, 2);
    }
    let x = 0;
    while (x < 512) {
      const w = 40 + r() * 70;
      const h = 120 + r() * 220;
      c.fillStyle = "#0b0a18";
      c.fillRect(x, 512 - h, w, h);
      for (let wy = 512 - h + 12; wy < 500; wy += 22)
        for (let wx = x + 8; wx < x + w - 10; wx += 16) if (r() > 0.55) {
          c.fillStyle = r() > 0.8 ? "#ff79c6" : "#ffd36b";
          c.fillRect(wx, wy, 8, 12);
        }
      x += w + 4;
    }
  });

/** Vertical gradient (for dyed hair etc.). */
export const gradTex = (top: string, bottom: string, key: string) =>
  make(`grad-${key}`, 8, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(0.6, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, 8, 256);
  });

export const hoodieTex = () =>
  make("hoodie", 512, 512, (c, r) => {
    c.fillStyle = "#c3b0ff";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6000; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.08})`;
      c.fillRect(r() * 512, r() * 512, 2, 2);
    }
    c.font = "900 70px sans-serif";
    c.textAlign = "center";
    c.fillStyle = "#ff4fb8";
    c.fillText("GG", 256, 300);
  });

/** Dark rubber gym floor tiles. */
export const rubberTex = () =>
  make(
    "rubber",
    512,
    512,
    (c, r) => {
      c.fillStyle = "#17171d";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) {
        c.fillStyle = `rgba(255,255,255,${r() * 0.06})`;
        c.fillRect(r() * 512, r() * 512, 2, 2);
      }
      c.strokeStyle = "#0a0a0e";
      c.lineWidth = 6;
      for (let k = 0; k <= 512; k += 256) {
        c.beginPath();
        c.moveTo(k, 0);
        c.lineTo(k, 512);
        c.moveTo(0, k);
        c.lineTo(512, k);
        c.stroke();
      }
    },
    {repeat: [6, 6]},
  );

export const concreteTex = () =>
  make(
    "concrete",
    512,
    512,
    (c, r) => {
      c.fillStyle = "#24202c";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 700; i++) {
        c.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.05})`;
        c.beginPath();
        c.arc(r() * 512, r() * 512, 3 + r() * 30, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(0,0,0,0.35)";
      c.lineWidth = 3;
      for (let y = 0; y < 512; y += 128) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(512, y);
        c.stroke();
      }
    },
    {repeat: [4, 2]},
  );

/** Neon sign text on transparent black (use as emissive + map). */
export const neonSignTex = (text: string, color: string, key: string) =>
  make(`neon-${key}`, 1024, 300, (c) => {
    c.fillStyle = "#000000";
    c.fillRect(0, 0, 1024, 300);
    c.font = "italic 900 112px Impact, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = color;
    c.shadowBlur = 40;
    c.lineWidth = 10;
    c.strokeStyle = color;
    c.strokeText(text, 512, 150);
    c.shadowBlur = 15;
    c.fillStyle = "#ffffff";
    c.fillText(text, 512, 150);
  });

/** Kitchen wall: mint subway tiles. */
export const tileTex = () =>
  make(
    "tiles",
    512,
    512,
    (c, r) => {
      c.fillStyle = "#e9fff4";
      c.fillRect(0, 0, 512, 512);
      for (let y = 0, row = 0; y < 512; y += 64, row++)
        for (let x = row % 2 ? -64 : 0; x < 512; x += 128) {
          c.fillStyle = `hsl(150, 55%, ${80 + r() * 8}%)`;
          c.fillRect(x + 3, y + 3, 122, 58);
        }
    },
    {repeat: [4, 3]},
  );

export const skyTex = () =>
  make("sky", 512, 512, (c, r) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#5fc8ff");
    g.addColorStop(1, "#fff2c9");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "rgba(255,255,255,0.85)";
      const x = r() * 512;
      const y = 60 + r() * 200;
      for (let k = 0; k < 4; k++) {
        c.beginPath();
        c.arc(x + k * 28, y + (k % 2) * 8, 26, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.fillStyle = "#3aa65a";
    c.beginPath();
    c.moveTo(0, 512);
    for (let x = 0; x <= 512; x += 32) c.lineTo(x, 420 + Math.sin(x / 50) * 30);
    c.lineTo(512, 512);
    c.fill();
  });
