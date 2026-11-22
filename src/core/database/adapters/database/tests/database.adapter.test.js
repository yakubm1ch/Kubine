import assert from "node:assert/strict";

import { providerEngine } from "../../../engine/provider.engine.js";
import { providerRegistry } from "../../../engine/registry/provider.registry.js";
import {
  databaseProviderName,
  getDatabaseProviderName,
} from "../../../../config/database.config.js";
import {
  DatabaseAdapter,
} from "../database.adapter.js";

class MockDatabaseProvider {
  constructor() {
    this.calls = [];
    this.shouldFail = null;
  }

  async connect(context = {}) {
    this.calls.push(["connect", context]);
    if (this.shouldFail === "connect") throw new Error("connect failed");
  }

  async disconnect(context = {}) {
    this.calls.push(["disconnect", context]);
    if (this.shouldFail === "disconnect") throw new Error("disconnect failed");
  }

  async health(context = {}) {
    this.calls.push(["health", context]);
    if (this.shouldFail === "health") throw new Error("health failed");
    return { status: "ok" };
  }

  async select(table, query, context) {
    this.calls.push(["select", table, query, context]);
    if (this.shouldFail === "select") throw new Error("select failed");
    return [{ id: 1, name: "test" }];
  }

  async insert(table, records, context) {
    this.calls.push(["insert", table, records, context]);
    if (this.shouldFail === "insert") throw new Error("insert failed");
    return [{ id: 1, ...records }];
  }

  async update(table, values, filters, context) {
    this.calls.push(["update", table, values, filters, context]);
    if (this.shouldFail === "update") throw new Error("update failed");
    return [{ id: 1, ...values }];
  }

  async delete(table, filters, context) {
    this.calls.push(["delete", table, filters, context]);
    if (this.shouldFail === "delete") throw new Error("delete failed");
    return [];
  }
}

providerRegistry.clear();

console.log("[Test] Starting DatabaseAdapter test.");

/*
 * ============================================================
 * PROVIDER RESOLUTION
 * ============================================================
 */

providerEngine.register("mock", new MockDatabaseProvider());

const adapter = new DatabaseAdapter("mock");

const result = await adapter.select("users", { columns: "*" });

assert.ok(
  result,
  "select() must return a result object."
);
assert.equal(
  result.error,
  null,
  "Successful select must have no error."
);
assert.deepEqual(
  result.data,
  [{ id: 1, name: "test" }],
  "select() must return provider data."
);

console.log("[Test] ✓ Provider resolution passed.");

/*
 * ============================================================
 * LAZY INITIALIZATION
 * ============================================================
 */

providerEngine.clear();
providerEngine.register("lazy", new MockDatabaseProvider());

const lazyAdapter = new DatabaseAdapter("lazy");

// Provider should not be resolved until first method call
assert.equal(
  lazyAdapter.providerName,
  "lazy",
  "Provider name is stored at construction."
);

const healthResult = await lazyAdapter.health();
assert.equal(
  healthResult.error,
  null,
  "First method call triggers lazy provider resolution."
);

console.log("[Test] ✓ Lazy initialization passed.");

/*
 * ============================================================
 * CRUD DELEGATION
 * ============================================================
 */

providerEngine.clear();
providerEngine.register("crud", new MockDatabaseProvider());

const crudAdapter = new DatabaseAdapter("crud");
const provider = providerEngine.get("crud");

// select
const sel = await crudAdapter.select("users", { columns: "*", filters: { active: true }, single: true });
assert.deepEqual(
  provider.calls.filter(c => c[0] === "select"),
  [["select", "users", { columns: "*", filters: { active: true }, single: true }, {}]],
  "select() delegates to provider.select() with correct arguments."
);

// insert
const ins = await crudAdapter.insert("users", { name: "new" });
assert.deepEqual(
  provider.calls.filter(c => c[0] === "insert"),
  [["insert", "users", { name: "new" }, {}]],
  "insert() delegates to provider.insert() with correct arguments."
);

// update
const upd = await crudAdapter.update("users", { name: "updated" }, { id: 1 });
assert.deepEqual(
  provider.calls.filter(c => c[0] === "update"),
  [["update", "users", { name: "updated" }, { id: 1 }, {}]],
  "update() delegates to provider.update() with correct arguments."
);

