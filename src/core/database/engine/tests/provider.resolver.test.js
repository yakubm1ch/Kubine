import assert from "node:assert/strict";

import ProviderResolver from "../resolver/provider.resolver.js";

class TestProvider {
  constructor(name) {
    this.name = name;
  }
}

class TestRegistry {
  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    this.providers.set(name, provider);
  }

  has(name) {
    return this.providers.has(name);
  }

  get(name) {
    return this.providers.get(name);
  }

  list() {
    return [...this.providers.keys()];
  }
}

class TestFactory {
  constructor() {
    this.created = [];
  }

  create(registration) {
    if (typeof registration === "function") {
      const instance = new registration("created");
      this.created.push(instance);
      return instance;
    }

    return registration;
  }
}

console.log(
  "[Test] Starting ProviderResolver test."
);

const registry = new TestRegistry();
const factory = new TestFactory();

const existingProvider = new TestProvider("existing");

registry.register(
  "existing",
  existingProvider
);

registry.register(
  "classProvider",
  TestProvider
);

const resolver = new ProviderResolver(
  registry,
  factory
);

/*
 * ============================================================
 * CONSTRUCTOR VALIDATION
 * ============================================================
 */

assert.throws(
  () => new ProviderResolver(),
  /registry/i,
  "Resolver must reject a missing registry."
);

assert.throws(
  () => new ProviderResolver(registry),
  /factory/i,
  "Resolver must reject a missing factory."
);

console.log(
  "[Test] ✓ Constructor validation passed."
);

/*
 * ============================================================
 * SINGLE PROVIDER RESOLUTION
 * ============================================================
 */

const resolvedExisting =
  resolver.resolve("existing");

assert.equal(
  resolvedExisting,
  existingProvider,
  "Resolver must return an already-created provider instance."
);

console.log(
  "[Test] ✓ Existing provider resolution passed."
);

/*
 * ============================================================
 * CONSTRUCTOR RESOLUTION
 * ============================================================
 */

const resolvedClass =
  resolver.resolve("classProvider");

assert.ok(
  resolvedClass instanceof TestProvider,
  "Resolver must resolve provider constructors through the factory."
);

assert.equal(
  resolvedClass.name,
  "created",
  "Factory-created provider must receive the expected construction arguments."
);

assert.equal(
  factory.created.length,
  1,
  "Factory must be called exactly once for the constructor registration."
);

console.log(
  "[Test] ✓ Constructor-based provider resolution passed."
);

/*
 * ============================================================
 * UNKNOWN PROVIDER
 * ============================================================
 */

assert.throws(
  () => resolver.resolve("missing"),
  /not registered/i,
  "Resolver must reject unknown providers."
);

console.log(
  "[Test] ✓ Unknown provider guard passed."
);

/*
 * ============================================================
 * INVALID PROVIDER NAME
 * ============================================================
 */

assert.throws(
  () => resolver.resolve(),
  /provider name/i,
  "Resolver must reject an undefined provider name."
);

assert.throws(
  () => resolver.resolve(""),
  /provider name/i,
  "Resolver must reject an empty provider name."
);

assert.throws(
  () => resolver.resolve(123),
  /provider name/i,
  "Resolver must reject a non-string provider name."
);

console.log(
  "[Test] ✓ Provider name validation passed."
);

/*
 * ============================================================
 * RESOLVE ALL
 * ============================================================
 */

const resolvedAll =
  resolver.resolveAll();

assert.ok(
  resolvedAll instanceof Map,
  "resolveAll() must return a Map."
);

assert.deepEqual(
  [...resolvedAll.keys()],
  [
    "existing",
    "classProvider",
  ],
  "resolveAll() must resolve every registered provider."
);

assert.equal(
  resolvedAll.get("existing"),
  existingProvider,
  "resolveAll() must preserve existing provider instances."
);

assert.ok(
  resolvedAll.get("classProvider") instanceof TestProvider,
  "resolveAll() must instantiate constructor registrations."
);

console.log(
  "[Test] ✓ resolveAll() passed."
);

/*
 * ============================================================
 * REGISTRY INTEGRITY
 * ============================================================
 */

assert.deepEqual(
  registry.list(),
  [
    "existing",
    "classProvider",
  ],
  "Resolver must not modify the registry."
);

assert.equal(
  registry.get("existing"),
  existingProvider,
  "Resolver must not replace existing registrations."
);

assert.equal(
  registry.get("classProvider"),
  TestProvider,
  "Resolver must not replace constructor registrations."
);

console.log(
  "[Test] ✓ Registry integrity passed."
);

console.log(
  "[Test] ✓ ProviderResolver test passed."
);