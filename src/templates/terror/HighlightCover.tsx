import React from "react";
import {AbsoluteFill} from "remotion";
import {useHorrorFonts} from "./HorrorStory";

/** Instagram highlight cover (1080x1920; Instagram crops the centre circle). */
export const HighlightCover: React.FC<{symbol: string; label: string}> = ({symbol, label}) => {
  useHorrorFonts();
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 50%, #2a0306 0%, #0a0203 38%, #000 70%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 640,
          height: 640,
          borderRadius: "50%",
          border: "10px solid #e0101c",
          boxShadow: "0 0 80px rgba(224,16,28,0.6), inset 0 0 80px rgba(224,16,28,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: symbol.length > 2 ? 190 : 280,
            color: "#efe8dc",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(224,16,28,0.8)",
          }}
        >
          {symbol}
        </div>
        <div style={{fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 64, letterSpacing: 10, color: "#e0101c", marginTop: 20}}>
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
