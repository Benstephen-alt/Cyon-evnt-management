import QRCode from "qrcode";

export async function generateQRCode(
  text: string
): Promise<string> {

  return QRCode.toDataURL(text);

}

