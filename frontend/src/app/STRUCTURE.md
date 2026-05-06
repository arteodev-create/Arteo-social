# Frontend Structure

This frontend is being migrated toward a feature-sliced layout.

## Current Stable Layers

- `app/` - router, route shells, global styles, i18n, top-level app wiring.
- `app/pages/` - route screens. These compose features and widgets, not reusable business logic.
- `services/` - the final legacy root still present; keep it stable for now and split it into domain API facades gradually.
- `features/` - new home for product flows such as auth, post, profile, search, admin.
- `entities/` - shared product entities such as user, post, algorithm.
- `shared/` - reusable UI, API client wrappers, config, and general utilities.
- `widgets/` - large reusable page sections such as feed column, sidebar, profile header.

## Migration Rule

Do not move every file at once. Move one feature folder at a time and run `npm run check` after each slice.

## Import Convention (Required)

- Use aliases instead of deep relative imports.
- Allowed examples: `@features/auth`, `@entities/user`, `@shared/ui`, `@widgets/layout/MainLayout`.
- Avoid patterns like `../../../shared/...` or retired aliases such as `@components`, `@hooks`, `@utils`, and `@pages` for new code.

## Large-Scale Governance

1. Every new business flow must live in `features/<feature-name>`.
2. Shared business objects must live in `entities/<entity-name>`.
3. Reusable base components and helpers must move to `shared/*`.
4. `app/pages/*` only compose widgets/features; avoid placing heavy business logic directly in route shells.
5. Legacy `services/*` should be migrated slice by slice when practical; `components`, `hooks`, `utils`, `types`, and `stores` roots have already been retired.

## Modal Architecture (Scale Standard)

1. All modal payload contracts must be declared in `registry/modalTypes.ts`.
2. Modal registration must happen only in `registry/ModalRegistry.ts`.
3. Runtime modal state and APIs must go through `contexts/ModalContext.tsx`.
4. Open modals via `openModal(MODAL_IDS.X, payload)` and avoid direct component-level mounting.

## Access Control Standard

1. Role and capability mapping must be centralized in `entities/session/model/accessControl.ts`.
2. UI gating should use `features/access-control/ui/CapabilityGuard.tsx`.
3. Avoid inline role checks spread across pages/components for new code.

## Next Slices

1. Split generic `services/*` into domain API facades.
2. Tighten architecture rules after service/domain ownership is clean.
3. Add bundle-budget checks after service/domain splitting is stable.
