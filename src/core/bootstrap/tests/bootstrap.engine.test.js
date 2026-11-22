import assert from "node:assert/strict";

import {
BootstrapEngine,
} from "../engine/bootstrap.engine.js";

import {
BootstrapContext,
} from "../context/bootstrap.context.js";

const expectedStages = [
"runtime",
"config",
"providers",
"database",
"modules",
"theme",
"router",
"auth",
];

const engine = new BootstrapEngine();

const context = new BootstrapContext();

console.log("[Test] Starting BootstrapEngine integration test.");

const result = await engine.initialize(context);

console.log(
"[Test] BootstrapEngine result:",
result
);

assert.equal(
result.initialized,
true,
"BootstrapEngine should initialize successfully."
);

assert.deepEqual(
result.stages,
expectedStages,
"BootstrapEngine should initialize stages in the resolved order."
);

const state = engine.getState();

console.log(
"[Test] BootstrapEngine state:",
state
);

assert.equal(
state.initialized,
true,
"BootstrapEngine state should report initialized=true."
);

assert.deepEqual(
state.stages,
expectedStages,
"BootstrapEngine state should expose all registered stages."
);

const expectedContextKeys = [
"runtime",
"config",
"providers",
"database",
"modules",
"theme",
"router",
"auth",
];

assert.deepEqual(
context.getKeys(),
expectedContextKeys,
"BootstrapContext should contain the result of every initialized stage."
);

for (const stageName of expectedContextKeys) {
assert.equal(
context.has(stageName),
true,
`BootstrapContext should contain "${stageName}".`
);

const value = context.get(stageName);

assert.equal(
value.name,
stageName,
`BootstrapContext value for "${stageName}" should expose the correct stage name.`
);

assert.ok(
value.initializedAt,
`BootstrapContext value for "${stageName}" should contain initializedAt.`
);
}

console.log(
"[Test] ✓ All bootstrap stages initialized and registered in context."
);

await engine.shutdown(context);

const shutdownState = engine.getState();

console.log(
"[Test] BootstrapEngine shutdown state:",
shutdownState
);

assert.equal(
shutdownState.initialized,
false,
"BootstrapEngine should report initialized=false after shutdown."
);

assert.deepEqual(
context.getKeys(),
[],
"BootstrapContext should be empty after complete engine shutdown."
);

console.log(
  "[Test] ✓ BootstrapContext completely rolled back."
);

console.log(
  "[Test] ✓ BootstrapEngine integration test passed."
);

/*
 * ============================================================
 * BootstrapEngine context contract tests
 * ============================================================
 */

{
  const context = new BootstrapContext();
  const engine = new BootstrapEngine();

  await engine.initialize(context);

  assert.equal(
    engine.context,
    context,
    "initialize(existingContext) reuses the exact supplied instance."
  );

  assert.ok(
    engine.context instanceof BootstrapContext,
    "Stored context is a BootstrapContext instance."
  );

  await engine.shutdown(context);
  console.log("[Test] ✓ initialize(existingContext) reuses the exact instance.");
}

{
  const engine = new BootstrapEngine();
  await engine.initialize();

  assert.ok(
    engine.context instanceof BootstrapContext,
    "initialize() creates a new BootstrapContext."
  );

  assert.ok(
    engine.context !== null,
    "Created context is not null."
  );

  await engine.shutdown(engine.context);
  console.log("[Test] ✓ initialize() creates a new BootstrapContext.");
}

{
  const engine = new BootstrapEngine();
  await engine.initialize(null);

  assert.ok(
    engine.context instanceof BootstrapContext,
    "initialize(null) creates a new BootstrapContext."
  );

  assert.ok(
    engine.context !== null,
    "Created context is not null."
  );

  await engine.shutdown(engine.context);
  console.log("[Test] ✓ initialize(null) creates a new BootstrapContext.");
}

{
  const engine = new BootstrapEngine();
  let threw = false;

  try {
    await engine.initialize({});
  } catch (error) {
    threw = true;

    assert.ok(
      error instanceof TypeError,
      "initialize({}) throws a TypeError."
    );

    assert.ok(
      error.message.includes("BootstrapContext"),
      "TypeError message references BootstrapContext."
    );
  }

  assert.equal(
    threw,
    true,
    "initialize({}) throws before any stage executes."
  );

  assert.equal(
    engine.state,
    "idle",
    "Engine state remains idle after rejected initialize({})."
  );

  console.log("[Test] ✓ initialize({}) rejects before any stage executes.");
}

{
  const engine = new BootstrapEngine();
  const unsupported = ["string", 42, true, undefined, null];

  // null is explicitly supported
  for (const value of ["string", 42, true]) {
    let threw = false;

    try {
      await engine.initialize(value);
    } catch (error) {
      threw = true;
      assert.ok(
        error instanceof TypeError,
        `initialize(${typeof value}) throws a TypeError.`
      );
    }

    assert.equal(
      threw,
      true,
      `initialize(${typeof value}) rejects unsupported primitive input.`
    );
  }

  console.log("[Test] ✓ Unsupported primitive inputs reject clearly.");
}

{
  const engine = new BootstrapEngine();

  // First attempt: fail at runtime stage by passing a plain object
  // (this throws before any stage, so engine stays idle/failed state)
  try {
    await engine.initialize({});
  } catch {
    // expected
  }

  assert.equal(
    engine.state,
    "idle",
    "Engine remains idle after rejected initialize({})."
  );

  // Second attempt: succeed with no argument → fresh context, not reused
  await engine.initialize();

  const secondContext = engine.context;

  assert.ok(
    secondContext instanceof BootstrapContext,
    "Reinitialization after failure creates a new BootstrapContext."
  );

  await engine.shutdown(secondContext);
  console.log("[Test] ✓ Reinitialization does not reuse context from a previous failed attempt.");
}

