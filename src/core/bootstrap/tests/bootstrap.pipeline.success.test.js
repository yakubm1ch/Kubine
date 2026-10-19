import {
  BootstrapStage,
  BootstrapStageState,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapPipeline,
} from "../pipeline/bootstrap.pipeline.js";

const events = [];

class TestStage extends BootstrapStage {
  async initialize() {
    events.push(`${this.name}:initialize`);
  }

  async rollback() {
    events.push(`${this.name}:rollback`);
  }
}

const runtime = new TestStage("runtime");
const config = new TestStage("config");
const database = new TestStage("database");

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
  "[Test] Pipeline state:",
  pipeline.state
);

console.log(
  "[Test] Lifecycle events:",
  events
);

const expectedEvents = [
  "runtime:initialize",
  "config:initialize",
  "database:initialize",
];

const eventsPassed =
  JSON.stringify(events) ===
  JSON.stringify(expectedEvents);

if (!eventsPassed) {
  console.error(
    "[Test] ✗ Unexpected lifecycle events."
  );

  console.error(
    "[Test] Expected:",
    expectedEvents
  );

  console.error(
    "[Test] Received:",
    events
  );

  process.exit(1);
}

if (result.success !== true) {
  console.error(
    "[Test] ✗ Pipeline should complete successfully."
  );

  process.exit(1);
}

if (pipeline.state !== "ready") {
  console.error(
    `[Test] ✗ Expected pipeline state "ready", received "${pipeline.state}".`
  );

  process.exit(1);
}

if (!pipeline.isReady()) {
  console.error(
    "[Test] ✗ Pipeline isReady() should return true."
  );

  process.exit(1);
}

for (const stage of [
  runtime,
  config,
  database,
]) {
  if (stage.state !== BootstrapStageState.READY) {
    console.error(
      `[Test] ✗ Stage "${stage.name}" is not READY.`
    );

    process.exit(1);
  }
}

if (
  pipeline.getCompletedStages().length !== 3
) {
  console.error(
    "[Test] ✗ All initialized stages should be completed."
  );

  process.exit(1);
}

let secondRunFailed = false;

try {
  await pipeline.run();
} catch (error) {
  secondRunFailed = true;

  console.log(
    "[Test] ✓ Second run correctly rejected:",
    error.message
  );
}

if (!secondRunFailed) {
  console.error(
    "[Test] ✗ Pipeline allowed a second run."
  );

  process.exit(1);
}

console.log(
  "[Test] ✓ Bootstrap pipeline success test passed."
);