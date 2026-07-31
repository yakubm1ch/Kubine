# Provider Engine Types

## Purpose

The Provider Engine is responsible for managing every database provider available in Kubine.

It never communicates with Supabase, Firebase or PostgreSQL directly.

Instead, it coordinates the provider lifecycle through specialized components.

---

# ProviderEngine

## Component Type

Engine

## Responsibility

Acts as the public entry point of the Provider subsystem.

It exposes a unified API for the rest of Kubine while hiding all internal implementation details.

The Engine never creates providers.

The Engine never stores provider metadata.

The Engine never performs validation.

It only coordinates the internal components.

## Owns

Nothing.

## Uses

- ProviderManager

---

# ProviderManager

## Component Type

Manager

## Responsibility

Owns the lifecycle of provider instances.

Responsible for:

- requesting providers
- creating providers (through Factory)
- caching providers
- destroying providers
- ensuring only one instance exists when required

The Manager is the only component allowed to own provider instances.

## Owns

Provider instances.

## Uses

- ProviderRegistry
- ProviderFactory
- ProviderValidator

---

# ProviderRegistry

## Component Type

Registry

## Responsibility

Stores provider metadata.

The Registry never creates providers.

The Registry only knows:

- provider names
- provider ids
- provider classes
- provider configuration
- provider capabilities

The Registry is the source of provider definitions.

## Owns

Provider definitions.

## Uses

Nothing.

---

# ProviderFactory

## Component Type

Factory

## Responsibility

Creates provider objects.

The Factory receives a provider definition and returns a fully initialized provider instance.

The Factory never stores instances.

The Factory never caches.

## Owns

Nothing.

## Uses

Provider definitions only.

---

# ProviderResolver

## Component Type

Resolver

## Responsibility

Finds the correct provider.

The Resolver contains lookup logic only.

Examples:

- active provider
- provider by name
- provider by capability

It never creates objects.

## Owns

Nothing.

## Uses

ProviderRegistry.

---

# ProviderValidator

## Component Type

Validator

## Responsibility

Validates provider definitions before registration or creation.

Typical checks include:

- unique provider name
- required methods
- contract implementation
- configuration validity

Validators never modify providers.

## Owns

Nothing.

---

# Provider

## Component Type

Provider

## Responsibility

Represents one concrete database implementation.

Examples:

- SupabaseProvider
- FirebaseProvider
- PostgreSQLProvider
- PocketBaseProvider

A Provider implements one or more contracts.

It contains provider-specific logic only.

Providers never know about the Provider Engine.

## Owns

Provider state.

---

# Relationships

Application

↓

ProviderEngine

↓

ProviderManager

↓

ProviderRegistry

↓

ProviderFactory

↓

Provider

---

# Dependency Rules

ProviderEngine
→ may only access ProviderManager

ProviderManager
→ may access Registry
→ may access Factory
→ may access Validator

ProviderRegistry
→ accesses nobody

ProviderFactory
→ accesses nobody except provider constructors

ProviderValidator
→ accesses nobody

Provider
→ never accesses Engine components

---

# Golden Rule

Every component inside the Provider Engine has exactly one responsibility.

No component may perform responsibilities belonging to another component.

This guarantees that new providers can be added without modifying the Engine itself.