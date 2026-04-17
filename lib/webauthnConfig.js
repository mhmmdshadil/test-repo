/**
 * Shared utility to dynamically resolve WebAuthn RP ID and Origin from request headers.
 * This ensures consistency across 'options' and 'verify' steps on any domain (local, Vercel preview, production).
 */
export function getWebAuthnConfig(req) {
  const host = req.headers.get("host"); // e.g. "localhost:3000" or "red-pulse.vercel.app"
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  
  // The origin is the full URL including protocol and host
  const origin = `${protocol}://${host}`;
  
  // The rpID MUST be just the hostname, without port or protocol.
  // We split by ':' to remove the port if it exists (e.g. "localhost:3000" -> "localhost")
  const rpID = host.split(":")[0];
  
  return { rpID, origin };
}
