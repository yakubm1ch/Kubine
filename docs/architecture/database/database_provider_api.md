# Database Provider API

# Purpose

This document defines the contract between Kubine Engine and any database provider.

The Engine NEVER communicates with Supabase, PocketBase, Firebase or PostgreSQL directly.

Instead it communicates only with a Provider Interface.

Every provider must implement the same core API.

---

# Provider Lifecycle

Engine Startup

↓

Load active provider

↓

Initialize connection

↓

Check installation

↓

Run pending migrations

↓

Load enabled modules

↓

Ready

---

# Core DatabaseProvider Contract (Mandatory)

Every database provider must implement these seven methods:

## Connection Lifecycle

connect(context)

disconnect(context)

health(context)

## CRUD Operations

select(table, query, context)

insert(table, records, context)

update(table, values, filters, context)

delete(table, filters, context)

---

# Optional Capabilities

The following capabilities are NOT required by the core contract. A provider that implements
a capability must expose its complete contract. Providers without a capability remain valid
core database providers.

## TransactionCapability

transaction(callback, context)

## SchemaCapability

createTable(name, definition, context)

updateTable(name, definition, context)

deleteTable(name, context)

---

# Responsibilities Outside the Provider Contract

The following are NOT part of the DatabaseProvider contract:

## Migrations

isInstalled(), install(), upgrade(), getCurrentVersion(), runMigration(), rollback()

Migration orchestration is owned by Kubine, not embedded in the provider contract.

## Storage

createBucket(), deleteBucket(), upload(), download(), remove(), list()

Storage is a separate concern. No StorageProvider contract exists yet.

## Authentication

login(), logout(), register(), refreshSession(), currentUser(), roles(), permissions()

Authentication is a separate concern. No AuthProvider contract exists yet.

## Module Installation

installModule(), uninstallModule(), updateModule()

Module installation is a separate concern.

---

# Events

Provider should emit:

database.connected

database.disconnected

database.error

---

# Provider Discovery

Engine searches:

src/core/database/providers/

Each provider contains:

provider.json

provider.js

auth/

database/

storage/

functions/

realtime/

installer/

---

# Provider Metadata

provider.json

Contains:

id

name

version

supportedFeatures

minimumEngineVersion

supportedModules

---

# Compatibility

Engine Version

Provider Version

Database Schema Version

must always be compatible.

If incompatible

↓

Upgrade required.

---

# Design Rules

Provider never knows business logic.

Provider never knows modules.

Provider only executes requests.

Business logic belongs to Engine.

---

# Future Providers

Supported examples:

Supabase

PocketBase

Firebase

PostgreSQL

SQLite

MySQL

MongoDB

Appwrite

Custom REST Backend

---

# Philosophy

Providers are replaceable.

Engine is permanent.

Modules are independent.

Business logic must never depend on a specific database.
