import assert from "node:assert/strict";

import { createLogger } from "../logger.js";
import {
  ConsoleTransport,
} from "../transports/console.transport.js";
import {
  serializeContext,
  serializeError,
  redactObject,
} from "../error-serializer.js";

/*
 * Helper: capture transport that records entries.
 */

class CaptureTransport {
  constructor() {
    this.entries = [];
    this.fail = false;
    this.failOn = null;
  }

  log(entry) {
    if (this.fail) {
      const target = this.failOn ?? entry.level;
      if (entry.level === target) {
        throw new Error(`Transport failure on ${entry.level}`);
      }
    }

    this.entries.push(entry);
  }
}

function captureConsole() {
  const originalConsole = { ...globalThis.console };
  const captured = {
    debug: [],
    info: [],
    warn: [],
    error: [],
    log: [],
  };

  globalThis.console = {
    debug(...args) { captured.debug.push(args.join(" ")); },
    info(...args) { captured.info.push(args.join(" ")); },
    warn(...args) { captured.warn.push(args.join(" ")); },
    error(...args) { captured.error.push(args.join(" ")); },
    log(...args) { captured.log.push(args.join(" ")); },
  };

  return { originalConsole, captured };
}

function restoreConsole(originalConsole) {
  globalThis.console = originalConsole;
}

console.log("[Test] Starting Logger tests.");

/*
 * ============================================================
 * 1. Level filtering
 * ============================================================
 */

{
  const logger = createLogger("test-level");
  const transport = new CaptureTransport();
  logger.removeTransport(logger); // no-op, not a transport
  logger.addTransport(transport);

  // Default level is info
  logger.debug("debug message");
  logger.info("info message");
  logger.warn("warn message");
  logger.error("error message");

  assert.equal(
    transport.entries.length,
    3,
    "Default level info: debug filtered, info/warn/error emitted."
  );
  assert.equal(
    transport.entries[0].level,
    "info",
    "First entry is info."
  );
  assert.equal(
    transport.entries[1].level,
    "warn",
    "Second entry is warn."
  );
  assert.equal(
    transport.entries[2].level,
    "error",
    "Third entry is error."
  );

  // Set level to debug - all should pass
  logger.setLevel("debug");
  transport.entries = [];
  logger.debug("debug again");
  logger.info("info again");

  assert.equal(
    transport.entries.length,
    2,
    "Level debug: debug and info both emitted."
  );

  // Set level to error - only error
  logger.setLevel("error");
  transport.entries = [];
  logger.debug("debug suppressed");
  logger.info("info suppressed");
  logger.warn("warn suppressed");
  logger.error("error emitted");

  assert.equal(
    transport.entries.length,
    1,
    "Level error: only error emitted."
  );
  assert.equal(
    transport.entries[0].message,
    "error emitted",
    "Error message preserved."
  );

  console.log("[Test] ✓ Level filtering passed.");
}

/*
 * ============================================================
 * 2. Invalid level handling
 * ============================================================
 */

{
  const logger = createLogger("test-invalid");

  assert.throws(
    () => logger.setLevel("verbose"),
    TypeError,
    "setLevel with invalid level throws TypeError."
  );

  assert.throws(
    () => logger.setLevel(""),
    TypeError,
    "setLevel with empty string throws TypeError."
  );

  assert.throws(
    () => logger.setLevel("DEBUG"),
    TypeError,
    "setLevel with uppercase throws TypeError (case sensitive)."
  );

  assert.throws(
    () => logger.addTransport(null),
    TypeError,
    "addTransport with null throws TypeError."
  );

  assert.throws(
    () => logger.addTransport({}),
    TypeError,
    "addTransport without log method throws TypeError."
  );

  assert.throws(
    () => logger.addTransport("not a transport"),
    TypeError,
    "addTransport with string throws TypeError."
  );

  console.log("[Test] ✓ Invalid level handling passed.");
}

/*
 * ============================================================
 * 3. Logger name and child context inheritance
 * ============================================================
 */

