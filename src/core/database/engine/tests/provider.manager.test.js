import assert from "node:assert/strict";

import {
  providerManager,
} from "../manager/provider.manager.js";

import {
  providerRegistry,
} from "../registry/provider.registry.js";

console.log("[Test] Starting ProviderManager test.");

/*
 * ============================================================
 * TEST SETUP
 * ============================================================
 */

providerManager.clear();

class TestProvider {
  constructor() {
    this.created = true;
  }

  connect() {}

  disconnect() {}

  health() {}

  createTable() {}

  updateTable() {}

  deleteTable() {}

  insert() {}

  update() {}

  delete() {}

  select() {}

  transaction() {}
}

let constructorCalls = 0;

class CountingProvider {
  constructor() {
    constructorCalls += 1;
    this.created = true;
  }

  connect() {}

  disconnect() {}

  health() {}

  createTable() {}

  updateTable() {}

  deleteTable() {}

  insert() {}

  update() {}

  delete() {}

  select() {}

  transaction() {}
}

/*
 * ============================================================
 * REGISTER INSTANCE
 * ============================================================
 */

const instance =
  new TestProvider();

const registerResult =
  providerManager.register(
    "test",
    instance
  );

assert.strictEqual(
  registerResult,
  providerManager,
  "register() must return the ProviderManager instance."
);

assert.equal(
  providerManager.has("test"),
  true,
  "Registered provider must be discoverable."
);

assert.deepEqual(
  providerManager.list(),
  ["test"],
  "Provider must appear in the registry."
);

assert.strictEqual(
  providerRegistry.get("test"),
  instance,
  "Registry must contain the exact registered provider."
);

console.log(
  "[Test] ✓ Provider instance registration passed."
);

/*
 * ============================================================
 * GET EXISTING INSTANCE
 * ============================================================
 */

const resolvedInstance =
  providerManager.get("test");

assert.strictEqual(
  resolvedInstance,
  instance,
  "get() must return the registered provider instance."
);

console.log(
  "[Test] ✓ Existing provider resolution passed."
);

/*
 * ============================================================
 * CONSTRUCTOR REGISTRATION
 * ============================================================
 */

providerManager.clear();
constructorCalls = 0;

providerManager.register(
  "counting",
  CountingProvider
);

assert.equal(
  providerManager.has("counting"),
  true,
  "Constructor-based provider must be registered."
);

assert.equal(
  constructorCalls,
  0,
  "Provider constructor must not execute during registration."
);

console.log(
  "[Test] ✓ Constructor registration is lazy."
);

/*
 * ============================================================
 * LAZY CONSTRUCTION
 * ============================================================
 */

const firstResolved =
  providerManager.get("counting");

assert.ok(
  firstResolved instanceof CountingProvider,
  "get() must create an instance from a registered constructor."
);

assert.equal(
  constructorCalls,
  1,
  "Provider constructor must execute exactly once on first resolution."
);

console.log(
  "[Test] ✓ Lazy provider construction passed."
);

/*
 * ============================================================
 * INSTANCE CACHING
 * ============================================================
 */

const secondResolved =
  providerManager.get("counting");

assert.strictEqual(
  secondResolved,
  firstResolved,
  "Repeated get() must return the same provider instance."
);

assert.equal(
  constructorCalls,
  1,
  "Repeated get() must not create another provider instance."
);

assert.strictEqual(
  providerRegistry.get("counting"),
  CountingProvider,
  "Registry must retain the constructor definition after lazy resolution."
);

assert.strictEqual(
  providerManager.get("counting"),
  firstResolved,
  "Manager must return the same cached instance from its own cache."
);

console.log(
  "[Test] ✓ Provider instance caching passed."
);

/*
 * ============================================================
 * UNKNOWN PROVIDER
 * ============================================================
 */

assert.throws(
  () => providerManager.get("unknown"),
  /Database provider "unknown" is not registered/i,
  "get() must reject unknown providers."
);

console.log(
  "[Test] ✓ Unknown provider guard passed."
);

/*
 * ============================================================
 * PROVIDER NAME VALIDATION
 * ============================================================
 */

assert.throws(
  () => providerManager.register(),
  /name/i,
  "register() must reject an undefined provider name."
);

assert.throws(
  () => providerManager.register("", instance),
  /name/i,
  "register() must reject an empty provider name."
);

assert.throws(
  () => providerManager.register("   ", instance),
  /name/i,
  "register() must reject a whitespace-only provider name."
);

console.log(
  "[Test] ✓ Provider name validation passed."
);

/*
 * ============================================================
 * PROVIDER VALIDATION
 * ============================================================
 */

assert.throws(
  () => providerManager.register("invalid", null),
  /provider/i,
  "register() must reject an undefined provider."
);

assert.throws(
  () => providerManager.register("invalid", 123),
  /provider/i,
  "register() must reject an invalid provider value."
);

console.log(
  "[Test] ✓ Provider value validation passed."
);

/*
 * ============================================================
 * DUPLICATE REGISTRATION
 * ============================================================
 */

providerManager.clear();

providerManager.register(
  "duplicate",
  instance
);

assert.throws(
  () =>
    providerManager.register(
      "duplicate",
      new TestProvider()
    ),
  /already|registered|exists/i,
  "Duplicate provider registration must be rejected."
);

console.log(
  "[Test] ✓ Duplicate registration guard passed."
);

/*
 * ============================================================
 * UNREGISTER
 * ============================================================
 */

