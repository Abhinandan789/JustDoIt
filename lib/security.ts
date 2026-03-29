import crypto from "crypto";

/**
 * Validates HMAC-SHA256 signature for cron webhook requests
 * Prevents unauthorized access to time-sensitive cron endpoints
 *
 * @param payload - The request body/payload
 * @param signature - The X-Signature header value (hex-encoded)
 * @param secret - The HMAC secret key
 * @returns true if signature is valid, false otherwise
 * @throws Error if signature format is invalid
 */
export function validateHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Expected signature is hex-encoded, so verify it's valid hex
  if (!/^[0-9a-f]{64}$/i.test(signature)) {
    throw new Error("Invalid signature format: expected 64-character hex string");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Compare both as hex strings (same encoding)
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
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