{
  const logger = createLogger("bootstrap");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  const child = logger.child({ subsystem: "database" });

  child.info("child message");

  assert.equal(
    transport.entries.length,
    1,
    "Child logger emits through shared transport."
  );

  assert.equal(
    transport.entries[0].logger,
    "bootstrap",
    "Child inherits parent logger name."
  );

  assert.equal(
    transport.entries[0].context.subsystem,
    "database",
    "Child context includes inherited subsystem."
  );

  assert.equal(
    transport.entries[0].message,
    "child message",
    "Child message preserved."
  );

  console.log("[Test] ✓ Logger name and child context inheritance passed.");
}

/*
 * ============================================================
 * 4. Child context overriding parent context
 * ============================================================
 */

{
  const logger = createLogger("override-test");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  const child = logger.child({ key: "parent", other: "keep" });
  const grandchild = child.child({ key: "child" });

  grandchild.info("override test");

  assert.equal(
    transport.entries[0].context.key,
    "child",
    "Child context overrides parent context for matching keys."
  );

  assert.equal(
    transport.entries[0].context.other,
    "keep",
    "Non-matching parent context keys preserved."
  );

  console.log("[Test] ✓ Child context overriding parent context passed.");
}

/*
 * ============================================================
 * 5. Shared state between root and child loggers
 * ============================================================
 */

{
  const logger = createLogger("shared-state");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  const child = logger.child({});

  // Child setLevel affects root
  child.setLevel("debug");
  assert.equal(
    logger.config?.level || "unknown",
    "debug",
    "Child setLevel changes shared config level."
  );

  // Root setLevel affects child
  logger.setLevel("error");
  transport.entries = [];
  child.debug("should be suppressed");
  child.error("should be emitted");

  assert.equal(
    transport.entries.length,
    1,
    "Root setLevel affects child logger filtering."
  );
  assert.equal(
    transport.entries[0].message,
    "should be emitted",
    "Error emitted after root setLevel."
  );

  console.log("[Test] ✓ Shared state between root and child loggers passed.");
}

/*
 * ============================================================
 * 6. Independent state between separately created root loggers
 * ============================================================
 */

{
  const loggerA = createLogger("logger-a");
  const loggerB = createLogger("logger-b");
  const transportA = new CaptureTransport();
  const transportB = new CaptureTransport();

  loggerA.addTransport(transportA);
  loggerB.addTransport(transportB);

  loggerA.setLevel("debug");
  loggerB.setLevel("error");

  loggerA.debug("debug on A");
  loggerB.debug("debug on B - suppressed");

  assert.equal(
    transportA.entries.length,
    1,
    "Logger A emits debug."
  );
  assert.equal(
    transportB.entries.length,
    0,
    "Logger B suppresses debug (independent level)."
  );

  // Adding transport to A doesn't affect B
  const transportC = new CaptureTransport();
  loggerA.addTransport(transportC);
  loggerA.info("info on A");

  assert.equal(
    transportA.entries.length,
    2,
    "Transport A received info."
  );
  assert.equal(
    transportC.entries.length,
    1,
    "Transport C received info."
  );
  assert.equal(
    transportB.entries.length,
    0,
    "Transport B unaffected by A's changes."
  );

  console.log("[Test] ✓ Independent state between separately created root loggers passed.");
}

/*
 * ============================================================
 * 7. Transport registration and removal
 * ============================================================
 */

{
  const logger = createLogger("transport-test");
  const transport = new CaptureTransport();

  logger.addTransport(transport);
  logger.info("before removal");

  assert.equal(
    transport.entries.length,
    1,
    "Transport receives entries after addTransport."
  );

  logger.removeTransport(transport);
  logger.info("after removal");

  assert.equal(
    transport.entries.length,
    1,
    "Transport does not receive entries after removeTransport."
  );

  // Removing again is safe (no-op)
  logger.removeTransport(transport);
  logger.info("after second removal");
  assert.equal(
    transport.entries.length,
    1,
    "Second removeTransport is safe no-op."
  );

  console.log("[Test] ✓ Transport registration and removal passed.");
}

/*
 * ============================================================
 * 8. Invalid transport rejection
 * ============================================================
 */

