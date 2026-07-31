# Kubine Database Architecture

# Philosophy

Kubine never stores business data directly.

The Engine stores only information required to initialize and manage projects.

Business data belongs to Modules.

Content belongs to Projects.

---

# Three Database Layers

## Engine Layer

Owned by Kubine.

Responsible for:

* Engine metadata
* Installed modules
* Migrations
* Providers
* Runtime state

---

## Project Layer

Owned by the Project.

Responsible for:

* Branding
* Navigation
* Theme
* Assets
* Public content

---

## Module Layer

Owned by individual modules.

Examples

Blog

Shop

Portfolio

CRM

Analytics

Each module owns its own schema.

---

# Engine Tables

The Engine always creates these tables.

## projects

Contains project metadata.

Fields

* id
* slug
* title
* version
* description
* provider
* active

---

## project_configuration

Stores default project configuration.

Examples

* colors
* typography
* spacing
* logos
* hero
* footer

---

## project_navigation

Stores default navigation.

Each record represents one menu item.

---

## installed_modules

Stores all installed modules.

Fields

* module_id
* version
* enabled
* installed_at

---

## module_settings

Stores configuration of every installed module.

Example

Blog

comments

posts_per_page

---

## migrations

Stores executed migrations.

The Runtime executes only missing migrations.

---

## providers

Stores active providers.

Examples

Database

Storage

Authentication

Email

Search

---

# User Tables

Kubine never changes authentication providers.

Instead it stores only preferences.

## user_preferences

Fields

* language
* theme
* timezone
* accessibility
* appearance

Project defaults remain unchanged.

---

# Assets

Engine stores only references.

Example

logos

hero images

favicons

backgrounds

Physical files belong to Storage Providers.

---

# Module Tables

Modules create their own tables.

Example

Blog

posts

comments

categories

Example

Shop

products

orders

wishlist

Nothing inside the Engine depends on them.

---

# Runtime Initialization

When Kubine starts

↓

Connect Provider

↓

Verify Engine Schema

↓

Create Missing Tables

↓

Insert Defaults

↓

Load Project

↓

Load Modules

↓

Run Module Migrations

↓

Application Ready

---

# Schema Evolution

The Runtime never drops user data automatically.

Only migrations may modify schemas.

Every migration executes once.

---

# Default Values

Every Engine installation inserts defaults.

Examples

Language

English

Theme

Dark

Navigation

Default menu

Appearance

Kubine defaults

Modules

Disabled until enabled

---

# Separation of Responsibilities

Engine

↓

Infrastructure

Project

↓

Branding

Modules

↓

Features

Users

↓

Preferences

No layer may overwrite the responsibility of another layer.

---

# Goal

A completely empty database should become a fully functional Kubine installation after a single Runtime initialization command.

No manual SQL editing should ever be required.
