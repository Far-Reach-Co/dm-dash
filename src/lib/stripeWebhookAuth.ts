import { createHmac, timingSafeEqual } from "crypto";

function parseStripeSignatureHeader(header: string) {
  const parts = header.split(",").map((entry) => entry.trim()).filter(Boolean);
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (!key || !rest.length) continue;
    const value = rest.join("=");
    if (key === "t") {
      timestamp = value;
      continue;
    }
    if (key === "v1") {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

function safeCompareHex(expectedHex: string, receivedHex: string) {
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const receivedBuffer = Buffer.from(receivedHex, "hex");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyStripeWebhookSignature(params: {
  payload: Buffer;
  stripeSignatureHeader: string;
  webhookSecret: string;
  toleranceSeconds?: number;
}) {
  const toleranceSeconds = Number.isFinite(params.toleranceSeconds)
    ? Number(params.toleranceSeconds)
    : 300;
  const parsed = parseStripeSignatureHeader(params.stripeSignatureHeader);
  if (!parsed.timestamp || !parsed.signatures.length) return false;

  const timestampNumber = Number(parsed.timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampNumber);
  if (ageSeconds > toleranceSeconds) return false;

  const signedPayload = `${parsed.timestamp}.${params.payload.toString("utf8")}`;
  const expected = createHmac("sha256", params.webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return parsed.signatures.some((signature) => {
    if (!/^[a-fA-F0-9]+$/.test(signature)) return false;
    return safeCompareHex(expected, signature);
  });
}
