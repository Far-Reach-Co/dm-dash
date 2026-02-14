import { sign, verify, SignOptions } from "jsonwebtoken";

const EMAIL_PREFERENCES_TOKEN_PURPOSE = "email-preferences";

interface EmailPreferencesTokenPayload {
  purpose: string;
  userId: string | number;
}

export function getPublicAppUrl(): string {
  const envBaseUrl = process.env.PUBLIC_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, "");
  if (process.env.SERVER_ENV === "prod") return "https://farreachco.com";
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
    process.env.SECRET_KEY as string,
    { expiresIn } as SignOptions,
  );
}

export function verifyEmailPreferencesToken(
  token: string,
): { userId: string } | null {
  try {
    const payload = verify(
      token,
      process.env.SECRET_KEY as string,
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