{
  const logger = createLogger("invalid-transport");

  assert.throws(
    () => logger.addTransport(null),
    TypeError,
    "addTransport(null) throws TypeError."
  );

  assert.throws(
    () => logger.addTransport(undefined),
    TypeError,
    "addTransport(undefined) throws TypeError."
  );

  assert.throws(
    () => logger.addTransport({}),
    TypeError,
    "addTransport({}) without log method throws TypeError."
  );

  assert.throws(
    () => logger.addTransport("string"),
    TypeError,
    "addTransport(string) throws TypeError."
  );

  assert.throws(
    () => logger.addTransport(42),
    TypeError,
    "addTransport(number) throws TypeError."
  );

  console.log("[Test] ✓ Invalid transport rejection passed.");
}

/*
 * ============================================================
 * 9. Transport failure isolation
 * ============================================================
 */

{
  const logger = createLogger("failure-isolation");
  const goodTransport = new CaptureTransport();
  const badTransport = new CaptureTransport();
  badTransport.fail = true;
  badTransport.failOn = "error";

  logger.addTransport(goodTransport);
  logger.addTransport(badTransport);

  // Logging error should not crash, and good transport still receives entry
  logger.error("error with failing transport");

  assert.equal(
    goodTransport.entries.length,
    1,
    "Good transport receives entry despite bad transport failure."
  );
  assert.equal(
    goodTransport.entries[0].message,
    "error with failing transport",
    "Entry message preserved."
  );

  console.log("[Test] ✓ Transport failure isolation passed.");
}

/*
 * ============================================================
 * 10. Console transport behavior with mocked console methods
 * ============================================================
 */

{
  const { captured, originalConsole } = captureConsole();

  try {
    const transport = new ConsoleTransport();
    const entry = {
      timestamp: "2026-01-01T00:00:00.000Z",
      level: "error",
      logger: "test",
      message: "test error",
      context: { code: 500 },
    };

    transport.log(entry);

    assert.equal(
      captured.error.length,
      1,
      "Console transport calls console.error for error level."
    );
    assert.ok(
      captured.error[0].includes("test error"),
        "Console error output includes message."
    );

    // Test debug level
    transport.level = undefined;
    const debugEntry = { ...entry, level: "debug" };
    transport.log(debugEntry);

    assert.ok(
      captured.debug.length >= 1,
        "Console transport calls console.debug for debug level."
    );

    // Test info level
    const infoEntry = { ...entry, level: "info" };
    transport.log(infoEntry);

    assert.ok(
      captured.info.length >= 1,
        "Console transport calls console.info for info level."
    );

    // Test warn level
    const warnEntry = { ...entry, level: "warn" };
    transport.log(warnEntry);

    assert.ok(
      captured.warn.length >= 1,
        "Console transport calls console.warn for warn level."
    );
  } finally {
    restoreConsole(originalConsole);
  }

  console.log("[Test] ✓ Console transport behavior with mocked console methods passed.");
}

/*
 * ============================================================
 * 11. Error serialization
 * ============================================================
 */

{
  const error = new Error("database connection failed");
  error.code = "ECONNREFUSED";

  const serialized = serializeError(error);

  assert.equal(
    serialized.name,
    "Error",
    "Serialized error preserves name."
  );
  assert.equal(
    serialized.message,
    "database connection failed",
    "Serialized error preserves message."
  );
  assert.equal(
    serialized.stack,
    undefined,
    "Serialized error excludes stack by default."
  );

  // Non-error passed to serializeError returns string
  assert.equal(
    serializeError("plain string"),
    "plain string",
    "Non-error value returns string."
  );

  console.log("[Test] ✓ Error serialization passed.");
}

/*
 * ============================================================
 * 12. Nested sensitive-field redaction
 * ============================================================
 */

{
  const context = {
    user: "alice",
    config: {
      apiKey: "sk-12345",
      anonKey: "eyJhbGciOiJIUzI1NiIs...",
      database: {
        password: "super-secret",
        service_role: "role-secret",
      },
    },
    headers: {
      authorization: "Bearer token123",
    },
    normalField: "visible",
  };

  const redacted = redactObject(context);

  assert.equal(
    redacted.normalField,
    "visible",
    "Non-sensitive field visible."
  );
  assert.equal(
    redacted.config.apiKey,
    "[redacted]",
    "apiKey redacted."
  );
  assert.equal(
    redacted.config.anonKey,
    "[redacted]",
    "anonKey redacted."
  );
  assert.equal(
    redacted.config.database.password,
    "[redacted]",
    "password redacted in nested object."
  );
  assert.equal(
    redacted.config.database.service_role,
    "[redacted]",
    "service_role redacted in nested object."
  );
  assert.equal(
    redacted.headers.authorization,
    "[redacted]",
    "authorization redacted."
  );

  // Original not mutated
  assert.equal(
    context.config.apiKey,
    "sk-12345",
    "Original object not mutated."
  );
  assert.equal(
    context.headers.authorization,
    "Bearer token123",
    "Original headers not mutated."
  );

  console.log("[Test] ✓ Nested sensitive-field redaction passed.");
}

