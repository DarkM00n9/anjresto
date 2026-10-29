import "server-only";

/**
 * Vérification d'identité par code email : à activer (QUOTE_SIGNATURE_OTP=true) une fois un domaine
 * d'envoi vérifié dans Resend. Tant qu'elle est désactivée, le signataire confirme son email à la place.
 */
export function quoteOtpRequired() {
  return process.env.QUOTE_SIGNATURE_OTP === "true";
}
