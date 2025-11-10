# Guardian_V1 — Documentation & guide GitLab

## 1. Aperçu
Guardian_V1 est un monorepo qui regroupe :
- une landing marketing Next.js (port 3000)
- l’application principale Next.js (port 8080)
- une API NestJS + Prisma (port 3001) connectée à Postgres
- une base Postgres orchestrée via Docker Compose

Le script `./docker` encapsule `docker compose` pour construire et lancer l’ensemble en une seule commande.

## 2. Architecture du repo

| Dossier / fichier | Rôle | Scripts clés |
| --- | --- | --- |
| `backend/` | API NestJS + Prisma | `npm run start:dev`, `npm run build`, `npm run test`, `npm run prisma:migrate` |
| `frontend/` | App Next.js (dashboard) | `npm run dev`, `npm run build`, `npm run lint` |
| `landing/` | Landing Next.js | `npm run dev`, `npm run build` |
| `docker-compose.yml` | Définit Postgres + backend + frontend + landing | `./docker up -d`, `./docker down` |
| `docker` | Helper bash pour piloter Docker Compose | `./docker`, `./docker logs -f backend` |
| `.env` (racine) | Variables backend partagées et utilisées par Docker | |
| `frontend/.env.local` | Variables exposées au Next App Router | |
| `landing/.env` | Variables landing (newsletter Brevo) | |

## 3. Pile technique
- Node.js 20 (backend & frontend), Node.js 18+ (landing)
- Next.js 14 (frontend) & 15 (landing)
- NestJS 10 + Prisma 5
- Postgres 15
- Docker / Docker Compose
- Stripe, Supabase, Brevo, Yousign, Google Custom Search

## 4. Prérequis machine
1. Docker Desktop + extension Docker Compose
2. Node.js 20.x + npm 10.x
3. Accès aux secrets (Supabase, Stripe, etc.)

## 5. Variables d’environnement

### 5.1 Racine (`./.env` — injecté dans `docker-compose.yml`)
| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Chaîne de connexion Postgres pour Prisma |
| `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Accès Supabase (anon + service) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Clés serveurs Stripe |
| `BREVO_API_KEY` | API Brevo (emailing) |
| `YOUSIGN_API_KEY` | Signature électronique |
| `GOOGLE_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID` | Google Programmable Search |
| `JWT_SECRET` | Secret JWT backend |

### 5.2 Frontend (`frontend/.env.local`)
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY` | Clés Supabase exposées côté client |
| `NEXT_PUBLIC_API_URL` | URL publique de l’API (par défaut `http://localhost:3001`) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Clé Stripe publishable |
| `BREVO_API_KEY` | Requis pour l’API `/api/subscribe` côté app |

### 5.3 Landing (`landing/.env`)
| Variable | Description |
| --- | --- |
| `BREVO_API_KEY` | Envoi des emails via l’API route Next |

> **Astuce Docker** : le service `frontend` reçoit automatiquement `INTERNAL_API_URL=http://backend:3001` via `docker-compose.yml`. Les appels server-side utilisent cette URL interne alors que le navigateur reste sur `NEXT_PUBLIC_API_URL`.

## 6. Mise en place locale
```bash
git clone <repo>
cd Guardian_V1
cp backend/.env.example .env          # ou remplissez à la main
cp frontend/.env.local.example frontend/.env.local  # si vous en maintenez un
```

### 6.1 Lancement complet avec Docker
```bash
cd Guardian_V1
./docker             # build + up
# ou
./docker up -d       # mode détaché une fois les images construites
```

Services exposés :
- Landing : http://localhost:3000
- Frontend : http://localhost:8080
- API + Swagger éventuel : http://localhost:3001
- Postgres : localhost:5432 (utilisateur `guardian` / mot de passe `guardian`)

Logs et arrêt :
```bash
./docker logs -f backend
./docker down          # stop & remove
./docker down -v       # stop + volumes
```

### 6.2 Développement sans Docker
Lancer les applis Next manuellement (hot-reload) :
```bash
cd landing   && npm install && npm run dev
cd frontend && npm install && npm run dev
```
API NestJS :
```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```
Postgres peut être lancé via Docker uniquement (`./docker up postgres postgres-data`).

