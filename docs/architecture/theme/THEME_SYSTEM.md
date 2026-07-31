# Kubine Theme System

> Version: Engine Core v1

---

# Purpose

Kubine separates visual appearance from business logic.

Themes are independent from projects, modules and providers.

Every project can completely change its appearance without modifying Engine source code.

---

# Theme Layers

Kubine defines three configuration layers.

```text
Engine

↓

Project

↓

User
```

Each layer overrides the previous one.

---

# Engine Theme

The Engine provides the default design language.

Contains:

* spacing
* typography
* breakpoints
* shadows
* border radius
* animation timings
* default colors

Engine Theme guarantees that Kubine always has a valid UI.

---

# Project Theme

Every project overrides Engine defaults.

Examples:

* brand colors
* logos
* fonts
* gradients
* button style
* card style

These values are stored inside the database.

Example:

```text
project_theme
```

---

# User Preferences

Each visitor may override visual preferences locally.

Examples:

* language
* dark mode
* light mode
* font scaling
* reduced motion

User settings never modify project configuration.

---

# Storage

Project Theme

↓

Database

User Preferences

↓

Browser Local Storage

Engine Theme

↓

Engine Source

---

# Loading Sequence

Runtime loads:

Engine Theme

↓

Project Theme

↓

User Preferences

↓

Generate CSS Variables

↓

Render UI

---

# CSS Variables

Kubine exposes all visual properties as CSS variables.

Example

```css
--color-primary

--color-surface

--radius-lg

--spacing-md

--font-family
```

Components never hardcode values.

---

# Theme Switching

Changing theme should never reload the application.

Runtime updates CSS variables dynamically.

The UI updates instantly.

---

# Logos

Logos belong to the Project Theme.

Examples

Header Light

Header Dark

Footer Light

Footer Dark

Favicon

App Icon

Only file references are stored.

Physical assets remain inside Storage Provider.

---

# Future Themes

A project may contain multiple themes.

Example

```text
Default

Cyberpunk

Minimal

Corporate

Christmas
```

Switching themes changes only configuration.

Engine source remains unchanged.

---

# Engine Rule

The Engine never contains project branding.

Projects provide branding.

Users provide preferences.

Engine combines them into the final appearance.

---

# Long-Term Goal

Every Kubine project should support complete visual rebranding without rebuilding or modifying the Engine.
