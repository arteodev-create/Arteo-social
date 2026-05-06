# Arteo Backend

Single-server API for arteosocial.com.

## Structure

- `src/` - application source code.
- `src/modules/` - business domains such as identity, posts, feed, admin, plugins, search, and civic.
- `src/infra/` - infrastructure services such as cache, logging, security, storage, socket, and health.
- `src/middleware/` - Express middleware.
- `src/config/` - environment and runtime configuration.
- `prisma/` - Prisma schema and the main database seed.
- `libs/recode-plugin/` - local ReCode runtime used by algorithm features.

## Development

```bash
npm install
npx prisma generate
npm run dev
```

## Production

```bash
npm install --omit=dev
npx prisma generate
npm start
```

## Notes

- The backend is configured as one primary server for `arteosocial.com`.
- Old multi-server deployment tooling and provider-specific database config have been removed from the source tree.
- Database connectivity is Supabase-first (`SUPABASE_DB_URL`) with `DATABASE_URL` kept only as backward compatibility for legacy scripts.
- Localhost values that remain are only for development CORS, IP fallback, or local Redis examples.
