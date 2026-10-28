import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // En local, le préfixe /r/{slug} ne survit pas à la réécriture du proxy : on le
  // reconstruit depuis le header posé par celui-ci pour revenir sur le bon tenant.
  const slug = request.headers.get("x-restaurant-slug");
  const redirectPath = slug ? `/r/${slug}/admin` : "/admin";

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
