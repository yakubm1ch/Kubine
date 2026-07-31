# Kubine Database Schema

## Philosophy

Kubine never stores project-specific data in its core.

The core database contains only system information required for the engine to operate.

Everything related to business logic belongs to modules.

---

# Core Tables

Engine creates these tables automatically.

## system_info

Stores information about current installation.

Fields:

- id
- engine_version
- installed_at
- updated_at
- database_provider
- schema_version

---

## installed_modules

Stores installed modules.

Fields:

- id
- slug
- version
- enabled
- installed_at
- updated_at

---

## module_settings

Stores configuration for every module.

Fields:

- module_slug
- key
- value

---

## site_settings

Stores global editable settings.

Examples:

- logo
- favicon
- company_name
- contacts

---

## default_settings

Stores engine defaults.

Examples:

- default_theme
- default_language
- default_colors

Never modified by user.

---

## permissions

Stores roles and permissions.

---

## migrations

Stores applied migrations.

Fields:

- migration
- module
- executed_at

---

## storage_providers

Information about configured storage providers.

---

## auth_providers

Information about authentication providers.

---

# Module Tables

Modules create their own tables.

Example:

Blog

blog_posts

blog_categories

blog_tags

Catalog

products

categories

product_images

Portfolio

projects

project_images

---

# Rule

Core never creates module tables.

Modules never modify core tables.

Communication happens only through Engine API.