/*
 * ============================================================
 * 13. Circular object handling
 * ============================================================
 */

{
  const circular = { name: "circular" };
  circular.self = circular;

  const result = serializeContext(circular);

  assert.equal(
    result.name,
    "circular",
    "Circular object preserves name."
  );
  assert.equal(
    result.self,
    "[circular]",
    "Circular reference marked as [circular]."
  );

  // Array with circular reference
  const arr = [1, 2, 3];
  arr.push(arr);

  const arrResult = serializeContext(arr);

  assert.ok(
    Array.isArray(arrResult),
    "Array result is array."
  );
  assert.equal(
    arrResult[3],
    "[circular]",
    "Self-referencing array marked as [circular]."
  );

  // Error inside circular object
  const errObj = { error: new Error("nested error") };
  errObj.self = errObj;

  const errResult = serializeContext(errObj);

  assert.ok(
    errResult.error,
    "Error inside circular object serialized."
  );
  assert.equal(
    errResult.error.name,
    "Error",
    "Nested error name preserved."
  );
  assert.equal(
    errResult.error.message,
    "nested error",
    "Nested error message preserved."
  );
  assert.equal(
    errResult.self,
    "[circular]",
    "Circular reference with error detected."
  );

  console.log("[Test] ✓ Circular object handling passed.");
}

/*
 * ============================================================
 * 14. Input immutability
 * ============================================================
 */

{
  const logger = createLogger("immutable-test");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  const context = {
    user: "bob",
    nested: { secret: "hidden", visible: "yes" },
    error: new Error("test error"),
  };

  // Snapshot specific values before logging (not deep copy, since Error doesn't serialize)
  const beforeUser = context.user;
  const beforeNestedSecret = context.nested.secret;
  const beforeNestedVisible = context.nested.visible;
  const beforeErrorMessage = context.error.message;

  logger.info("immutable test", context);

  assert.equal(
    context.user,
    beforeUser,
    "Caller context user not mutated after logging."
  );
  assert.equal(
    context.nested.secret,
    beforeNestedSecret,
    "Caller context nested.secret not mutated after logging."
  );
  assert.equal(
    context.nested.visible,
    beforeNestedVisible,
    "Caller context nested.visible not mutated after logging."
  );
  assert.equal(
    context.error.message,
    beforeErrorMessage,
    "Caller context error not mutated after logging."
  );
  assert.equal(
    context.nested.secret,
    "hidden",
    "Nested secret not redacted in original."
  );

  console.log("[Test] ✓ Input immutability passed.");
}

/*
 * ============================================================
 * 15. Safe behavior when console is unavailable or throws
 * ============================================================
 */

{
  // Test with throwing console methods
  const originalConsole = { ...globalThis.console };

  try {
    globalThis.console = {
      debug() { throw new Error("console.debug throws"); },
      info() { throw new Error("console.info throws"); },
      warn() { throw new Error("console.warn throws"); },
      error() { throw new Error("console.error throws"); },
      log() { throw new Error("console.log throws"); },
    };

    const logger = createLogger("console-throws");
    logger.setLevel("debug");
    const transport = new CaptureTransport();
    logger.addTransport(transport);

    // Should not throw even when console methods throw
    assert.doesNotThrow(
      () => logger.error("error with throwing console"),
      "Logger does not throw when console.error throws."
    );

    assert.doesNotThrow(
      () => logger.debug("debug with throwing console"),
      "Logger does not throw when console.debug throws."
    );

    // Transport still receives entry
    assert.equal(
      transport.entries.length,
      2,
      "Transport receives entries even when console throws."
    );
  } finally {
    globalThis.console = originalConsole;
  }

  // Test with console undefined
  const originalConsole2 = globalThis.console;
  try {
    delete globalThis.console;

    const logger2 = createLogger("no-console");
    const transport2 = new CaptureTransport();
    logger2.addTransport(transport2);

    assert.doesNotThrow(
      () => logger2.error("error without console"),
      "Logger does not throw when console is undefined."
    );

    assert.equal(
      transport2.entries.length,
      1,
      "Transport receives entry without console."
    );
  } finally {
    globalThis.console = originalConsole2;
  }

  console.log("[Test] ✓ Safe behavior when console is unavailable or throws passed.");
}

