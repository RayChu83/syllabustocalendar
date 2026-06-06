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
  name: string;
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
