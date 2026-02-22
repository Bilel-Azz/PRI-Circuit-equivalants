import {
  interpolate,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { SITE } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";

type Props = {
  siteFrame: number;
  width?: number;
  height?: number;
};

export const MockCircuit: React.FC<Props> = ({
  siteFrame,
  width = 900,
  height = 240,
}) => {
  // Circuit appears with results
  const containerAppear = interpolate(siteFrame, [500, 520], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sequential component drawing (camera zooms to circuit at global ~1750)
  // siteFrame 980 = global 1760
  const wireProgress = interpolate(siteFrame, [980, 1020], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const rProgress = interpolate(siteFrame, [1030, 1060], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const lProgress = interpolate(siteFrame, [1070, 1100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const cProgress = interpolate(siteFrame, [1110, 1140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const labelsProgress = interpolate(siteFrame, [1150, 1175], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Valid badge
  const badgeProgress = interpolate(siteFrame, [1185, 1205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Layout constants
  const cx = width / 2;
  const railY = 80;
  const gndY = 190;
  const nodeSpacing = 120;
  const sourceX = 80;
  const n1x = sourceX + nodeSpacing;
  const n2x = n1x + nodeSpacing;
  const n3x = n2x + nodeSpacing;
  const endX = n3x + nodeSpacing;

  // Main wire path
  const mainWire = `M ${sourceX} ${railY} L ${endX} ${railY}`;
  const gndWire = `M ${sourceX} ${gndY} L ${endX} ${gndY}`;
  const wireEvolve = evolvePath(wireProgress, mainWire);
  const gndEvolve = evolvePath(wireProgress, gndWire);

  // AC source to ground
  const sourceWire = `M ${sourceX} ${railY + 15} L ${sourceX} ${gndY}`;
  const srcEvolve = evolvePath(wireProgress, sourceWire);

  return (
    <div style={{ opacity: containerAppear }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 600,
            color: SITE.text,
          }}
        >
          Synthesized Circuit Topology
        </span>

        {/* Control buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {["⊕", "⊖", "⟲"].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: `1px solid ${SITE.border}`,
                backgroundColor: SITE.cardSolid,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 12, color: SITE.muted }}>{icon}</span>
            </div>
          ))}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${SITE.border}`,
              backgroundColor: SITE.cardSolid,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: SITE.muted }}>
              Export SPICE
            </span>
          </div>
        </div>
      </div>

      {/* Circuit diagram */}
      <div
        style={{
          backgroundColor: SITE.cardSolid,
          borderRadius: 10,
          border: `1px solid ${SITE.border}`,
          padding: 12,
          position: "relative",
        }}
      >
        {/* Grid background */}
        <svg
          width={width - 24}
          height={height}
          style={{ position: "absolute", top: 12, left: 12 }}
        >
          <defs>
            <pattern id="circGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={SITE.gridPattern} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circGrid)" />
        </svg>

        <svg width={width - 24} height={height}>
          {/* Main horizontal wire */}
          <path
            d={mainWire}
            fill="none"
            stroke={SITE.muted}
            strokeWidth="2"
            strokeDasharray={wireEvolve.strokeDasharray}
            strokeDashoffset={wireEvolve.strokeDashoffset}
          />

          {/* Ground wire */}
          <path
            d={gndWire}
            fill="none"
            stroke={SITE.muted}
            strokeWidth="2"
            strokeDasharray={gndEvolve.strokeDasharray}
            strokeDashoffset={gndEvolve.strokeDashoffset}
          />

          {/* Source vertical wire */}
          <path
            d={sourceWire}
            fill="none"
            stroke={SITE.muted}
            strokeWidth="2"
            strokeDasharray={srcEvolve.strokeDasharray}
            strokeDashoffset={srcEvolve.strokeDashoffset}
          />

          {/* AC Source symbol */}
          <g opacity={wireProgress}>
            <circle cx={sourceX} cy={railY} r="12" fill="none" stroke={SITE.muted} strokeWidth="1.5" />
            <path d={`M ${sourceX - 6} ${railY} Q ${sourceX - 3} ${railY - 6} ${sourceX} ${railY} Q ${sourceX + 3} ${railY + 6} ${sourceX + 6} ${railY}`} fill="none" stroke={SITE.muted} strokeWidth="1.5" />
            <text x={sourceX} y={railY - 20} textAnchor="middle" fill={SITE.muted} fontSize="10" fontFamily={monoFontFamily}>VAC</text>
          </g>

          {/* Nodes */}
          {wireProgress > 0.5 && (
            <g opacity={interpolate(wireProgress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
              {[
                { x: n1x, label: "N1" },
                { x: n2x, label: "N2" },
                { x: n3x, label: "N3" },
              ].map((node) => (
                <g key={node.label}>
                  <circle cx={node.x} cy={railY} r="4" fill={SITE.primary} opacity="0.6" />
                  <text x={node.x} y={railY - 12} textAnchor="middle" fill={SITE.primary} fontSize="9" fontFamily={monoFontFamily} fontWeight="600">
                    {node.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* R: between N1 and N2 (series, orange) */}
          <g opacity={rProgress}>
            {/* Zigzag resistor */}
            <path
              d={`M ${n1x + 10} ${railY} L ${n1x + 20} ${railY - 8} L ${n1x + 30} ${railY + 8} L ${n1x + 40} ${railY - 8} L ${n1x + 50} ${railY + 8} L ${n1x + 60} ${railY - 8} L ${n1x + 70} ${railY + 8} L ${n1x + 80} ${railY} L ${n2x - 10} ${railY}`}
              fill="none"
              stroke={SITE.compR}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* L: between N2 and N3 (series, orange) */}
          <g opacity={lProgress}>
            {/* Coil inductor */}
            {[0, 1, 2, 3, 4].map((i) => {
              const startX = n2x + 10 + i * 16;
              return (
                <path
                  key={i}
                  d={`M ${startX} ${railY} A 8 8 0 0 1 ${startX + 16} ${railY}`}
                  fill="none"
                  stroke={SITE.compL}
                  strokeWidth="2.5"
                />
              );
            })}
          </g>

          {/* C: shunt from N3 to GND (blue) */}
          <g opacity={cProgress}>
            {/* Vertical wire down */}
            <line x1={n3x} y1={railY + 4} x2={n3x} y2={(railY + gndY) / 2 - 8} stroke={SITE.compC} strokeWidth="2" />
            {/* Capacitor plates */}
            <line x1={n3x - 14} y1={(railY + gndY) / 2 - 6} x2={n3x + 14} y2={(railY + gndY) / 2 - 6} stroke={SITE.compC} strokeWidth="3" />
            <line x1={n3x - 14} y1={(railY + gndY) / 2 + 6} x2={n3x + 14} y2={(railY + gndY) / 2 + 6} stroke={SITE.compC} strokeWidth="3" />
            {/* Wire to ground */}
            <line x1={n3x} y1={(railY + gndY) / 2 + 8} x2={n3x} y2={gndY} stroke={SITE.compC} strokeWidth="2" />
          </g>

          {/* Component labels */}
          <g opacity={labelsProgress}>
            <text x={(n1x + n2x) / 2} y={railY + 28} textAnchor="middle" fill={SITE.compR} fontSize="11" fontFamily={monoFontFamily} fontWeight="600">
              R = 47Ω
            </text>
            <text x={(n2x + n3x) / 2} y={railY + 28} textAnchor="middle" fill={SITE.compL} fontSize="11" fontFamily={monoFontFamily} fontWeight="600">
              L = 2.2mH
            </text>
            <text x={n3x + 24} y={(railY + gndY) / 2 + 5} textAnchor="start" fill={SITE.compC} fontSize="11" fontFamily={monoFontFamily} fontWeight="600">
              C = 470nF
            </text>
          </g>

          {/* Ground symbol at end */}
          <g opacity={wireProgress}>
            <line x1={endX - 10} y1={gndY} x2={endX + 10} y2={gndY} stroke={SITE.muted} strokeWidth="2" />
            <line x1={endX - 6} y1={gndY + 5} x2={endX + 6} y2={gndY + 5} stroke={SITE.muted} strokeWidth="1.5" />
            <line x1={endX - 2} y1={gndY + 10} x2={endX + 2} y2={gndY + 10} stroke={SITE.muted} strokeWidth="1" />
            <text x={endX} y={gndY + 24} textAnchor="middle" fill={SITE.muted} fontSize="9" fontFamily={monoFontFamily}>GND</text>
          </g>
        </svg>

        {/* Valid badge */}
        {badgeProgress > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              padding: "4px 12px",
              borderRadius: 100,
              backgroundColor: SITE.successLight,
              border: `1px solid ${SITE.success}30`,
              opacity: badgeProgress,
              transform: `scale(${interpolate(badgeProgress, [0, 0.5, 1], [0.5, 1.1, 1])})`,
            }}
          >
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 11,
                fontWeight: 600,
                color: SITE.success,
              }}
            >
              ✓ Circuit Valide
            </span>
          </div>
        )}
      </div>

      {/* Netlist below circuit */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          opacity: labelsProgress,
        }}
      >
        {[
          { type: "R", value: "47Ω", nodes: "N1→N2", color: SITE.compR },
          { type: "L", value: "2.2mH", nodes: "N2→N3", color: SITE.compL },
          { type: "C", value: "470nF", nodes: "N3→GND", color: SITE.compC },
        ].map((comp, i) => (
          <div
            key={i}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: `${comp.color}10`,
              border: `1px solid ${comp.color}25`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 10,
                fontWeight: 700,
                color: comp.color,
              }}
            >
              {comp.type}
            </span>
            <span
              style={{
                fontFamily: monoFontFamily,
                fontSize: 10,
                color: SITE.muted,
              }}
            >
              {comp.value} ({comp.nodes})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