// delete
const del = await crudAdapter.delete("users", { id: 1 });
assert.deepEqual(
  provider.calls.filter(c => c[0] === "delete"),
  [["delete", "users", { id: 1 }, {}]],
  "delete() delegates to provider.delete() with correct arguments."
);

console.log("[Test] ✓ CRUD delegation passed.");

/*
 * ============================================================
 * LIFECYCLE DELEGATION
 * ============================================================
 */

providerEngine.clear();
providerEngine.register("lifecycle", new MockDatabaseProvider());

const lifecycleAdapter = new DatabaseAdapter("lifecycle");
const lifecycleProvider = providerEngine.get("lifecycle");

// connect
await lifecycleAdapter.connect({ env: "test" });
assert.deepEqual(
  lifecycleProvider.calls.filter(c => c[0] === "connect"),
  [["connect", { env: "test" }]],
  "connect() delegates to provider.connect() with exact context."
);

// disconnect
await lifecycleAdapter.disconnect({ env: "test" });
assert.deepEqual(
  lifecycleProvider.calls.filter(c => c[0] === "disconnect"),
  [["disconnect", { env: "test" }]],
  "disconnect() delegates to provider.disconnect() with exact context."
);

// health
const healthResultLifecycle = await lifecycleAdapter.health({ env: "test" });
assert.deepEqual(
  lifecycleProvider.calls.filter(c => c[0] === "health"),
  [["health", { env: "test" }]],
  "health() delegates to provider.health() with exact context."
);
assert.equal(
  healthResultLifecycle.error,
  null,
  "health() returns { data, error: null } format."
);

console.log("[Test] ✓ Lifecycle delegation passed.");

/*
 * ============================================================
 * RESULT NORMALIZATION
 * ============================================================
 */

providerEngine.clear();
providerEngine.register("result", new MockDatabaseProvider());

const resultAdapter = new DatabaseAdapter("result");

// Successful select returns { data, error: null }
const ok = await resultAdapter.select("users", { columns: "*" });
assert.equal(
  ok.error,
  null,
  "Success result has null error."
);
assert.ok(
  Array.isArray(ok.data),
  "Success result has data array."
);

// Successful insert returns { data, error: null }
const ins2 = await resultAdapter.insert("users", { name: "x" });
assert.equal(
  ins2.error,
  null,
  "Insert success result has null error."
);

// Successful update returns { data, error: null }
const upd2 = await resultAdapter.update("users", { name: "y" }, { id: 1 });
assert.equal(
  upd2.error,
  null,
  "Update success result has null error."
);

// Successful delete returns { data, error: null }
const del2 = await resultAdapter.delete("users", { id: 1 });
assert.equal(
  del2.error,
  null,
  "Delete success result has null error."
);

console.log("[Test] ✓ Result normalization passed.");

/*
 * ============================================================
 * ERROR NORMALIZATION
 * ============================================================
 */

providerEngine.clear();
const failingProvider = new MockDatabaseProvider();
failingProvider.shouldFail = "select";
providerEngine.register("failing", failingProvider);

const failAdapter = new DatabaseAdapter("failing");

const err = await failAdapter.select("users", { columns: "*" });

assert.equal(
  err.data,
  null,
  "Failed select has null data."
);
assert.ok(
  err.error,
  "Failed select has an error object."
);
assert.equal(
  err.error.message,
  "select failed",
  "Error message is preserved."
);
assert.equal(
  err.error.code,
  null,
  "Error code defaults to null when absent."
);

console.log("[Test] ✓ Error normalization passed.");

/*
 * ============================================================
 * MISSING PROVIDER BEHAVIOR
 * ============================================================
 */

providerEngine.clear();

// Adapter with no provider name
const noNameAdapter = new DatabaseAdapter();

await assert.rejects(
  () => noNameAdapter.select("users", { columns: "*" }),
  /No database provider configured/,
  "Adapter without provider name throws clear error."
);

// Adapter with unregistered provider name
const noRegAdapter = new DatabaseAdapter("nonexistent");

