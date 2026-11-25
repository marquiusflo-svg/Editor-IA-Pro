import React from "react";
import {AbsoluteFill} from "remotion";
import {useFonts} from "../../templates/gta/GTAInfo";
import {DiegoPortrait} from "./Diego3D";

const PINK = "#ff2e88";
const CYAN = "#3ee6ff";
const LIME = "#c6ff3d";
const DISPLAY = "'Anton', 'Impact', sans-serif";

/** 1080x1080 profile picture: Diego centered for a circular crop. */
export const DiegoAvatar: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "radial-gradient(circle at 50% 42%, #7b2cff 0%, #3a0f6b 45%, #12051f 100%)"}}>
      {/* neon ring + rays */}
      <AbsoluteFill style={{background: "repeating-conic-gradient(from 0deg at 50% 50%, #ffffff0d 0deg 8deg, transparent 8deg 20deg)"}} />
      <div style={{position: "absolute", left: 90, top: 90, width: 900, height: 900, borderRadius: "50%", border: `14px solid ${PINK}`, boxShadow: `0 0 60px ${PINK}, inset 0 0 60px ${CYAN}88`}} />
      <AbsoluteFill>
        <DiegoPortrait width={1080} height={1080} />
      </AbsoluteFill>
      {/* "30" day badge, inside the circle-safe area */}
      <div
        style={{
          position: "absolute",
          right: 175,
          top: 175,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: LIME,
          border: "8px solid #0d0d14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(10deg)",
          boxShadow: "0 8px 0 #0d0d14",
        }}
      >
        <div style={{fontFamily: DISPLAY, fontSize: 84, lineHeight: 0.9, color: "#0d0d14"}}>30</div>
        <div style={{fontFamily: DISPLAY, fontSize: 30, color: "#0d0d14", letterSpacing: 2}}>DÍAS</div>
      </div>
    </AbsoluteFill>
  );
};

type Icon = "dias" | "votos" | "sofi" | "progreso" | "faq";

const ICONS: Record<Icon, React.ReactNode> = {
  dias: (
    <g fill="none" stroke="#fff" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round">
      <rect x={40} y={60} width={220} height={190} rx={28} />
      <line x1={40} y1={115} x2={260} y2={115} />
      <line x1={95} y1={35} x2={95} y2={80} />
      <line x1={205} y1={35} x2={205} y2={80} />
      <text x={150} y={225} fill="#fff" stroke="none" fontFamily={DISPLAY} fontSize={96} textAnchor="middle">30</text>
    </g>
  ),
  votos: (
    <g fill="none" stroke="#fff" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round">
      <rect x={50} y={130} width={200} height={130} rx={20} />
      <path d="M95 90 L140 135 L230 40" />
      <line x1={95} y1={195} x2={205} y2={195} />
    </g>
  ),
  sofi: <path d="M150 262s-104-64-139-129C-13 87 13 26 69 26c31 0 50 18 60 33h42c10-15 29-33 60-33 56 0 82 61 58 107-35 65-139 129-139 129z" fill="#fff" />,
  progreso: (
    <g fill="#fff">
      <rect x={60} y={138} width={180} height={24} rx={10} />
      <rect x={30} y={95} width={40} height={110} rx={12} />
      <rect x={230} y={95} width={40} height={110} rx={12} />
      <rect x={8} y={118} width={30} height={64} rx={10} />
      <rect x={262} y={118} width={30} height={64} rx={10} />
    </g>
  ),
  faq: <text x={150} y={240} fill="#fff" fontFamily={DISPLAY} fontSize={260} textAnchor="middle">?</text>,
};

/** 1080x1920 Instagram highlight cover (icon centered in the circle-safe zone). */
export const HighlightCover: React.FC<{icon: Icon; color: string}> = ({icon, color}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#0d0d14", alignItems: "center", justifyContent: "center"}}>
      <div
        style={{
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${color}, #12051f 85%)`,
          boxShadow: `0 0 90px ${color}aa, inset 0 0 0 16px ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={380} height={380} viewBox="0 0 300 300">
          {ICONS[icon]}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const HIGHLIGHTS: {id: string; icon: Icon; color: string}[] = [
  {id: "HL-Dias", icon: "dias", color: LIME},
  {id: "HL-Votos", icon: "votos", color: PINK},
  {id: "HL-Sofi", icon: "sofi", color: "#ff4fb8"},
  {id: "HL-Progreso", icon: "progreso", color: CYAN},
  {id: "HL-FAQ", icon: "faq", color: "#b14bff"},
];
