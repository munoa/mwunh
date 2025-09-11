# Client Hub Miniatures

### Prérequis
- Node 20+

### Installation
```bash
pnpm i # ou npm i / yarn
echo "DATABASE_URL=\"file:./dev.db\"" > .env
pnpm prisma:push
pnpm dev
```

### Déploiement (Railway / Vercel + Railway)
- Créez une base **PostgreSQL** sur Railway ⇒ récupérez l’URL
- Sur Vercel, ajoutez la variable `DATABASE_URL` = URL Railway
- `pnpm prisma:push` en CI (ou `npx prisma migrate deploy` si vous ajoutez des migrations)

### Utilisation
1. Allez sur `/` (dashboard) → créez un projet
2. Collez vos images (une par ligne : `Titre | https://...`)
3. Récupérez le lien `/p/<token>` et envoyez-le au client
4. Les votes s’enregistrent en base (toggle like/dislike)

### Exports
- Ouvrez `npx prisma studio` pour voir/exporter les votes
- Ajoutez plus tard une route `/api/export/csv?token=...` si besoin
