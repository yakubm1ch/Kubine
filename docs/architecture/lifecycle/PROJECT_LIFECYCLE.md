# PROJECT_LIFECYCLE.md

# Kubine Project Lifecycle

> Version: Engine Core v1
>
> Status: Draft

---

# Purpose

This document describes the complete lifecycle of every project running on the Kubine engine.

Every Kubine project follows exactly the same initialization sequence regardless of its purpose (shop, blog, portfolio, landing page, corporate website, etc.).

This guarantees predictable behavior, modularity and portability.

---

# Startup Sequence

```
Browser
        │
        ▼
index.html
        │
        ▼
Kubine Runtime
        │
        ▼
Configuration
        │
        ▼
Database Adapter
        │
        ▼
Database Provider
        │
        ▼
Project Configuration
        │
        ▼
Module Discovery
        │
        ▼
Module Initialization
        │
        ▼
Application Ready
```

---

# Phase 1 — Browser Request

The user opens a Kubine website.

The browser loads only one static file:

```
index.html
```

At this moment:

- nothing about the project is known;
- no theme exists;
- no navigation exists;
- no modules exist;
- no database connection exists.

The browser only knows:

```
Loading...
```

---

# Phase 2 — Runtime Initialization

Kubine Runtime starts.

Responsibilities:

- initialize environment;
- load configuration;
- detect build mode;
- prepare internal services;
- initialize logger.

---

# Phase 3 — Adapter Selection

Runtime reads engine configuration.

Example:

```
provider = supabase
```

Runtime loads corresponding adapter.

Example:

```
SupabaseAdapter
```

Later this may become:

```
FirebaseAdapter

AppwriteAdapter

PocketBaseAdapter

LocalAdapter
```

The engine itself never communicates directly with databases.

Only adapters do.

---

# Phase 4 — Provider Connection

Adapter establishes connection.

Example:

```
Supabase

↓

Connection OK
```

If connection fails:

Runtime enters Error Mode.

---

# Phase 5 — Load Project Profile

Kubine requests:

```
project_profile
```

The engine receives:

- project name
- slug
- language
- default theme
- project type
- description

Browser tab updates.

Example:

```
Loading...

↓

TinkerSpace
```

Favicon also updates.

---

# Phase 6 — Load Theme

Kubine loads

```
project_theme
```

Only global theme information.

Example:

- colors
- spacing
- typography
- shadows
- border radius

Then CSS variables are generated.

---

# Phase 7 — Load Navigation

Kubine requests

```
project_navigation
```

Navigation becomes available.

Menus are rendered.

---

# Phase 8 — Discover Modules

Kubine requests

```
project_modules
```

Engine now knows:

Which modules exist.

Example

```
Blog

Catalog

Portfolio

Authentication

Analytics

Wishlist

Checkout
```

---

# Phase 9 — Module Registration

Each enabled module executes

```
register()
```

The module provides:

- name
- version
- routes
- migrations
- admin pages
- permissions
- dependencies

Kubine builds internal registry.

---

# Phase 10 — Migration Check

Every module compares

```
required version

↓

installed version
```

If migration is required

Kubine executes module migrations.

---

# Phase 11 — Render Application

Only now the application starts rendering.

Everything is already known:

- theme
- navigation
- modules
- routes
- providers

The user now sees the project.

---

# Phase 12 — Runtime State

Kubine remains active.

Modules communicate only through engine services.

Modules never communicate directly with each other.

Everything goes through Runtime.

---

# Admin Mode

When administrator enters Admin Panel

Kubine enables Admin Runtime.

Additional services become available:

- Module Manager
- Theme Editor
- Content Editor
- Storage Manager
- User Manager
- Analytics
- Settings

Normal visitors never load these services.

---

# Shutdown

When browser closes

Runtime is destroyed.

No project state is permanently stored inside the engine.

Persistent state exists only inside configured providers.

---

# Fundamental Principle

The engine knows nothing about projects.

Projects know nothing about providers.

Providers know nothing about modules.

Modules know nothing about each other.

Kubine is the orchestrator connecting every component together.