/*
 * ============================================================
 * 16. Independent logger instances in tests
 * ============================================================
 */

{
  const logger1 = createLogger("instance-1");
  const logger2 = createLogger("instance-2");

  logger1.setLevel("debug");
  assert.equal(
    logger1.config.level,
    "debug",
    "Logger 1 level changed."
  );
  assert.equal(
    logger2.config.level,
    "info",
    "Logger 2 level unaffected (default info)."
  );

  const transport1 = new CaptureTransport();
  const transport2 = new CaptureTransport();
  logger1.addTransport(transport1);
  logger2.addTransport(transport2);

  logger1.info("message 1");
  logger2.info("message 2");

  assert.equal(
    transport1.entries.length,
    1,
    "Transport 1 receives message 1."
  );
  assert.equal(
    transport1.entries[0].message,
    "message 1",
    "Transport 1 entry message correct."
  );
  assert.equal(
    transport2.entries.length,
    1,
    "Transport 2 receives message 2."
  );
  assert.equal(
    transport2.entries[0].message,
    "message 2",
    "Transport 2 entry message correct."
  );

  console.log("[Test] ✓ Independent logger instances in tests passed.");
}

/*
 * ============================================================
 * Additional: Log entry contract
 * ============================================================
 */

{
  const logger = createLogger("entry-contract");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  logger.warn("entry contract test", { key: "value" });

  const entry = transport.entries[0];

  assert.ok(
    entry.timestamp,
    "Entry has timestamp."
  );
  assert.ok(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp),
    "Timestamp is ISO 8601 format."
  );
  assert.equal(
    entry.level,
    "warn",
    "Entry has level."
  );
  assert.equal(
    entry.logger,
    "entry-contract",
    "Entry has logger name."
  );
  assert.equal(
    entry.message,
    "entry contract test",
    "Entry has message."
  );
  assert.ok(
    entry.context,
    "Entry has context."
  );
  assert.equal(
    entry.context.key,
    "value",
    "Context value preserved."
  );

  console.log("[Test] ✓ Log entry contract passed.");
}

/*
 * ============================================================
 * Additional: Error in context serialization
 * ============================================================
 */

{
  const logger = createLogger("error-context");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  const dbError = new Error("connection failed");
  dbError.code = "ECONNREFUSED";

  logger.error("Database failed", { error: dbError, subsystem: "db" });

  const entry = transport.entries[0];

  assert.ok(
    entry.context.error,
    "Error object serialized in context."
  );
  assert.equal(
    entry.context.error.name,
    "Error",
    "Nested error name preserved."
  );
  assert.equal(
    entry.context.error.message,
    "connection failed",
    "Nested error message preserved."
  );
  assert.equal(
    entry.context.error.code,
    "ECONNREFUSED",
    "Nested error custom properties preserved."
  );
  assert.equal(
    entry.context.subsystem,
    "db",
    "Other context fields preserved alongside error."
  );

  console.log("[Test] ✓ Error in context serialization passed.");
}

/*
 * ============================================================
 * Additional: Sensitive keys not over-redacted
 * ============================================================
 */

{
  const context = {
    monkey: "key-value", // contains "key" but not a sensitive key name
    keychain: "items",   // contains "key" but not sensitive
    apikey: "secret",    // exact match - should be redacted
    ApiKey: "also-secret", // case variant - should be redacted
  };

  const redacted = redactObject(context);

  assert.equal(
    redacted.monkey,
    "key-value",
    "Property containing 'key' substring but not matching exact sensitive key not redacted."
  );
  assert.equal(
    redacted.keychain,
    "items",
    "Property 'keychain' not redacted."
  );
  assert.equal(
    redacted.apikey,
    "[redacted]",
    "Exact 'apikey' match redacted."
  );
  assert.equal(
    redacted.ApiKey,
    "[redacted]",
    "Case variant 'ApiKey' redacted."
  );

  console.log("[Test] ✓ Sensitive keys not over-redacted passed.");
}

