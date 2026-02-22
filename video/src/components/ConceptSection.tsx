import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS, CONCEPT_START, CONCEPT_END } from "../lib/theme";
import { fontFamily, monoFontFamily } from "../lib/fonts";
import { SPRING_SNAPPY, SPRING_SMOOTH } from "../lib/animations";

// Helper: page visibility (enter + exit with zoom-through)
function usePageTransition(
  f: number, // local frame
  enter: number,
  exit: number,
  duration: number = 12,
) {
  const fadeIn = interpolate(f, [enter, enter + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(f, [exit - duration, exit], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleIn = interpolate(f, [enter, enter + duration], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const scaleOut = interpolate(f, [exit - duration, exit], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const opacity = fadeIn * fadeOut;
  const scale = f < (enter + exit) / 2 ? scaleIn : scaleOut;
  return { opacity, scale };
}

export const ConceptSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visible = frame >= CONCEPT_START - 5 && frame <= CONCEPT_END + 10;
  if (!visible) return null;

  const f = frame - CONCEPT_START; // local frame 0-2700

  // === PAGE 1: Circuit (f 0-430, 14s) ===
  const p1 = usePageTransition(f, 0, 430);
  const p1_rAppear = spring({ frame: f, fps, delay: 40, config: SPRING_SNAPPY });
  const p1_lAppear = spring({ frame: f, fps, delay: 80, config: SPRING_SNAPPY });
  const p1_cAppear = spring({ frame: f, fps, delay: 120, config: SPRING_SNAPPY });
  const p1_titleAppear = spring({ frame: f, fps, delay: 15, config: SPRING_SMOOTH });
  const p1_labelsAppear = spring({ frame: f, fps, delay: 180, config: SPRING_SMOOTH });

  // === PAGE 2: Impedance (f 410-840, 14s) ===
  const p2 = usePageTransition(f, 410, 840);
  const p2_titleAppear = spring({ frame: f, fps, delay: 425, config: SPRING_SMOOTH });
  const p2_equationAppear = spring({ frame: f, fps, delay: 450, config: SPRING_SNAPPY });
  const p2_axesAppear = spring({ frame: f, fps, delay: 480, config: SPRING_SMOOTH });
  const p2_curveProgress = interpolate(f, [500, 650], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const p2_resonanceGlow = interpolate(f, [670, 710], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Impedance curve
  const curvePath = (() => {
    const pts: string[] = [];
    const n = 80;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const mag = 0.75 - 0.55 * Math.exp(-((t - 0.38) ** 2) / 0.007) + 0.12 * t;
      const x = 60 + t * 520;
      const y = 30 + (1 - mag) * 240;
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  })();
  const curveEvolve = evolvePath(p2_curveProgress, curvePath);

  // === PAGE 3: Data Encoding (f 820-1250, 14s) ===
  const p3 = usePageTransition(f, 820, 1250);
  const p3_titleAppear = spring({ frame: f, fps, delay: 835, config: SPRING_SMOOTH });
  const p3_curveAppear = spring({ frame: f, fps, delay: 855, config: SPRING_SMOOTH });
  const p3_dotsProgress = interpolate(f, [880, 990], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3_jsonAppear = spring({ frame: f, fps, delay: 1030, config: SPRING_SNAPPY });
  const p3_countAppear = spring({ frame: f, fps, delay: 1090, config: SPRING_SMOOTH });

  // === PAGE 4: AI Prediction (f 1230-1660, 14s) ===
  const p4 = usePageTransition(f, 1230, 1660);
  const p4_titleAppear = spring({ frame: f, fps, delay: 1245, config: SPRING_SMOOTH });
  const p4_inputAppear = spring({ frame: f, fps, delay: 1275, config: SPRING_SMOOTH });
  const p4_arrowIn = spring({ frame: f, fps, delay: 1310, config: SPRING_SMOOTH });
  const p4_aiAppear = spring({ frame: f, fps, delay: 1340, config: SPRING_SNAPPY });
  const p4_arrowOut = spring({ frame: f, fps, delay: 1400, config: SPRING_SMOOTH });
  const p4_outputAppear = spring({ frame: f, fps, delay: 1430, config: SPRING_SNAPPY });
  const p4_badgeAppear = spring({ frame: f, fps, delay: 1510, config: SPRING_SNAPPY });
  const p4_gearAngle = (f - 1230) * 3;

  // === PAGE 5: Backend Deployment (f 1640-2060, 14s) ===
  const p5 = usePageTransition(f, 1640, 2060);
  const p5_titleAppear = spring({ frame: f, fps, delay: 1655, config: SPRING_SMOOTH });
  const p5_modelAppear = spring({ frame: f, fps, delay: 1695, config: SPRING_SNAPPY });
  const p5_arrowAppear = spring({ frame: f, fps, delay: 1750, config: SPRING_SMOOTH });
  const p5_serverAppear = spring({ frame: f, fps, delay: 1790, config: SPRING_SNAPPY });
  const p5_endpointsAppear = spring({ frame: f, fps, delay: 1870, config: SPRING_SMOOTH });
  const p5_badgeAppear = spring({ frame: f, fps, delay: 1950, config: SPRING_SNAPPY });
  const p5_serverGlow = f > 1870 ? Math.sin((f - 1870) * 0.12) * 0.3 + 0.7 : 0;

  // === PAGE 6: Frontend Architecture (f 2040-2460, 14s) ===
  const p6 = usePageTransition(f, 2040, 2460);
  const p6_titleAppear = spring({ frame: f, fps, delay: 2055, config: SPRING_SMOOTH });
  const p6_backendAppear = spring({ frame: f, fps, delay: 2095, config: SPRING_SNAPPY });
  const p6_connectionAppear = spring({ frame: f, fps, delay: 2160, config: SPRING_SMOOTH });
  const p6_frontendAppear = spring({ frame: f, fps, delay: 2210, config: SPRING_SNAPPY });
  const p6_techAppear = spring({ frame: f, fps, delay: 2300, config: SPRING_SMOOTH });
  const p6_dataFlow = interpolate(f, [2230, 2400], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PAGE 7: Click to Demo (f 2440-2600, 5s) ===
  const p7 = usePageTransition(f, 2440, 2600);
  const p7_urlAppear = spring({ frame: f, fps, delay: 2460, config: SPRING_SNAPPY });
  const p7_cursorX = interpolate(f, [2485, 2530], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const p7_cursorY = interpolate(f, [2485, 2530], [150, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const p7_clickEffect = interpolate(f, [2535, 2545, 2560], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p7_cursorVisible = f >= 2485 && f <= 2570;

  // === PAGE 8: Transition text (f 2580-2700, 4s) ===
  const p8 = usePageTransition(f, 2580, 2700, 10);
  const p8_textAppear = spring({ frame: f, fps, delay: 2600, config: SPRING_SMOOTH });

  // Shared page container style
  const pageStyle = (p: { opacity: number; scale: number }): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    opacity: p.opacity,
    transform: `scale(${p.scale})`,
    pointerEvents: "none",
  });

  return (
    <AbsoluteFill style={{ zIndex: 50 }}>
      {/* ====== PAGE 1: Circuit ====== */}
      {p1.opacity > 0 && (
        <div style={pageStyle(p1)}>
          {/* Title */}
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 40,
              opacity: interpolate(p1_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p1_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            Un <span style={{ color: COLORS.blue }}>circuit</span> électrique
          </h2>

          {/* Large circuit SVG */}
          <svg width="700" height="200" viewBox="0 0 700 200">
            {/* Main wire */}
            <line x1="50" y1="100" x2="650" y2="100" stroke={COLORS.gray700} strokeWidth="2" opacity={p1_rAppear > 0 ? 0.5 : 0} />

            {/* R - slides from left */}
            <g
              opacity={interpolate(p1_rAppear, [0, 1], [0, 1])}
              transform={`translate(${interpolate(p1_rAppear, [0, 1], [-30, 0])}, 0)`}
            >
              <rect x="110" y="75" width="100" height="50" fill="none" stroke={COLORS.orange} strokeWidth="3" rx="6" />
              <text x="160" y="106" textAnchor="middle" fill={COLORS.orange} fontSize="22" fontFamily={monoFontFamily} fontWeight="700">R</text>
              {/* Glow */}
              <rect x="110" y="75" width="100" height="50" fill="none" stroke={COLORS.orange} strokeWidth="1" rx="6" opacity="0.3" style={{ filter: `blur(6px)` }} />
            </g>

            {/* L - slides from top */}
            <g
              opacity={interpolate(p1_lAppear, [0, 1], [0, 1])}
              transform={`translate(0, ${interpolate(p1_lAppear, [0, 1], [-25, 0])})`}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={`M ${280 + i * 28} 100 A 14 14 0 0 1 ${280 + (i + 1) * 28} 100`}
                  fill="none"
                  stroke={COLORS.blue}
                  strokeWidth="3"
                />
              ))}
              <text x="350" y="80" textAnchor="middle" fill={COLORS.blue} fontSize="22" fontFamily={monoFontFamily} fontWeight="700">L</text>
            </g>

            {/* C - slides from right */}
            <g
              opacity={interpolate(p1_cAppear, [0, 1], [0, 1])}
              transform={`translate(${interpolate(p1_cAppear, [0, 1], [30, 0])}, 0)`}
            >
              <line x1="500" y1="65" x2="500" y2="135" stroke={COLORS.green} strokeWidth="4" />
              <line x1="516" y1="65" x2="516" y2="135" stroke={COLORS.green} strokeWidth="4" />
              <text x="508" y="55" textAnchor="middle" fill={COLORS.green} fontSize="22" fontFamily={monoFontFamily} fontWeight="700">C</text>
            </g>

            {/* Connection dots */}
            {p1_labelsAppear > 0 && (
              <g opacity={interpolate(p1_labelsAppear, [0, 1], [0, 1])}>
                <circle cx="110" cy="100" r="5" fill={COLORS.gray500} />
                <circle cx="210" cy="100" r="5" fill={COLORS.gray500} />
                <circle cx="280" cy="100" r="5" fill={COLORS.gray500} />
                <circle cx="420" cy="100" r="5" fill={COLORS.gray500} />
                <circle cx="500" cy="100" r="5" fill={COLORS.gray500} />
                <circle cx="516" cy="100" r="5" fill={COLORS.gray500} />
              </g>
            )}
          </svg>

          {/* Component values */}
          <div
            style={{
              display: "flex",
              gap: 30,
              marginTop: 30,
              opacity: interpolate(p1_labelsAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p1_labelsAppear, [0, 1], [10, 0])}px)`,
            }}
          >
            {[
              { label: "R = 47Ω", color: COLORS.orange },
              { label: "L = 2.2mH", color: COLORS.blue },
              { label: "C = 470nF", color: COLORS.green },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  backgroundColor: `${item.color}12`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                <span style={{ fontFamily: monoFontFamily, fontSize: 16, fontWeight: 600, color: item.color }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Diverse circuit topologies */}
          {(() => {
            const diversityAppear = spring({ frame: f, fps, delay: 250, config: SPRING_SMOOTH });
            return (
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  marginTop: 35,
                  opacity: interpolate(diversityAppear, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(diversityAppear, [0, 1], [15, 0])}px)`,
                }}
              >
                <span style={{ fontFamily, fontSize: 14, color: COLORS.gray400, alignSelf: "center", marginRight: 8 }}>
                  Mais aussi :
                </span>
                {[
                  { name: "Tank LC", color: COLORS.purple, svg: (
                    <svg width="90" height="45" viewBox="0 0 90 45">
                      <line x1="5" y1="10" x2="25" y2="10" stroke={COLORS.blue} strokeWidth="1.5" />
                      {[0,1,2].map(i => <path key={i} d={`M ${25+i*10} 10 A 5 5 0 0 1 ${25+(i+1)*10} 10`} fill="none" stroke={COLORS.blue} strokeWidth="1.5" />)}
                      <line x1="55" y1="10" x2="85" y2="10" stroke={COLORS.blue} strokeWidth="1.5" />
                      <line x1="25" y1="10" x2="25" y2="35" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="85" y1="10" x2="85" y2="35" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="25" y1="35" x2="42" y2="35" stroke={COLORS.green} strokeWidth="1.5" />
                      <line x1="45" y1="27" x2="45" y2="43" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="50" y1="27" x2="50" y2="43" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="53" y1="35" x2="85" y2="35" stroke={COLORS.green} strokeWidth="1.5" />
                    </svg>
                  )},
                  { name: "Double rés.", color: COLORS.red, svg: (
                    <svg width="90" height="45" viewBox="0 0 90 45">
                      <line x1="5" y1="12" x2="15" y2="12" stroke={COLORS.orange} strokeWidth="1.5" />
                      <rect x="15" y="5" width="16" height="14" fill="none" stroke={COLORS.orange} strokeWidth="1.5" rx="2" />
                      <line x1="31" y1="12" x2="40" y2="12" stroke={COLORS.blue} strokeWidth="1.5" />
                      {[0,1].map(i => <path key={i} d={`M ${40+i*8} 12 A 4 4 0 0 1 ${40+(i+1)*8} 12`} fill="none" stroke={COLORS.blue} strokeWidth="1.5" />)}
                      <line x1="56" y1="12" x2="63" y2="12" stroke={COLORS.green} strokeWidth="1.5" />
                      <line x1="63" y1="5" x2="63" y2="19" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="67" y1="5" x2="67" y2="19" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="67" y1="12" x2="85" y2="12" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="40" y1="12" x2="40" y2="35" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="85" y1="12" x2="85" y2="35" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="40" y1="35" x2="52" y2="35" stroke={COLORS.green} strokeWidth="1.5" />
                      <line x1="55" y1="28" x2="55" y2="42" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="59" y1="28" x2="59" y2="42" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="62" y1="35" x2="85" y2="35" stroke={COLORS.green} strokeWidth="1.5" />
                    </svg>
                  )},
                  { name: "Filtre notch", color: COLORS.orangeLight, svg: (
                    <svg width="90" height="45" viewBox="0 0 90 45">
                      <line x1="5" y1="22" x2="20" y2="22" stroke={COLORS.orange} strokeWidth="1.5" />
                      <rect x="20" y="15" width="16" height="14" fill="none" stroke={COLORS.orange} strokeWidth="1.5" rx="2" />
                      <line x1="36" y1="22" x2="45" y2="22" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="45" y1="22" x2="45" y2="5" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="45" y1="22" x2="45" y2="40" stroke={COLORS.gray600} strokeWidth="1" />
                      {[0,1].map(i => <path key={i} d={`M ${45+i*8} 5 A 4 4 0 0 1 ${45+(i+1)*8} 5`} fill="none" stroke={COLORS.blue} strokeWidth="1.5" />)}
                      <line x1="61" y1="5" x2="75" y2="5" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="48" y1="33" x2="48" y2="40" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="52" y1="33" x2="52" y2="40" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="55" y1="40" x2="75" y2="40" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="75" y1="5" x2="75" y2="40" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="75" y1="22" x2="85" y2="22" stroke={COLORS.gray600} strokeWidth="1.5" />
                    </svg>
                  )},
                  { name: "Ladder", color: COLORS.blueLight, svg: (
                    <svg width="90" height="45" viewBox="0 0 90 45">
                      <line x1="5" y1="12" x2="15" y2="12" stroke={COLORS.orange} strokeWidth="1.5" />
                      <rect x="15" y="5" width="12" height="14" fill="none" stroke={COLORS.orange} strokeWidth="1.5" rx="2" />
                      {[0,1].map(i => <path key={i} d={`M ${27+i*7} 12 A 3.5 3.5 0 0 1 ${27+(i+1)*7} 12`} fill="none" stroke={COLORS.blue} strokeWidth="1.5" />)}
                      <line x1="41" y1="12" x2="41" y2="38" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="38" y1="30" x2="38" y2="38" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="44" y1="30" x2="44" y2="38" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="41" y1="12" x2="50" y2="12" stroke={COLORS.orange} strokeWidth="1.5" />
                      <rect x="50" y="5" width="12" height="14" fill="none" stroke={COLORS.orange} strokeWidth="1.5" rx="2" />
                      {[0,1].map(i => <path key={i} d={`M ${62+i*7} 12 A 3.5 3.5 0 0 1 ${62+(i+1)*7} 12`} fill="none" stroke={COLORS.blue} strokeWidth="1.5" />)}
                      <line x1="76" y1="12" x2="76" y2="38" stroke={COLORS.gray600} strokeWidth="1" />
                      <line x1="73" y1="30" x2="73" y2="38" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="79" y1="30" x2="79" y2="38" stroke={COLORS.green} strokeWidth="2" />
                      <line x1="76" y1="12" x2="85" y2="12" stroke={COLORS.gray600} strokeWidth="1.5" />
                      <line x1="5" y1="38" x2="85" y2="38" stroke={COLORS.gray600} strokeWidth="1" strokeDasharray="3 2" />
                    </svg>
                  )},
                ].map((topo) => (
                  <div key={topo.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 12, backgroundColor: `${topo.color}08`, border: `1px solid ${topo.color}20` }}>
                    {topo.svg}
                    <span style={{ fontFamily: monoFontFamily, fontSize: 11, color: topo.color, fontWeight: 600 }}>{topo.name}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ====== PAGE 2: Impedance ====== */}
      {p2.opacity > 0 && (
        <div style={pageStyle(p2)}>
          {/* Title */}
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 10,
              opacity: interpolate(p2_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p2_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            La courbe d'<span style={{ color: COLORS.purple }}>impédance</span> : notre entrée
          </h2>

          {/* Equation */}
          <div
            style={{
              opacity: interpolate(p2_equationAppear, [0, 1], [0, 1]),
              transform: `scale(${interpolate(p2_equationAppear, [0, 1], [0.8, 1])})`,
              marginBottom: 30,
            }}
          >
            <span style={{ fontFamily: monoFontFamily, fontSize: 24, color: COLORS.purple, fontWeight: 600 }}>
              Z(f) = R + j(2πfL - 1/2πfC)
            </span>
          </div>

          {/* Chart area */}
          <div
            style={{
              backgroundColor: `${COLORS.bgCard}`,
              borderRadius: 16,
              padding: "16px 20px",
              border: `1px solid ${COLORS.gray700}`,
              opacity: interpolate(p2_axesAppear, [0, 1], [0, 1]),
              transform: `scale(${interpolate(p2_axesAppear, [0, 1], [0.92, 1])})`,
            }}
          >
            <svg width="640" height="300">
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((t) => (
                <line
                  key={t}
                  x1="60"
                  y1={30 + t * 240}
                  x2="580"
                  y2={30 + t * 240}
                  stroke={COLORS.gray700}
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Axes */}
              <line x1="60" y1="270" x2="580" y2="270" stroke={COLORS.gray600} strokeWidth="1.5" />
              <line x1="60" y1="30" x2="60" y2="270" stroke={COLORS.gray600} strokeWidth="1.5" />
              {/* Axis labels */}
              <text x="30" y="45" fill={COLORS.gray400} fontSize="14" fontFamily={monoFontFamily} fontWeight="600">|Z|</text>
              <text x="565" y="295" fill={COLORS.gray400} fontSize="14" fontFamily={monoFontFamily} fontWeight="600">f (Hz)</text>
              {/* Frequency labels */}
              {["10", "100", "1k", "10k", "100k"].map((l, i) => (
                <text key={l} x={60 + (i + 1) * (520 / 6)} y="290" textAnchor="middle" fill={COLORS.gray500} fontSize="11" fontFamily={monoFontFamily}>{l}</text>
              ))}

              {/* Impedance curve */}
              <path
                d={curvePath}
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={curveEvolve.strokeDasharray}
                strokeDashoffset={curveEvolve.strokeDashoffset}
                style={{ filter: `drop-shadow(0 0 6px ${COLORS.blue}60)` }}
              />

              {/* Resonance highlight */}
              {p2_resonanceGlow > 0 && (
                <g opacity={p2_resonanceGlow}>
                  <circle
                    cx={60 + 0.38 * 520}
                    cy={30 + (1 - (0.75 - 0.55 + 0.12 * 0.38)) * 240}
                    r={12 + p2_resonanceGlow * 4}
                    fill="none"
                    stroke={COLORS.blueLight}
                    strokeWidth="2"
                    opacity={0.6}
                  />
                  <text
                    x={60 + 0.38 * 520 + 20}
                    y={30 + (1 - (0.75 - 0.55 + 0.12 * 0.38)) * 240 - 10}
                    fill={COLORS.blueLight}
                    fontSize="13"
                    fontFamily={monoFontFamily}
                    fontWeight="600"
                  >
                    Resonance
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Emphasis: curve = THE input */}
          {(() => {
            const emphasisAppear = spring({ frame: f, fps, delay: 730, config: SPRING_SNAPPY });
            return (
              <div
                style={{
                  marginTop: 20,
                  padding: "10px 28px",
                  borderRadius: 100,
                  backgroundColor: `${COLORS.purple}12`,
                  border: `1.5px solid ${COLORS.purple}40`,
                  opacity: interpolate(emphasisAppear, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(emphasisAppear, [0, 0.5, 1], [0.7, 1.05, 1])})`,
                }}
              >
                <span style={{ fontFamily, fontSize: 16, fontWeight: 700, color: COLORS.purple }}>
                  C'est cette courbe — et rien d'autre — que l'on donne au système
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* ====== PAGE 3: Data Encoding ====== */}
      {p3.opacity > 0 && (
        <div style={pageStyle(p3)}>
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 30,
              opacity: interpolate(p3_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p3_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            Encoder les <span style={{ color: COLORS.green }}>données</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
            {/* Mini curve with dots */}
            <div
              style={{
                opacity: interpolate(p3_curveAppear, [0, 1], [0, 1]),
                transform: `scale(${interpolate(p3_curveAppear, [0, 1], [0.9, 1])})`,
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 14,
                  padding: "14px 16px",
                  border: `1px solid ${COLORS.gray700}`,
                }}
              >
                <svg width="340" height="180">
                  <line x1="30" y1="160" x2="320" y2="160" stroke={COLORS.gray700} strokeWidth="1" />
                  <line x1="30" y1="20" x2="30" y2="160" stroke={COLORS.gray700} strokeWidth="1" />
                  {/* Curve */}
                  {(() => {
                    const pts: string[] = [];
                    const n = 60;
                    for (let i = 0; i < n; i++) {
                      const t = i / (n - 1);
                      const mag = 0.75 - 0.55 * Math.exp(-((t - 0.38) ** 2) / 0.007) + 0.12 * t;
                      const x = 30 + t * 290;
                      const y = 20 + (1 - mag) * 140;
                      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
                    }
                    return (
                      <path d={pts.join(" ")} fill="none" stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    );
                  })()}
                  {/* Sampled dots */}
                  {[0.05, 0.12, 0.2, 0.28, 0.35, 0.38, 0.42, 0.5, 0.6, 0.72, 0.85, 0.95].map((t, i) => {
                    const mag = 0.75 - 0.55 * Math.exp(-((t - 0.38) ** 2) / 0.007) + 0.12 * t;
                    const x = 30 + t * 290;
                    const y = 20 + (1 - mag) * 140;
                    const dotDelay = i * 0.07;
                    const dotOpacity = interpolate(p3_dotsProgress, [dotDelay, dotDelay + 0.15], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const dotScale = interpolate(p3_dotsProgress, [dotDelay, dotDelay + 0.15], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={5 * dotScale} fill={COLORS.blueLight} stroke={COLORS.blue} strokeWidth="1.5" opacity={dotOpacity} />
                        {/* Vertical dashed line to axis */}
                        <line x1={x} y1={y} x2={x} y2={160} stroke={COLORS.blue} strokeWidth="0.5" strokeDasharray="2 3" opacity={dotOpacity * 0.3} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Arrow */}
            <svg width="50" height="30" opacity={interpolate(p3_jsonAppear, [0, 1], [0, 1])}>
              <line x1="5" y1="15" x2="35" y2="15" stroke={COLORS.gray500} strokeWidth="2" />
              <polygon points="33,8 47,15 33,22" fill={COLORS.gray400} />
            </svg>

            {/* JSON representation */}
            <div
              style={{
                opacity: interpolate(p3_jsonAppear, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p3_jsonAppear, [0, 1], [20, 0])}px) scale(${interpolate(p3_jsonAppear, [0, 1], [0.9, 1])})`,
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 14,
                  padding: "18px 22px",
                  border: `1px solid ${COLORS.gray700}`,
                  fontFamily: monoFontFamily,
                  fontSize: 13,
                  lineHeight: "22px",
                  color: COLORS.gray300,
                }}
              >
                <span style={{ color: COLORS.gray500 }}>{"{"}</span><br />
                <span style={{ color: COLORS.blue }}>{`  "magnitude"`}</span>
                <span style={{ color: COLORS.gray500 }}>{`: [`}</span>
                <span style={{ color: COLORS.blueLight }}>{`2.14, 1.87, 0.92, ...`}</span>
                <span style={{ color: COLORS.gray500 }}>{`],`}</span><br />
                <span style={{ color: COLORS.purple }}>{`  "phase"`}</span>
                <span style={{ color: COLORS.gray500 }}>{`:    [`}</span>
                <span style={{ color: COLORS.purpleLight }}>{`-78, -45, 2, 41, ...`}</span>
                <span style={{ color: COLORS.gray500 }}>{`]`}</span><br />
                <span style={{ color: COLORS.gray500 }}>{"}"}</span>
              </div>
            </div>
          </div>

          {/* Point count badge */}
          <div
            style={{
              marginTop: 24,
              opacity: interpolate(p3_countAppear, [0, 1], [0, 1]),
              transform: `scale(${interpolate(p3_countAppear, [0, 1], [0.85, 1])})`,
            }}
          >
            <div
              style={{
                padding: "8px 24px",
                borderRadius: 100,
                backgroundColor: `${COLORS.green}12`,
                border: `1px solid ${COLORS.green}25`,
              }}
            >
              <span style={{ fontFamily: monoFontFamily, fontSize: 15, color: COLORS.green, fontWeight: 600 }}>
                100 points de fréquence (log-spaced)
              </span>
            </div>
          </div>

          {/* Échantillon explanation */}
          {(() => {
            const sampleAppear = spring({ frame: f, fps, delay: 1130, config: SPRING_SMOOTH });
            return (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 24px",
                  borderRadius: 14,
                  backgroundColor: `${COLORS.orange}10`,
                  border: `1px solid ${COLORS.orange}25`,
                  opacity: interpolate(sampleAppear, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(sampleAppear, [0, 1], [0.85, 1])})`,
                }}
              >
                <span style={{ fontSize: 22 }}>💡</span>
                <div>
                  <span style={{ fontFamily, fontSize: 15, fontWeight: 700, color: COLORS.orange }}>
                    Un échantillon
                  </span>
                  <span style={{ fontFamily, fontSize: 14, color: COLORS.gray300 }}>
                    {" "}= une paire (courbe Z(f), circuit correspondant).{" "}
                  </span>
                  <span style={{ fontFamily, fontSize: 14, color: COLORS.gray400 }}>
                    On en génère 150 000 pour le dataset.
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ====== PAGE 4: AI Prediction ====== */}
      {p4.opacity > 0 && (
        <div style={pageStyle(p4)}>
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 40,
              opacity: interpolate(p4_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p4_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            L'<span style={{ color: COLORS.blue }}>IA</span> prédit le circuit
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            {/* Input data */}
            <div
              style={{
                opacity: interpolate(p4_inputAppear, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p4_inputAppear, [0, 1], [-20, 0])}px)`,
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 14,
                  padding: "16px 20px",
                  border: `1px solid ${COLORS.gray700}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontFamily, fontSize: 12, color: COLORS.gray400, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Entrée
                </span>
                <svg width="100" height="60">
                  {(() => {
                    const pts: string[] = [];
                    for (let i = 0; i < 30; i++) {
                      const t = i / 29;
                      const mag = 0.75 - 0.55 * Math.exp(-((t - 0.38) ** 2) / 0.007) + 0.12 * t;
                      const x = 5 + t * 90;
                      const y = 5 + (1 - mag) * 50;
                      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
                    }
                    return <path d={pts.join(" ")} fill="none" stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" />;
                  })()}
                </svg>
                <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: COLORS.gray500 }}>Z(f) data</span>
              </div>
            </div>

            {/* Arrow in */}
            <svg width="50" height="30" opacity={interpolate(p4_arrowIn, [0, 1], [0, 1])}>
              <line x1="5" y1="15" x2="35" y2="15" stroke={COLORS.gray500} strokeWidth="2" />
              <polygon points="33,8 47,15 33,22" fill={COLORS.blue} />
            </svg>

            {/* AI Machine */}
            <div
              style={{
                opacity: interpolate(p4_aiAppear, [0, 1], [0, 1]),
                transform: `scale(${interpolate(p4_aiAppear, [0, 1], [0.7, 1])})`,
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 200,
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 24,
                  border: `2px solid ${COLORS.blue}50`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  boxShadow: `0 0 50px ${COLORS.blue}20, inset 0 0 40px ${COLORS.blue}05`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background grid */}
                <svg width="200" height="200" style={{ position: "absolute", top: 0, left: 0, opacity: 0.06 }}>
                  {[30, 60, 90, 120, 150, 180].map((y) => (
                    <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke={COLORS.blue} strokeWidth="0.5" />
                  ))}
                  {[30, 70, 110, 150].map((x) => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke={COLORS.blue} strokeWidth="0.5" />
                  ))}
                </svg>

                {/* Spinning gear */}
                <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform: `rotate(${p4_gearAngle}deg)` }}>
                  <circle cx="25" cy="25" r="8" fill={`${COLORS.blue}30`} stroke={COLORS.blue} strokeWidth="2" />
                  <circle cx="25" cy="25" r="3" fill={COLORS.blue} />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                    const rad = (a * Math.PI) / 180;
                    return (
                      <line key={a} x1={25 + 10 * Math.cos(rad)} y1={25 + 10 * Math.sin(rad)} x2={25 + 18 * Math.cos(rad)} y2={25 + 18 * Math.sin(rad)} stroke={COLORS.blue} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    );
                  })}
                </svg>

                <span style={{ fontFamily, fontSize: 32, fontWeight: 800, color: COLORS.blue, letterSpacing: "-0.02em", zIndex: 1 }}>
                  AI
                </span>
                <span style={{ fontFamily: monoFontFamily, fontSize: 11, color: COLORS.gray500, zIndex: 1 }}>
                  CNN + Transformer
                </span>
              </div>
            </div>

            {/* Arrow out */}
            <svg width="50" height="30" opacity={interpolate(p4_arrowOut, [0, 1], [0, 1])}>
              <line x1="5" y1="15" x2="35" y2="15" stroke={COLORS.gray500} strokeWidth="2" />
              <polygon points="33,8 47,15 33,22" fill={COLORS.green} />
            </svg>

            {/* Output circuit */}
            <div
              style={{
                opacity: interpolate(p4_outputAppear, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p4_outputAppear, [0, 1], [20, 0])}px) scale(${interpolate(p4_outputAppear, [0, 1], [0.9, 1])})`,
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 14,
                  padding: "16px 20px",
                  border: `1px solid ${COLORS.green}30`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: `0 0 30px ${COLORS.green}10`,
                }}
              >
                <span style={{ fontFamily, fontSize: 12, color: COLORS.green, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  Sortie
                </span>
                <svg width="160" height="60" viewBox="0 0 160 60">
                  <line x1="5" y1="30" x2="25" y2="30" stroke={COLORS.gray500} strokeWidth="2" />
                  <rect x="25" y="18" width="30" height="24" fill="none" stroke={COLORS.orange} strokeWidth="2" rx="3" />
                  <text x="40" y="14" textAnchor="middle" fill={COLORS.orange} fontSize="9" fontFamily={monoFontFamily}>47Ω</text>
                  <line x1="55" y1="30" x2="65" y2="30" stroke={COLORS.gray500} strokeWidth="2" />
                  {[0, 1, 2].map((i) => (
                    <path key={i} d={`M ${65 + i * 10} 30 A 5 5 0 0 1 ${65 + (i + 1) * 10} 30`} fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  ))}
                  <text x="80" y="22" textAnchor="middle" fill={COLORS.blue} fontSize="9" fontFamily={monoFontFamily}>2.2mH</text>
                  <line x1="95" y1="30" x2="108" y2="30" stroke={COLORS.gray500} strokeWidth="2" />
                  <line x1="108" y1="18" x2="108" y2="42" stroke={COLORS.green} strokeWidth="2.5" />
                  <line x1="115" y1="18" x2="115" y2="42" stroke={COLORS.green} strokeWidth="2.5" />
                  <text x="112" y="14" textAnchor="middle" fill={COLORS.green} fontSize="9" fontFamily={monoFontFamily}>470nF</text>
                  <line x1="115" y1="30" x2="155" y2="30" stroke={COLORS.gray500} strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Candidates explanation */}
          {p4_badgeAppear > 0 && (
            <div
              style={{
                marginTop: 25,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: interpolate(p4_badgeAppear, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p4_badgeAppear, [0, 1], [15, 0])}px)`,
              }}
            >
              {/* Best-of-N explanation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "14px 28px",
                  borderRadius: 14,
                  backgroundColor: `${COLORS.purple}10`,
                  border: `1px solid ${COLORS.purple}25`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 28, fontWeight: 800, color: COLORS.purple }}>50</span>
                  <span style={{ fontFamily, fontSize: 11, color: COLORS.gray400 }}>candidats</span>
                </div>
                <svg width="30" height="20" viewBox="0 0 30 20">
                  <line x1="2" y1="10" x2="22" y2="10" stroke={COLORS.gray500} strokeWidth="2" />
                  <polygon points="20,4 30,10 20,16" fill={COLORS.gray400} />
                </svg>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray400 }}>validation</span>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray400 }}>+ tri RMSE</span>
                </div>
                <svg width="30" height="20" viewBox="0 0 30 20">
                  <line x1="2" y1="10" x2="22" y2="10" stroke={COLORS.gray500} strokeWidth="2" />
                  <polygon points="20,4 30,10 20,16" fill={COLORS.green} />
                </svg>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 28, fontWeight: 800, color: COLORS.green }}>5</span>
                  <span style={{ fontFamily, fontSize: 11, color: COLORS.gray400 }}>meilleurs</span>
                </div>
              </div>

              {/* Candidate definition */}
              <div
                style={{
                  padding: "8px 22px",
                  borderRadius: 10,
                  backgroundColor: `${COLORS.bgCard}`,
                  border: `1px solid ${COLORS.gray700}`,
                }}
              >
                <span style={{ fontFamily, fontSize: 13, color: COLORS.gray400 }}>
                  Un <span style={{ color: COLORS.purple, fontWeight: 700 }}>candidat</span> = un circuit proposé par le modèle (décodage stochastique)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== PAGE 5: Backend Deployment ====== */}
      {p5.opacity > 0 && (
        <div style={pageStyle(p5)}>
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 40,
              opacity: interpolate(p5_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p5_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            Déployer dans un <span style={{ color: COLORS.green }}>backend</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {/* Trained model */}
            <div
              style={{
                opacity: interpolate(p5_modelAppear, [0, 1], [0, 1]),
                transform: `scale(${interpolate(p5_modelAppear, [0, 1], [0.7, 1])})`,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  backgroundColor: `${COLORS.purple}15`,
                  borderRadius: 20,
                  border: `2px solid ${COLORS.purple}50`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: `0 0 30px ${COLORS.purple}15`,
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill={`${COLORS.purple}30`} stroke={COLORS.purple} strokeWidth="2" />
                  <circle cx="20" cy="20" r="5" fill={COLORS.purple} />
                  {[0, 60, 120, 180, 240, 300].map((a) => {
                    const rad = (a * Math.PI) / 180;
                    return <line key={a} x1={20 + 8 * Math.cos(rad)} y1={20 + 8 * Math.sin(rad)} x2={20 + 14 * Math.cos(rad)} y2={20 + 14 * Math.sin(rad)} stroke={COLORS.purple} strokeWidth="1.5" opacity="0.5" />;
                  })}
                </svg>
                <span style={{ fontFamily: monoFontFamily, fontSize: 16, fontWeight: 700, color: COLORS.purple }}>
                  model_v5.pt
                </span>
                <span style={{ fontFamily: monoFontFamily, fontSize: 11, color: COLORS.gray500 }}>
                  CNN + Transformer
                </span>
              </div>
            </div>

            {/* Arrow */}
            <svg width="80" height="30" style={{ opacity: interpolate(p5_arrowAppear, [0, 1], [0, 1]) }}>
              <defs>
                <linearGradient id="backendArrow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={COLORS.green} stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <line x1="5" y1="15" x2="60" y2="15" stroke="url(#backendArrow)" strokeWidth="2.5" />
              <polygon points="58,8 74,15 58,22" fill={COLORS.green} opacity="0.8" />
            </svg>

            {/* FastAPI Server */}
            <div
              style={{
                opacity: interpolate(p5_serverAppear, [0, 1], [0, 1]),
                transform: `scale(${interpolate(p5_serverAppear, [0, 1], [0.7, 1])})`,
              }}
            >
              <div
                style={{
                  width: 280,
                  height: 240,
                  backgroundColor: `${COLORS.green}10`,
                  borderRadius: 20,
                  border: `2px solid ${COLORS.green}40`,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: `0 0 ${p5_serverGlow * 40}px ${COLORS.green}${Math.round(p5_serverGlow * 30).toString(16).padStart(2, "0")}`,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "10px 16px",
                    backgroundColor: `${COLORS.green}15`,
                    borderBottom: `1px solid ${COLORS.green}20`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <polygon points="2,14 8,2 14,14" fill="none" stroke={COLORS.green} strokeWidth="1.5" />
                    <circle cx="8" cy="10" r="1.5" fill={COLORS.green} />
                  </svg>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 14, fontWeight: 700, color: COLORS.green }}>
                    FastAPI
                  </span>
                  <span style={{ fontFamily: monoFontFamily, fontSize: 11, color: COLORS.gray500, marginLeft: "auto" }}>
                    Python
                  </span>
                </div>

                {/* Endpoints */}
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { method: "POST", path: "/api/predict", color: COLORS.green },
                    { method: "GET", path: "/api/health", color: COLORS.blue },
                    { method: "POST", path: "/api/impedance", color: COLORS.orange },
                  ].map((ep, i) => {
                    const epDelay = i * 0.3;
                    const epOpacity = interpolate(p5_endpointsAppear, [epDelay, epDelay + 0.5], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    return (
                      <div
                        key={ep.path}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 8,
                          backgroundColor: `${COLORS.bgCard}`,
                          opacity: epOpacity,
                        }}
                      >
                        <span style={{ fontFamily: monoFontFamily, fontSize: 11, fontWeight: 700, color: ep.color }}>
                          {ep.method}
                        </span>
                        <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray300 }}>
                          {ep.path}
                        </span>
                      </div>
                    );
                  })}

                  {/* Status badge */}
                  {p5_badgeAppear > 0.1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                        opacity: interpolate(p5_badgeAppear, [0, 1], [0, 1]),
                        transform: `scale(${interpolate(p5_badgeAppear, [0, 1], [0.8, 1])})`,
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.green }} />
                      <span style={{ fontFamily: monoFontFamily, fontSize: 11, color: COLORS.green, fontWeight: 600 }}>
                        Model loaded — :8000
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== PAGE 6: Frontend Architecture ====== */}
      {p6.opacity > 0 && (
        <div style={pageStyle(p6)}>
          <h2
            style={{
              fontFamily,
              fontSize: 42,
              fontWeight: 700,
              color: COLORS.white,
              margin: 0,
              marginBottom: 40,
              opacity: interpolate(p6_titleAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p6_titleAppear, [0, 1], [20, 0])}px)`,
            }}
          >
            Connecter au <span style={{ color: COLORS.blue }}>frontend</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            {/* Backend box */}
            <div
              style={{
                opacity: interpolate(p6_backendAppear, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p6_backendAppear, [0, 1], [-20, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 220,
                  height: 200,
                  backgroundColor: `${COLORS.green}10`,
                  borderRadius: 18,
                  border: `2px solid ${COLORS.green}40`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <rect x="4" y="6" width="28" height="24" rx="4" fill="none" stroke={COLORS.green} strokeWidth="2" />
                  <line x1="4" y1="14" x2="32" y2="14" stroke={COLORS.green} strokeWidth="1.5" opacity="0.4" />
                  <circle cx="10" cy="10" r="2" fill={COLORS.green} opacity="0.6" />
                  <circle cx="16" cy="10" r="2" fill={COLORS.green} opacity="0.4" />
                </svg>
                <span style={{ fontFamily: monoFontFamily, fontSize: 18, fontWeight: 700, color: COLORS.green }}>
                  FastAPI
                </span>
                <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray500 }}>
                  Backend Python
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["PyTorch", "Uvicorn"].map((t) => (
                    <span key={t} style={{ fontFamily: monoFontFamily, fontSize: 10, color: COLORS.gray400, padding: "3px 8px", borderRadius: 6, backgroundColor: `${COLORS.green}12`, border: `1px solid ${COLORS.green}20` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Connection lines + data flow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: interpolate(p6_connectionAppear, [0, 1], [0, 1]),
              }}
            >
              <svg width="120" height="100" viewBox="0 0 120 100">
                {/* Request arrow */}
                <line x1="10" y1="35" x2="95" y2="35" stroke={COLORS.blue} strokeWidth="2" strokeDasharray="6 4" />
                <polygon points="93,28 110,35 93,42" fill={COLORS.blue} opacity="0.7" />
                <text x="55" y="25" textAnchor="middle" fill={COLORS.blue} fontSize="11" fontFamily={monoFontFamily}>Z(f) data</text>

                {/* Response arrow */}
                <line x1="110" y1="65" x2="25" y2="65" stroke={COLORS.green} strokeWidth="2" strokeDasharray="6 4" />
                <polygon points="27,58 10,65 27,72" fill={COLORS.green} opacity="0.7" />
                <text x="65" y="85" textAnchor="middle" fill={COLORS.green} fontSize="11" fontFamily={monoFontFamily}>Circuit</text>

                {/* Data flow dots */}
                {p6_dataFlow > 0 && [0, 1, 2].map((i) => {
                  const dotPos = (p6_dataFlow * 100 + i * 35) % 100;
                  return (
                    <g key={i}>
                      <circle cx={10 + dotPos} cy={35} r={3} fill={COLORS.blue} opacity={0.6} />
                      <circle cx={110 - dotPos} cy={65} r={3} fill={COLORS.green} opacity={0.6} />
                    </g>
                  );
                })}
              </svg>
              <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray500 }}>
                REST API
              </span>
            </div>

            {/* Frontend box */}
            <div
              style={{
                opacity: interpolate(p6_frontendAppear, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(p6_frontendAppear, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 220,
                  height: 200,
                  backgroundColor: `${COLORS.blue}10`,
                  borderRadius: 18,
                  border: `2px solid ${COLORS.blue}40`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <rect x="4" y="4" width="28" height="28" rx="6" fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  <rect x="8" y="12" width="20" height="3" rx="1.5" fill={COLORS.blue} opacity="0.4" />
                  <rect x="8" y="18" width="14" height="3" rx="1.5" fill={COLORS.blue} opacity="0.3" />
                  <rect x="8" y="24" width="18" height="3" rx="1.5" fill={COLORS.blue} opacity="0.2" />
                </svg>
                <span style={{ fontFamily: monoFontFamily, fontSize: 18, fontWeight: 700, color: COLORS.blue }}>
                  Next.js
                </span>
                <span style={{ fontFamily: monoFontFamily, fontSize: 12, color: COLORS.gray500 }}>
                  Frontend React
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["React", "Tailwind"].map((t) => (
                    <span key={t} style={{ fontFamily: monoFontFamily, fontSize: 10, color: COLORS.gray400, padding: "3px 8px", borderRadius: 6, backgroundColor: `${COLORS.blue}12`, border: `1px solid ${COLORS.blue}20` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tech stack row */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 30,
              opacity: interpolate(p6_techAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p6_techAppear, [0, 1], [10, 0])}px)`,
            }}
          >
            {[
              { label: "PyTorch", desc: "Inference", color: COLORS.orange },
              { label: "FastAPI", desc: "API REST", color: COLORS.green },
              { label: "Next.js", desc: "Interface", color: COLORS.blue },
              { label: "Recharts", desc: "Graphiques", color: COLORS.purple },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}25`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color }} />
                <span style={{ fontFamily: monoFontFamily, fontSize: 13, fontWeight: 600, color: item.color }}>
                  {item.label}
                </span>
                <span style={{ fontFamily, fontSize: 12, color: COLORS.gray500 }}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== PAGE 7: Click to Demo ====== */}
      {p7.opacity > 0 && (
        <div style={pageStyle(p7)}>
          {/* URL bar mockup */}
          <div
            style={{
              opacity: interpolate(p7_urlAppear, [0, 1], [0, 1]),
              transform: `scale(${interpolate(p7_urlAppear, [0, 1], [0.85, 1])})`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 600,
                height: 60,
                backgroundColor: COLORS.bgCard,
                borderRadius: 16,
                border: `2px solid ${p7_clickEffect > 0 ? COLORS.blue : COLORS.gray600}`,
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                gap: 14,
                boxShadow: p7_clickEffect > 0
                  ? `0 0 ${30 + p7_clickEffect * 40}px ${COLORS.blue}40`
                  : `0 4px 20px rgba(0,0,0,0.3)`,
                transition: "border-color 0.1s",
              }}
            >
              {/* Lock icon */}
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="3" y="7" width="10" height="8" rx="2" fill="none" stroke={COLORS.green} strokeWidth="1.5" />
                <path d="M 5 7 V 5 A 3 3 0 0 1 11 5 V 7" fill="none" stroke={COLORS.green} strokeWidth="1.5" />
              </svg>
              <span style={{ fontFamily: monoFontFamily, fontSize: 18, color: COLORS.gray300 }}>
                <span style={{ color: COLORS.gray500 }}>https://</span>
                circuit-synthesis.ai
              </span>
            </div>

            {/* Click ripple effect */}
            {p7_clickEffect > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 100 + p7_clickEffect * 200,
                  height: 100 + p7_clickEffect * 200,
                  borderRadius: "50%",
                  border: `2px solid ${COLORS.blue}`,
                  opacity: 1 - p7_clickEffect,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Mouse cursor */}
            {p7_cursorVisible && (
              <svg
                width="28"
                height="36"
                viewBox="0 0 28 36"
                style={{
                  position: "absolute",
                  top: `calc(50% + ${p7_cursorY}px)`,
                  left: `calc(60% + ${p7_cursorX}px)`,
                  filter: "drop-shadow(2px 3px 4px rgba(0,0,0,0.5))",
                  transform: p7_clickEffect > 0.3 ? "scale(0.9)" : "scale(1)",
                }}
              >
                <path
                  d="M 2 2 L 2 24 L 8 18 L 16 28 L 20 26 L 12 16 L 20 14 Z"
                  fill="white"
                  stroke={COLORS.gray700}
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontFamily,
              fontSize: 22,
              color: COLORS.gray400,
              margin: 0,
              marginTop: 30,
              opacity: interpolate(p7_urlAppear, [0, 1], [0, 0.8]),
            }}
          >
            Tester le site en direct
          </p>
        </div>
      )}

      {/* ====== PAGE 8: Transition ====== */}
      {p8.opacity > 0 && (
        <div style={pageStyle(p8)}>
          <h2
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 600,
              color: COLORS.gray400,
              margin: 0,
              opacity: interpolate(p8_textAppear, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p8_textAppear, [0, 1], [15, 0])}px)`,
            }}
          >
            Démo en <span style={{ color: COLORS.blue, fontWeight: 700 }}>action</span>...
          </h2>
        </div>
      )}
    </AbsoluteFill>
  );
};
