import { decrypt } from "@/lib/google-oauth-tokens";
// import { serverClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GoogleAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

async function mintGoogleAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as GoogleAccessTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "Failed to mint access token",
    );
  }

  return data.access_token;
}

export async function POST(req: NextRequest) {
  //   const supabase = await serverClient();

  //   const {
  //     data: { user },
  //     error: userError,
  //   } = await supabase.auth.getUser();

  //   if (!user || userError) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }

  const { body } = await req.json().catch(() => ({}));
  const input =
    typeof body === "string"
      ? body
      : "Summarize my upcoming Google Calendar events.";

  //   const { data: tokenRecord, error: tokenError } = await supabase
  //     .from("google_oauth_tokens")
  //     .select("encrypted_refresh_token,iv,authTag")
  //     .eq("user_id", user.id)
  //     .maybeSingle();

  //   if (tokenError) {
  //     console.error(tokenError);
  //     return NextResponse.json(
  //       { error: "Failed to retrieve Google Calendar connection" },
  //       { status: 500 },
  //     );
  //   }
  const tokenRecord = {
    encrypted_refresh_token: process.env.ENCRYPTED_GOOGLE_REFRESH_TOKEN,
    iv: process.env.GOOGLE_REFRESH_TOKEN_IV,
    authTag: process.env.GOOGLE_REFRESH_TOKEN_AUTH_TAG,
  };

  if (
    !tokenRecord?.encrypted_refresh_token ||
    !tokenRecord.iv ||
    !tokenRecord.authTag
  ) {
    return NextResponse.json(
      { error: "Google Calendar is not connected" },
      { status: 409 },
    );
  }

  try {
    const refreshToken = decrypt({
      encryptedToken: tokenRecord.encrypted_refresh_token,
      iv: tokenRecord.iv,
      authTag: tokenRecord.authTag,
    });

    const accessToken = await mintGoogleAccessToken(refreshToken);
    console.log("ACCESS TOKLEN", accessToken);

    // const response = await openai.responses.create({
    //   model: "gpt-5-mini",
    //   tools: [
    //     {
    //       type: "mcp",
    //       server_label: "google_calendar",
    //       connector_id: "connector_googlecalendar",
    //       authorization: accessToken,
    //       require_approval: "never",
    //     },
    //   ],
    //   input,
    // });

    // return NextResponse.json(
    //   {
    //     output: response.output_text,
    //     response,
    //   },
    //   { status: 200 },
    // );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to process Google Calendar request" },
      { status: 500 },
    );
  }
}