/*
 * ============================================================
 * Additional: Comprehensive secret redaction
 * ============================================================
 */

{
  const sensitiveKeys = [
    "apiKey",
    "api_key",
    "APIKEY",
    "anonKey",
    "supabaseAnonKey",
    "VITE_ENGINE_SUPABASE_ANON_KEY",
    "access_token",
    "accessToken",
    "refreshToken",
    "refresh_token",
    "service_role",
    "authorization",
    "password",
    "secret",
  ];

  for (const key of sensitiveKeys) {
    const redacted = redactObject({ [key]: "sensitive-value" });
    assert.equal(
      redacted[key],
      "[redacted]",
      `Key "${key}" must be redacted.`
    );
  }

  const nonSensitiveKeys = ["monkey", "keychain", "keyboardLayout"];

  for (const key of nonSensitiveKeys) {
    const redacted = redactObject({ [key]: "visible-value" });
    assert.equal(
      redacted[key],
      "visible-value",
      `Key "${key}" must not be redacted.`
    );
  }

  console.log("[Test] ✓ Comprehensive secret redaction passed.");
}

/*
 * ============================================================
 * Additional: Nested redaction in arrays and objects
 * ============================================================
 */

{
  const context = {
    level1: {
      level2: {
        apiKey: "nested-secret",
        items: [
          { anonKey: "array-item-secret" },
          { password: "array-password" },
        ],
      },
    },
  };

  const redacted = redactObject(context);

  assert.equal(
    redacted.level1.level2.apiKey,
    "[redacted]",
    "Deeply nested apiKey redacted."
  );
  assert.equal(
    redacted.level1.level2.items[0].anonKey,
    "[redacted]",
    "anonKey in array item redacted."
  );
  assert.equal(
    redacted.level1.level2.items[1].password,
    "[redacted]",
    "password in array item redacted."
  );

  // Original not mutated
  assert.equal(
    context.level1.level2.apiKey,
    "nested-secret",
    "Original nested apiKey not mutated."
  );

  console.log("[Test] ✓ Nested redaction in arrays and objects passed.");
}

/*
 * ============================================================
 * Additional: Sensitive properties on Error objects
 * ============================================================
 */

{
  const err = new Error("connection failed");
  err.password = "db-password";
  err.apiKey = "db-api-key";
  err.code = "ECONNREFUSED";

  const redacted = redactObject({ error: err });

  assert.equal(
    redacted.error.password,
    "[redacted]",
    "Error custom password property redacted."
  );
  assert.equal(
    redacted.error.apiKey,
    "[redacted]",
    "Error custom apiKey property redacted."
  );
  assert.equal(
    redacted.error.code,
    "ECONNREFUSED",
    "Error non-sensitive code property preserved."
  );

  // Original error not mutated
  assert.equal(
    err.password,
    "db-password",
    "Original error password not mutated."
  );
  assert.equal(
    err.apiKey,
    "db-api-key",
    "Original error apiKey not mutated."
  );

  console.log("[Test] ✓ Sensitive properties on Error objects passed.");
}

/*
 * ============================================================
 * Additional: Nested Error objects
 * ============================================================
 */

{
  const innerError = new Error("inner failure");
  innerError.secret = "inner-secret";

  const outerError = new Error("outer failure");
  outerError.cause = innerError;

  const redacted = redactObject({ error: outerError });

  assert.equal(
    redacted.error.cause.secret,
    "[redacted]",
    "Nested Error secret redacted."
  );
  assert.equal(
    redacted.error.cause.message,
    "inner failure",
    "Nested Error message preserved."
  );

  console.log("[Test] ✓ Nested Error objects passed.");
}

/*
 * ============================================================
 * Additional: Stack exclusion by default
 * ============================================================
 */

{
  const err = new Error("stack test error");

  // serializeError should not include stack by default
  const serialized = serializeError(err);
  assert.equal(
    serialized.stack,
    undefined,
    "serializeError excludes stack by default."
  );
  assert.equal(
    serialized.name,
    "Error",
    "Error name preserved."
  );
  assert.equal(
    serialized.message,
    "stack test error",
    "Error message preserved."
  );

  // serializeContext should not include stack by default
  const contextSerialized = serializeContext({ error: err });
  assert.equal(
    contextSerialized.error.stack,
    undefined,
    "serializeContext excludes stack by default."
  );

  console.log("[Test] ✓ Stack exclusion by default passed.");
}

