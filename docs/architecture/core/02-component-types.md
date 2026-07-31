# Component Types

## Purpose

This document defines every architectural component used inside the Kubine Core.

Every file inside `src/core` MUST belong to one of the component types described here.

A component may have only one primary responsibility.

If a file violates these rules, the architecture should be reconsidered.

---

# Engine

Purpose

Coordinate the execution flow.

An Engine never stores data.

An Engine never owns objects.

An Engine only orchestrates other components.

Responsibilities

- coordinate execution
- delegate work
- expose public entry point
- never contain business logic

Can use

- Manager
- Resolver
- Validator

Must NOT use

- UI
- Views
- Components

Example

ProviderEngine

RuntimeEngine

ThemeEngine

BootstrapEngine

---

# Manager

Purpose

Own runtime objects.

A Manager controls lifecycle.

Responsibilities

- create if necessary
- cache instances
- destroy instances
- reuse instances

Can use

- Factory
- Registry
- Validator

Must NOT be used as storage.

Example

ProviderManager

ThemeManager

RuntimeManager

---

# Registry

Purpose

Store metadata.

Registry never creates objects.

Registry never performs logic.

Responsibilities

- register definitions
- unregister definitions
- lookup definitions

Stores

- manifests
- provider classes
- aliases
- metadata

Example

ProviderRegistry

DatabaseRegistry

ModuleRegistry

---

# Factory

Purpose

Create objects.

Factory performs construction only.

Responsibilities

- instantiate classes
- inject dependencies
- return ready instance

Must NOT

- cache
- validate
- register

Example

ProviderFactory

ModuleFactory

ThemeFactory

---

# Resolver

Purpose

Find the correct object.

Responsibilities

- determine active provider
- determine active module
- resolve aliases
- resolve dependencies

Resolver never owns objects.

Example

ProviderResolver

RouteResolver

ThemeResolver

---

# Validator

Purpose

Verify correctness.

Responsibilities

- validate configuration
- validate contracts
- validate runtime state
- validate permissions

Validator never changes state.

Example

ProviderValidator

SchemaValidator

ConfigValidator

---

# Adapter

Purpose

Provide unified API.

Adapter hides implementation differences.

Responsibilities

- expose stable interface
- normalize requests
- normalize responses

Adapters never know provider implementation details.

Example

DatabaseAdapter

StorageAdapter

AuthAdapter

---

# Service

Purpose

Perform business logic.

Service contains provider-specific implementation.

Responsibilities

- execute operations
- communicate with SDK
- translate requests

Example

DatabaseService

StorageService

RealtimeService

AuthService

---

# Helper

Purpose

Provide stateless utility functions.

Helpers never own state.

Helpers never depend on runtime.

Example

QueryHelper

ResponseHelper

StorageHelper

---

# Provider

Purpose

Represent one complete backend implementation.

A Provider combines services into one runtime object.

Responsibilities

- initialize provider
- expose services
- expose capabilities

Example

SupabaseProvider

FirebaseProvider

PocketBaseProvider

---

# Bootstrap

Purpose

Initialize system.

Bootstrap executes only once.

Responsibilities

- register providers
- load configuration
- prepare runtime

Bootstrap never performs application logic.

Example

provider.bootstrap.js

runtime.bootstrap.js

---

# Pipeline

Purpose

Execute ordered stages.

Responsibilities

- execute sequence
- stop on failure
- collect result

Example

InstallerPipeline

BootstrapPipeline

RuntimePipeline

---

# Step

Purpose

Represent one atomic operation.

Responsibilities

- execute exactly one task
- report success or failure

Example

CreateTablesStep

CreatePoliciesStep

CreateBucketsStep

---

# Contract

Purpose

Describe required API.

Contracts contain no implementation.

Responsibilities

- define methods
- define behavior expectations

Example

DatabaseProvider.interface.js

StorageProvider.interface.js

---

# Rule

One file.

One component.

One responsibility.

Never combine multiple architectural roles inside a single file.