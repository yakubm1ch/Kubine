# Kubine Provider System

> Version: Engine Core v1

---

# Purpose

Kubine never communicates with external services directly.

Everything goes through Providers.

Providers abstract external infrastructure from the Engine.

This allows replacing any backend service without modifying Engine or Modules.

---

# Provider Types

Kubine currently defines the following provider categories.

* Database
* Storage
* Authentication
* Search
* Email
* Logger
* Cache

Future providers may be added without changing the Engine.

---

# Provider Architecture

```text
Module

↓

Engine API

↓

Provider Interface

↓

Provider Implementation

↓

External Service
```

Modules never know which provider implementation is being used.

---

# Database Provider

Responsible for:

* reading data
* writing data
* migrations
* transactions
* queries

Possible implementations:

* Supabase
* PostgreSQL
* SQLite
* Firebase
* PocketBase
* Appwrite

---

# Storage Provider

Responsible for:

* images
* documents
* videos
* uploads
* downloads

Possible implementations:

* Supabase Storage
* S3
* Cloudflare R2
* Local Filesystem

The Engine stores only file references.

---

# Authentication Provider

Responsible for:

* login
* logout
* session
* roles
* permissions

Possible implementations:

* Supabase Auth
* Firebase Auth
* Auth0
* Keycloak
* Custom JWT

---

# Search Provider

Responsible for:

* indexing
* searching
* filtering

Possible implementations:

* Meilisearch
* Typesense
* ElasticSearch

---

# Email Provider

Responsible for:

* notifications
* password recovery
* verification
* transactional emails

Possible implementations:

* Resend
* SendGrid
* SMTP

---

# Logger Provider

Responsible for:

* logs
* runtime errors
* diagnostics

Possible implementations:

* Console
* File
* Remote API

---

# Cache Provider

Responsible for:

* temporary data
* query caching
* session caching

Possible implementations:

* Redis
* Memory
* Local cache

---

# Provider Configuration

Every provider exposes configuration.

Example

```json
{
  "database": "supabase",
  "storage": "supabase",
  "auth": "supabase",
  "email": "resend"
}
```

Runtime loads providers automatically.

---

# Engine Rule

The Engine depends only on Provider Interfaces.

It never imports provider implementations directly.

---

# Module Rule

Modules never access providers directly.

Instead they request Engine services.

Example

```text
Module

↓

Engine API

↓

Database Provider
```

---

# Provider Replacement

Replacing a provider must never require changes inside:

* Engine
* Modules
* Project

Only provider configuration changes.

---

# Future Goal

Kubine should support switching the entire backend stack by replacing provider implementations while keeping the application source code unchanged.