/*
 * ============================================================
 * Additional: Circular Error properties
 * ============================================================
 */

{
  const err = new Error("circular error");
  err.self = err;

  const result = serializeContext({ error: err });

  assert.equal(
    result.error.name,
    "Error",
    "Circular Error name preserved."
  );
  assert.equal(
    result.error.message,
    "circular error",
    "Circular Error message preserved."
  );
  assert.equal(
    result.error.self,
    "[circular]",
    "Circular Error self-reference marked."
  );

  console.log("[Test] ✓ Circular Error properties passed.");
}

/*
 * ============================================================
 * Additional: Entry and context immutability
 * ============================================================
 */

{
  const logger = createLogger("immutable-entry");
  const transport = new CaptureTransport();
  logger.addTransport(transport);

  logger.info("immutable entry test", { foo: "bar" });

  const entry = transport.entries[0];

  // Entry is frozen
  assert.throws(
    () => {
      entry.level = "tampered";
    },
    TypeError,
    "Entry level is frozen."
  );
  assert.throws(
    () => {
      entry.message = "tampered";
    },
    TypeError,
    "Entry message is frozen."
  );

  // Nested context is frozen
  assert.throws(
    () => {
      entry.context.foo = "tampered";
    },
    TypeError,
    "Nested context is frozen."
  );

  // Entry values unchanged
  assert.equal(
    entry.level,
    "info",
    "Entry level unchanged after freeze attempt."
  );
  assert.equal(
    entry.message,
    "immutable entry test",
    "Entry message unchanged after freeze attempt."
  );

  console.log("[Test] ✓ Entry and context immutability passed.");
}

/*
 * ============================================================
 * Additional: Transport cannot mutate entry
 * ============================================================
 */

{
  const logger = createLogger("transport-mutate");
  const mutatingTransport = {
    log(entry) {
      try {
        entry.message = "tampered-by-transport";
      } catch (e) {
        // Expected - entry is frozen
      }
    },
  };

  const captureTransport = new CaptureTransport();
  logger.addTransport(mutatingTransport);
  logger.addTransport(captureTransport);

  logger.info("original message");

  // Capture transport should receive the original, unmutated entry
  assert.equal(
    captureTransport.entries.length,
    1,
    "Capture transport receives entry."
  );
  assert.equal(
    captureTransport.entries[0].message,
    "original message",
    "Capture transport receives original message, not tampered version."
  );

  console.log("[Test] ✓ Transport cannot mutate entry passed.");
}

/*
 * ============================================================
 * Additional: Failing transport followed by working transport
 * ============================================================
 */

{
  const logger = createLogger("failing-then-working");
  const failingTransport = {
    log() {
      throw new Error("this transport fails");
    },
  };
  const workingTransport = new CaptureTransport();

  logger.addTransport(failingTransport);
  logger.addTransport(workingTransport);

  logger.error("error after failing transport");

  assert.equal(
    workingTransport.entries.length,
    1,
    "Working transport receives entry after failing transport."
  );
  assert.equal(
    workingTransport.entries[0].message,
    "error after failing transport",
    "Working transport receives intact entry."
  );

  console.log("[Test] ✓ Failing transport followed by working transport passed.");
}

/*
 * ============================================================
 * Additional: Original input objects remain unfrozen
 * ============================================================
 */

{
  const input = { secret: "my-secret", visible: "yes" };

  const redacted = redactObject(input);

  // Input should not be frozen
  assert.doesNotThrow(
    () => {
      input.visible = "changed";
    },
    "Original input object is not frozen."
  );
  assert.equal(
    input.visible,
    "changed",
    "Original input object is mutable."
  );
  assert.equal(
    input.secret,
    "my-secret",
    "Original input secret not redacted."
  );

  console.log("[Test] ✓ Original input objects remain unfrozen passed.");
}

/*
 * ============================================================
 * FINAL
 * ============================================================
 */

console.log("[Test] ✓ All Logger tests passed.");
