import "server-only";

/**
 * Traduit des textes de restaurant du français vers l'anglais via l'API Claude.
 * Sans ANTHROPIC_API_KEY (ou en cas d'erreur), renvoie un objet vide : le site reste en français.
 */
export async function translateToEnglish(texts: Record<string, string | null | undefined>): Promise<Record<string, string>> {
  const key = process.env.ANTHROPIC_API_KEY;
  const entries = Object.entries(texts).filter(([, v]) => v && v.trim());
  if (!key || entries.length === 0) return {};

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 4000,
        system:
          "You translate French restaurant website content (dish names, descriptions, taglines) into natural, appetizing English. " +
          "Keep proper names and well-known French dish names where appropriate. " +
          "Reply with ONLY a JSON object with the same keys as the input and the translated strings as values.",
        messages: [{ role: "user", content: JSON.stringify(Object.fromEntries(entries)) }],
      }),
    });
    if (!res.ok) return {};
    const body = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = body.content?.find((c) => c.type === "text")?.text ?? "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  } catch {
    return {};
  }
}
