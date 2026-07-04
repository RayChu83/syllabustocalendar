import {
  createGoogleOAuthState,
  sanitizeRedirectPath,
} from "@/lib/google-oauth-state";
import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeRedirectPath(searchParams.get("next"), "/calendar");

  const supabase = await serverClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    const loginUrl = new URL("/", origin);
    loginUrl.searchParams.set("auth_error", "login_required");
    return NextResponse.redirect(loginUrl);
  }

  const state = createGoogleOAuthState({ userId: user.id, next });
  const redirectUri = `${origin}/api/google/calendar/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "openid email profile https://www.googleapis.com/auth/calendar",
  );
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
