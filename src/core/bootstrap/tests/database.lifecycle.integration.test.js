import assert from "node:assert/strict";

import {
  BootstrapEngine,
} from "../engine/bootstrap.engine.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

import {
  BootstrapStageFactory,
} from "../factory/bootstrap-stage.factory.js";

import {
  BootstrapStageRegistry,
} from "../registry/bootstrap-stage.registry.js";

import {
  BootstrapStageResolver,
} from "../resolver/bootstrap-stage.resolver.js";

import {
  BootstrapStageLoader,
} from "../loader/bootstrap-stage.loader.js";

import {
  BootstrapPipeline,
} from "../pipeline/bootstrap.pipeline.js";

import {
  BootstrapContext,
} from "../context/bootstrap.context.js";

import {
  providerEngine,
} from "../../database/engine/provider.engine.js";

import {
  providerManager,
} from "../../database/engine/manager/provider.manager.js";

import databaseAdapterSingleton from "../../database/adapters/database/database.adapter.js";

import {
  getSupabaseClient,
  resetSupabaseClient,
  setSupabaseClient,
} from "../../database/providers/supabase/client/supabase.client.js";

import ProvidersStage from "../stages/providers.stage.js";
import DatabaseStage from "../stages/database.stage.js";
import ModuleStage from "../stages/module.stage.js";
import RuntimeStage from "../stages/runtime.stage.js";
import ConfigStage from "../stages/config.stage.js";

/*
 * Build a chainable, awaitable Supabase query builder mock.
 */

function makeMockQueryBuilder() {
  const calls = [];

  return {
    calls,
    resolveWith(data, error) {
      this._resolved = { data, error };
      return this;
    },

    select() {
      calls.push(["select"]);
      return this;
    },

    insert() {
      calls.push(["insert"]);
      return this;
    },

    update() {
      calls.push(["update"]);
      return this;
    },

    delete() {
      calls.push(["delete"]);
      return this;
    },

    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },

    order(column, options) {
      calls.push(["order", column, options]);
      return this;
    },

    limit(count) {
      calls.push(["limit", count]);
      return this;
    },

    single() {
      calls.push(["single"]);
      return this;
    },

    async then(resolve) {
      resolve(this._resolved ?? { data: null, error: null });
    },
  };
}

function makeMockClient() {
  const builder = makeMockQueryBuilder();

  return {
    fromCalls: [],

    from(table) {
      this.fromCalls.push(table);
      return builder;
    },

    get storage() {
      return {
        from() {
          return {
            async upload() {
              return { data: null, error: null };
            },
            async remove() {
              return { data: null, error: null };
            },
            async getPublicUrl() {
              return { data: { publicUrl: "" }, error: null };
            },
          };
        },
      };
    },

    get functions() {
      return {};
    },

    builder,
  };
}

/*
 * Shared test state cleanup for singletons.
 */

function cleanup() {
  providerEngine.clear();
  databaseAdapterSingleton.clearConfiguration();
  resetSupabaseClient();
}

function createMockClientWithRows(rows, error) {
  const client = makeMockClient();
  client.builder.resolveWith(rows, error);
  setSupabaseClient(client);
  return client;
}

/*
 * Build a BootstrapEngine with real ProvidersStage + DatabaseStage +
 * optional ModulesStage.
 *
 * Returns { engine, context, client } where client is the mock Supabase
 * client that will be used by SupabaseProvider.
 */

function createTestEngine(options = {}) {
  const {
    withFailingModule = false,
    moduleFailureError = new Error("module initialization failed"),
    withFailingDatabase = false,
    databaseFailureError = new Error("database initialization failed"),
  } = options;

  const definitions = [
    new BootstrapStageDefinition({
      name: "runtime",
      order: 10,
    }),
    new BootstrapStageDefinition({
      name: "config",
      order: 20,
      dependencies: ["runtime"],
    }),
    new BootstrapStageDefinition({
      name: "providers",
      order: 30,
      dependencies: ["runtime", "config"],
    }),
    new BootstrapStageDefinition({
      name: "database",
      order: 40,
      dependencies: ["runtime", "config", "providers"],
    }),
  ];

  if (withFailingModule) {
    definitions.push(
      new BootstrapStageDefinition({
        name: "modules",
        order: 50,
        dependencies: ["runtime", "config", "database"],
      })
    );
  }

  const registryInitializer = (registry) => {
    for (const definition of definitions) {
      registry.register(definition);
    }
    return registry;
  };

  const factoryInitializer = (factory) => {
    factory.register("runtime", ({ definition }) => new RuntimeStage(definition));
    factory.register("config", ({ definition }) => new ConfigStage(definition));
    factory.register("providers", ({ definition }) => new ProvidersStage(definition));

    if (withFailingDatabase) {
      class FailingDatabaseStage extends DatabaseStage {
        async initialize(context) {
          throw databaseFailureError;
        }
      }
      factory.register("database", ({ definition }) => new FailingDatabaseStage(definition));
    } else {
      factory.register("database", ({ definition }) => new DatabaseStage(definition));
    }

    if (withFailingModule) {
      class FailingModuleStage extends ModuleStage {
        async initialize(context) {
          throw moduleFailureError;
        }
      }
      factory.register("modules", ({ definition }) => new FailingModuleStage(definition));
    }
  };

  const registry = new BootstrapStageRegistry();
  const factory = new BootstrapStageFactory();
  const resolver = new BootstrapStageResolver(registry);
  const loader = new BootstrapStageLoader(factory);
  const pipeline = new BootstrapPipeline();
  const context = new BootstrapContext();

  const engine = new BootstrapEngine({
    registry,
    registryInitializer,
    resolver,
    factory,
    factoryInitializer,
    loader,
    pipeline,
  });

  return { engine, context };
}

