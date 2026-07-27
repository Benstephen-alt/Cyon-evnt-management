import fs from "fs";
import path from "path";
import sharp from "sharp";

interface CreateTextOptions {
  text: string | null | undefined;
  width: number;
  fontSize: number;
  color: string;
  fontWeight?: number;
}

function getFontPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "dist/assets/fonts/DejaVuSans-Bold.ttf"),
    path.resolve(process.cwd(), "src/assets/fonts/DejaVuSans-Bold.ttf"),
  ];

  const fontPath = possiblePaths.find(fs.existsSync);

  if (!fontPath) {
    throw new Error(
      `Badge font not found. Checked: ${possiblePaths.join(", ")}`
    );
  }

  return fontPath;
}

function escapePango(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function createSvgText({
  text,
  width,
  fontSize,
  color,
}: CreateTextOptions): Promise<Buffer> {
  const safeText = String(text ?? "").trim();

  if (!safeText) {
    throw new Error("Cannot generate badge text from an empty value.");
  }

  return sharp({
    text: {
      text: `<span foreground="${color}">${escapePango(safeText)}</span>`,
      font: `DejaVu Sans Bold ${fontSize}`,
      fontfile: getFontPath(),
      width,
      align: "left",
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer();
}