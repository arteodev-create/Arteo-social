# Backend Structure

The backend is a modular monolith with a dedicated application layer.

## Current Layers

- `app/` - Express bootstrap and route registry.
- `config/` - environment, Prisma client, runtime config.
- `core/` - base repository, errors, low-level HTTP utilities.
- `infra/` - external infrastructure adapters: cache, email, logging, security, socket, storage, health.
- `middleware/` - Express middleware.
- `modules/` - product domains. Each module owns routes, controller, service, repository, and validation.
- `shared/` - cross-domain events/contracts.
- `utils/` - generic helpers and DTO transforms.

## Module Rule

A mature module should follow this pattern:

```text
modules/<domain>/
  <domain>.routes.js
  <domain>.controller.js
  <domain>.service.js
  <domain>.repository.js
  <domain>.validation.js
```

The old uppercase filenames still work, but new files should use lowercase domain naming. Rename old modules one by one only after tests/checks pass.