assert.equal(
  providerManager.has("duplicate"),
  true,
  "Provider must exist before unregister()."
);

const unregisterResult =
  providerManager.unregister(
    "duplicate"
  );

assert.strictEqual(
  unregisterResult,
  providerManager,
  "unregister() must return the ProviderManager instance."
);

assert.equal(
  providerManager.has("duplicate"),
  false,
  "Provider must no longer exist after unregister()."
);

assert.deepEqual(
  providerManager.list(),
  [],
  "Registry must be empty after unregister()."
);

console.log(
  "[Test] ✓ Provider unregister passed."
);

/*
 * ============================================================
 * UNREGISTER UNKNOWN PROVIDER
 * ============================================================
 */

assert.doesNotThrow(
  () =>
    providerManager.unregister(
      "unknown"
    ),
  "Unregistering an unknown provider must be safe."
);

console.log(
  "[Test] ✓ Unknown provider unregister is safe."
);

/*
 * ============================================================
 * VALIDATION FAILURE DOES NOT CACHE INSTANCE
 * ============================================================
 */

class InvalidProvider {
  constructor() {
    this.name = "invalid";
  }
  // Missing required methods: connect, disconnect, health, etc.
}

providerManager.register("invalid-lazy", InvalidProvider);

assert.throws(
  () => providerManager.get("invalid-lazy"),
  /missing required core method/,
  "get() must reject invalid provider created from constructor."
);

// The invalid instance must not be cached: constructor must run again
assert.throws(
  () => providerManager.get("invalid-lazy"),
  /missing required core method/,
  "get() must not cache an invalid instance; retry must re-attempt construction."
);

assert.equal(
  providerManager.has("invalid-lazy"),
  true,
  "Provider definition must remain registered even though instance is invalid."
);

console.log(
  "[Test] ✓ Validation failure does not cache invalid instance."
);

/*
 * ============================================================
 * FACTORY FAILURE DOES NOT CACHE PARTIAL INSTANCE
 * ============================================================
 */

class FailingProvider {
  constructor() {
    throw new Error("factory construction failed");
  }
}

providerManager.register("failing", FailingProvider);

assert.throws(
  () => providerManager.get("failing"),
  /factory construction failed/,
  "get() must propagate factory construction errors."
);

// The failed instance must not be cached: retry must re-attempt construction
assert.throws(
  () => providerManager.get("failing"),
  /factory construction failed/,
  "get() must not cache a partially created instance; retry must re-attempt."
);

assert.equal(
  providerManager.has("failing"),
  true,
  "Provider definition must remain registered even though factory failed."
);

console.log(
  "[Test] ✓ Factory failure does not cache partial instance."
);

/*
 * ============================================================
 * RE-REGISTER AFTER UNREGISTER
 * ============================================================
 */

providerManager.register("re-register", instance);

assert.equal(
  providerManager.has("re-register"),
  true,
  "Provider must exist before unregister()."
);

const reUnregisterResult =
  providerManager.unregister(
    "re-register"
  );

assert.strictEqual(
  reUnregisterResult,
  providerManager,
  "unregister() must return the ProviderManager instance."
);

assert.equal(
  providerManager.has("re-register"),
  false,
  "Provider must no longer exist after unregister()."
);

// Re-registering after unregister must work
providerManager.register(
  "re-register",
  new TestProvider()
);

assert.equal(
  providerManager.has("re-register"),
  true,
  "Provider must be re-registerable after unregister()."
);

assert.strictEqual(
  providerManager.get("re-register") instanceof TestProvider,
  true,
  "Re-registered provider must be resolvable."
);

console.log(
  "[Test] ✓ Re-register after unregister works."
);

/*
 * ============================================================
 * MULTIPLE PROVIDERS
 * ============================================================
 */

providerManager.clear();

providerManager.register(
  "first",
  new TestProvider()
);

providerManager.register(
  "second",
  new TestProvider()
);

providerManager.register(
  "third",
  TestProvider
);

assert.deepEqual(
  providerManager.list(),
  [
    "first",
    "second",
    "third",
  ],
  "Manager must preserve registered provider names."
);

assert.equal(
  providerManager.has("first"),
  true
);

assert.equal(
  providerManager.has("second"),
  true
);

assert.equal(
  providerManager.has("third"),
  true
);

console.log(
  "[Test] ✓ Multiple provider management passed."
);

/*
 * ============================================================
 * CLEAR
 * ============================================================
 */

const clearResult =
  providerManager.clear();

assert.strictEqual(
  clearResult,
  providerManager,
  "clear() must return the ProviderManager instance."
);

assert.deepEqual(
  providerManager.list(),
  [],
  "clear() must remove all providers."
);

assert.equal(
  providerManager.has("first"),
  false
);

assert.equal(
  providerManager.has("second"),
  false
);

assert.equal(
  providerManager.has("third"),
  false
);

console.log(
  "[Test] ✓ Provider manager clear passed."
);

/*
 * ============================================================
 * REGISTRY INTEGRITY
 * ============================================================
 */

assert.deepEqual(
  providerRegistry.list(),
  [],
  "ProviderManager and ProviderRegistry must remain synchronized."
);

console.log(
  "[Test] ✓ Registry integrity passed."
);

/*
 * ============================================================
 * FINAL STATE
 * ============================================================
 */

providerManager.clear();

console.log(
  "[Test] ✓ ProviderManager test passed."
);