import assert from "node:assert/strict";
import {
  getSupabaseClient,
  resetSupabaseClient,
  setSupabaseClient,
} from "../client/supabase.client.js";
import SupabaseProvider from "../engine/supabase.provider.js";
import DatabaseProvider from "../../../contracts/DatabaseProvider.interface.js";
import ProviderValidator from "../../../engine/validators/provider.validator.js";

/*
 * Build a chainable, awaitable Supabase query builder mock.
 *
 * Each chain method returns the builder itself. The builder is thenable:
 * awaiting it resolves with { data, error }. Tests can preconfigure
 * the resolved value and inspect which methods were called.
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

console.log("[Test] Starting SupabaseProvider test.");

resetSupabaseClient();

/*
 * ============================================================
 * Lazy client initialization
 * ============================================================
 */

// Importing the provider does not create a client. First actual use does.
const provider = SupabaseProvider;

assert.equal(typeof provider.getClient, "function", "getClient is exposed.");
assert.equal(
  typeof provider.getStorage,
  "function",
  "getStorage is exposed."
);
assert.equal(
  typeof provider.getRealtime,
  "function",
  "getRealtime is exposed."
);
assert.equal(
  typeof provider.getFunctions,
  "function",
  "getFunctions is exposed."
);
console.log("[Test] ✓ Provider-specific methods exposed.");

/*
 * ============================================================
 * ProviderValidator acceptance
 * ============================================================
 */

assert.ok(
  ProviderValidator.validate(provider),
  "ProviderValidator.validate() accepts SupabaseProvider."
);
assert.ok(
  provider instanceof DatabaseProvider,
  "SupabaseProvider extends DatabaseProvider."
);
console.log("[Test] ✓ ProviderValidator acceptance passed.");

/*
 * ============================================================
 * Successful CRUD operations return raw data
 * ============================================================
 */

const client = makeMockClient();
setSupabaseClient(client);

const rows = [{ id: 1, name: "alice" }, { id: 2, name: "bob" }];
client.builder.resolveWith(rows, null);

// select with columns, multiple filters, order, limit, single
const selectData = await provider.select("users", {
  columns: "id, name",
  filters: { active: true, role: "admin" },
  order: { column: "created_at", ascending: false },
  limit: 10,
  single: false,
});
assert.deepEqual(
  selectData,
  rows,
  "select() returns raw data array."
);
assert.deepEqual(
  client.fromCalls,
  ["users"],
  "select() queries the correct table."
);
assert.deepEqual(
  client.builder.calls.filter(c => c[0] === "eq"),
  [
    ["eq", "active", true],
    ["eq", "role", "admin"],
  ],
  "Multiple filters produce individual eq(column, value) calls."
);
assert.ok(
  client.builder.calls.some(c => c[0] === "order"),
  "select() applies ordering."
);
assert.ok(
  client.builder.calls.some(c => c[0] === "limit"),
  "select() applies limit."
);
console.log("[Test] ✓ select() returns raw data with correct query translation.");

// insert returns raw data
const inserted = [{ id: 3, name: "carol" }];
client.builder.resolveWith(inserted, null);
const insertData = await provider.insert("users", { name: "carol" });
assert.deepEqual(
  insertData,
  inserted,
  "insert() returns raw data."
);
console.log("[Test] ✓ insert() returns raw data.");

// update returns raw data
client.builder.calls.length = 0;
const updated = [{ id: 1, name: "dave" }];
client.builder.resolveWith(updated, null);
const updateData = await provider.update("users", { name: "dave" }, { id: 1 });
assert.deepEqual(
  updateData,
  updated,
  "update() returns raw data."
);
assert.deepEqual(
  client.builder.calls.filter(c => c[0] === "eq"),
  [["eq", "id", 1]],
  "update() applies filters via eq()."
);
console.log("[Test] ✓ update() returns raw data with filters applied.");

// delete returns raw data
const deleted = [{ id: 1 }];
client.builder.resolveWith(deleted, null);
const deleteData = await provider.delete("users", { id: 1 });
assert.deepEqual(
  deleteData,
  deleted,
  "delete() returns raw data."
);
console.log("[Test] ✓ delete() returns raw data.");

