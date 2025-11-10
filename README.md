# Guardian_V1

Monorepo regroupant la landing page, le frontend applicatif et le backend Guardian avec une base Postgres démarrable via Docker.

## Structure
- `landing/` : site marketing Next.js. Le bouton CTA redirige vers l'app (frontend).
- `frontend/` : application Next.js principale.
- `backend/` : API NestJS + Prisma.
- `docker-compose.yml` : orchestre Postgres, le backend, le frontend et la landing.
- `docker` : script helper (`./docker` ou `./docker up -d`) pour piloter Docker Compose en une commande.

## Prérequis
- Docker + Docker Compose plugin.
- Node.js 20+ et npm pour lancer `landing` & `frontend` localement (si nécessaire).

## Configuration
1. Créez un `.env` à la racine (ou copiez votre template interne) et renseignez les clés backend (Supabase, Stripe, Brevo, Google…).
2. Renseignez `frontend/.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc.) : ce fichier est lu lors du `docker compose build` et injecté dans l'app Next. Conservez `NEXT_PUBLIC_API_URL=http://localhost:3001` pour que le navigateur pointe vers l'API exposée ; Docker injecte automatiquement `INTERNAL_API_URL=http://backend:3001` pour les appels server-side.
3. Renseignez `landing/.env` (au minimum `BREVO_API_KEY`) pour que l'API de newsletter puisse fonctionner.

## Tout lancer en une ligne
```bash
cd Guardian_V1 && ./docker
```
La première exécution construira les images puis lancera Postgres, le backend (avec `prisma migrate deploy`), le frontend (port 8080) et la landing (port 3000).  
Ensuite, vous pouvez relancer en mode détaché via `./docker up -d`.

## Lancer les interfaces web sans Docker (optionnel)
Si vous préférez travailler hors Docker pour le hot-reload, vous pouvez toujours lancer chaque app Next.js dans un terminal dédié :

```bash
cd Guardian_V1/landing
npm install
npm run dev

cd Guardian_V1/frontend
npm install
npm run dev
```

La landing reste accessible sur http://localhost:3000 et le bouton "Join Beta" continue de pointer vers le frontend (http://localhost:8080 par défaut). Vérifiez que `NEXT_PUBLIC_API_URL` pointe bien vers `http://localhost:3001`.

## Gestion Docker
- Voir les logs : `./docker logs -f <service>` (ex. `backend`, `frontend`, `landing`)
- Arrêter : `./docker down`
- Nettoyer les volumes : `./docker down -v`
# Guardian
