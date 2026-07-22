import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const encryptionKey = Buffer.from(
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY!,
  "base64",
);

const hashSecret = process.env.GOOGLE_TOKEN_HASH_SECRET!;

function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedToken: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decrypt({
  encryptedToken,
  iv,
  authTag,
}: {
  encryptedToken: string;
  iv: string;
  authTag: string;
}) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedToken, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function hashToken(token: string) {
  return crypto.createHmac("sha256", hashSecret).update(token).digest("hex");
}

type GoogleCalendarConnection = {
  user_id: string;
  avatar_url: string | null;
  email: string;
  name: string | null;
  ok: boolean;
  created_at: string;
};

type GoogleCalendarTokenRecord = GoogleCalendarConnection & {
  encrypted_refresh_token: string | null;
  iv: string | null;
  auth_tag: string | null;
};

export async function saveGoogleRefreshToken({
  supabase,
  userId,
  refreshToken,
  ok,
  avatar_url,
  email,
  name,
}: {
  supabase: SupabaseClient;
  userId: string;
  refreshToken: string;
  ok: boolean;
  avatar_url: string | null;
  email: string;
  name: string | null;
}) {
  const refreshTokenHash = hashToken(refreshToken);

  const { data: existing, error: readError } = await supabase
    .from("google_oauth_tokens")
    .select("hashed_refresh_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing?.hashed_refresh_token === refreshTokenHash) {
    const { error: updateError } = await supabase
      .from("google_oauth_tokens")
      .update({
        ok,
        avatar_url,
        email,
        name,
      })
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { encryptedToken, authTag, iv } = encryptToken(refreshToken);

  const { error: upsertError } = await supabase
    .from("google_oauth_tokens")
    .upsert({
      user_id: userId,
      encrypted_refresh_token: encryptedToken,
      hashed_refresh_token: refreshTokenHash,
      auth_tag: authTag,
      iv,
      ok,
      avatar_url,
      email,
      name,
    });

  if (upsertError) {
    throw upsertError;
  }
}

type GoogleAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  refresh_token?: string;
  id_token?: string;
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

export async function exchangeGoogleAuthCode(
  code: string,
  redirectUri: string,
) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as GoogleAccessTokenResponse;

  if (!response.ok || !data.access_token || !data.refresh_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange Google authorization code",
    );
  }

  return data as GoogleAccessTokenResponse & {
    access_token: string;
    refresh_token: string;
  };
}

type GoogleUserInfo = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google account profile");
  }

  return (await response.json()) as GoogleUserInfo;
}

function toCalendarConnection(
  tokenRecord: GoogleCalendarTokenRecord,
  ok: boolean,
): GoogleCalendarConnection {
  return {
    user_id: tokenRecord.user_id,
    avatar_url: tokenRecord.avatar_url,
    email: tokenRecord.email,
    name: tokenRecord.name,
    ok,
    created_at: tokenRecord.created_at,
  };
}

async function updateGoogleConnectionStatus({
  supabase,
  userId,
  ok,
}: {
  supabase: SupabaseClient;
  userId: string;
  ok: boolean;
}) {
  const { error } = await supabase
    .from("google_oauth_tokens")
    .update({ ok })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function getValidatedGoogleCalendarConnection(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("google_oauth_tokens")
    .select(
      "user_id,avatar_url,email,name,ok,created_at,encrypted_refresh_token,iv,auth_tag",
    )
    .eq("user_id", userId)
    .maybeSingle<GoogleCalendarTokenRecord>();

  if (tokenError) {
    throw tokenError;
  }

  if (!tokenRecord) {
    return null;
  }

  try {
    if (
      !tokenRecord.encrypted_refresh_token ||
      !tokenRecord.iv ||
      !tokenRecord.auth_tag
    ) {
      throw new Error("Google Calendar connection is missing token data");
    }

    const refreshToken = decrypt({
      encryptedToken: tokenRecord.encrypted_refresh_token,
      iv: tokenRecord.iv,
      authTag: tokenRecord.auth_tag,
    });

    const accessToken = await mintGoogleAccessToken(refreshToken);

    if (!tokenRecord.ok) {
      await updateGoogleConnectionStatus({ supabase, userId, ok: true });
    }

    return toCalendarConnection(tokenRecord, true);
  } catch (error) {
    console.error("Google Calendar connection validation failed", {
      userId,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    try {
      await updateGoogleConnectionStatus({ supabase, userId, ok: false });
    } catch (updateError) {
      console.error("Failed to update Google Calendar connection status", {
        userId,
        message:
          updateError instanceof Error ? updateError.message : "Unknown error",
      });
    }

    return toCalendarConnection(tokenRecord, false);
  }
}

export async function retrieveGoogleAccessToken(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("google_oauth_tokens")
    .select("encrypted_refresh_token,iv,auth_tag")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    tokenError ||
    !tokenRecord?.encrypted_refresh_token ||
    !tokenRecord?.iv ||
    !tokenRecord?.auth_tag
  ) {
    throw tokenError || new Error("Google Calendar is not connected");
  }

  const refreshToken = decrypt({
    encryptedToken: tokenRecord.encrypted_refresh_token,
    iv: tokenRecord.iv,
    authTag: tokenRecord.auth_tag,
  });

  const accessToken = await mintGoogleAccessToken(refreshToken);

  return accessToken;
}
