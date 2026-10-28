import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";
import type { Restaurant } from "@/types/database";

/** URL publique (prod) de la carte, utilisée pour le QR — jamais l'URL locale /r/{slug}. */
export function buildPublicCarteUrl(restaurant: Restaurant, rootDomain: string): string {
  const host = restaurant.custom_domain || `${restaurant.slug}.${rootDomain}`;
  return `https://${host}/carte`;
}

export async function generateQrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, { width: 1024, margin: 1, errorCorrectionLevel: "M" });
}

// A6 = 105 x 148 mm. pdf-lib travaille en points (1 mm = 2.8346 pt).
const MM_TO_PT = 2.8346;
const A6_WIDTH = 105 * MM_TO_PT;
const A6_HEIGHT = 148 * MM_TO_PT;

async function tryEmbedLogo(pdfDoc: PDFDocument, logoUrl: string | null): Promise<PDFImage | null> {
  if (!logoUrl) return null;
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("png") || logoUrl.endsWith(".png")) {
      return await pdfDoc.embedPng(bytes);
    }
    if (contentType.includes("jpeg") || contentType.includes("jpg") || /\.jpe?g$/.test(logoUrl)) {
      return await pdfDoc.embedJpg(bytes);
    }
    return null;
  } catch {
    return null;
  }
}

/** PDF chevalet de table A6 (recto/verso identiques) : logo, nom, QR vers la carte. */
export async function generateTableCardPdf(restaurant: Restaurant, carteUrl: string): Promise<Uint8Array> {
  const qrPng = await generateQrPngBuffer(carteUrl);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdfDoc.embedPng(qrPng);
  const logoImage = await tryEmbedLogo(pdfDoc, restaurant.logo_url);

  for (let i = 0; i < 2; i++) {
    const page = pdfDoc.addPage([A6_WIDTH, A6_HEIGHT]);
    const { width, height } = page.getSize();

    let cursorY = height - 28;

    if (logoImage) {
      const logoSize = 48;
      page.drawImage(logoImage, {
        x: width / 2 - logoSize / 2,
        y: cursorY - logoSize,
        width: logoSize,
        height: logoSize,
      });
      cursorY -= logoSize + 12;
    }

    const nameSize = 15;
    page.drawText(restaurant.name, {
      x: width / 2 - font.widthOfTextAtSize(restaurant.name, nameSize) / 2,
      y: cursorY,
      size: nameSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    const qrSize = Math.min(width, height) * 0.5;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: height / 2 - qrSize / 2 - 10,
      width: qrSize,
      height: qrSize,
    });

    const caption = "Scannez pour voir la carte";
    const captionSize = 9;
    page.drawText(caption, {
      x: width / 2 - regularFont.widthOfTextAtSize(caption, captionSize) / 2,
      y: 28,
      size: captionSize,
      font: regularFont,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  return pdfDoc.save();
}