await assert.rejects(
  () => noRegAdapter.select("users", { columns: "*" }),
  /Database provider "nonexistent" is not registered/,
  "Adapter with unregistered provider throws clear error."
);

console.log("[Test] ✓ Missing provider behavior passed.");

/*
 * ============================================================
 * PROVIDER REPLACEMENT REGRESSION TEST
 * ============================================================
 *
 * Sequence:
 *   1. Register provider A under a name.
 *   2. Resolve it through the adapter and verify A was called.
 *   3. Unregister A.
 *   4. Register provider B under the same name.
 *   5. Call the adapter again.
 *   6. Assert that B was called and A was not.
 *
 * No adapter call occurs between unregister and re-register —
 * this tests that the adapter does not retain a stale cached instance.
 */

providerEngine.clear();

const providerA = new MockDatabaseProvider();

providerEngine.register("replace", providerA);

const replaceAdapter = new DatabaseAdapter("replace");
await replaceAdapter.select("users", { columns: "*" });

const aCallsBefore = providerA.calls.filter(c => c[0] === "select");
assert.equal(
  aCallsBefore.length,
  1,
  "Provider A must have been called by the adapter."
);

// Step 3: Unregister A
providerEngine.unregister("replace");

// Step 4: Register provider B under the same name
const providerB = new MockDatabaseProvider();
providerEngine.register("replace", providerB);

// Step 5 & 6: Call adapter again — provider B must be called, A must not
const replacementResult = await replaceAdapter.select("users", { columns: "*" });

const aCallsAfter = providerA.calls.filter(c => c[0] === "select");
const bCalls = providerB.calls.filter(c => c[0] === "select");

assert.equal(
  aCallsAfter.length,
  1,
  "Provider A must not be called again after unregister + re-register."
);

assert.equal(
  bCalls.length,
  1,
  "Provider B must be called after re-registration under the same name."
);

assert.equal(
  replacementResult.error,
  null,
  "Adapter must return successful result with provider B."
);

console.log("[Test] ✓ Provider replacement regression test passed.");

/*
 * ============================================================
 * NO SUPABASE DEPENDENCY
 * ============================================================
 */

// Verify no Supabase-specific calls are made
providerEngine.clear();
providerEngine.register("clean", new MockDatabaseProvider());

const cleanAdapter = new DatabaseAdapter("clean");
await cleanAdapter.select("users", { columns: "*" });
await cleanAdapter.insert("users", { name: "x" });
await cleanAdapter.update("users", { name: "y" }, { id: 1 });
await cleanAdapter.delete("users", { id: 1 });

const providerCalls = providerEngine.get("clean").calls;
const callTypes = providerCalls.map(c => c[0]);

assert.ok(
  callTypes.includes("select"),
  "select was called."
);
assert.ok(
  callTypes.includes("insert"),
  "insert was called."
);
assert.ok(
  callTypes.includes("update"),
  "update was called."
);
assert.ok(
  callTypes.includes("delete"),
  "delete was called."
);

assert.equal(
  callTypes.filter(c => c === "getClient").length,
  0,
  "No getClient() calls — adapter does not bypass the contract."
);
assert.equal(
  callTypes.filter(c => c === "getStorage").length,
  0,
  "No getStorage() calls — storage is not part of DatabaseAdapter."
);

console.log("[Test] ✓ No Supabase dependency passed.");

/*
 * ============================================================
 * CONFIGURATION RESOLUTION
 * ============================================================
 */

// Authoritative config source must export a non-empty string
assert.equal(
  typeof databaseProviderName,
  "string",
  "databaseProviderName must be a string."
);
assert.ok(
  databaseProviderName.trim().length > 0,
  "databaseProviderName must not be empty."
);

// getDatabaseProviderName() returns the same value
assert.equal(
  getDatabaseProviderName(),
  databaseProviderName,
  "getDatabaseProviderName() returns the same value as the export."
);

// Singleton configuration with config-provided name works
const configuredAdapter = new DatabaseAdapter();
configuredAdapter.configure(databaseProviderName);
assert.equal(
  configuredAdapter.providerName,
  databaseProviderName,
  "Adapter stores the config-provided provider name."
);

