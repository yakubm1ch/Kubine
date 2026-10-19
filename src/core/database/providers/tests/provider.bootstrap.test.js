import assert from "node:assert/strict";

import ProviderBootstrap from "../provider.bootstrap.js";

const lifecycle = [];

class TestProvider {
  constructor(name) {
    this.name = name;
  }
}

class TestManager {
  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    lifecycle.push(`${name}:register`);
    this.providers.set(name, provider);
    return this;
  }

  unregister(name) {
    lifecycle.push(`${name}:unregister`);
    this.providers.delete(name);
    return this;
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

console.log("[Test] Starting ProviderBootstrap test.");

/*
 * ============================================================
 * CONSTRUCTOR
 * ============================================================
 */

const manager = new TestManager();

const runtimeProvider =
  new TestProvider("runtime");

const databaseProvider =
  new TestProvider("database");

const bootstrap =
  new ProviderBootstrap({
    manager,
    providers: {
      runtime: runtimeProvider,
      database: databaseProvider,
    },
  });

assert.equal(
  bootstrap.isIdle(),
  true,
  "ProviderBootstrap must start in idle state."
);

assert.deepEqual(
  bootstrap.list(),
  [
    "runtime",
    "database",
  ],
  "Provider definitions must be registered in bootstrap."
);

console.log(
  "[Test] ✓ Constructor and provider definitions passed."
);

/*
 * ============================================================
 * PROVIDER API
 * ============================================================
 */

assert.equal(
  bootstrap.has("runtime"),
  true,
  "Bootstrap must detect existing provider definitions."
);

assert.equal(
  bootstrap.get("runtime"),
  runtimeProvider,
  "Bootstrap must return the registered provider definition."
);

assert.equal(
  bootstrap.has("unknown"),
  false,
  "Bootstrap must report unknown provider definitions."
);

assert.equal(
  bootstrap.get("unknown"),
  null,
  "Unknown provider lookup must return null."
);

console.log(
  "[Test] ✓ Provider definition API passed."
);

/*
 * ============================================================
 * PROVIDER VALIDATION
 * ============================================================
 */

assert.throws(
  () => bootstrap.add("", runtimeProvider),
  /name/i,
  "Provider name must be validated."
);

assert.throws(
  () => bootstrap.add("invalid", null),
  /provider/i,
  "Provider value must be validated."
);

assert.throws(
  () => bootstrap.add("runtime", runtimeProvider),
  /already defined|already/i,
  "Duplicate provider definition must be rejected."
);

console.log(
  "[Test] ✓ Provider definition validation passed."
);

/*
 * ============================================================
 * INITIALIZATION
 * ============================================================
 */

const result =
  await bootstrap.initialize();

assert.equal(
  result.success,
  true,
  "Provider bootstrap must initialize successfully."
);

assert.equal(
  bootstrap.isReady(),
  true,
  "ProviderBootstrap must enter ready state."
);

assert.deepEqual(
  manager.list(),
  [
    "runtime",
    "database",
  ],
  "All providers must be registered in the manager."
);

assert.deepEqual(
  bootstrap.getState().registeredProviders,
  [
    "runtime",
    "database",
  ],
  "Bootstrap must track registered providers."
);

console.log(
  "[Test] ✓ Provider initialization passed."
);

/*
 * ============================================================
 * INITIALIZATION GUARD
 * ============================================================
 */

await assert.rejects(
  () => bootstrap.initialize(),
  /cannot initialize|state/i,
  "Second initialization while ready must be rejected."
);

console.log(
  "[Test] ✓ Initialization state guard passed."
);

/*
 * ============================================================
 * SHUTDOWN / ROLLBACK
 * ============================================================
 */

await bootstrap.shutdown();

assert.equal(
  bootstrap.isRolledBack(),
  true,
  "Shutdown must leave bootstrap in rolled_back state."
);

assert.deepEqual(
  manager.list(),
  [],
  "All providers must be unregistered after shutdown."
);

assert.deepEqual(
  bootstrap.getState().registeredProviders,
  [],
  "Registered provider tracking must be cleared."
);

console.log(
  "[Test] ✓ Shutdown and rollback passed."
);

/*
 * ============================================================
 * REINITIALIZATION
 * ============================================================
 */

await bootstrap.initialize();

assert.equal(
  bootstrap.isReady(),
  true,
  "Bootstrap must support initialization after rollback."
);

assert.deepEqual(
  manager.list(),
  [
    "runtime",
    "database",
  ],
  "Providers must be registered again after reinitialization."
);

console.log(
  "[Test] ✓ Reinitialization passed."
);

await bootstrap.shutdown();

assert.equal(
  bootstrap.isRolledBack(),
  true,
  "Second shutdown must complete successfully."
);

console.log(
  "[Test] ✓ Second shutdown passed."
);

/*
 * ============================================================
 * FAILURE + AUTOMATIC ROLLBACK
 * ============================================================
 */

const failureLifecycle = [];

class FailingManager {
  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    failureLifecycle.push(`${name}:register`);

    if (name === "database") {
      throw new Error(
        "database provider initialization failed"
      );
    }

    this.providers.set(name, provider);
  }

  unregister(name) {
    failureLifecycle.push(`${name}:unregister`);
    this.providers.delete(name);
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

const failingManager =
  new FailingManager();

const failingBootstrap =
  new ProviderBootstrap({
    manager: failingManager,
    providers: {
      runtime: new TestProvider("runtime"),
      database: new TestProvider("database"),
    },
  });

await assert.rejects(
  () => failingBootstrap.initialize(),
  /database provider initialization failed/,
  "Failed provider initialization must reject."
);

assert.equal(
  failingBootstrap.isFailed() ||
  failingBootstrap.isRolledBack(),
  true,
  "Failed bootstrap must enter a failure/rollback state."
);

assert.deepEqual(
  failingManager.list(),
  [],
  "Previously registered providers must be rolled back after failure."
);

assert.deepEqual(
  failureLifecycle,
  [
    "runtime:register",
    "database:register",
    "runtime:unregister",
  ],
  "Failed initialization must rollback previously registered providers in reverse order."
);

console.log(
  "[Test] ✓ Failed initialization and automatic rollback passed."
);

/*
 * ============================================================
 * LIFECYCLE ORDER
 * ============================================================
 */

assert.deepEqual(
  lifecycle,
  [
    "runtime:register",
    "database:register",

    "database:unregister",
    "runtime:unregister",

    "runtime:register",
    "database:register",

    "database:unregister",
    "runtime:unregister",
  ],
  "Provider lifecycle order must be deterministic."
);

console.log(
  "[Test] ✓ Provider lifecycle ordering passed."
);

/*
 * ============================================================
 * FINAL STATE
 * ============================================================
 */

assert.equal(
  bootstrap.isRolledBack(),
  true,
  "Bootstrap must finish in rolled_back state."
);

console.log(
  "[Test] ✓ ProviderBootstrap test passed."
);