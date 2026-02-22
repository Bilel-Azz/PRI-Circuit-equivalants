import { useCurrentFrame, interpolate } from "remotion";
import { SITE, SITE_WIDTH, SITE_HEIGHT, SITE_APPEAR, SITE_READY, OUTRO_START } from "../lib/theme";
import { BrowserChrome } from "./BrowserChrome";
import { MockHeader } from "./MockHeader";
import { MockLeftPanel } from "./MockLeftPanel";
import { MockRightPanel } from "./MockRightPanel";

export const WebsiteMockup: React.FC = () => {
  const frame = useCurrentFrame();

  // Site becomes visible after concept section
  const siteOpacity = interpolate(frame, [SITE_APPEAR, SITE_APPEAR + 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out in outro
  const outroFade = interpolate(frame, [OUTRO_START + 50, OUTRO_START + 150], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame relative to site ready (compressed timeline)
  const siteFrame = Math.max(0, frame - SITE_READY);

  if (frame < SITE_APPEAR - 10) return null;

  return (
    <div
      style={{
        width: SITE_WIDTH,
        height: SITE_HEIGHT + 44, // +browser chrome
        opacity: siteOpacity * outroFade,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `
          0 25px 80px rgba(0,0,0,0.35),
          0 8px 30px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.05)
        `,
        flexShrink: 0,
      }}
    >
      {/* Browser chrome */}
      <BrowserChrome width={SITE_WIDTH} />

      {/* Site content */}
      <div
        style={{
          width: SITE_WIDTH,
          height: SITE_HEIGHT,
          backgroundColor: SITE.bg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <svg
          width={SITE_WIDTH}
          height={SITE_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <pattern
              id="siteGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={SITE.gridPattern}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#siteGrid)" />
        </svg>

        {/* Header */}
        <MockHeader siteFrame={siteFrame} />

        {/* Main content area: two columns */}
        <div
          style={{
            display: "flex",
            height: SITE_HEIGHT - 73, // minus header
            padding: "16px 24px",
            gap: 20,
          }}
        >
          {/* Left panel (33%) */}
          <div style={{ width: "33%", display: "flex", flexDirection: "column", gap: 16 }}>
            <MockLeftPanel siteFrame={siteFrame} />
          </div>

          {/* Right panel (67%) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <MockRightPanel siteFrame={siteFrame} />
          </div>
        </div>
      </div>
    </div>
  );
};
