# Kubine Engine

## Overview

Kubine is an open-source modular engine for building modern web projects.

It is **not** a website.

It is **not** a CMS.

It is **not** a template.

Kubine is the runtime responsible for assembling, configuring and launching any project built on top of it.

A project built with Kubine contains only its own content.

Everything else is provided by the engine.

---

## Core Principles

* Modular architecture
* Database agnostic
* Provider agnostic
* Theme independent
* Content separated from engine
* Runtime initialization
* Automatic project deployment
* Automatic module registration

---

## Engine Responsibilities

Kubine is responsible for:

* Runtime bootstrap
* Project initialization
* Database initialization
* Configuration loading
* Module discovery
* Theme loading
* Navigation generation
* Asset management
* User preferences
* Authentication abstraction
* Storage abstraction

---

## Project Responsibilities

Projects built on Kubine are responsible only for:

* Branding
* Content
* Assets
* Business logic
* Custom modules

Everything else belongs to the engine.

---

## Philosophy

The engine must never know what project it is running.

The project tells the engine who it is.

The engine then assembles the application dynamically.

---

## Deployment Flow

1. User opens the website.
2. Kubine Runtime starts.
3. Runtime connects to the configured provider.
4. Runtime checks project schema.
5. Missing tables are created automatically.
6. Default values are inserted.
7. Project configuration is loaded.
8. Theme is loaded.
9. Navigation is generated.
10. Modules register themselves.
11. Runtime initializes enabled modules.
12. Application starts.

---

## Runtime Lifecycle

Bootstrap

↓

Provider Connection

↓

Database Migration

↓

Configuration

↓

Theme

↓

Navigation

↓

Module Registration

↓

Module Initialization

↓

Application Ready
