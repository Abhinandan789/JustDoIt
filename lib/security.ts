import crypto from "crypto";

/**
 * Validates HMAC-SHA256 signature for cron webhook requests
 * Prevents unauthorized access to time-sensitive cron endpoints
 *
 * @param payload - The request body/payload
 * @param signature - The X-Signature header value
 * @param secret - The HMAC secret key
 * @returns true if signature is valid, false otherwise
 */
export function validateHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate HMAC-SHA256 signature for outgoing webhook requests
 * Use this when calling external cron services
 *
 * @param payload - The payload to sign
 * @param secret - The HMAC secret key
 * @returns Hex-encoded HMAC signature
 */
export function generateHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}
