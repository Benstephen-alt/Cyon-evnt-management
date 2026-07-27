import fs from "fs";
import path from "path";

interface CreateSvgTextOptions {
  text: string | null | undefined;
  width: number;
  height?: number;
  fontSize: number;
  color: string;
  fontWeight?: number;
}

let cachedFontBase64: string | null = null;

function getFontBase64(): string {
  if (cachedFontBase64) {
    return cachedFontBase64;
  }

  const possiblePaths = [
    // When running compiled JavaScript from dist
    path.resolve(
      process.cwd(),
      "dist/assets/fonts/DejaVuSans-Bold.ttf"
    ),

    // When running TypeScript directly
    path.resolve(
      process.cwd(),
      "src/assets/fonts/DejaVuSans-Bold.ttf"
    ),
  ];

  const fontPath = possiblePaths.find((candidate) =>
    fs.existsSync(candidate)
  );

  if (!fontPath) {
    throw new Error(
      `Badge font not found. Checked: ${possiblePaths.join(", ")}`
    );
  }

  cachedFontBase64 = fs
    .readFileSync(fontPath)
    .toString("base64");

  return cachedFontBase64;
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
  height,
  fontSize,
  color,
  fontWeight = 700,
}: CreateSvgTextOptions): Buffer {
  const safeText = String(text ?? "").trim();

  if (!safeText) {
    throw new Error(
      "Cannot generate badge text because the supplied value is empty."
    );
  }

  const fontBase64 = getFontBase64();
  const lines = safeText.split("\n");

  const lineHeight = Math.round(
    fontSize * 1.2
  );

  const svgHeight =
    height ??
    Math.max(
      lineHeight * lines.length + 16,
      fontSize + 20
    );

  const totalTextHeight =
    lineHeight * lines.length;

  const firstLineY =
    (svgHeight - totalTextHeight) / 2 +
    fontSize;

  const textNodes = lines
    .map((line, index) => {
      const y =
        firstLineY +
        index * lineHeight;

      return `
        <text
          x="${width / 2}"
          y="${y}"
          text-anchor="middle"
          font-family="BadgeFont"
          font-size="${fontSize}"
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
      <defs>
        <style>
          @font-face {
            font-family: "BadgeFont";
            src: url("data:font/truetype;charset=utf-8;base64,${fontBase64}")
              format("truetype");
            font-weight: 700;
            font-style: normal;
          }
        </style>
      </defs>

      ${textNodes}
    </svg>
  `;

  return Buffer.from(svg);
}