export interface ParsedItem {
  name: string;
  description: string | null;
  price: number;
}

export interface ParsedCategory {
  name: string;
  items: ParsedItem[];
}

const PRICE_PATTERN = /(\d+[.,]\d{1,2}|\d+)\s*€?\s*$/;

function extractPrice(line: string): { rest: string; price: number } | null {
  const match = line.match(PRICE_PATTERN);
  if (!match) return null;

  const price = Number.parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(price) || price <= 0 || price > 999) return null;

  const rest = line
    .slice(0, match.index)
    .trim()
    .replace(/[.\-–—]+$/, "")
    .trim();
  if (!rest) return null;

  return { rest, price };
}

function looksLikeCategoryHeader(line: string): boolean {
  if (line.length === 0 || line.length > 40) return false;
  if (/[.!?]$/.test(line)) return false; // phrase : probablement une description

  const letters = line.replace(/[^a-zàâäéèêëïîôöùûüç]/gi, "");
  if (letters.length === 0) return false;

  const upperCount = line.match(/[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/g)?.length ?? 0;
  const upperRatio = upperCount / letters.length;

  return upperRatio > 0.6 || line.split(/\s+/).length <= 4;
}

/**
 * Parseur heuristique (pas d'IA) : convertit du texte brut — copié d'un PDF ou
 * recopié à la main depuis une photo de carte — en catégories/plats/prix.
 *
 * Règles : une ligne se terminant par un prix est un plat ; une ligne courte
 * sans prix est une catégorie ; une ligne sans prix qui suit un plat en
 * complète la description. Résultat nécessairement approximatif — toujours
 * présenté en relecture/édition avant enregistrement (voir MenuImportReview).
 */
export function parseMenuText(text: string): ParsedCategory[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const categories: ParsedCategory[] = [];
  let current: ParsedCategory | null = null;

  for (const line of lines) {
    const priced = extractPrice(line);

    if (priced) {
      const [name, ...descParts] = priced.rest.split(/\s+[-–—:]\s+/);
      const description = descParts.length > 0 ? descParts.join(" - ") : null;

      if (!current) {
        current = { name: "Carte", items: [] };
        categories.push(current);
      }
      current.items.push({ name: name.trim(), description, price: priced.price });
      continue;
    }

    if (looksLikeCategoryHeader(line)) {
      current = { name: line, items: [] };
      categories.push(current);
      continue;
    }

    // Ligne sans prix : probablement la suite de la description du dernier plat.
    if (current && current.items.length > 0) {
      const last = current.items[current.items.length - 1];
      last.description = last.description ? `${last.description} ${line}` : line;
    }
  }

  return categories.filter((c) => c.items.length > 0);
}
