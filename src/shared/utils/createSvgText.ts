interface CreateSvgTextOptions {
  text: string | null | undefined;
  width: number;
  fontSize: number;
  color: string;
  height?: number;
  fontWeight?: number | string;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createSvgText({
  text,
  width,
  fontSize,
  color,
  height,
  fontWeight = 700,
}: CreateSvgTextOptions): Buffer {
  const safeText = String(text ?? "").trim();

  if (!safeText) {
    throw new Error("Cannot generate badge text: text value is empty.");
  }

  const lines = safeText.split("\n");

  const lineHeight = Math.round(fontSize * 1.25);

  const svgHeight =
    height ??
    Math.max(
      lineHeight * lines.length + 20,
      fontSize + 20
    );

  const startY =
    lines.length === 1
      ? Math.round(svgHeight / 2 + fontSize * 0.35)
      : Math.round(fontSize + 8);

  const textElements = lines
    .map((line, index) => {
      const y = startY + index * lineHeight;

      return `
        <text
          x="50%"
          y="${y}"
          text-anchor="middle"
          font-family="DejaVu Sans, Arial, sans-serif"
          font-size="${fontSize}px"
          font-weight="${fontWeight}"
          fill="${color}"
        >
          ${escapeXml(line)}
        </text>
      `;
    })
    .join("");

  const svg = `
    <svg
      width="${width}"
      height="${svgHeight}"
      viewBox="0 0 ${width} ${svgHeight}"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${textElements}
    </svg>
  `;

  return Buffer.from(svg);
}