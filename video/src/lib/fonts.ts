// Load Google Fonts via @font-face (avoids @remotion/google-fonts render bug)
function injectFontFaces() {
  if (typeof document === "undefined") return;
  if (document.getElementById("custom-fonts")) return;

  const style = document.createElement("style");
  style.id = "custom-fonts";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=block');
  `;
  document.head.appendChild(style);
}

injectFontFaces();

export const fontFamily = "Inter, sans-serif";
export const monoFontFamily = "'JetBrains Mono', monospace";
