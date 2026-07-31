# Kubine Engine

> **Kubine** is a modular runtime engine for building modern web applications.

Kubine is **not** a CMS, **not** a website template, and **not** a page builder.

Its responsibility is to initialize projects, load configuration, discover installed modules, orchestrate them, and provide a unified runtime environment.

Business logic never belongs to the engine.

---

## Core Principles

* Engine first.
* Modules contain business logic.
* Database providers are replaceable.
* Everything is configuration-driven.
* Documentation is the single source of truth.

---

## Architecture

```text
Browser
        │
        ▼
Kubine Runtime
        │
        ▼
Database Provider
        │
        ▼
Project
        │
        ▼
Module Registry
        │
        ▼
Installed Modules
        │
        ▼
UI
```

---

## Main Responsibilities

Kubine Engine is responsible for:

* Project initialization.
* Configuration loading.
* Runtime lifecycle.
* Module discovery.
* Module installation.
* Route registration.
* Theme initialization.
* Storage abstraction.
* Provider abstraction.
* User preferences.

Kubine Engine is **not responsible** for:

* Shop logic.
* Blog logic.
* Portfolio logic.
* Authentication implementation.
* Any project-specific functionality.

Those responsibilities always belong to modules.

---

## Philosophy

The engine knows nothing about the project.

Modules describe themselves.

The runtime only connects everything together.

---

## Documentation

All technical specifications are located inside the `/docs` directory.

Every architectural decision must be documented before implementation.

Documentation always has higher priority than implementation.

---

## Current Demo Project

The repository currently contains **TinkerSpace**, which serves as the demonstration project for Kubine Engine.

TinkerSpace is **not part of the engine**.

It exists only to demonstrate Kubine capabilities.

---

## License

Apache-2.0