/*
 * ============================================================================
 * SCENARIO 1: Successful initialization
 * ============================================================================
 */

console.log("[Test] Scenario 1: Successful initialization.");

cleanup();

const client = createMockClientWithRows(
  [{ id: 1, name: "alice" }, { id: 2, name: "bob" }],
  null
);

const { engine: engine1, context: context1 } = createTestEngine();

const result1 = await engine1.initialize(context1);

assert.equal(
  result1.initialized,
  true,
  "BootstrapEngine should initialize successfully."
);

assert.ok(
  providerEngine.has("supabase"),
  "ProviderEngine.has('supabase') is true after ProvidersStage."
);

assert.strictEqual(
  providerEngine.get("supabase").constructor.name,
  "SupabaseProvider",
  "Registered provider is SupabaseProvider."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  "supabase",
  "DatabaseAdapter is configured with 'supabase'."
);

assert.ok(
  context1.has("providers"),
  "ProvidersStage stored metadata in context."
);

assert.ok(
  context1.has("database"),
  "DatabaseStage stored metadata in context."
);

// DatabaseAdapter can resolve and use the registered provider
const selectResult = await databaseAdapterSingleton.select(
  "users",
  { columns: "*", filters: { active: true } },
  { env: "test" }
);

assert.equal(
  selectResult.error,
  null,
  "DatabaseAdapter select returns no error."
);

assert.deepEqual(
  selectResult.data,
  [{ id: 1, name: "alice" }, { id: 2, name: "bob" }],
  "DatabaseAdapter select returns provider data directly."
);

assert.deepEqual(
  client.fromCalls,
  ["users"],
  "Supabase client queried the correct table."
);

assert.deepEqual(
  client.builder.calls.filter(c => c[0] === "eq"),
  [["eq", "active", true]],
  "Multiple filters produce individual eq(column, value) calls."
);

console.log("[Test] ✓ Scenario 1 passed.");
cleanup();

/*
 * ============================================================================
 * SCENARIO 2: Shutdown
 * ============================================================================
 */

console.log("[Test] Scenario 2: Shutdown.");

cleanup();

const client2 = createMockClientWithRows([], null);

const { engine: engine2, context: context2 } = createTestEngine();

await engine2.initialize(context2);

assert.ok(
  providerEngine.has("supabase"),
  "Provider is registered before shutdown."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  "supabase",
  "Adapter is configured before shutdown."
);

await engine2.shutdown(context2);

assert.equal(
  engine2.isShutdown(),
  true,
  "Engine enters shutdown state."
);

assert.equal(
  providerEngine.has("supabase"),
  false,
  "ProvidersStage unregisters its own provider on shutdown."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration is cleared on shutdown."
);

// Database operations after shutdown fail with unconfigured error
await assert.rejects(
  () => databaseAdapterSingleton.select("users", { columns: "*" }),
  /No database provider configured/,
  "Adapter throws unconfigured-provider error after shutdown."
);

console.log("[Test] ✓ Scenario 2 passed.");
cleanup();

/*
 * ============================================================================
 * SCENARIO 3: Failure during DatabaseStage
 * ============================================================================
 */

console.log("[Test] Scenario 3: Failure during DatabaseStage.");

cleanup();

const client3 = createMockClientWithRows([], null);

const { engine: engine3, context: context3 } = createTestEngine({
  withFailingDatabase: true,
  databaseFailureError: new Error("database initialization failed"),
});

