# Kubine Runtime

# Runtime

Runtime is the heart of Kubine.

Its responsibility is to transform an empty project into a running application.

The Runtime knows nothing about the business logic.

It only coordinates every subsystem.

---

# Runtime Lifecycle

```
Browser

↓

index.html

↓

Bootstrap

↓

Provider Connection

↓

Database Verification

↓

Migration Engine

↓

Default Configuration

↓

Project Configuration

↓

Theme Engine

↓

Navigation Engine

↓

Module Discovery

↓

Dependency Resolution

↓

Module Registration

↓

Module Initialization

↓

Application Mount

↓

Ready
```

---

# Bootstrap

Bootstrap starts immediately after loading index.html.

Responsibilities:

* create Engine Context
* initialize providers
* load runtime configuration

---

# Provider Connection

Runtime connects to configured providers.

Examples

Database

Storage

Authentication

Email

Search

The Engine communicates only with provider interfaces.

---

# Database Verification

Runtime checks Engine schema.

If tables are missing:

Create them.

Insert defaults.

Continue.

No manual SQL should be required.

---

# Migration Engine

Every module exposes migrations.

Runtime compares

Current Version

↓

Installed Version

↓

Missing Migrations

Only missing migrations are executed.

---

# Project Loading

Runtime loads

Project

↓

Brand

↓

Theme

↓

Navigation

↓

Assets

Only one project is active.

---

# Theme Engine

Runtime loads

Default Theme

↓

Project Theme

↓

User Preferences

Result

↓

Final Theme

---

# Navigation Engine

Navigation is assembled automatically.

Sources

Engine

*

Project

*

Modules

↓

Sorted

↓

Rendered

No hardcoded menus exist.

---

# Module Discovery

Runtime scans

```
modules/
```

Every manifest found becomes a candidate.

---

# Dependency Resolution

Runtime builds dependency graph.

Example

Authentication

↓

Shop

↓

Wishlist

Modules initialize only after dependencies are ready.

---

# Module Registration

Runtime provides Engine Context.

Every module registers

Routes

Stores

Permissions

Navigation

Admin Pages

Services

Settings

Assets

---

# Module Initialization

After registration

Modules may initialize

API

Workers

Realtime

Caches

Background Tasks

---

# Application Mount

Only after Runtime completes

Vue mounts.

The user never interacts with a partially initialized application.

---

# Failure Recovery

If one module fails

↓

Disable module

↓

Continue startup

Engine must never crash because of one module.

---

# Runtime States

Booting

↓

Initializing

↓

Running

↓

Updating

↓

Stopping

Every subsystem knows current Runtime State.

---

# Runtime Context

Every module receives

Project

Configuration

Database Provider

Storage Provider

Authentication Provider

Logger

Event Bus

Localization

Theme

Current User

---

# Startup Principle

A new Kubine installation should require only

```
kubine init
```

Everything else happens automatically.

---

# Long-Term Goal

The Runtime should become capable of launching completely different applications without modifying Engine source code.

Changing only:

* Project
* Modules
* Content

should be enough.
