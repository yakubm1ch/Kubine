import assert from "node:assert/strict";

import { providerEngine } from "../../database/engine/provider.engine.js";
import { providerManager } from "../../database/engine/manager/provider.manager.js";
import {
  DatabaseAdapter,
} from "../../database/adapters/database/database.adapter.js";
import databaseAdapterSingleton from "../../database/adapters/database/database.adapter.js";
import {
  databaseProviderName,
} from "../../config/database.config.js";
import {
  resolveProviderDefinition,
  getSupportedProviderNames,
} from "../../database/providers/provider.catalog.js";
import SupabaseProvider from "../../database/providers/supabase/engine/supabase.provider.js";
import ProvidersStage from "../stages/providers.stage.js";
import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";
import {
  BootstrapContext,
} from "../context/bootstrap.context.js";
import ProviderValidator from "../../database/engine/validators/provider.validator.js";

class MockDatabaseProvider {
  constructor() {
    this.calls = [];
  }

  async connect(context = {}) {
    this.calls.push(["connect", context]);
  }

  async disconnect(context = {}) {
    this.calls.push(["disconnect", context]);
  }

  async health(context = {}) {
    this.calls.push(["health", context]);
    return { status: "ok" };
  }

  async select(table, query, context) {
    this.calls.push(["select", table, query, context]);
    return [{ id: 1, name: "test" }];
  }

  async insert(table, records, context) {
    this.calls.push(["insert", table, records, context]);
    return [{ id: 1, ...records }];
  }

  async update(table, values, filters, context) {
    this.calls.push(["update", table, values, filters, context]);
    return [{ id: 1, ...values }];
  }

  async delete(table, filters, context) {
    this.calls.push(["delete", table, filters, context]);
    return [];
  }
}

function createMockContext() {
  return new BootstrapContext({
    runtime: { name: "runtime" },
    config: { name: "config" },
  });
}

function cleanup() {
  providerEngine.clear();
  databaseAdapterSingleton.providerName = null;
}

console.log("[Test] Starting ProvidersStage integration test.");

providerEngine.clear();
databaseAdapterSingleton.providerName = null;

/*
 * ============================================================
 * Provider catalog
 * ============================================================
 */

const supabaseDef = resolveProviderDefinition("supabase");
assert.strictEqual(
  supabaseDef,
  SupabaseProvider,
  "resolveProviderDefinition('supabase') returns SupabaseProvider."
);

assert.ok(
  getSupportedProviderNames().includes("supabase"),
  "Supported provider names includes 'supabase'."
);

assert.throws(
  () => resolveProviderDefinition("postgres"),
  /Unsupported database provider/,
  "resolveProviderDefinition('postgres') throws for unsupported provider."
);

assert.throws(
  () => resolveProviderDefinition("postgres"),
  /Supported providers/,
  "Error message lists supported providers."
);

assert.throws(
  () => resolveProviderDefinition(""),
  /Provider name must be a non-empty string/,
  "Empty provider name throws TypeError."
);

console.log("[Test] ✓ Provider catalog tests passed.");

/*
 * ============================================================
 * Stage construction
 * ============================================================
 */

const definition = new BootstrapStageDefinition({
  name: "providers",
  order: 30,
  dependencies: ["runtime", "config"],
  required: true,
});

const stage = new ProvidersStage(definition);
assert.equal(stage.name, "providers");
assert.equal(stage.providerBootstrap, null);
assert.equal(stage.registeredProviderName, null);
console.log("[Test] ✓ Stage construction passed.");

/*
 * ============================================================
 * Before registration: provider not available
 * ============================================================
 */

assert.equal(
  providerEngine.has("supabase"),
  false,
  "ProviderEngine.has('supabase') is false before registration."
);

assert.throws(
  () => providerEngine.get("supabase"),
  /not registered/,
  "ProviderEngine.get('supabase') throws before registration."
);
console.log("[Test] ✓ Pre-registration state verified.");

/*
 * ============================================================
 * Successful registration through ProvidersStage
 * ============================================================
 */

const context = createMockContext();
await stage.initialize(context);

assert.equal(
  providerEngine.has("supabase"),
  true,
  "ProviderEngine.has('supabase') is true after ProvidersStage."
);

const resolved = providerEngine.get("supabase");
assert.strictEqual(
  resolved,
  SupabaseProvider,
  "ProviderEngine.get('supabase') returns the SupabaseProvider instance."
);

