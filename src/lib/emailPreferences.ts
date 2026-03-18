import { sign, verify, SignOptions } from "jsonwebtoken";
import { isProd, PUBLIC_BASE_URL, SECRET_KEY } from "../config";

const EMAIL_PREFERENCES_TOKEN_PURPOSE = "email-preferences";

interface EmailPreferencesTokenPayload {
  purpose: string;
  userId: string | number;
}

export function getPublicAppUrl(): string {
  if (PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/+$/, "");
  if (isProd) return "https://farreachco.com";
  return "http://localhost:4000";
}

export function createEmailPreferencesToken(
  userId: string | number,
  expiresIn: string | number = "365d",
): string {
  return sign(
    {
      purpose: EMAIL_PREFERENCES_TOKEN_PURPOSE,
      userId: String(userId),
    },
    SECRET_KEY,
    { expiresIn } as SignOptions,
  );
}

export function verifyEmailPreferencesToken(
  token: string,
): { userId: string } | null {
  try {
    const payload = verify(
      token,
      SECRET_KEY,
    ) as EmailPreferencesTokenPayload;

    if (
      payload.purpose !== EMAIL_PREFERENCES_TOKEN_PURPOSE ||
      !payload.userId
    ) {
      return null;
    }

    return { userId: String(payload.userId) };
  } catch {
    return null;
  }
}

export function getEmailPreferenceLinks(userId: string | number) {
  const token = createEmailPreferencesToken(userId);
  const baseUrl = getPublicAppUrl();
  return {
    token,
    managePreferencesUrl: `${baseUrl}/email/preferences?token=${encodeURIComponent(token)}`,
    unsubscribeUrl: `${baseUrl}/email/unsubscribe?token=${encodeURIComponent(token)}`,
  };
}
