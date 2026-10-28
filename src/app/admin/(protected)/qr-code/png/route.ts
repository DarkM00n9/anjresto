import { NextResponse } from "next/server";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { requireOwnerForCurrentRestaurant } from "@/lib/auth";
import { buildPublicCarteUrl, generateQrPngBuffer } from "@/lib/qr";

export async function GET() {
  const restaurant = await requireCurrentRestaurant();
  await requireOwnerForCurrentRestaurant(restaurant.id);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  const carteUrl = buildPublicCarteUrl(restaurant, rootDomain);
  const png = await generateQrPngBuffer(carteUrl);

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
