import { SITE } from "../lib/theme";
import { monoFontFamily } from "../lib/fonts";

type Props = {
  width: number;
};

export const BrowserChrome: React.FC<Props> = ({ width }) => {
  return (
    <div
      style={{
        width,
        height: 44,
        backgroundColor: "#f0f0f5",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottom: `1px solid ${SITE.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 7, marginRight: 12 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#ffbd2e",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#28c840",
          }}
        />
      </div>

      {/* URL bar */}
      <div
        style={{
          flex: 1,
          height: 28,
          backgroundColor: "#ffffff",
          borderRadius: 6,
          border: `1px solid ${SITE.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px",
        }}
      >
        {/* Lock icon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          style={{ marginRight: 6, opacity: 0.4 }}
        >
          <rect x="2" y="5" width="8" height="6" rx="1" fill="#64748b" />
          <path
            d="M 4 5 L 4 3.5 A 2 2 0 0 1 8 3.5 L 8 5"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.2"
          />
        </svg>
        <span
          style={{
            fontFamily: monoFontFamily,
            fontSize: 12,
            color: SITE.muted,
          }}
        >
          circuit-synthesis.ai
        </span>
      </div>

      {/* Spacer for symmetry */}
      <div style={{ width: 70 }} />
    </div>
  );
};
