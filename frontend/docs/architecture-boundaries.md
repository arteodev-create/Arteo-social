# Architecture Boundaries

Arteo frontend follows a one-way dependency model:

- `shared`: product-agnostic UI, lib, and temporary API facades only.
- `entities`: business entities and entity UI; can depend on `shared`.
- `features`: user-facing product capabilities; can depend on `entities` and `shared`.
- `widgets`: composition blocks such as layout; can depend on `features`, `entities`, and `shared`.
- `app`: route shells, providers, and top-level composition.

## Import Rules

- Do not import retired aliases: `@components`, `@hooks`, `@utils`, `@pages`, `@types`, or `@stores`.
- Do not import from retired generic type paths such as `types/auth`, `types/post`, or `types/poll`; use domain facades such as `@entities/user/model`, `@entities/session/model`, `@entities/post/model`, and `@shared/api`.
- Auth/session state should come from `@entities/session/model`, not from a root store folder.
- Do not import upward into composition layers.
- Prefer public facades such as `@features/post`, `@entities/session/model`, `@shared/ui`, and `@shared/lib`.
- Keep route chrome in `app`, not inside feature pages.
- Keep reusable primitives in `shared`, not inside feature folders.

## Local Check

Run this before large refactors:

```bash
npm run check:architecture
```

The checker currently runs with no architecture exceptions. If a future migration needs a temporary exception, keep it named, file-scoped, and remove it in the same domain slice.
