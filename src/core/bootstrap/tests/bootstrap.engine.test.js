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
