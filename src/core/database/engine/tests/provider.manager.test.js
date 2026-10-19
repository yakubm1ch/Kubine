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
}

let constructorCalls = 0;

class CountingProvider {
  constructor() {
    constructorCalls += 1;
    this.created = true;
  }
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
  firstResolved,
  "Resolved provider instance must replace its constructor in the registry."
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
 * MULTIPLE PROVIDERS
 * ============================================================
 */

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