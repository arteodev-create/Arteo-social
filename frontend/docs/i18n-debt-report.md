# I18n And Text Debt Report

Last checked after full mojibake cleanup, page-domain migration, route-shell split, feature lint tightening, legacy component/hook/utility root removal, route-level lazy loading, architecture boundary checks, production build, and browser QA.

## Current Policy

Arteo frontend is English-only.

- Runtime language is fixed to `en`.
- `public/locales/en/translation.json` is the only locale file.
- Language switching UI and browser language detection have been removed.
- New visible text must be English.

## QA Scope Completed

Checked and cleaned the main app surfaces requested:

- Login and register flow
- Home/profile/admin route guards
- Core post creation, post card, comments, media gallery, media lightbox, reaction/timer UI
- Search discovery widgets and suggested accounts
- Cloudflare verification gate and renewal notice modal
- Core SEO metadata, `public/index.html`, and not-found copy
- Algorithm domain: list, detail, studio, library, and context/model ownership
- Plugin domain: list, studio, public exports, and English-only Studio UI
- Route-page batch: documentation, location, locations, not-found, privacy, and terms metadata/copy
- Hot-event domain: list/detail pages moved under `src/features/hot-event` and routed behind auth
- Shared UI, hooks, admin/auth/post comments, services, stores, and utils mojibake cleanup
- Page-domain migration: feed home content moved to `src/features/feed`, post detail content moved to `src/features/post`, route shells for `/home`, `/search`, `/profile`, `/:username`, `/hot-events`, `/hot-events/:query`, and post detail moved to `src/app/pages`, public pages moved to `src/app/pages`, and stale `@pages` alias removed
- Layout widget migration: layout/sidebar composition moved to `src/widgets/layout`; legacy `src/components/layout` shims removed
- Profile route-shell split: `src/app/pages/ProfilePage.tsx` now owns `MainLayout` and `PageHeader`; `src/features/profile` exports content and passes header metadata through `renderHeader`
- Algorithm/plugin route-shell split: app page wrappers now own `MainLayout`, list headers, and static page titles for algorithm/plugin surfaces; feature files no longer import `@widgets/layout`
- Shared utility cleanup: `cn` moved from `src/utils/cn.ts` to `src/shared/lib/cn.ts`; legacy `@utils/cn` and relative `utils/cn` imports removed
- Shared UI facade cleanup: feature imports of legacy `@components/ui` and relative `components/ui` paths were replaced with `@shared/ui`
- Shared component cleanup: feature imports of legacy `components/shared`, `components/studio`, and `@components/*` paths were removed; `ContentEditor` moved into the post feature
- Hook and utility cleanup: feature imports of legacy `@hooks`, relative `hooks`, `@utils`, and relative `utils` paths were removed; session hooks are exposed through `@entities/session/model`, profile query hooks through `@features/profile/model`, post interaction hooks through `@features/post/model`, and generic utilities through `@shared/lib`
- App/widget/entity cleanup: legacy `@components`, `@hooks`, `@utils`, and `@pages` imports were removed from app, widgets, entities, and features; ESLint now blocks those legacy aliases across the migrated layers
- Shared UI physical migration batch 1: `Button`, `Input`, `LoadingSpinner`, `Logo`, `SEO`, `SkeletonLoader`, `Tabs`, and `Text` moved from `src/components/ui` into `src/shared/ui`
- Shared UI physical migration batch 2: `AddThreadIcon`, `Avatar`, `BackToTop`, `ConfirmModal`, `DropdownMenu`, `EmptyState`, `FeedEndState`, `Icons`, `RelativeTime`, `SplashScreen`, and `Tooltip` moved from `src/components/ui` into `src/shared/ui`
- Shared UI physical migration batch 3: remaining UI files moved from `src/components/ui` into `src/shared/ui`; `src/components/ui/index.ts` is now only a compatibility re-export to `@shared/ui`
- Shared component physical migration: `src/components/shared` was removed; shared modal, design-system, lightbox, location picker, and global modal components now live in `src/shared/ui`
- Legacy component root removal: unused `src/components/security`, `src/components/settings`, `src/components/studio`, `src/components/modals`, and the final `src/components/ui` compatibility shim were removed; `src/components` no longer exists
- Legacy hook and utility root removal: unused `src/hooks` files were removed; active `transformer`, `gridentEncoder`, and `palettes` utilities moved into `src/shared/lib`; stale `src/utils` files were removed
- Route-level lazy loading: non-auth route pages are loaded with `React.lazy` and `Suspense`; auth entry screens stay eager for fast first paint
- Architecture boundary checks: added `npm run check:architecture` and `docs/architecture-boundaries.md`; `npm run check` now runs architecture validation before production build
- Shared API infrastructure cleanup: moved the real HTTP client to `src/shared/api/httpClient.ts`, moved temporary shared API facades into their owning user/post domains, and removed all architecture checker exceptions
- Type-domain cleanup: moved `User` to `@entities/user/model`, auth/session state types to `@entities/session/model`, post/poll types to `@entities/post/model`, and `ApiResponse` to `@shared/api`; removed `src/types` and the `@types` alias
- Store-domain cleanup: moved the auth store into `@entities/session/model`, removed unused settings/theme stores, removed `src/stores`, and retired the `@stores` alias

