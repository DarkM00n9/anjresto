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
(Phase 3 ci-dessous l'utilise encore, Phase 4), c'est la seule façon de
provisionner un accès restaurateur.

## Phase 3 — ce qui est fait

- Réservation en ligne sans commission (`/reservation`, lien "Réserver une table" du
  Hero) : créneaux calculés automatiquement depuis les horaires, les fermetures
  exceptionnelles et la capacité (`src/lib/reservations/availability.ts`), revalidés
  côté serveur à la soumission.
- Réglages par resto (`/admin/reservations/parametres`) : intervalle des créneaux
  (15/30 min), capacité max par créneau, taille max d'un groupe en ligne (au-delà :
  "appelez-nous"), délai minimum avant réservation, réservable jusqu'à X jours,
  confirmation automatique ou validation manuelle.
- Anti-spam : honeypot + rate limiting par IP (table dédiée, jamais exposée en RLS,
  accès uniquement via la clé `service_role` côté serveur).
- Emails (Resend) aux couleurs du resto : demande reçue / confirmée / refusée au
  client (avec lien d'annulation sécurisé par token), nouvelle réservation au resto
  avec boutons Accepter/Refuser (`/resa/{token}`, protégés par un token propre à la
  réservation, utilisables sans être connecté).
- **Admin** (`/admin/reservations`) : vue par jour avec navigation, compteur de
  couverts par service, "Marquer complet" pour fermer un service en un tap, accepter
  / refuser / annuler / marquer venu / absent, ajout manuel (réservation par
  téléphone).
- 2 routes cron Vercel (`vercel.json`, protégées par `CRON_SECRET`) : rappel la
  veille (`/api/cron/reminders`) et purge RGPD des réservations de plus de 12 mois
  (`/api/cron/purge-reservations`). Ne se déclenchent qu'une fois déployé sur Vercel
  — en local, s'appellent à la main avec l'en-tête `Authorization: Bearer $CRON_SECRET`.
- Nouvelles tables : `reservation_settings`, `blocked_services`,
  `reservation_rate_limits` (`supabase/migrations/0007` à `0009`) ; `reservations`
  étendue avec statuts `refused`/`seated`, tokens, source, consentement RGPD
  (`0006`).

## Installation

```bash
npm install
cp .env.example .env.local
```

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, récupère l'URL du projet, la clé `anon` et la clé
   `service_role`, et renseigne-les dans `.env.local`.
3. Dans l'éditeur SQL Supabase, exécute **dans l'ordre** tous les fichiers de
   `supabase/migrations/` (`0001` à `0009`).
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
| `RESEND_API_KEY` | Clé API Resend, pour l'envoi réel des emails de réservation |
| `RESEND_FROM_EMAIL` | Optionnel : adresse d'envoi une fois un domaine vérifié sur Resend (sinon `onboarding@resend.dev`, adresse de test) |
| `CRON_SECRET` | Protège les routes `/api/cron/*` (Vercel envoie `Authorization: Bearer $CRON_SECRET`) |

Sans `RESEND_API_KEY`, les emails ne sont pas envoyés mais tout le reste fonctionne
normalement (un avertissement est juste loggé côté serveur) — pratique pour tester
le flux de réservation sans compte Resend.

## Ajouter un nouveau restaurant

Pour l'instant (avant l'espace `/superadmin`, Phase 4), insérer une ligne dans la
table `restaurants` (slug unique) + ses `categories` / `menu_items` / `opening_hours`
suffit à faire apparaître son site — sans toucher au code.
