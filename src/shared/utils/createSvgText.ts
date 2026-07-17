interface CreateSvgTextOptions {
  text: string;
  width: number;
  fontSize: number;
  color: string;
  fontWeight?: "normal" | "bold";
}

export function createSvgText({
  text,
  width,
  fontSize,
  color,
  fontWeight = "bold",
}: CreateSvgTextOptions): Buffer {

  const lines = text.split("\n");

  const tspans = lines
    .map(
      (line, index) => `
      <tspan
        x="0"
        dy="${index === 0 ? 0 : fontSize + 8}">
        ${escapeXml(line)}
      </tspan>`
    )
    .join("");

  const svg = `
  <svg
    width="${width}"
    height="${fontSize * lines.length + 30}"
    xmlns="http://www.w3.org/2000/svg">

    <text
      x="0"
      y="${fontSize}"
      font-size="${fontSize}"
      font-family="Arial, Helvetica, sans-serif"
      font-weight="${fontWeight}"
      fill="${color}">
      ${tspans}
    </text>

  </svg>
  `;

  return Buffer.from(svg);
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}