## Automated QA Results

- `npm run build`: passing.
- `npm run check:architecture`: passing.
- `npm run check`: passing with architecture validation and production build.
- Route lazy build result: main JS gzip dropped from about `502.64 kB` to `311.02 kB`, with route pages split into async chunks.
- Feature boundary scan: `src/features` has `0` imports of `@widgets/layout`, `MainLayout`, or `PageHeader`.
- Legacy utility scan: `@utils/cn` and relative `utils/cn` imports are `0`.
- Legacy UI primitive scan: feature imports of `@components/ui` and relative `components/ui` paths are `0`.
- Legacy component scan: feature imports of `@components/*` and relative `components/*` paths are `0`.
- Legacy hook/utility scan: feature imports of `@hooks`, relative `hooks`, `@utils`, and relative `utils` paths are `0`.
- Full migrated-layer legacy alias scan: imports of `@components`, `@hooks`, `@utils`, and `@pages` are `0`.
- Shared UI batch 1 build check: moved UI primitives compile from `src/shared/ui`, with legacy internal relative imports updated to `@shared/ui`.
- Shared UI batch 2 build check: moved UI primitives compile from `src/shared/ui`, with legacy compatibility exports preserved in `src/components/ui/index.ts`.
- Shared UI batch 3 build check: `src/components/ui` contains only compatibility `index.ts`; deep `components/ui/*` references are `0`.
- Shared component build check: deep `components/shared` references are `0`, and `src/components/shared` no longer exists.
- Legacy component root check: `@components` references are `0`, `@components` aliases were removed from `tsconfig.json` and `craco.config.js`, and `src/components` no longer exists.
- Legacy hook/utility root check: `@hooks`, `@utils`, relative legacy hook/utility imports are `0`; `@hooks` and `@utils` aliases were removed from `tsconfig.json` and `craco.config.js`; `src/hooks` and `src/utils` no longer exist.
- Legacy type root check: imports from `types/auth`, `types/post`, `types/poll`, and `@types/*` are `0`; `src/types` no longer exists.
- Legacy store root check: imports from `@stores` and relative `stores/*` paths are `0`; `src/stores` no longer exists.
- Static i18n key scan from previous batch: `missing_count=0`.
- Browser QA: `/flow/login`, `/flow/register`, and `/about` render in English with no mojibake.
- Browser QA: `/privacy` and `/terms` redirect to `/about` per current route config, with no mojibake.
- Browser QA: `/home`, `/profile`, `/admin`, and `/plugins` stay protected while unauthenticated and show English login UI with no mojibake.
- Browser QA: `/hot-events` and `/hot-events/test-event` redirect to `/flow/login` while unauthenticated, with no mojibake.
- Browser QA after full cleanup: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, `/admin`, and `/hot-events` show no mojibake.
- Browser QA after page-domain migration: login, register, about, protected home/profile/admin/hot-events, and post-detail guard routes render or redirect correctly.
- Browser QA after route-shell split: `/home`, `/search`, `/profile`, `/:username`, `/hot-events`, `/hot-events/:query`, and `/:username/status/:id` still redirect correctly while unauthenticated.
- Browser QA after profile shell split: `/profile`, `/:username`, `/home`, `/search`, and `/admin` redirect to `/flow/login` while unauthenticated and show English login UI with no mojibake.
- Browser QA after algorithm/plugin shell split: `/algorithms`, `/algorithms/test-id`, `/algorithms/studio`, `/plugins`, `/plugins/studio`, and `/plugins/store/test-id` preserve the existing `/home` redirect behavior and show no mojibake.
- Browser QA after legacy component root removal: `/flow/login` and `/flow/register` render, while `/home`, `/profile`, and `/admin` redirect to `/flow/login` unauthenticated; all checked routes show no mojibake.
- Browser QA after legacy hook/utility root removal: `/flow/login` and `/flow/register` render, while `/home`, `/profile`, and `/admin` redirect to `/flow/login` unauthenticated; all checked routes show no mojibake.
- Browser QA after route-level lazy loading: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, and `/admin` render or redirect correctly while unauthenticated; all checked routes show no mojibake.
- Browser QA after architecture boundary checks: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, and `/admin` render or redirect correctly while unauthenticated; all checked routes show no mojibake.
- Browser QA after shared API infrastructure cleanup: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, and `/admin` render or redirect correctly while unauthenticated; all checked routes show no mojibake.
- Browser QA after type-domain cleanup: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, and `/admin` render or redirect correctly while unauthenticated; all checked routes show no mojibake.
- Browser QA after store-domain cleanup: `/flow/login`, `/flow/register`, `/about`, `/home`, `/profile`, and `/admin` render or redirect correctly while unauthenticated; all checked routes show no mojibake.
- Algorithm domain mojibake scan: `0`.
- Plugin domain mojibake scan: `0`.
- Hot-event domain mojibake scan: `0`.
- Route-page mojibake scan: `0`.
- Full `src` mojibake scan: `0`.