// configure() rejects empty string
assert.throws(
  () => configuredAdapter.configure(""),
  /non-empty string/,
  "configure() rejects empty provider name."
);

// configure() rejects whitespace-only string
assert.throws(
  () => configuredAdapter.configure("   "),
  /non-empty string/,
  "configure() rejects whitespace-only provider name."
);

// configure() rejects non-string
assert.throws(
  () => configuredAdapter.configure(null),
  /non-empty string/,
  "configure() rejects null provider name."
);

// After successful configure(), provider name is retained
configuredAdapter.configure("custom-provider");
assert.equal(
  configuredAdapter.providerName,
  "custom-provider",
  "Adapter retains the configured provider name."
);

// Adapter without any configuration throws on database operation
const unconfiguredAdapter = new DatabaseAdapter();
await assert.rejects(
  () => unconfiguredAdapter.select("users", { columns: "*" }),
  /No database provider configured/,
  "Unconfigured adapter throws clear error on database operation."
);

console.log("[Test] ✓ Configuration resolution passed.");

/*
 * ============================================================
 * CLEAR CONFIGURATION REGRESSION TESTS
 * ============================================================
 */

const clearableAdapter = new DatabaseAdapter("supabase");
assert.equal(
  clearableAdapter.providerName,
  "supabase",
  "Adapter starts with configured provider name."
);

clearableAdapter.clearConfiguration();
assert.equal(
  clearableAdapter.providerName,
  null,
  "clearConfiguration() resets provider name to null."
);

// Calling clearConfiguration repeatedly is safe
clearableAdapter.clearConfiguration();
clearableAdapter.clearConfiguration();
assert.equal(
  clearableAdapter.providerName,
  null,
  "Repeated clearConfiguration() calls are safe."
);

// After clearing, database operations fail with unconfigured error
await assert.rejects(
  () => clearableAdapter.select("users", { columns: "*" }),
  /No database provider configured/,
  "Cleared adapter throws unconfigured-provider error on select."
);

console.log("[Test] ✓ Clear configuration regression passed.");

/*
 * ============================================================
 * ERROR CONTRACT REGRESSION TESTS
 * ============================================================
 *
 * Provider contract: throw on error, return raw data on success.
 * Adapter contract: catch provider errors, normalize into { data, error }.
 *
 * These tests prove:
 *   1. An error thrown by a provider becomes non-null outer result.error,
 *      with result.data === null.
 *   2. Successful provider data is returned directly as result.data,
 *      without an extra { data, error } nesting layer.
 */

class RawDataProvider {
  constructor() {
    this.calls = [];
    this.shouldFail = null;
    this.returnValue = null;
  }

  async select(table, query, context) {
    this.calls.push(["select", table, query, context]);
    if (this.shouldFail === "select") throw new Error("select failed");
    return this.returnValue ?? [{ id: 1, name: "test" }];
  }

  async insert(table, records, context) {
    this.calls.push(["insert", table, records, context]);
    if (this.shouldFail === "insert") throw new Error("insert failed");
    return this.returnValue ?? [{ id: 1, ...records }];
  }

  async update(table, values, filters, context) {
    this.calls.push(["update", table, values, filters, context]);
    if (this.shouldFail === "update") throw new Error("update failed");
    return this.returnValue ?? [{ id: 1, ...values }];
  }

  async delete(table, filters, context) {
    this.calls.push(["delete", table, filters, context]);
    if (this.shouldFail === "delete") throw new Error("delete failed");
    return this.returnValue ?? [];
  }

  async connect(context) {
    this.calls.push(["connect", context]);
    if (this.shouldFail === "connect") throw new Error("connect failed");
  }

  async disconnect(context) {
    this.calls.push(["disconnect", context]);
    if (this.shouldFail === "disconnect") throw new Error("disconnect failed");
  }

  async health(context) {
    this.calls.push(["health", context]);
    if (this.shouldFail === "health") throw new Error("health failed");
    return { status: "ok" };
  }
}

providerEngine.clear();
providerEngine.register("raw-error", new RawDataProvider());

const rawAdapter = new DatabaseAdapter("raw-error");

