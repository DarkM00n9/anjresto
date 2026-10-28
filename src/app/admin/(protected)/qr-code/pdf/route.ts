import { NextResponse } from "next/server";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { requireOwnerForCurrentRestaurant } from "@/lib/auth";
import { buildPublicCarteUrl, generateTableCardPdf } from "@/lib/qr";

export async function GET() {
  const restaurant = await requireCurrentRestaurant();
  await requireOwnerForCurrentRestaurant(restaurant.id);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  const carteUrl = buildPublicCarteUrl(restaurant, rootDomain);
  const pdf = await generateTableCardPdf(restaurant, carteUrl);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