## Architecture Migration Completed

Algorithm code was moved out of generic `pages` and `contexts` into the domain layer:

- `src/features/algorithm/api`
- `src/features/algorithm/model`
- `src/features/algorithm/pages`
- `src/features/algorithm/index.ts`

Plugin code was moved out of generic `pages` into the domain layer:

- `src/features/plugin/api`
- `src/features/plugin/pages`
- `src/features/plugin/index.ts`

Hot-event code was moved out of generic `pages` into the domain layer:

- `src/features/hot-event/pages`
- `src/features/hot-event/index.ts`

Feed and post route code now live in their owning domains:

- `src/features/feed/pages`
- `src/features/feed/index.ts`
- `src/features/post/pages`

Profile route chrome now lives in the app layer:

- `src/app/pages/ProfilePage.tsx`
- `src/features/profile/pages/Profile.tsx` receives route header rendering through `renderHeader`

Algorithm and plugin route chrome now lives in the app layer:

- `src/app/pages/AlgorithmsPage.tsx`
- `src/app/pages/AlgorithmDetailPage.tsx`
- `src/app/pages/AlgorithmStudioPage.tsx`
- `src/app/pages/PluginsPage.tsx`
- `src/app/pages/PluginStudioPage.tsx`

Public/static app pages now live under the app layer:

- `src/app/pages`

## Remaining Debt

No mojibake debt remains in `src` based on the current static scan. Migrated layers no longer import legacy widget, component, hook, utility, pages, type, or store aliases, and architecture checks now run with no exceptions. Legacy roots `src/components`, `src/hooks`, `src/utils`, `src/types`, and `src/stores` have been removed; shared UI, utilities, and HTTP infrastructure now live under `src/shared`.

The frontend is safe to continue feature work on: `npm run check` is passing, route QA is passing, and the remaining debt is isolated. The only large legacy root still present is `src/services`; it can be split gradually into domain API facades later without blocking current development.

## Next Cleanup Order

1. Continue splitting generic `src/services` into domain API facades when there is time
2. Tighten architecture rules further after service ownership is clean
3. Add lightweight bundle-budget checks so the main chunk does not quietly grow again
