import assert from "node:assert/strict";

import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapPipeline,
} from "../pipeline/bootstrap.pipeline.js";

const events = [];

class TestStage extends BootstrapStage {
  constructor(name, { fail = false } = {}) {
    super(name);
    this.fail = fail;
  }

  async initialize() {
    events.push(`${this.name}:initialize`);

    if (this.fail) {
      throw new Error(
        `${this.name} initialization failed`
      );
    }
  }

  async rollback() {
    events.push(`${this.name}:rollback`);
  }
}

const runtime = new TestStage("runtime");

const config = new TestStage("config");

const database = new TestStage("database", {
  fail: true,
});

const pipeline = new BootstrapPipeline([
  runtime,
  config,
  database,
]);

const result = await pipeline.run();

console.log(
  "[Test] Bootstrap result:",
  result
);

console.log(
  "[Test] Lifecycle events:",
  events
);

const expected = [
  "runtime:initialize",
  "config:initialize",
  "database:initialize",
  "database:rollback",
  "config:rollback",
  "runtime:rollback",
];

const passed =
  JSON.stringify(events) ===
  JSON.stringify(expected);

if (!passed) {
  console.error(
    "[Test] ✗ Bootstrap pipeline test failed."
  );

  console.error(
    "[Test] Expected:",
    expected
  );

  console.error(
    "[Test] Received:",
    events
  );

  process.exit(1);
}

if (result.success !== false) {
  console.error(
    "[Test] ✗ Pipeline should report failure."
  );

  process.exit(1);
}

console.log(
  "[Test] ✓ Bootstrap pipeline test passed."
);

/*
 * ============================================================
 * BootstrapPipeline error preservation tests
 * ============================================================
 */

class CountingStage extends BootstrapStage {
  constructor(name, options = {}) {
    super(name);
    this.initCalls = 0;
    this.rollbackCalls = 0;
    this.failInit = options.failInit ?? false;
    this.failRollback = options.failRollback ?? false;
    this.initError = options.initError ?? new Error(`${name} initialization failed`);
    this.rollbackError = options.rollbackError ?? new Error(`${name} rollback failed`);
  }

  async initialize(context) {
    this.initCalls += 1;
    if (this.failInit) {
      throw this.initError;
    }
  }

  async rollback(context) {
    this.rollbackCalls += 1;
    if (this.failRollback) {
      throw this.rollbackError;
    }
  }
}

// Test 1: First-stage initialization failure with successful rollback.
{
  const runtime = new CountingStage("runtime", { failInit: true });
  const config = new CountingStage("config");
  const database = new CountingStage("database");

  const pipeline = new BootstrapPipeline([runtime, config, database]);
  const result = await pipeline.run();

  assert.equal(
    result.success,
    false,
    "Pipeline reports failure when first stage fails."
  );

  assert.equal(
    result.error.message,
    "runtime initialization failed",
    "Original error remains the primary error."
  );

  assert.equal(
    runtime.initCalls,
    1,
    "Failed stage ran initialize once."
  );

  assert.equal(
    runtime.rollbackCalls,
    1,
    "Failed stage ran rollback once."
  );

  assert.equal(
    config.initCalls,
    0,
    "Later stages did not run initialize."
  );

  console.log(
    "[Test] ✓ First-stage initialization failure with successful rollback."
  );
}

// Test 2: First-stage initialization failure with rollback failure.
{
  const runtime = new CountingStage("runtime", {
    failInit: true,
    failRollback: true,
  });
  const config = new CountingStage("config");
  const database = new CountingStage("database");

  const pipeline = new BootstrapPipeline([runtime, config, database]);
  const result = await pipeline.run();

  assert.equal(
    result.success,
    false,
    "Pipeline reports failure when first stage fails and rollback fails."
  );

  assert.equal(
    result.error.message,
    "runtime initialization failed",
    "Original error remains the primary error even when rollback fails."
  );

  assert.equal(
    result.originalError,
    result.error,
    "originalError is the same object as the primary error."
  );

  assert.ok(
    result.rollbackError,
    "Rollback error is available as secondary diagnostic information."
  );

  assert.ok(
    Array.isArray(result.rollbackErrors),
    "rollbackErrors array is available."
  );

  assert.equal(
    result.rollbackErrors.length,
    1,
    "One rollback error recorded."
  );

  assert.equal(
    result.rollbackErrors[0].stage,
    "runtime",
    "Rollback error identifies the failing stage."
  );

  assert.ok(
    result.rollbackError !== result.error,
    "Rollback error is a different object from the original error."
  );

  console.log(
    "[Test] ✓ First-stage initialization failure with rollback failure."
  );
}

// Test 3: Later-stage initialization failure with rollback failure.
{
  const runtime = new CountingStage("runtime");
  const config = new CountingStage("config", {
    failInit: true,
    failRollback: true,
  });
  const database = new CountingStage("database");

  const pipeline = new BootstrapPipeline([runtime, config, database]);
  const result = await pipeline.run();

  assert.equal(
    result.success,
    false,
    "Pipeline reports failure when a later stage fails."
  );

  assert.equal(
    result.error.message,
    "config initialization failed",
    "Original error from the failing stage remains primary."
  );

  assert.equal(
    runtime.initCalls,
    1,
    "Earlier stage ran initialize."
  );

  assert.equal(
    runtime.rollbackCalls,
    1,
    "Earlier stage ran rollback."
  );

  assert.equal(
    config.rollbackCalls,
    1,
    "Failed stage ran rollback."
  );

  assert.equal(
    database.initCalls,
    0,
    "Later stage did not run initialize."
  );

  assert.ok(
    result.rollbackError,
    "Rollback error is available as secondary diagnostic information."
  );

  assert.notEqual(
    result.rollbackError,
    result.error,
    "Rollback error does not replace the original error."
  );

  console.log(
    "[Test] ✓ Later-stage initialization failure with rollback failure."
  );
}

// Test 4: Original error identity remains accessible through engine.
{
  const originalError = new Error("database initialization failed");
  const runtime = new CountingStage("runtime");
  const config = new CountingStage("config");
  const database = new CountingStage("database", {
    failInit: true,
    initError: originalError,
    failRollback: true,
  });

  const pipeline = new BootstrapPipeline([runtime, config, database]);
  const result = await pipeline.run();

  assert.equal(
    result.error,
    originalError,
    "Original error object identity is preserved."
  );

  assert.equal(
    result.error.message,
    "database initialization failed",
    "Original error message is accessible."
  );

  assert.ok(
    result.rollbackError,
    "Rollback error is available without replacing the original."
  );

  console.log(
    "[Test] ✓ Original error identity/message remains accessible."
  );
}

// Test 5: Successful rollback does not produce rollbackError field.
{
  const runtime = new CountingStage("runtime", { failInit: true });
  const config = new CountingStage("config");

  const pipeline = new BootstrapPipeline([runtime, config]);
  const result = await pipeline.run();

  assert.equal(
    result.error.message,
    "runtime initialization failed",
    "Original error is primary."
  );

  assert.equal(
    result.rollbackError,
    undefined,
    "No rollbackError when rollback succeeds."
  );

  console.log(
    "[Test] ✓ Successful rollback does not produce rollbackError field."
  );
}
