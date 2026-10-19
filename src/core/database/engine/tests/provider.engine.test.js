import assert from "node:assert/strict";

import providerEngine from "../provider.engine.js";

console.log(
  "[Test] Starting ProviderEngine test."
);

/*
 * ============================================================
 * TEST PROVIDERS
 * ============================================================
 */

class TestProvider {
  constructor(name = "test") {
    this.name = name;
  }
}

const provider =
  new TestProvider();

/*
 * ============================================================
 * CLEAN INITIAL STATE
 * ============================================================
 */

providerEngine.clear();

assert.deepEqual(
  providerEngine.list(),
  [],
  "ProviderEngine must start with an empty provider registry."
);

console.log(
  "[Test] ✓ Initial engine state passed."
);

/*
 * ============================================================
 * REGISTER
 * ============================================================
 */

const registerResult =
  providerEngine.register(
    "test",
    provider
  );

assert.strictEqual(
  registerResult,
  providerEngine,
  "register() must return the ProviderEngine instance."
);

assert.equal(
  providerEngine.has("test"),
  true,
  "Registered provider must be available through Engine."
);

assert.strictEqual(
  providerEngine.get("test"),
  provider,
  "Engine must return the registered provider."
);

console.log(
  "[Test] ✓ Provider registration passed."
);

/*
 * ============================================================
 * LIST
 * ============================================================
 */

assert.deepEqual(
  providerEngine.list(),
  ["test"],
  "Engine must expose registered provider names."
);

console.log(
  "[Test] ✓ Provider listing passed."
);

/*
 * ============================================================
 * UNREGISTER
 * ============================================================
 */

const unregisterResult =
  providerEngine.unregister(
    "test"
  );

assert.strictEqual(
  unregisterResult,
  providerEngine,
  "unregister() must return the ProviderEngine instance."
);

assert.equal(
  providerEngine.has("test"),
  false,
  "Unregistered provider must no longer exist."
);

assert.doesNotThrow(
  () => providerEngine.unregister("unknown"),
  "Unregistering an unknown provider must be safe."
);

console.log(
  "[Test] ✓ Provider unregister passed."
);

/*
 * ============================================================
 * MULTIPLE PROVIDERS
 * ============================================================
 */

const providerA =
  new TestProvider("a");

const providerB =
  new TestProvider("b");

providerEngine
  .register("providerA", providerA)
  .register("providerB", providerB);

assert.deepEqual(
  providerEngine.list(),
  [
    "providerA",
    "providerB",
  ],
  "Engine must manage multiple providers."
);

assert.strictEqual(
  providerEngine.get("providerA"),
  providerA,
  "Engine must resolve providerA."
);

assert.strictEqual(
  providerEngine.get("providerB"),
  providerB,
  "Engine must resolve providerB."
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
  providerEngine.clear();

assert.strictEqual(
  clearResult,
  providerEngine,
  "clear() must return the ProviderEngine instance."
);

assert.deepEqual(
  providerEngine.list(),
  [],
  "clear() must remove all providers."
);

console.log(
  "[Test] ✓ Provider engine clear passed."
);

/*
 * ============================================================
 * UNKNOWN PROVIDER
 * ============================================================
 */

assert.throws(
  () => providerEngine.get("unknown"),
  /not registered/i,
  "get() must reject unknown providers."
);

console.log(
  "[Test] ✓ Unknown provider guard passed."
);

/*
 * ============================================================
 * API INTEGRITY
 * ============================================================
 */

for (const method of [
  "register",
  "unregister",
  "has",
  "get",
  "list",
  "clear",
]) {
  assert.equal(
    typeof providerEngine[method],
    "function",
    `ProviderEngine must expose ${method}().`
  );
}

console.log(
  "[Test] ✓ ProviderEngine API integrity passed."
);

/*
 * ============================================================
 * FINAL STATE
 * ============================================================
 */

providerEngine.clear();

assert.deepEqual(
  providerEngine.list(),
  [],
  "ProviderEngine must finish with a clean registry."
);

console.log(
  "[Test] ✓ ProviderEngine test passed."
);