await assert.rejects(
  () => engine3.initialize(context3),
  /database initialization failed/,
  "BootstrapEngine rejects when DatabaseStage fails."
);

assert.equal(
  engine3.isFailed(),
  true,
  "Engine enters failed state."
);

// Earlier completed stages are rolled back
assert.equal(
  context3.has("runtime"),
  false,
  "Runtime context is cleared after rollback."
);

assert.equal(
  context3.has("config"),
  false,
  "Config context is cleared after rollback."
);

// Provider registration is removed
assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider is unregistered after DatabaseStage failure rollback."
);

// Adapter configuration is cleared
assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "Adapter configuration is cleared after DatabaseStage failure rollback."
);

console.log("[Test] ✓ Scenario 3 passed.");
cleanup();

/*
 * ============================================================================
 * SCENARIO 4: Failure in a later stage (ModulesStage)
 * ============================================================================
 */

console.log("[Test] Scenario 4: Failure in ModulesStage.");

cleanup();

const client4 = createMockClientWithRows([], null);

const { engine: engine4, context: context4 } = createTestEngine({
  withFailingModule: true,
  moduleFailureError: new Error("module initialization failed"),
});

await assert.rejects(
  () => engine4.initialize(context4),
  /module initialization failed/,
  "BootstrapEngine rejects when ModulesStage fails."
);

// Rollback runs in reverse order
assert.equal(
  providerEngine.has("supabase"),
  false,
  "ProvidersStage unregisters its provider on later-stage failure."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration is cleared on later-stage failure."
);

assert.equal(
  context4.has("providers"),
  false,
  "Providers context is cleared after rollback."
);

assert.equal(
  context4.has("database"),
  false,
  "Database context is cleared after rollback."
);

// Unrelated provider registrations remain untouched
providerManager.register("unrelated", { connect: async () => {} });
assert.ok(
  providerManager.has("unrelated"),
  "Unrelated provider remains registered."
);

providerManager.unregister("unrelated");

console.log("[Test] ✓ Scenario 4 passed.");
cleanup();

/*
 * ============================================================================
 * SCENARIO 5: Retry after failure
 * ============================================================================
 */

console.log("[Test] Scenario 5: Retry after failure.");

cleanup();

const client5 = createMockClientWithRows([{ id: 1, name: "carol" }], null);

// First attempt: fail at ModulesStage
const { engine: engine5a, context: context5a } = createTestEngine({
  withFailingModule: true,
  moduleFailureError: new Error("module initialization failed"),
});

await assert.rejects(
  () => engine5a.initialize(context5a),
  /module initialization failed/,
  "First attempt fails at ModulesStage."
);

// Verify cleanup after failure
assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider is unregistered after failed attempt."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "Adapter is cleared after failed attempt."
);

// Second attempt: succeed
const { engine: engine5b, context: context5b } = createTestEngine();

const result5b = await engine5b.initialize(context5b);

assert.equal(
  result5b.initialized,
  true,
  "Retry succeeds after failure."
);

assert.ok(
  providerEngine.has("supabase"),
  "Provider is registered on retry."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  "supabase",
  "Adapter is configured on retry."
);

// Database operations work on retry
const retryResult = await databaseAdapterSingleton.select(
  "users",
  { columns: "*" },
  { env: "test" }
);

assert.deepEqual(
  retryResult.data,
  [{ id: 1, name: "carol" }],
  "Database operations work after retry."
);

assert.equal(
  retryResult.error,
  null,
  "No error on retry."
);

console.log("[Test] ✓ Scenario 5 passed.");
cleanup();

/*
 * ============================================================================
 * SCENARIO 6: Repeated shutdown and rollback
 * ============================================================================
 */

console.log("[Test] Scenario 6: Repeated shutdown and rollback.");

cleanup();

const client6 = createMockClientWithRows([], null);

const { engine: engine6, context: context6 } = createTestEngine();

await engine6.initialize(context6);

// First shutdown
await engine6.shutdown(context6);

assert.equal(
  engine6.isShutdown(),
  true,
  "Engine is shutdown after first shutdown."
);

assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider is unregistered after first shutdown."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "Adapter is cleared after first shutdown."
);

// Second shutdown is safe (no-op)
await engine6.shutdown(context6);

assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider remains unregistered after second shutdown."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "Adapter remains cleared after second shutdown."
);

console.log("[Test] ✓ Scenario 6 passed.");
cleanup();

/*
 * ============================================================================
 * FINAL
 * ============================================================================
 */

console.log("[Test] ✓ All Database Lifecycle Integration Test scenarios passed.");
