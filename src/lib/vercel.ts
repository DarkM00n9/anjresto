import "server-only";

const VERCEL_API = "https://api.vercel.com";

export interface AddDomainResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Ajoute un domaine personnalisé au projet Vercel, si VERCEL_TOKEN et
 * VERCEL_PROJECT_ID sont configurés. Sans ça, ne fait rien (les instructions DNS
 * manuelles restent affichées dans tous les cas — voir CustomDomainForm).
 */
export async function addDomainToVercel(domain: string): Promise<AddDomainResult> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return { success: true, skipped: true };
  }

  const teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";

  try {
    const res = await fetch(`${VERCEL_API}/v10/projects/${projectId}/domains${teamQuery}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: domain }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      // Déjà ajouté : pas une vraie erreur pour l'utilisateur.
      if (body?.error?.code === "domain_already_in_use") {
        return { success: true };
      }
      return { success: false, error: body?.error?.message ?? `Erreur Vercel (${res.status})` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Impossible de contacter l'API Vercel." };
  }
}