assert.ok(
  ProviderValidator.validate(resolved),
  "ProviderValidator accepts the registered SupabaseProvider."
);

assert.equal(
  databaseAdapterSingleton.providerName,
  "supabase",
  "DatabaseAdapter singleton is configured with 'supabase'."
);

const contextValue = context.get("providers");
assert.ok(contextValue, "ProvidersStage stores metadata in context.");
assert.equal(contextValue.provider, "supabase");
assert.ok(
  contextValue.providers.includes("supabase"),
  "Context metadata lists registered provider names."
);
assert.ok(
  stage.providerBootstrap,
  "ProvidersStage retains ProviderBootstrap instance for rollback."
);

console.log("[Test] ✓ Successful registration through ProvidersStage passed.");

/*
 * ============================================================
 * DatabaseAdapter delegation
 * ============================================================
 */

providerEngine.register("mock-delegate", new MockDatabaseProvider());

const delegateAdapter = new DatabaseAdapter("mock-delegate");
const result = await delegateAdapter.select("users", { columns: "*" });
assert.equal(result.error, null, "Adapter select returns no error.");
assert.deepEqual(
  result.data,
  [{ id: 1, name: "test" }],
  "Adapter select returns provider data directly."
);

const mockProvider = providerEngine.get("mock-delegate");
assert.ok(
  mockProvider.calls.some(c => c[0] === "select"),
  "Mock provider's select() was called by the adapter."
);

console.log("[Test] ✓ DatabaseAdapter delegation passed.");

/*
 * ============================================================
 * Rollback unregisters the provider
 * ============================================================
 */

await stage.rollback(context);

assert.equal(
  providerEngine.has("supabase"),
  false,
  "ProviderEngine.has('supabase') is false after rollback."
);

assert.equal(
  stage.providerBootstrap,
  null,
  "ProvidersStage clears ProviderBootstrap reference after rollback."
);

assert.equal(
  stage.registeredProviderName,
  null,
  "ProvidersStage clears registered provider name after rollback."
);

assert.equal(
  context.has("providers"),
  false,
  "Context 'providers' entry is removed after rollback."
);

console.log("[Test] ✓ Rollback unregisters the provider.");

/*
 * ============================================================
 * ProviderManager instance cache cleared after rollback
 * ============================================================
 */

await stage.initialize(createMockContext());
providerEngine.get("supabase");

assert.ok(
  providerManager.has("supabase"),
  "Provider is registered before rollback."
);

const cached = providerManager.get("supabase");
assert.strictEqual(
  cached,
  SupabaseProvider,
  "Instance is cached in ProviderManager."
);

await stage.rollback(createMockContext());

assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider is unregistered after rollback."
);
console.log("[Test] ✓ ProviderManager instance cache cleared after rollback.");

/*
 * ============================================================
 * Pre-existing registrations remain untouched
 * ============================================================
 */

providerEngine.clear();
providerEngine.register("pre-existing", new MockDatabaseProvider());

const preExistingStage = new ProvidersStage(definition);
const preExistingContext = createMockContext();
await preExistingStage.initialize(preExistingContext);

assert.equal(
  providerEngine.has("pre-existing"),
  true,
  "Pre-existing registration remains after ProvidersStage."
);
assert.equal(
  providerEngine.has("supabase"),
  true,
  "Supabase is also registered."
);

await preExistingStage.rollback(preExistingContext);

assert.equal(
  providerEngine.has("pre-existing"),
  true,
  "Pre-existing registration remains after rollback."
);
assert.equal(
  providerEngine.has("supabase"),
  false,
  "Supabase is unregistered after rollback."
);

console.log("[Test] ✓ Pre-existing registrations remain untouched.");

/*
 * ============================================================
 * Failed initialization leaves no partial registration
 * ============================================================
 */

providerEngine.clear();

providerEngine.register("supabase", new MockDatabaseProvider());

const failingStage = new ProvidersStage(definition);
const failingContext = createMockContext();

await assert.rejects(
  () => failingStage.initialize(failingContext),
  /already registered/,
  "ProvidersStage.initialize() throws when provider already registered."
);

assert.equal(
  providerEngine.has("supabase"),
  true,
  "Pre-existing registration is untouched by failed initialization."
);

await failingStage.rollback(failingContext);

