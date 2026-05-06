# Arteo Frontend Architecture

This frontend follows a domain-first structure inspired by Feature-Sliced Design. The goal is to keep product code scalable without turning every small component into ceremony.

## Layers

Use these layers from highest to lowest:

1. `app`

Application bootstrap, providers, routing, global configuration, and app-wide setup.

2. `app/pages`

Route-level screens that compose widgets and features. Pages should stay thin and avoid owning reusable business logic.

3. `widgets`

Large page sections that combine multiple features or entities, such as sidebars, feed shells, or dashboard panels.

4. `features`

User actions and business capabilities. Examples: `post`, `auth`, `profile`, `admin`, `search`.

5. `entities`

Reusable domain models and UI tied to a core object. Examples: `user`, `verification`, `session`.

6. `shared`

Cross-domain utilities, primitives, API clients, query keys, and small UI foundations with no product-specific ownership.

## Import Direction

Dependencies should point downward:

`app -> app/pages -> widgets -> features -> entities -> shared`

Rules:

- `entities` may depend only on `entities` and `shared`.
- `features` may depend on `features`, `entities`, and `shared`.
- `widgets` may depend on `widgets`, `features`, `entities`, and `shared`.
- `app/pages` may compose every lower layer.
- `shared` must not import from product layers.

## Naming

- Use kebab-case for folders: `create-post`, `access-control`.
- Use PascalCase for React components: `PostCard.tsx`, `UserHoverCard.tsx`.
- Use camelCase for hooks, services, and utilities: `useAuth.tsx`, `identity.service.ts`, `queryKeys.post.ts`.
- Prefer explicit public exports through `index.ts` at domain boundaries.

## Domain Folder Shape

Feature/entity folders should use this shape when they grow:

```text
feature-name/
  api/
  model/
  ui/
  lib/
  index.ts
```

Use only the folders that are useful. Small domains do not need empty folders.

## Internationalization

Arteo is currently English-only:

- Keep runtime language fixed to `en`.
- Keep all visible product text in English.
- Prefer `t('namespace.key')` for reusable UI text.
- Hardcoded text is acceptable for local-only admin scaffolding, but it must be English and free of mojibake.

## Layout Ownership

`src/widgets/layout` owns app-shell composition such as `MainLayout`, `PageHeader`, feed headers, sidebars, and help-center shells. New code should import layout composition from `@widgets/layout/*` from app/page or widget layers only. Feature modules should not import layout widgets; prefer thin app/page composition when a feature screen needs shell layout.

## Route Shell Split

Route shells such as `MainLayout`, `PageHeader`, SEO metadata, and route-specific guard composition should live in `src/app/pages` when practical. Feature content should be exported from `features/*` and app-level route wrappers should compose widgets around it.

When feature content needs route chrome data, prefer a render prop or a small app-layer adapter over importing layout widgets directly into the feature. Example: profile content exposes `renderHeader`, while `src/app/pages/ProfilePage.tsx` renders `PageHeader`.

## Migration Rule

Do not move broad folders in one pass. Migrate one domain at a time:

1. Pick a feature or entity.
2. Add or repair its public `index.ts`.
3. Replace deep imports with alias imports.
4. Build.
5. Only then move the next domain.

## Shared Utilities

Pure cross-cutting utilities belong in `src/shared/lib` and should be imported through `@shared/lib`. Do not add new imports from legacy `@utils/*`; move the utility into `shared/lib` first, then update callers in one small batch.

Feature modules should not import from legacy `@hooks/*` or relative `hooks/*` paths. Session-facing hooks should come from `@entities/session/model`; domain-specific hooks should live under the owning feature or entity `model` folder.

Do not add imports from legacy aliases `@components/*`, `@hooks/*`, `@utils/*`, or `@pages/*` in app, widget, entity, or feature code. Use public facades such as `@shared/ui`, `@shared/lib`, `@entities/session/model`, and owning domain `model` exports.

## Shared UI

Shared UI primitives should be imported through `@shared/ui` from feature code. Do not add new feature imports from retired `@components/ui` or deep relative `components/ui` paths.

Feature modules should not import from legacy `@components/*` or relative `components/*` paths. If the component is generic, expose it through `@shared/ui`; if it is domain-specific, move it into the owning feature or entity.
