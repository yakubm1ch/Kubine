# Naming Conventions

## Purpose

This document defines naming rules used across the Kubine Core.

Every filename should immediately describe its architectural role.

---

# Engines

Pattern

*.engine.js

Purpose

Coordinates execution.

Examples

provider.engine.js

runtime.engine.js

theme.engine.js

bootstrap.engine.js

---

# Managers

Pattern

*.manager.js

Purpose

Own runtime lifecycle.

Examples

provider.manager.js

theme.manager.js

runtime.manager.js

---

# Registries

Pattern

*.registry.js

Purpose

Store metadata.

Examples

provider.registry.js

database.registry.js

module.registry.js

---

# Factories

Pattern

*.factory.js

Purpose

Create runtime objects.

Examples

provider.factory.js

module.factory.js

theme.factory.js

---

# Resolvers

Pattern

*.resolver.js

Purpose

Locate resources.

Examples

provider.resolver.js

theme.resolver.js

route.resolver.js

---

# Validators

Pattern

*.validator.js

Purpose

Validate state.

Examples

provider.validator.js

schema.validator.js

config.validator.js

---

# Adapters

Pattern

*.adapter.js

Purpose

Expose unified API.

Examples

database.adapter.js

storage.adapter.js

auth.adapter.js

---

# Services

Pattern

*.service.js

Purpose

Implement business logic.

Examples

database.service.js

storage.service.js

realtime.service.js

auth.service.js

---

# Helpers

Pattern

*.helper.js

Purpose

Stateless utilities.

Examples

query.helper.js

storage.helper.js

response.helper.js

---

# Providers

Pattern

*.provider.js

Purpose

Backend implementation.

Examples

supabase.provider.js

firebase.provider.js

postgresql.provider.js

---

# Contracts

Pattern

*.interface.js

Purpose

Architectural contracts.

Examples

DatabaseProvider.interface.js

StorageProvider.interface.js

---

# Pipelines

Pattern

*.pipeline.js

Purpose

Execute ordered stages.

Examples

installer.pipeline.js

bootstrap.pipeline.js

runtime.pipeline.js

---

# Steps

Pattern

*.step.js

Purpose

One atomic action.

Examples

createTables.step.js

createBuckets.step.js

---

# Bootstrap

Pattern

*.bootstrap.js

Purpose

Initialize subsystem.

Examples

provider.bootstrap.js

runtime.bootstrap.js

---

# Rules

A filename should describe:

- architectural role
- responsibility

A filename should never describe implementation details.

Good

provider.manager.js

Bad

providerRuntimeThing.js

---

One role.

One filename.

One responsibility.