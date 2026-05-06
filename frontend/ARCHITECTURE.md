# Frontend Architecture (Scale-Ready)

## 1. Layering Rule
- `app`: app bootstrap, providers, routes, global policies.
- `pages`: page composition only, no direct networking logic.
- `widgets`: large UI blocks that compose multiple features/entities.
- `features`: user actions/use-cases (follow, create-post, report, etc.).
- `entities`: business objects and core domain model (user, post, verification, session).
- `shared`: reusable infrastructure (api, config, lib, ui).

Dependency direction:
`app -> pages -> widgets -> features -> entities -> shared`

## 2. Folder Standards

### `src/shared`
- `shared/api`: base client and cross-domain transport helpers.
- `shared/config`: environment and runtime configuration.
- `shared/lib`: framework-agnostic helpers/constants.
- `shared/ui`: primitive UI components.

### `src/features/*`
- `api/`: feature API facade (calls service/client).
- `model/`: feature-specific state, hooks, selectors.
- `ui/`: feature UI pieces.
- `index.ts`: public exports only.

### `src/entities/*`
- `model/`: entity types and pure business rules.
- `ui/`: entity UI representation.
- `index.ts`: public exports.

## 3. API Migration Policy
- Existing `src/services/*` remains valid during migration.
- New code must prefer `src/features/*/api` or `src/shared/api`.
- Each feature API is a stable facade; internals can later move from services to direct client modules without touching consumers.

## 4. Import Conventions
- Prefer aliases: `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`.
- Avoid long relative imports like `../../../` for cross-domain imports.
- Keep imports from upper layers forbidden (e.g. `entities` must not import `features`).

## 5. State & Data Fetching
- React Query keys should be centralized in `shared/lib/queryKeys.ts`.
- Invalidation must use stable keys from shared constants.
- Avoid ad-hoc inline keys in many places for the same resource.

## 6. UI/Text Quality
- User-facing text should come from i18n keys first.
- Fallback strings must be UTF-8 clean (no mojibake).
- Keep accessibility minimum: `alt`, `aria-*`, semantic button/input usage.

## 7. Incremental Rollout Checklist
1. New feature: create `features/<name>/{api,model,ui,index.ts}`.
2. Move shared utility to `shared/lib` when reused by 2+ domains.
3. Move domain type/rules to `entities/<entity>/model`.
4. Replace direct `services/*` imports from UI with feature API facade.
5. Keep each PR migration-safe and build-green.
