# Kubine Engine API

# Purpose

The Engine API is the only public interface between Kubine and Modules.

Modules never access Engine internals.

Every interaction goes through the Engine API.

---

# Registration

During initialization every module receives Engine Context.

Example

```ts
export function register(engine) {

}
```

---

# Route Registration

Modules may expose frontend routes.

Example

```ts
engine.registerRoute({
    path: "/blog",
    component: BlogPage
})
```

---

# Admin Pages

Modules may expose administration pages.

```ts
engine.registerAdminPage({
    path: "/admin/blog",
    component: BlogAdmin
})
```

---

# Store Registration

Modules register Pinia stores.

```ts
engine.registerStore(useBlogStore)
```

---

# Navigation

Modules never edit navigation directly.

Instead

```ts
engine.registerNavigation({
    location: "public",
    title: "Blog",
    path: "/blog",
    order: 30
})
```

The Runtime assembles navigation automatically.

---

# Settings

Modules define editable settings.

```ts
engine.registerSettings({

    module: "blog",

    schema: {

        comments: Boolean,

        postsPerPage: Number

    }

})
```

The Admin Panel generates forms automatically.

---

# Database

Modules never create tables manually.

Instead

```ts
engine.registerMigration()
```

The Runtime executes migrations.

---

# Assets

Modules may register assets.

```ts
engine.registerAssets()

```

Examples

Images

Fonts

Icons

Shaders

Translations

---

# Permissions

Modules expose permissions.

```ts
engine.registerPermissions([
    "blog.read",
    "blog.write",
    "blog.delete"
])
```

The Engine integrates them into the Role System.

---

# Events

Modules communicate through Events.

```ts
engine.emit()

engine.on()

engine.off()
```

Modules never call each other directly.

---

# Services

Modules may expose reusable services.

```ts
engine.registerService()

engine.useService()
```

Example

Media

Search

Notifications

Storage

---

# Dependency Injection

Modules request dependencies.

```ts
engine.inject()

```

The Runtime resolves them automatically.

---

# Runtime Context

Every module receives

Database Provider

Storage Provider

Configuration

Current Project

Current User

Theme

Localization

Logger

Event Bus

---

# Runtime Rules

Allowed

Module

↓

Engine API

↓

Runtime

Forbidden

Module

↓

Engine Internals

Forbidden

Module

↓

Another Module

---

# Future

The Engine API must remain stable.

Everything else inside Kubine may change.

Modules should continue working without modification between engine versions whenever possible.
