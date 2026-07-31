# Component Lifecycle

## Purpose

This document defines how every architectural component is created, registered, initialized, used, and destroyed inside the Kubine Core.

Every component follows a predictable lifecycle.

No component may skip stages unless explicitly documented.

---

# Generic Lifecycle

```
Definition

↓

Registration

↓

Resolution

↓

Instantiation

↓

Initialization

↓

Runtime Usage

↓

Disposal

↓

Destroy
```

---

# Stage 1 — Definition

Purpose

Describe a component.

At this stage nothing exists yet.

Examples

- Provider Blueprint
- Module Manifest
- Theme Definition

Output

Metadata only.

---

# Stage 2 — Registration

Purpose

Register definitions.

Registry becomes aware of available components.

Examples

```
ProviderRegistry

↓

register()

↓

Supabase
```

Output

Registered metadata.

---

# Stage 3 — Resolution

Purpose

Find the correct component.

Resolver determines which implementation should be used.

Examples

```
ProviderResolver

↓

resolve("database")

↓

Supabase
```

Output

Component definition.

---

# Stage 4 — Instantiation

Purpose

Create runtime object.

Factory builds an object.

Examples

```
ProviderFactory

↓

create()

↓

SupabaseProvider
```

Output

Live object.

---

# Stage 5 — Initialization

Purpose

Prepare object.

Initialization may include

- configuration
- connection
- validation
- dependency injection

Output

Ready component.

---

# Stage 6 — Runtime Usage

Purpose

Component performs work.

Examples

```
DatabaseAdapter

↓

ProviderEngine

↓

DatabaseService

↓

Supabase SDK
```

This is the longest lifecycle stage.

---

# Stage 7 — Disposal

Purpose

Release runtime resources.

Examples

- unsubscribe realtime
- close listeners
- clear caches

Component still exists.

Resources do not.

---

# Stage 8 — Destroy

Purpose

Remove component completely.

Examples

```
Manager

↓

delete instance

↓

GC
```

Object no longer exists.

---

# Lifecycle per Component

## Registry

Lifecycle

```
Create

↓

Register metadata

↓

Lookup

↓

Destroy
```

Registry never owns runtime objects.

---

## Resolver

Lifecycle

```
Create

↓

Resolve

↓

Return

↓

Destroy
```

Resolver never caches.

---

## Factory

Lifecycle

```
Create

↓

Instantiate

↓

Return

↓

Destroy
```

Factory owns nothing.

---

## Manager

Lifecycle

```
Create

↓

Request instance

↓

Create if missing

↓

Cache

↓

Return

↓

Dispose

↓

Destroy
```

Manager owns runtime lifecycle.

---

## Engine

Lifecycle

```
Start

↓

Coordinate

↓

Delegate

↓

Finish
```

Engine never owns resources.

---

## Provider

Lifecycle

```
Create

↓

Initialize

↓

Expose Services

↓

Dispose

↓

Destroy
```

---

## Service

Lifecycle

```
Create

↓

Execute

↓

Return Result

↓

Destroy
```

---

## Bootstrap

Lifecycle

```
Application Start

↓

Initialize

↓

Exit
```

Bootstrap executes once.

---

# Lifecycle Rules

A component may only move forward.

Never recreate an initialized object.

Never initialize twice.

Destroy only after disposal.

Managers own lifecycle.

Factories own construction.

Resolvers own lookup.

Registries own metadata.

Engines own orchestration.

---

# Philosophy

Lifecycle must be deterministic.

The same input must always produce the same component state.