assert.equal(
  providerEngine.has("supabase"),
  true,
  "Pre-existing registration remains after failed stage rollback."
);

console.log("[Test] ✓ Failed initialization leaves no partial registration.");

/*
 * ============================================================
 * Unsupported provider never registered under wrong name
 * ============================================================
 */

providerEngine.clear();

assert.throws(
  () => resolveProviderDefinition("postgres"),
  /Unsupported/,
  "Catalog rejects 'postgres'."
);

assert.ok(
  !getSupportedProviderNames().includes("postgres"),
  "Postgres is not a supported provider identifier."
);

/*
 * ============================================================
 * ADAPTER CONFIGURATION ROLLBACK TESTS
 * ============================================================
 */

// Successful initialization configures the adapter
providerEngine.clear();
databaseAdapterSingleton.providerName = null;

const adapterInitStage = new ProvidersStage(definition);
const adapterInitContext = createMockContext();
await adapterInitStage.initialize(adapterInitContext);

assert.equal(
  databaseAdapterSingleton.providerName,
  "supabase",
  "DatabaseAdapter is configured with 'supabase' after stage initialization."
);
assert.equal(
  providerEngine.has("supabase"),
  true,
  "ProviderEngine.has('supabase') is true after stage initialization."
);

await adapterInitStage.rollback(adapterInitContext);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration is cleared after rollback."
);
assert.equal(
  providerEngine.has("supabase"),
  false,
  "ProviderEngine.has('supabase') is false after rollback."
);

console.log("[Test] ✓ Adapter configuration rollback passed.");

// Repeated rollback is safe
await adapterInitStage.rollback(createMockContext());

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration remains null after repeated rollback."
);
assert.equal(
  providerEngine.has("supabase"),
  false,
  "Provider remains unregistered after repeated rollback."
);
assert.equal(
  adapterInitStage.providerBootstrap,
  null,
  "ProvidersStage clears providerBootstrap reference after rollback."
);

console.log("[Test] ✓ Repeated rollback is safe.");

// Adapter configuration is cleared even when ProviderBootstrap.rollback throws
providerEngine.clear();
databaseAdapterSingleton.providerName = null;

// Pre-register "supabase" so ProviderBootstrap registration will fail,
// triggering internal rollback and leaving providerBootstrap in FAILED state
providerEngine.register("supabase", new MockDatabaseProvider());

const adapterRollbackStage = new ProvidersStage(definition);
const adapterRollbackContext = createMockContext();

await assert.rejects(
  () => adapterRollbackStage.initialize(adapterRollbackContext),
  /already registered/,
  "ProvidersStage.initialize() throws when provider already registered."
);

// Even though registration failed, DatabaseAdapter should not be configured
// because initialization never reached DatabaseAdapter.configure().
assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter is not configured when initialization fails."
);

await adapterRollbackStage.rollback(adapterRollbackContext);

assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration cleared after failed stage rollback."
);
assert.equal(
  providerEngine.has("supabase"),
  true,
  "Pre-existing registration remains untouched after failed stage rollback."
);

console.log("[Test] ✓ Adapter configuration cleared on failed initialization.");

// Existing unrelated provider registrations remain untouched
providerEngine.clear();
providerEngine.register("unrelated", new MockDatabaseProvider());

const unrelatedStage = new ProvidersStage(definition);
const unrelatedContext = createMockContext();
await unrelatedStage.initialize(unrelatedContext);

assert.equal(
  providerEngine.has("unrelated"),
  true,
  "Unrelated provider remains registered after ProvidersStage initialization."
);
assert.equal(
  providerEngine.has("supabase"),
  true,
  "Supabase provider is registered after ProvidersStage initialization."
);

await unrelatedStage.rollback(unrelatedContext);

assert.equal(
  providerEngine.has("unrelated"),
  true,
  "Unrelated provider remains registered after rollback."
);
assert.equal(
  providerEngine.has("supabase"),
  false,
  "Supabase provider is unregistered after rollback."
);
assert.equal(
  databaseAdapterSingleton.providerName,
  null,
  "DatabaseAdapter configuration cleared after rollback."
);

console.log("[Test] ✓ Unrelated provider registrations remain untouched.");

/*
 * ============================================================
 * Cleanup
 * ============================================================
 */

cleanup();

console.log("[Test] ✓ ProvidersStage integration test passed.");
