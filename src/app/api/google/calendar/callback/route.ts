import {
  exchangeGoogleAuthCode,
  fetchGoogleUserInfo,
  saveGoogleRefreshToken,
} from "@/lib/google-oauth-tokens";
import { verifyGoogleOAuthState } from "@/lib/google-oauth-state";
import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FALLBACK_NEXT = "/calendar";

function errorRedirect(origin: string, next: string, reason: string) {
  const url = new URL(next, origin);
  url.searchParams.set("calendar_connect_error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const statePayload = verifyGoogleOAuthState(searchParams.get("state"));

  if (error) {
    return errorRedirect(
      origin,
      statePayload?.next ?? FALLBACK_NEXT,
      error === "access_denied" ? "access_denied" : "google_oauth_error",
    );
  }

  if (!statePayload) {
    return errorRedirect(origin, FALLBACK_NEXT, "invalid_state");
  }

  if (!code) {
    return errorRedirect(origin, statePayload.next, "missing_code");
  }

  try {
    const redirectUri = `${origin}/api/google/calendar/callback`;
    const tokenResponse = await exchangeGoogleAuthCode(code, redirectUri);
    const profile = await fetchGoogleUserInfo(tokenResponse.access_token);

    if (!profile.email) {
      throw new Error("Google account did not return an email address");
    }

    const supabase = await serverClient();

    await saveGoogleRefreshToken({
      supabase,
      userId: statePayload.userId,
      refreshToken: tokenResponse.refresh_token,
      ok: true,
      avatar_url: profile.picture ?? null,
      email: profile.email,
      name: profile.name ?? null,
    });

    return NextResponse.redirect(new URL(statePayload.next, origin));
  } catch (err) {
    console.error("Google Calendar connect callback failed", {
      userId: statePayload.userId,
      message: err instanceof Error ? err.message : "Unknown error",
    });

    return errorRedirect(origin, statePayload.next, "token_exchange_failed");
  }
}
