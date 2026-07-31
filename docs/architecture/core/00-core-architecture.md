# Kubine Architecture

# Architecture Overview

Kubine is a modular runtime engine.

Its purpose is **not** to implement a website.

Its purpose is to assemble, initialize and manage any project built on top of the engine.

---

# Main Layers

```
Application

│

Project

│

Modules

│

Engine Core

│

Providers

│

External Services
```

---

# Engine Core

The Engine Core is the only mandatory part of Kubine.

Responsibilities:

* bootstrap
* runtime initialization
* configuration loading
* module discovery
* provider abstraction
* lifecycle management
* dependency injection
* routing initialization
* state initialization

The Engine Core never contains project-specific logic.

---

# Project

A Project is a configuration package executed by Kubine.

A Project contains:

* branding
* content
* assets
* enabled modules
* project configuration

A Project never modifies Engine internals.

---

# Modules

Modules extend the engine.

Examples:

* Shop
* Blog
* Portfolio
* Authentication
* Comments
* Analytics
* Contact Forms
* Wishlist

Modules are isolated.

Modules communicate only through the Engine API.

Modules never communicate directly with each other.

---

# Providers

Kubine never talks directly to services.

Everything goes through Providers.

Example providers:

Database

* Supabase
* PostgreSQL
* MySQL
* SQLite

Storage

* Supabase Storage
* AWS S3
* Cloudflare R2

Authentication

* Supabase Auth
* Auth.js
* Firebase

The engine always talks to interfaces.

Providers implement those interfaces.

---

# Runtime

Runtime startup sequence:

1. Bootstrap
2. Load configuration
3. Connect provider
4. Verify schema
5. Run migrations
6. Insert default values
7. Load project
8. Load theme
9. Register modules
10. Initialize modules
11. Mount application

Only after step 11 the application becomes interactive.

---

# Module Registration

Every module contains a manifest.

Example

```
module.json
```

The manifest describes:

* id
* name
* version
* dependencies
* routes
* permissions
* migrations
* settings schema
* navigation entries
* admin pages

The Engine discovers manifests automatically.

The Engine never contains a hardcoded list of modules.

---

# Automatic Discovery

Kubine scans the modules directory.

Every discovered manifest is registered automatically.

No Engine source code should ever be modified to install a new module.

Adding a folder should be enough.

---

# Database Philosophy

The Engine owns:

* system tables
* migrations
* module metadata

Modules own:

* their own tables
* relations
* migrations

Projects own:

* data only

---

# Configuration Philosophy

Configuration exists on three levels.

Engine Configuration

Global Engine behaviour.

Module Configuration

Behaviour of one module.

Project Configuration

Branding and project content.

They must never be mixed.

---

# User Preferences

User preferences never overwrite project configuration.

Project configuration defines defaults.

User preferences define overrides.

Example:

Project

Language = English

User

Language = Ukrainian

The project remains English by default.

Only this user sees Ukrainian.

---

# Design Principle

Engine

↓

Modules

↓

Project

↓

User

Each level overrides only the level below it.

Never the opposite.

---

# Dependency Rule

Allowed

Engine

↓

Module

↓

Project

Forbidden

Project

↓

Engine internals

Forbidden

Module

↓

Another Module

Communication always goes through the Engine.

---

# Goal

Kubine should be capable of creating completely different applications without changing Engine code.

The only difference between applications should be:

* project configuration
* enabled modules
* content
* assets

Everything else remains the Engine.