/*
 * 1. Provider error → outer result.error non-null, result.data === null
 */

const rawErrorProvider = providerEngine.get("raw-error");
rawErrorProvider.shouldFail = "select";
rawErrorProvider.returnValue = null;

const selectErr = await rawAdapter.select("users", { columns: "*" });
assert.equal(
  selectErr.data,
  null,
  "Provider-thrown error results in null outer data."
);
assert.ok(
  selectErr.error,
  "Provider-thrown error results in non-null outer error."
);
assert.equal(
  selectErr.error.message,
  "select failed",
  "Outer error message matches provider error message."
);

rawErrorProvider.shouldFail = "insert";
const insertErr = await rawAdapter.insert("users", { name: "x" });
assert.equal(insertErr.data, null, "Insert error → null outer data.");
assert.ok(insertErr.error, "Insert error → non-null outer error.");

rawErrorProvider.shouldFail = "update";
const updateErr = await rawAdapter.update("users", { name: "y" }, { id: 1 });
assert.equal(updateErr.data, null, "Update error → null outer data.");
assert.ok(updateErr.error, "Update error → non-null outer error.");

rawErrorProvider.shouldFail = "delete";
const deleteErr = await rawAdapter.delete("users", { id: 1 });
assert.equal(deleteErr.data, null, "Delete error → null outer data.");
assert.ok(deleteErr.error, "Delete error → non-null outer error.");

rawErrorProvider.shouldFail = "connect";
const connectErr = await rawAdapter.connect({ env: "test" });
assert.equal(connectErr.data, null, "Connect error → null outer data.");
assert.ok(connectErr.error, "Connect error → non-null outer error.");

rawErrorProvider.shouldFail = "disconnect";
const disconnectErr = await rawAdapter.disconnect({ env: "test" });
assert.equal(disconnectErr.data, null, "Disconnect error → null outer data.");
assert.ok(disconnectErr.error, "Disconnect error → non-null outer error.");

rawErrorProvider.shouldFail = "health";
const healthErr = await rawAdapter.health({ env: "test" });
assert.equal(healthErr.data, null, "Health error → null outer data.");
assert.ok(healthErr.error, "Health error → non-null outer error.");

console.log("[Test] ✓ Provider error propagation regression passed.");

/*
 * 2. Successful provider data returned directly as result.data,
 *    without { data, error } nesting
 */

providerEngine.clear();
providerEngine.register("raw-success", new RawDataProvider());

const successAdapter = new DatabaseAdapter("raw-success");
const successProvider = providerEngine.get("raw-success");

// Raw data return (not wrapped in { data, error })
const rawRows = [{ id: 1, name: "alice" }, { id: 2, name: "bob" }];
successProvider.returnValue = rawRows;

const selectOk = await successAdapter.select("users", { columns: "*" });
assert.equal(
  selectOk.data,
  rawRows,
  "Raw provider data returned directly as result.data."
);
assert.equal(
  selectOk.error,
  null,
  "Successful select has null outer error."
);
assert.notDeepEqual(
  selectOk.data,
  { data: rawRows, error: null },
  "Result.data is not a nested { data, error } wrapper."
);

const insertOk = await successAdapter.insert("users", { name: "carol" });
assert.ok(Array.isArray(insertOk.data), "Insert data is raw provider data.");
assert.equal(insertOk.error, null, "Insert error is null on success.");

const updateOk = await successAdapter.update(
  "users",
  { name: "dave" },
  { id: 1 }
);
assert.ok(Array.isArray(updateOk.data), "Update data is raw provider data.");
assert.equal(updateOk.error, null, "Update error is null on success.");

const deleteOk = await successAdapter.delete("users", { id: 1 });
assert.ok(Array.isArray(deleteOk.data), "Delete data is raw provider data.");
assert.equal(deleteOk.error, null, "Delete error is null on success.");

console.log("[Test] ✓ Raw data return regression passed.");

console.log("[Test] ✓ Error contract regression passed.");

/*
 * ============================================================
 * FINAL
 * ============================================================
 */

providerEngine.clear();

console.log("[Test] ✓ DatabaseAdapter test passed.");
