import assert from "node:assert/strict";

import {
  providerFactory,
} from "../factory/provider.factory.js";

console.log("[Test] Starting ProviderFactory test.");

/*
 * ============================================================
 * TEST PROVIDERS
 * ============================================================
 */

class TestProvider {
  constructor() {
    this.created = true;
  }
}

class ConfigurableProvider {
  constructor(options = {}) {
    this.options = options;
  }
}

class FailingProvider {
  constructor() {
    throw new Error("provider construction failed");
  }
}

/*
 * ============================================================
 * INVALID INPUT
 * ============================================================
 */

assert.throws(
  () => providerFactory.create(),
  /Provider is not defined/i,
  "Factory must reject undefined provider."
);

console.log(
  "[Test] ✓ Undefined provider guard passed."
);

assert.throws(
  () => providerFactory.create(null),
  /Provider is not defined/i,
  "Factory must reject null provider."
);

console.log(
  "[Test] ✓ Null provider guard passed."
);

/*
 * ============================================================
 * CONSTRUCTOR PROVIDER
 * ============================================================
 */

const provider =
  providerFactory.create(TestProvider);

assert.ok(
  provider instanceof TestProvider,
  "Factory must create an instance from a provider constructor."
);

assert.equal(
  provider.created,
  true,
  "Created provider instance must preserve constructor state."
);

console.log(
  "[Test] ✓ Constructor-based provider creation passed."
);

/*
 * ============================================================
 * EXISTING INSTANCE
 * ============================================================
 */

const existingProvider =
  new TestProvider();

const resolvedProvider =
  providerFactory.create(existingProvider);

assert.strictEqual(
  resolvedProvider,
  existingProvider,
  "Factory must preserve an already-created provider instance."
);

console.log(
  "[Test] ✓ Existing provider instance preservation passed."
);

/*
 * ============================================================
 * CONSTRUCTOR OPTIONS
 * ============================================================
 *
 * The current factory API does not yet define constructor
 * arguments. This test intentionally documents the desired
 * future behavior without assuming it exists yet.
 *
 * We will enable this assertion when the factory contract
 * explicitly supports options.
 * ============================================================
 */

const configurableProvider =
  providerFactory.create(ConfigurableProvider);

assert.ok(
  configurableProvider instanceof ConfigurableProvider,
  "Factory must create configurable provider instances."
);

assert.deepEqual(
  configurableProvider.options,
  {},
  "Factory must create providers with the default constructor state."
);

console.log(
  "[Test] ✓ Default constructor behavior passed."
);

/*
 * ============================================================
 * CONSTRUCTOR FAILURE
 * ============================================================
 */

assert.throws(
  () => providerFactory.create(FailingProvider),
  /provider construction failed/i,
  "Factory must propagate provider constructor errors."
);

console.log(
  "[Test] ✓ Constructor failure propagation passed."
);

/*
 * ============================================================
 * FACTORY INSTANCE INTEGRITY
 * ============================================================
 */

assert.equal(
  typeof providerFactory.create,
  "function",
  "ProviderFactory must expose create()."
);

console.log(
  "[Test] ✓ Factory API integrity passed."
);

console.log(
  "[Test] ✓ ProviderFactory test passed."
);