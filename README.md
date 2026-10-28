# ANJ Agency — Plateforme SaaS Restaurants

Une seule codebase Next.js multi-tenant pour tous les sites restaurants vendus par ANJ Agency.

## Stack

Next.js (App Router, TS strict) · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage) · Zod

## Phase 1 — ce qui est fait

- Projet Next.js scaffoldé, Tailwind v4, TypeScript strict.
- Schéma Supabase complet (`supabase/migrations/`) : restaurants, profiles, categories,
  menu_items, opening_hours, reservations, RLS stricte (public / owner / superadmin),
  bucket de stockage `restaurant-media`.
- Résolution multi-tenant via `middleware.ts` (sous-domaine, domaine personnalisé, ou
  `/r/{slug}` en local).
- Site public complet d'un restaurant : Hero, À propos, aperçu de la carte, horaires
  (avec badge "ouvert maintenant"), carte Google Maps + itinéraire, contact, footer
  avec mentions légales / politique de confidentialité générées depuis la BDD.
- Page `/carte` optimisée QR code : onglets sticky par catégorie, badges régime
  (végé/végan/sans gluten/épicé/fait maison), les 14 allergènes réglementaires, plats
  épuisés grisés, bandeau "suggestion du chef".
- Thème par restaurant (couleurs, police parmi 6 Google Fonts, 3 styles de mise en
  page prédéfinis) stocké en BDD.
- SEO : metadata dynamiques, Open Graph, sitemap.xml, robots.txt, JSON-LD
  `Restaurant` + `Menu`.
- Script de seed : restaurant de démo "Chez Marius" (5 catégories, 25 plats, horaires).

## Installation

```bash
npm install
cp .env.example .env.local
```

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, récupère l'URL du projet, la clé `anon` et la clé
   `service_role`, et renseigne-les dans `.env.local`.
3. Dans l'éditeur SQL Supabase, exécute dans l'ordre les fichiers de
   `supabase/migrations/` (`0001_init.sql`, `0002_rls.sql`, `0003_storage.sql`).
4. Génère le restaurant de démo :

```bash
npm run seed
```

5. Lance le serveur de dev :

```bash
npm run dev
```

6. Ouvre [http://localhost:3000/r/chez-marius](http://localhost:3000/r/chez-marius)
   (le préfixe `/r/{slug}` n'est utilisé qu'en local ; en production, chaque resto est
   servi sur son propre sous-domaine ou domaine personnalisé).

## Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (RLS appliquée) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin, utilisée uniquement par `scripts/seed.ts` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Domaine racine de prod pour les sous-domaines `{slug}.ROOT_DOMAIN` |
| `RESEND_API_KEY` | Réservé aux phases suivantes (emails transactionnels) |

## Ajouter un nouveau restaurant

Pour l'instant (avant l'espace `/superadmin`, phase 3), insérer une ligne dans la
table `restaurants` (slug unique) + ses `categories` / `menu_items` / `opening_hours`
suffit à faire apparaître son site — sans toucher au code.