## 7. Backend (NestJS + Prisma)
- **Migrations** : `npm run prisma:migrate` (dev) / `npm run prisma:deploy` (prod/Docker)
- **Tests** : `npm run test` (Jest)
- **Lint** : `npm run lint`
- **Build** : `npm run build` (et `node dist/main.js`)
- **Dockerfile** : multi-stage avec `npm ci`, build, `npx prisma generate`

## 8. Frontend (Next.js)
- Port dev : 8080 (`npm run dev`)
- Build prod : `npm run build` puis `npm run start`
- Lint : `npm run lint`
- Les appels API passent par `lib/env.ts` → `getApiBaseUrl()`

## 9. Landing (Next.js)
- Port dev : 3000 (`npm run dev`)
- Déploiement GitLab Pages prêt via `landing/.gitlab-ci.yml`
- Variables requises : `BREVO_API_KEY`

## 10. Observabilité & troubleshooting
- `docker compose ps` pour vérifier les services
- `docker compose logs <service>`
- `docker exec -it guardian_v1-postgres psql -U guardian` pour accéder à la base
- Les migrations Prisma sont lancées automatiquement via la commande du service backend (`npx prisma migrate deploy && node dist/main.js`)

## 11. GitLab CI/CD

### 11.1 Variables CI/CD à déclarer
Dans **Settings > CI/CD > Variables** :

| Nom | Scope suggéré | Description |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Protected, Masked | Secrets backend |
| `DATABASE_URL` | Protected, Masked | Connexion Postgres (hébergée ou managée) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Protected | Stripe |
| `BREVO_API_KEY` | All envs | Utilisé par backend, frontend et landing |
| `YOUSIGN_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`, `JWT_SECRET` | Protected | Services tiers |
| `NEXT_PUBLIC_API_URL` | All envs | URL publique backend (prod/staging) |
| `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` | Protected | Si vous pushez des images Docker |

Ajoutez des variables spécifiques par environnement (`PROD_*`, `STAGING_*`) si nécessaire et marquez-les *protected* pour limiter l’accès.

### 11.2 Pipeline type `.gitlab-ci.yml`
Ce squelette peut être placé à la racine si vous souhaitez orchestrer l’ensemble depuis GitLab CI :

```yaml
stages:
  - install
  - test
  - build

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
  policy: pull-push

.node_job:
  image: node:20-bullseye
  before_script:
    - corepack enable

backend:test:
  stage: test
  extends: .node_job
  script:
    - cd backend
    - npm ci
    - npm run lint
    - npm run test

frontend:build:
  stage: build
  extends: .node_job
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npm run build
  artifacts:
    paths:
      - frontend/.next
      - frontend/package.json
      - frontend/package-lock.json

landing:pages:
  stage: build
  image: node:22.14.0
  script:
    - cd landing
    - npm ci
    - npm run build
  artifacts:
    paths:
      - landing/out
  only:
    - main
```

Adaptez les stages pour builder/pusher des images Docker :

```yaml
backend:image:
  stage: build
  image: docker:25.0.3
  services:
    - docker:25.0.3-dind
  variables:
    DOCKER_DRIVER: overlay2
  script:
    - docker build -t "$CI_REGISTRY_IMAGE/backend:${CI_COMMIT_SHORT_SHA}" backend
    - docker push "$CI_REGISTRY_IMAGE/backend:${CI_COMMIT_SHORT_SHA}"
```

### 11.3 GitLab Pages (landing)
Le fichier `landing/.gitlab-ci.yml` déclenche déjà un job `create-pages` qui :
1. installe les dépendances (`npm ci`)
2. exécute `npm run build`
3. publie le dossier `landing/out` via Pages (uniquement sur la branche par défaut)

Si vous externalisez la landing dans un projet GitLab dédié, copiez ce fichier à la racine et adaptez les règles.

## 12. Checklist avant merge / release
- [ ] Tests backend (`npm run test`)
- [ ] Lint backend & frontend (`npm run lint`)
- [ ] `npm run build` frontend
- [ ] `npm run build` landing si modifiée
- [ ] `docker compose up --build` passe sans erreur
- [ ] Variables CI/CD mises à jour sur GitLab
- [ ] Migrations Prisma versionnées (`prisma/migrations`)

---
Pour toute contribution, ouvrez une MR GitLab en mentionnant la checklist ci-dessus et ajoutez des logs `./docker logs` en cas de bug lié aux conteneurs.
