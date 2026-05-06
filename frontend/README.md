# Arteo Frontend

Single-server React interface for `arteosocial.com`.

## Structure

- `src/` - application source.
- `src/app/` - application bootstrap, providers, routes, i18n, and global styles.
- `src/features/` - user-facing feature modules.
- `src/entities/` - domain models and entity UI.
- `src/shared/` - reusable API, config, library helpers, and UI primitives.
- `src/widgets/` - larger layout and composition blocks.
- `src/services/` - legacy service clients kept during incremental migration.
- `public/locales/` - translation files.

## Development

```bash
npm install
npm start
```

## Production Build

```bash
npm run build
```

## Quality Checks

```bash
npm run check
```

## Notes

- The app points to `https://arteosocial.com/api` by default in production.
- Local development points to `http://localhost:5000/api` unless `REACT_APP_API_URL` is set.
- Generated build output and dependency folders are not part of the clean source tree.
