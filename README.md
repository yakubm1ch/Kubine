# Kubine Engine

> **The modular engine for building modern web platforms.**

Kubine is not a website template.

Kubine is not a CMS.

Kubine is a universal engine that assembles complete web projects from independent modules, dynamic configuration, and database-driven content.

The engine itself knows nothing about stores, blogs, portfolios, or any specific project.

Every project is built by combining reusable modules on top of the same core.

---

# Philosophy

Kubine follows one simple principle:

> **Code defines logic. Data defines behavior.**

The engine contains only reusable logic.

Everything that can be configured is stored outside the code.

Examples:

* Site identity
* Navigation
* Theme
* Colors
* Homepage layout
* Logos
* Content
* Enabled modules

---

# Architecture

```text
Kubine Engine

├── Core
├── Bootstrap Engine
├── Database Engine
├── Module Engine
├── Theme Engine
├── Preference Engine
├── Security Engine
├── Storage Engine
├── Localization Engine
├── Adapters
└── Projects
```

Projects are **not part of the engine**.

Projects simply consume the engine.

---

# Module-first architecture

Kubine does not know what modules exist.

Instead, every module registers itself.

Each module provides its own:

* Manifest
* Database schema
* Services
* Stores
* Components
* Pages
* Admin integration

The engine discovers and connects everything automatically.

---

# Database-first architecture

Kubine does not rely on handwritten SQL.

Instead, the engine owns its database schema.

```text
Schema

↓

Migration Engine

↓

Database

↓

Seed

↓

Project
```

The engine can initialize an empty database automatically.

Future providers may include:

* Supabase
* PostgreSQL
* Appwrite
* Firebase
* PocketBase
* Other adapters

---

# User Preferences

Global configuration belongs to the project.

Personal preferences belong to the user.

Examples of user preferences:

* Theme
* Language
* Currency
* Accessibility
* Animations

Guest users store preferences locally.

Authenticated users synchronize them across devices.

---

# Design Goals

Kubine is built around several core ideas:

* Modular architecture
* Minimal hardcoded values
* Configuration over conditions
* One source of truth
* Reusable components
* Database-driven behavior
* Engine independent from projects
* Future-proof architecture

---

# Example Project

The first project built with Kubine Engine is:

**TinkerSpace**

TinkerSpace is a demonstration platform showcasing the capabilities of the engine.

It is not part of Kubine itself.

---

# Documentation

Detailed documentation is available inside:

```text
/docs
```

Including:

* Architecture
* Module System
* Database Schema
* Bootstrap Lifecycle
* Security
* Project Structure
* Development Guide

---

Kubine Engine is designed to become a foundation for building scalable, maintainable and highly customizable web platforms.
