import assert from "node:assert/strict";

import {
  ProviderRegistry,
} from "../registry/provider.registry.js";

console.log(
  "[Test] Starting ProviderRegistry test."
);

/*
 * ============================================================
 * CONSTRUCTOR
 * ============================================================
 */

const registry =
  new ProviderRegistry();

assert.equal(
  registry.size(),
  0,
  "Registry must start empty."
);

assert.equal(
  registry.isEmpty(),
  true,
  "Registry must report empty state."
);

console.log(
  "[Test] ✓ Initial registry state passed."
);

/*
 * ============================================================
 * REGISTRATION
 * ============================================================
 */

const runtimeProvider = {
  name: "runtime",
};

const configProvider = {
  name: "config",
};

registry.register(
  "runtime",
  runtimeProvider
);

registry.register(
  "config",
  configProvider
);

assert.equal(
  registry.size(),
  2,
  "Registry must contain registered providers."
);

assert.equal(
  registry.has("runtime"),
  true,
  "Registry must detect registered provider."
);

assert.equal(
  registry.get("runtime"),
  runtimeProvider,
  "Registry must return the original provider instance."
);

console.log(
  "[Test] ✓ Provider registration passed."
);

/*
 * ============================================================
 * CONSTRUCTOR REGISTRATION
 * ============================================================
 */

class DatabaseProvider {}

registry.register(
  "database",
  DatabaseProvider
);

assert.equal(
  registry.get("database"),
  DatabaseProvider,
  "Registry must preserve constructor definitions."
);

console.log(
  "[Test] ✓ Constructor registration passed."
);

/*
 * ============================================================
 * NAME VALIDATION
 * ============================================================
 */

assert.throws(
  () => registry.register(
    "",
    runtimeProvider
  ),
  /name/i,
  "Empty provider name must be rejected."
);

assert.throws(
  () => registry.register(
    "   ",
    runtimeProvider
  ),
  /name/i,
  "Whitespace-only provider name must be rejected."
);

assert.throws(
  () => registry.register(
    undefined,
    runtimeProvider
  ),
  /name/i,
  "Undefined provider name must be rejected."
);

assert.throws(
  () => registry.has(undefined),
  /name/i,
  "Invalid name must be rejected by has()."
);

assert.throws(
  () => registry.get(undefined),
  /name/i,
  "Invalid name must be rejected by get()."
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
  () => registry.register(
    "undefined",
    undefined
  ),
  /provider/i,
  "Undefined provider must be rejected."
);

assert.throws(
  () => registry.register(
    "null",
    null
  ),
  /provider/i,
  "Null provider must be rejected."
);

assert.throws(
  () => registry.register(
    "invalid",
    "provider"
  ),
  /provider/i,
  "Primitive provider value must be rejected."
);

assert.throws(
  () => registry.register(
    "invalid",
    123
  ),
  /provider/i,
  "Numeric provider value must be rejected."
);

assert.throws(
  () => registry.register(
    "invalid",
    true
  ),
  /provider/i,
  "Boolean provider value must be rejected."
);

console.log(
  "[Test] ✓ Provider value validation passed."
);

/*
 * ============================================================
 * DUPLICATE REGISTRATION
 * ============================================================
 */

assert.throws(
  () => registry.register(
    "runtime",
    {}
  ),
  /already registered|already/i,
  "Duplicate provider registration must be rejected."
);

console.log(
  "[Test] ✓ Duplicate registration guard passed."
);

/*
 * ============================================================
 * COLLECTION API
 * ============================================================
 */

assert.deepEqual(
  registry.list(),
  [
    "runtime",
    "config",
    "database",
  ],
  "list() must return provider names in registration order."
);

assert.deepEqual(
  registry.values(),
  [
    runtimeProvider,
    configProvider,
    DatabaseProvider,
  ],
  "values() must return registered provider definitions."
);

assert.deepEqual(
  registry.entries(),
  [
    ["runtime", runtimeProvider],
    ["config", configProvider],
    ["database", DatabaseProvider],
  ],
  "entries() must return provider definitions with names."
);

console.log(
  "[Test] ✓ Registry collection API passed."
);

/*
 * ============================================================
 * UNKNOWN PROVIDER
 * ============================================================
 */

assert.equal(
  registry.has("unknown"),
  false,
  "Unknown provider must not exist."
);

assert.equal(
  registry.get("unknown"),
  null,
  "Unknown provider lookup must return null."
);

console.log(
  "[Test] ✓ Unknown provider lookup passed."
);

/*
 * ============================================================
 * UNREGISTER
 * ============================================================
 */

registry.unregister("config");

assert.equal(
  registry.has("config"),
  false,
  "Provider must be removed after unregister()."
);

assert.equal(
  registry.get("config"),
  null,
  "Removed provider must no longer be retrievable."
);

assert.equal(
  registry.size(),
  2,
  "Registry size must decrease after unregister()."
);

assert.doesNotThrow(
  () => registry.unregister("unknown"),
  "Unregistering an unknown provider must be safe."
);

console.log(
  "[Test] ✓ Provider unregister passed."
);

/*
 * ============================================================
 * CHAINABLE API
 * ============================================================
 */

const chainRegistry =
  new ProviderRegistry();

assert.strictEqual(
  chainRegistry.register(
    "one",
    {}
  ),
  chainRegistry,
  "register() must return the registry instance."
);

assert.strictEqual(
  chainRegistry.unregister("one"),
  chainRegistry,
  "unregister() must return the registry instance."
);

assert.strictEqual(
  chainRegistry.clear(),
  chainRegistry,
  "clear() must return the registry instance."
);

console.log(
  "[Test] ✓ Chainable registry API passed."
);

/*
 * ============================================================
 * CLEAR
 * ============================================================
 */

registry.clear();

assert.equal(
  registry.size(),
  0,
  "clear() must remove all providers."
);

assert.equal(
  registry.isEmpty(),
  true,
  "Registry must be empty after clear()."
);

assert.deepEqual(
  registry.list(),
  [],
  "list() must be empty after clear()."
);

console.log(
  "[Test] ✓ Registry clear passed."
);

/*
 * ============================================================
 * FINAL INTEGRITY
 * ============================================================
 */

registry.register(
  "runtime",
  runtimeProvider
);

registry.register(
  "config",
  configProvider
);

assert.equal(
  registry.get("runtime"),
  runtimeProvider,
  "Registry must remain usable after clear()."
);

assert.equal(
  registry.get("config"),
  configProvider,
  "Registry must support new registrations after clear()."
);

console.log(
  "[Test] ✓ Registry integrity passed."
);

console.log(
  "[Test] ✓ ProviderRegistry test passed."
);