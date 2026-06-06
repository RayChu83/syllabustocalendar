import { saveGoogleRefreshToken } from "@/lib/google-oauth-tokens";
import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await serverClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      console.log(data.session);
      const refreshToken = data.session.provider_refresh_token;

      if (refreshToken) {
        await saveGoogleRefreshToken({
          supabase,
          userId: data.session.user.id,
          refreshToken,
          ok: true,
          avatar_url: data.session.user?.user_metadata?.avatar_url,
          email: data.session.user.user_metadata.email,
          name: data.session.user?.user_metadata?.name,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=oauth_callback`);
}