/*
 * ============================================================
 * SDK errors are thrown by all four CRUD operations
 * ============================================================
 */

const sdkError = new Error("relation \"users\" does not exist");
sdkError.code = "42P01";

client.builder.resolveWith(null, sdkError);

await assert.rejects(
  () => provider.select("users", { columns: "*" }),
  sdkError,
  "select() throws SDK error."
);

client.builder.resolveWith(null, sdkError);
await assert.rejects(
  () => provider.insert("users", { name: "x" }),
  sdkError,
  "insert() throws SDK error."
);

client.builder.resolveWith(null, sdkError);
await assert.rejects(
  () => provider.update("users", { name: "y" }, { id: 1 }),
  sdkError,
  "update() throws SDK error."
);

client.builder.resolveWith(null, sdkError);
await assert.rejects(
  () => provider.delete("users", { id: 1 }),
  sdkError,
  "delete() throws SDK error."
);

console.log("[Test] ✓ SDK errors thrown by all four CRUD operations.");

/*
 * ============================================================
 * Null and omitted query options
 * ============================================================
 */

client.builder.resolveWith([], null);

// select(table, null) must not crash
await provider.select("users", null);
console.log("[Test] ✓ select(table, null) does not crash.");

// select(table, { filters: null, order: null }) works as empty options
await provider.select("users", { filters: null, order: null });
console.log("[Test] ✓ select with null filters and order works.");

// select(table) with omitted query works
await provider.select("users");
console.log("[Test] ✓ select with omitted query works.");

// update(table, values, null) must not crash
await provider.update("users", { name: "z" }, null);
console.log("[Test] ✓ update(table, values, null) does not crash.");

// delete(table, null) must not crash
await provider.delete("users", null);
console.log("[Test] ✓ delete(table, null) does not crash.");

/*
 * ============================================================
 * connect() semantics
 * ============================================================
 */

// connect() initializes the lazy client (already set via setSupabaseClient).
// It does not query a hardcoded _health table.
client.fromCalls.length = 0;
const connectResult = await provider.connect({ env: "test" });
assert.deepEqual(
  connectResult,
  { connected: true, context: { env: "test" } },
  "connect() returns { connected: true, context }."
);
assert.deepEqual(
  client.fromCalls,
  [],
  "connect() does not query any table (no _health query)."
);
console.log("[Test] ✓ connect() initializes client without _health query.");

/*
 * ============================================================
 * disconnect() semantics
 * ============================================================
 */

const disconnectResult = await provider.disconnect({ env: "test" });
assert.deepEqual(
  disconnectResult,
  { disconnected: true, context: { env: "test" } },
  "disconnect() returns { disconnected: true, context }."
);

// Client must NOT be destroyed/reset by disconnect.
assert.equal(
  getSupabaseClient(),
  client,
  "disconnect() does not reset the shared client."
);
console.log("[Test] ✓ disconnect() is a safe no-op and does not reset client.");

/*
 * ============================================================
 * health() semantics
 * ============================================================
 */

// health() with working client reports healthy (local readiness verified).
const healthOk = await provider.health({ env: "test" });
assert.deepEqual(
  healthOk,
  { status: "healthy", error: null, context: { env: "test" } },
  "health() returns healthy when client initializes."
);
console.log("[Test] ✓ health() reports healthy on client readiness.");

// health() when client initialization fails.
// Reset client so getSupabaseClient() will attempt creation.
// If env vars are missing, getSupabaseClient() throws.
// health() catches and returns unhealthy without crashing.
resetSupabaseClient();

const healthFail = await provider.health({ env: "test" });
assert.equal(
  healthFail.status,
  "unhealthy",
  "health() reports unhealthy when client init fails."
);
assert.ok(
  healthFail.error,
  "health() includes error message when client init fails."
);
console.log("[Test] ✓ health() reports unhealthy when client initialization fails.");

/*
 * ============================================================
 * FINAL
 * ============================================================
 */

resetSupabaseClient();
console.log("[Test] ✓ SupabaseProvider test passed.");
