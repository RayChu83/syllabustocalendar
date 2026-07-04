import crypto from "crypto";

const stateSecret = process.env.GOOGLE_OAUTH_STATE_SECRET!;
const STATE_TTL_MS = 10 * 60 * 1000;

type GoogleOAuthStatePayload = {
  userId: string;
  next: string;
  nonce: string;
  iat: number;
};

function sign(payloadB64: string) {
  return crypto.createHmac("sha256", stateSecret).update(payloadB64).digest("base64url");
}

export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback: string,
) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }
  return path;
}

export function createGoogleOAuthState(input: { userId: string; next: string }) {
  const payload: GoogleOAuthStatePayload = {
    userId: input.userId,
    next: input.next,
    nonce: crypto.randomBytes(16).toString("hex"),
    iat: Date.now(),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyGoogleOAuthState(
  state: string | null,
): GoogleOAuthStatePayload | null {
  if (!state) return null;

  const [payloadB64, signature] = state.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const actual = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actual.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actual, expectedBuffer)
  ) {
    return null;
  }

  let payload: GoogleOAuthStatePayload;

  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload.userId !== "string" ||
    typeof payload.next !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.iat !== "number"
  ) {
    return null;
  }

  if (Date.now() - payload.iat > STATE_TTL_MS) {
    return null;
  }

  return payload;
}
