# Layer Rules

## Purpose

This document defines architectural layers inside Kubine.

Every layer has one responsibility.

Communication always flows downward.

---

# Layer Hierarchy

```
Application

↓

Bootstrap

↓

Core Engines

↓

Managers

↓

Resolvers

↓

Registries

↓

Factories

↓

Providers

↓

Services

↓

External SDK
```

---

# Layer 1 — Application

Purpose

Entry point.

Examples

- main.js
- App.vue

Responsibilities

- start Kubine
- mount UI

---

# Layer 2 — Bootstrap

Purpose

Initialize architecture.

Responsibilities

- register providers
- prepare runtime
- validate startup

---

# Layer 3 — Core Engines

Purpose

Coordinate execution.

Examples

- RuntimeEngine
- ProviderEngine
- ThemeEngine

---

# Layer 4 — Managers

Purpose

Own runtime state.

Examples

- ProviderManager

- RuntimeManager

---

# Layer 5 — Resolvers

Purpose

Find components.

Examples

- ProviderResolver

- RouteResolver

---

# Layer 6 — Registries

Purpose

Store metadata.

Examples

- ProviderRegistry

- ModuleRegistry

---

# Layer 7 — Factories

Purpose

Instantiate objects.

Examples

- ProviderFactory

- ThemeFactory

---

# Layer 8 — Providers

Purpose

Represent implementations.

Examples

- SupabaseProvider

- FirebaseProvider

---

# Layer 9 — Services

Purpose

Execute provider logic.

Examples

- DatabaseService

- StorageService

---

# Layer 10 — External SDK

Purpose

Third-party systems.

Examples

- Supabase SDK

- Firebase SDK

- PostgreSQL Driver

---

# Allowed Communication

```
Higher Layer

↓

Lower Layer
```

Allowed.

---

```
Lower Layer

↓

Higher Layer
```

Forbidden.

---

# Cross Layer Rules

Application

↓

Core

Allowed.

---

Core

↓

Providers

Allowed.

---

Providers

↓

Core

Forbidden.

---

Services

↓

Engine

Forbidden.

---

Registry

↓

Manager

Forbidden.

---

Factory

↓

Registry

Forbidden.

---

# Philosophy

Each layer knows less than the layer above it.

Knowledge decreases downward.

Responsibilities become smaller downward.

Coupling decreases downward.