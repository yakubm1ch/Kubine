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