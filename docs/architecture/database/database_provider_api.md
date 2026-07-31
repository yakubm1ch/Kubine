# Database Provider API

# Purpose

This document defines the contract between Kubine Engine and any database provider.

The Engine NEVER communicates with Supabase, PocketBase, Firebase or PostgreSQL directly.

Instead it communicates only with a Provider Interface.

Every provider must implement the same API.

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

# Required Interfaces

Every provider must implement:

## Connection

connect()

disconnect()

health()

---

## Installation

isInstalled()

install()

upgrade()

---

## Migrations

getCurrentVersion()

runMigration(version)

rollback(version)

---

## Database

createTable()

updateTable()

deleteTable()

insert()

update()

delete()

select()

transaction()

---

## Storage

createBucket()

deleteBucket()

upload()

download()

remove()

list()

---

## Authentication

login()

logout()

register()

refreshSession()

currentUser()

roles()

permissions()

---

## Module Installation

installModule()

uninstallModule()

updateModule()

---

## Events

Provider should emit:

database.connected

database.disconnected

database.error

migration.started

migration.finished

module.installed

module.updated

module.removed

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