# Déploiement (Vercel) et mise en ligne

## 1. Avant de déployer

1. **Supabase** : exécuter dans le SQL Editor, dans l'ordre, toutes les migrations de `supabase/migrations/` (0001 → 0015) qui n'ont pas encore été lancées.
2. **Supabase > Authentication > URL Configuration** :
   - *Site URL* : l'URL de production (ex. `https://app.anjagency.fr`).
   - *Redirect URLs* : ajouter `https://*.anjagency.fr/**` (sous-domaines des restaurants) et chaque domaine personnalisé client.
3. **Resend** : créer un compte, vérifier le domaine d'envoi (enregistrements DNS SPF/DKIM), créer une clé API.
4. Code poussé sur GitHub (`git push`).

## 2. Vercel

1. vercel.com > *Add New Project* > importer le dépôt GitHub. Framework : Next.js (détecté seul).
2. *Settings > Environment Variables* (Production) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API (secrète) |
| `RESEND_API_KEY` | clé Resend |
| `RESEND_FROM_EMAIL` | ex. `Mon Resto <reservations@anjagency.fr>` (domaine vérifié) |
| `CRON_SECRET` | longue chaîne aléatoire (protège `/api/cron/*`) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | ex. `anjagency.fr` |
| `ANTHROPIC_API_KEY` | facultatif : traduction auto en anglais |
| `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | facultatif : ajout automatique des domaines clients |

3. *Deploy*. Les tâches planifiées (`vercel.json`) envoient les rappels (17 h) et purgent les anciennes réservations (3 h).

## 3. Domaines

- **Sous-domaines** `{slug}.anjagency.fr` : dans Vercel > *Domains*, ajouter `anjagency.fr` et `*.anjagency.fr` (wildcard). Chez le registrar : enregistrement `CNAME * → cname.vercel-dns.com` (ou nameservers Vercel).
- **Domaine propre d'un client** : saisi dans `/superadmin/{restaurant}` > Domaine personnalisé. DNS côté client : `CNAME` vers `cname.vercel-dns.com` (sous-domaine) ou `A 76.76.21.21` (domaine racine).

## 4. Après la mise en ligne

1. Créer le superadmin : `npm run create-superadmin -- ton@email.fr` (avec les variables de prod dans `.env.local`).
2. Passer un restaurant de **Démo** à **Actif** dans `/superadmin` : seuls les sites *Actifs* sont indexés (les démos sont en `noindex` et exclues du sitemap).
3. **Google Search Console** : ajouter chaque domaine de restaurant, soumettre `https://domaine/sitemap.xml`.
4. **Fiche Google Business Profile** du restaurant : y mettre l'URL du site et du lien de réservation ; renseigner la note et le lien des avis dans Admin > Infos.

## 5. SEO déjà en place

- Titre, description, URL canonique, Open Graph et Twitter par page.
- Données structurées schema.org : `Restaurant` (adresse, horaires, note Google, réservation) et `Menu`.
- `sitemap.xml` et `robots.txt` par restaurant ; zones privées (`/admin`, `/superadmin`, `/resa`, `/annulation`) en `noindex`.
- Attribut `lang` de la page selon la langue choisie.
