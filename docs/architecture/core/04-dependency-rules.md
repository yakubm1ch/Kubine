# Dependency Rules

## Purpose

This document defines the dependency rules inside the Kubine Core.

Dependencies always flow in one direction.

Circular dependencies are forbidden.

Every component may communicate only with specific architectural layers.

---

# General Rule

Higher layers orchestrate.

Lower layers execute.

Execution always flows downward.

```
Application

↓

Bootstrap

↓

Engine

↓

Manager

↓

Resolver

↓

Registry

↓

Factory

↓

Provider

↓

Service

↓

External SDK
```

No component may reverse this flow.

---

# Engine

Can use

- Manager
- Resolver
- Validator

Cannot use

- Registry
- Factory
- Provider
- Service

Reason

Engine coordinates only.

---

# Manager

Can use

- Resolver
- Registry
- Factory
- Validator

Cannot use

- Engine

Reason

Manager owns lifecycle.

---

# Resolver

Can use

- Registry

Cannot use

- Manager
- Factory

Reason

Resolver only finds information.

---

# Registry

Can use

Nothing.

Registry is passive.

Cannot use

- Engine
- Manager
- Resolver
- Factory

Reason

Registry stores metadata only.

---

# Factory

Can use

- Provider classes

Cannot use

- Registry
- Manager
- Engine

Reason

Factory creates objects only.

---

# Validator

Can use

Nothing.

Validators are stateless.

Cannot use

- Manager
- Engine
- Factory

Reason

Validation must never modify runtime.

---

# Adapter

Can use

- ProviderEngine

Cannot use

- Provider directly

Reason

Adapter depends only on public architecture.

---

# Service

Can use

- External SDK
- Helpers

Cannot use

- Engine
- Manager
- Registry

Reason

Services implement provider logic only.

---

# Provider

Can use

- Services

Cannot use

- Engine
- Manager
- Resolver

Reason

Provider aggregates services.

---

# Bootstrap

Can use

- Registry
- Factory
- Validator

Cannot use

Runtime objects.

Reason

Bootstrap initializes architecture.

---

# Helpers

Can use

Nothing.

Helpers must remain independent.

---

# Contracts

Cannot depend on anything.

Contracts define APIs only.

---

# Forbidden Dependencies

Engine

❌ Manager → Engine

❌ Registry → Engine

❌ Provider → Engine

---

Manager

❌ Registry → Manager

❌ Provider → Manager

---

Registry

❌ Registry → Factory

❌ Registry → Resolver

❌ Registry → Service

---

Factory

❌ Factory → Manager

❌ Factory → Resolver

---

Service

❌ Service → Engine

❌ Service → Manager

❌ Service → Registry

---

Provider

❌ Provider → Engine

❌ Provider → Manager

---

# Circular Dependencies

Never allowed.

Example

```
Engine

↓

Manager

↓

Resolver

↓

Registry

↓

Engine
```

Forbidden.

---

# Dependency Philosophy

Every dependency should make the system easier to understand.

If adding a dependency makes responsibilities unclear, the architecture should be redesigned instead.ііі