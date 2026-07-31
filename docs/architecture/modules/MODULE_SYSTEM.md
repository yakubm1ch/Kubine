# Kubine Module System

# Philosophy

Kubine itself contains almost no business logic.

Every feature is implemented as a module.

The Engine is responsible only for discovering, registering and executing modules.

---

# What is a Module

A module is a self-contained feature package.

Examples:

* Shop
* Blog
* Portfolio
* Wiki
* CRM
* Analytics
* Authentication

A module owns:

* Components
* Routes
* Stores
* Services
* Database schema
* Admin pages
* Settings
* Assets

---

# Self Registration

Modules register themselves.

The Engine never contains a hardcoded module list.

Each module exposes its own manifest.

Example

```text
modules/blog/module.json
```

---

# Manifest

Every module must provide metadata.

Example fields:

* id
* name
* version
* description
* author
* dependencies
* migrations
* routes
* admin routes
* permissions
* navigation entries
* default configuration

The Engine reads only manifests.

---

# Module Discovery

Engine Startup

↓

Scan modules directory

↓

Read every manifest

↓

Validate

↓

Register

↓

Resolve dependencies

↓

Run migrations

↓

Initialize

---

# Module Lifecycle

Module installation

↓

Migration

↓

Configuration creation

↓

Registration

↓

Initialization

↓

Running

↓

Disable

↓

Uninstall

---

# Module Isolation

Modules never communicate directly.

Forbidden

Blog

↓

Shop

Allowed

Blog

↓

Engine API

↓

Shop

The Engine becomes the communication layer.

---

# Dependency Resolution

Modules may depend on other modules.

Example

Wishlist

↓

Shop

Authentication

↓

User

Portfolio

↓

Media

The Engine resolves dependency order automatically.

---

# Automatic Database

Every module provides migrations.

Example

Blog

↓

posts

categories

comments

The Engine executes migrations only once.

Already installed modules never recreate their tables.

---

# Default Configuration

Modules provide their own default configuration.

Example

Blog

```json
{
  "comments": true,
  "postsPerPage": 10
}
```

The Engine inserts defaults during installation.

---

# Administration

Every module may expose Admin pages.

The Admin Dashboard discovers them automatically.

Example

Installed

✔ Blog

✔ Shop

✔ Portfolio

↓

Dashboard automatically displays

Blog

Shop

Portfolio

No Engine code changes required.

---

# Runtime Registration

Every enabled module receives the Engine Context.

Example

Engine

↓

Blog Module

↓

register()

↓

Engine knows:

Routes

Stores

Permissions

Navigation

Database

Assets

---

# Hot Installation

Future versions should support enabling modules without rebuilding the project.

The Engine should initialize newly enabled modules dynamically.

---

# Goal

Adding a new module should require only:

1. Copy folder into modules/
2. Enable module
3. Restart Runtime

Nothing inside the Engine should ever be modified.
