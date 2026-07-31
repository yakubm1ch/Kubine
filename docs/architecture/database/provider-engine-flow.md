# Provider Engine Flow

## Purpose

This document describes the complete execution flow of the Provider Engine.

Unlike **provider-engine-types.md**, which explains *what every component is*, this document explains *how every component interacts during execution*.

---

# Startup Flow

Application

↓

bootstrap.engine.js

↓

provider.bootstrap.js

↓

ProviderRegistry.register()

↓

Provider definitions stored

↓

Application ready

---

## Startup Explanation

During application startup no provider instances exist.

Only provider definitions are registered.

At this stage Kubine knows:

- provider name
- provider class
- capabilities
- configuration

No connection to any database is created.

---

# First Request Flow

Example:

DatabaseAdapter.select()

↓

ProviderEngine

↓

ProviderManager

↓

ProviderResolver

↓

ProviderRegistry

↓

Provider definition

↓

ProviderFactory

↓

Provider instance

↓

ProviderManager cache

↓

Provider returned

↓

DatabaseAdapter

↓

Database Service

↓

Database Provider

↓

External Database

---

# Detailed Execution

## Step 1

Application requests a database operation.

Example

DatabaseAdapter.select()

The Adapter never knows which provider is active.

---

## Step 2

The Adapter delegates execution.

↓

ProviderEngine

The Engine becomes the public entry point.

---

## Step 3

ProviderEngine forwards the request.

↓

ProviderManager

The Engine performs no business logic.

---

## Step 4

Manager resolves provider.

↓

ProviderResolver

Resolver determines which provider should be used.

Possible strategies:

- active provider
- project configuration
- runtime configuration
- explicit provider

---

## Step 5

Resolver queries Registry.

↓

ProviderRegistry

Registry returns only metadata.

Example

Provider Name

Supabase

Provider Class

SupabaseProvider

Capabilities

Database

Storage

Auth

Realtime

---

## Step 6

Manager checks cache.

If instance exists

↓

return cached instance

Else

↓

Factory

---

## Step 7

Factory creates provider.

↓

new SupabaseProvider()

Factory performs construction only.

No caching.

No validation.

---

## Step 8

Validation

↓

ProviderValidator

Validation confirms:

- provider contract
- required methods
- configuration
- initialization state

If validation fails

↓

throw exception

---

## Step 9

Manager caches provider.

ProviderManager now owns the lifecycle.

Future requests reuse the same instance.

---

## Step 10

Provider returned.

↓

ProviderEngine

↓

DatabaseAdapter

---

## Step 11

Adapter executes service.

Example

provider.database.select()

or

provider.storage.upload()

or

provider.auth.login()

---

## Step 12

Service communicates with SDK.

Example

Supabase JS SDK

↓

Supabase API

↓

Database

---

# Shutdown Flow

Application

↓

ProviderEngine

↓

ProviderManager

↓

Destroy Provider

↓

Clear Cache

↓

Application Exit

---

# Ownership Rules

Application

owns nothing

---

ProviderEngine

owns nothing

---

ProviderManager

owns provider instances

owns cache

controls lifecycle

---

ProviderRegistry

owns provider metadata only

---

ProviderFactory

owns nothing

creates objects

---

ProviderValidator

owns nothing

checks correctness only

---

ProviderResolver

owns nothing

finds providers only

---

Provider

owns provider-specific runtime state

---

# Golden Rule

Execution always flows downward.

Application

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

External SDK

↓

External Service

No lower component may directly call a higher component.

Every layer only knows the layer immediately below it.