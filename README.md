# ANJ Agency — Plateforme SaaS Restaurants

Une seule codebase Next.js multi-tenant pour tous les sites restaurants vendus par ANJ Agency.

## Stack

Next.js (App Router, TS strict) · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage) · Zod

## Phase 1 — ce qui est fait

- Projet Next.js scaffoldé, Tailwind v4, TypeScript strict.
- Schéma Supabase complet (`supabase/migrations/`) : restaurants, profiles, categories,
  menu_items, opening_hours, reservations, RLS stricte (public / owner / superadmin),
  bucket de stockage `restaurant-media`.
- Résolution multi-tenant via `src/proxy.ts` (sous-domaine, domaine personnalisé, ou
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

## Phase 2 — ce qui est fait

- Authentification par magic link (`/admin/login`, pas de mot de passe) : `src/proxy.ts`
  rafraîchit la session Supabase sur chaque requête ; `/admin/(protected)` vérifie la
  session et l'appartenance au restaurant courant.
- Tableau de bord `/admin` : réservations du jour/demain, raccourcis vers carte / menu
  du jour / horaires.
- **Ma carte** (`/admin/carte`) : catégories et plats en CRUD, glisser-déposer tactile
  (`@dnd-kit`) pour réordonner catégories et plats (chacun dans sa catégorie), bouton
  "Épuisé" en un tap, duplication de plat, upload photo avec compression côté client
  (~300 Ko, `browser-image-compression`) directement vers Supabase Storage.
- **Menu du jour** (`/admin/menu-du-jour`) : formule entrée/plat/dessert à prix fixe,
  expire automatiquement (n'est affichée que le jour `valid_date`).
- **Horaires** (`/admin/horaires`) : jusqu'à 2 services par jour, jours fermés,
  fermetures exceptionnelles avec message affiché sur le site public (surcharge le
  badge "ouvert maintenant").
- **Infos du resto** (`/admin/infos`) : textes, logo, couverture, galerie "À propos",
  contact, réseaux sociaux.
- **QR code** (`/admin/qr-code`) : génération PNG et PDF chevalet A6 (logo + nom +
  QR) via `qrcode` et `pdf-lib`, pointant toujours vers l'URL de prod (jamais `/r/{slug}`).
- Nouvelles tables : `daily_menus`, `closures` (`supabase/migrations/0004`, `0005`).
- Toutes les actions (`src/app/admin/actions/`) revalident immédiatement le site
  public — déjà garanti de toute façon car ses pages sont 100 % dynamiques.

### Créer un compte restaurateur de test

```bash
npm run create-owner -- <email> <slug-du-resto>
```

Relie (ou crée) un compte Supabase Auth à ce restaurant en tant que `owner`, pour
pouvoir se connecter sur `/admin/login`. En attendant l'espace `/superadmin`
(Phase 3), c'est la seule façon de provisionner un accès restaurateur.

## Installation

```bash
npm install
cp .env.example .env.local
```

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, récupère l'URL du projet, la clé `anon` et la clé
   `service_role`, et renseigne-les dans `.env.local`.
3. Dans l'éditeur SQL Supabase, exécute **dans l'ordre** tous les fichiers de
   `supabase/migrations/` (`0001` à `0005`).
4. Génère le restaurant de démo :

```bash
npm run seed
```

5. Crée ton accès restaurateur de test :

```bash
npm run create-owner -- ton@email.fr chez-marius
```

6. Lance le serveur de dev :

```bash
npm run dev
```

7. Site public : [http://localhost:3000/r/chez-marius](http://localhost:3000/r/chez-marius)
   (le préfixe `/r/{slug}` n'est utilisé qu'en local ; en production, chaque resto est
   servi sur son propre sous-domaine ou domaine personnalisé).
   Espace restaurateur : [http://localhost:3000/r/chez-marius/admin/login](http://localhost:3000/r/chez-marius/admin/login)
   — connecte-toi avec l'email utilisé à l'étape 5, tu recevras un lien magique.

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
