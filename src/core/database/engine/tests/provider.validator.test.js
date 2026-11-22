import assert from "node:assert/strict";

import ProviderValidator from "../validators/provider.validator.js";

import DatabaseProvider from "../../contracts/DatabaseProvider.interface.js";

console.log(
  "[Test] Starting ProviderValidator test."
);

/*
 * ============================================================
 * CORE CONTRACT
 * ============================================================
 */

class CoreCompleteProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}
}

const coreCompleteProvider =
  new CoreCompleteProvider();

assert.equal(
  ProviderValidator.validate(coreCompleteProvider),
  true,
  "A provider implementing all seven core methods must pass validation."
);

assert.equal(
  ProviderValidator.isValid(coreCompleteProvider),
  true,
  "isValid() must return true for a core-valid provider."
);

assert.deepEqual(
  ProviderValidator.getMissingMethods(coreCompleteProvider),
  [],
  "A core-valid provider must have no missing core methods."
);

console.log(
  "[Test] ✓ Core complete provider passed."
);

/*
 * ============================================================
 * UNDEFINED PROVIDER
 * ============================================================
 */

assert.throws(
  () => ProviderValidator.validate(),
  /undefined/i,
  "Undefined provider must be rejected."
);

assert.equal(
  ProviderValidator.isValid(),
  false,
  "isValid() must return false for an undefined provider."
);

assert.deepEqual(
  ProviderValidator.getMissingMethods(),
  ProviderValidator.requiredMethods,
  "Undefined provider must report all core required methods as missing."
);

console.log(
  "[Test] ✓ Undefined provider guard passed."
);

/*
 * ============================================================
 * MISSING CORE METHOD
 * ============================================================
 */

class IncompleteCoreProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}

  // Missing select()
}

const incompleteCoreProvider =
  new IncompleteCoreProvider();

const missingCoreMethods =
  ProviderValidator.getMissingMethods(
    incompleteCoreProvider
  );

assert.deepEqual(
  missingCoreMethods,
  ["select"],
  "Validator must report every missing core required method."
);

assert.equal(
  ProviderValidator.isValid(
    incompleteCoreProvider
  ),
  false,
  "Incomplete core provider must be invalid."
);

assert.throws(
  () =>
    ProviderValidator.validate(
      incompleteCoreProvider
    ),
  /select/,
  "Validation error must identify the missing required core method."
);

console.log(
  "[Test] ✓ Missing core method detection passed."
);

/*
 * ============================================================
 * NON-FUNCTION CORE MEMBER
 * ============================================================
 */

class InvalidCoreMemberProvider {
  connect = "not-a-function";

  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}
}

const invalidCoreMemberProvider =
  new InvalidCoreMemberProvider();

assert.equal(
  ProviderValidator.isValid(
    invalidCoreMemberProvider
  ),
  false,
  "A required core member that is not a function must invalidate the provider."
);

assert.deepEqual(
  ProviderValidator.getMissingMethods(
    invalidCoreMemberProvider
  ),
  ["connect"],
  "Non-function required core members must be reported as missing."
);

assert.throws(
  () =>
    ProviderValidator.validate(
      invalidCoreMemberProvider
    ),
  /connect/,
  "Validation error must identify the invalid required core member."
);

console.log(
  "[Test] ✓ Non-function core member detection passed."
);

/*
 * ============================================================
 * PROVIDER WITHOUT OPTIONAL CAPABILITIES
 * ============================================================
 *
 * A provider implementing only the seven core methods must
 * still pass core validation. Optional capabilities are not
 * required.
 */

class CoreOnlyProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}
}

const coreOnlyProvider =
  new CoreOnlyProvider();

assert.equal(
  ProviderValidator.validate(coreOnlyProvider),
  true,
  "A core-only provider must pass core validation."
);

assert.equal(
  ProviderValidator.isSchemaCapable(coreOnlyProvider),
  false,
  "A core-only provider must not be schema capable."
);

assert.equal(
  ProviderValidator.isTransactionCapable(coreOnlyProvider),
  false,
  "A core-only provider must not be transaction capable."
);

console.log(
  "[Test] ✓ Core-only provider passes core validation."
);

/*
 * ============================================================
 * PROVIDER EXTENDING DATABASEPROVIDER WITH CORE METHODS ONLY
 * ============================================================
 *
 * A provider that inherits from DatabaseProvider but implements
 * only the seven core methods must pass core validation and
 * must NOT be falsely detected as schema- or transaction-capable
 * through inherited stubs.
 */

class CoreOnlyInheritedProvider extends DatabaseProvider {
  async connect() {}

  async disconnect() {}

  async health() {}

  async insert() {}

  async update() {}

  async delete() {}

  async select() {}
}

const coreOnlyInheritedProvider =
  new CoreOnlyInheritedProvider();

assert.equal(
  ProviderValidator.validate(coreOnlyInheritedProvider),
  true,
  "A DatabaseProvider subclass with core methods must pass core validation."
);

assert.equal(
  ProviderValidator.isValid(coreOnlyInheritedProvider),
  true,
  "isValid() must return true for a core-valid inherited provider."
);

assert.equal(
  ProviderValidator.isSchemaCapable(coreOnlyInheritedProvider),
  false,
  "A DatabaseProvider subclass without schema methods must not be schema capable."
);

assert.equal(
  ProviderValidator.isTransactionCapable(coreOnlyInheritedProvider),
  false,
  "A DatabaseProvider subclass without transaction method must not be transaction capable."
);

assert.deepEqual(
  ProviderValidator.getMissingSchemaMethods(coreOnlyInheritedProvider),
  [
    "createTable",
    "updateTable",
    "deleteTable",
  ],
  "Validator must report all schema methods as missing for a core-only inherited provider."
);

assert.deepEqual(
  ProviderValidator.getMissingTransactionMethods(coreOnlyInheritedProvider),
  ["transaction"],
  "Validator must report transaction as missing for a core-only inherited provider."
);

console.log(
  "[Test] ✓ Core-only inherited provider passes core validation without false capability positives."
);

/*
 * ============================================================
 * VALID OPTIONAL CAPABILITY: SCHEMA
 * ============================================================
 */

class SchemaCapableProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async createTable() {}
  async updateTable() {}
  async deleteTable() {}
}

const schemaCapableProvider =
  new SchemaCapableProvider();

assert.equal(
  ProviderValidator.validate(schemaCapableProvider),
  true,
  "A schema-capable provider must still pass core validation."
);

assert.equal(
  ProviderValidator.isSchemaCapable(schemaCapableProvider),
  true,
  "A provider implementing all schema methods must be schema capable."
);

assert.deepEqual(
  ProviderValidator.getMissingSchemaMethods(schemaCapableProvider),
  [],
  "A schema-capable provider must have no missing schema methods."
);

console.log(
  "[Test] ✓ Valid SchemaCapability passed."
);

/*
 * ============================================================
 * VALID OPTIONAL CAPABILITY: TRANSACTION
 * ============================================================
 */

class TransactionCapableProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async transaction() {}
}

const transactionCapableProvider =
  new TransactionCapableProvider();

assert.equal(
  ProviderValidator.validate(transactionCapableProvider),
  true,
  "A transaction-capable provider must still pass core validation."
);

assert.equal(
  ProviderValidator.isTransactionCapable(transactionCapableProvider),
  true,
  "A provider implementing the transaction method must be transaction capable."
);

assert.deepEqual(
  ProviderValidator.getMissingTransactionMethods(transactionCapableProvider),
  [],
  "A transaction-capable provider must have no missing transaction methods."
);

console.log(
  "[Test] ✓ Valid TransactionCapability passed."
);

/*
 * ============================================================
 * INCOMPLETE OPTIONAL CAPABILITY: SCHEMA
 * ============================================================
 */

class IncompleteSchemaProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async createTable() {}
  async updateTable() {}

  // Missing deleteTable()
}

const incompleteSchemaProvider =
  new IncompleteSchemaProvider();

assert.equal(
  ProviderValidator.validate(incompleteSchemaProvider),
  true,
  "A provider missing an optional capability method must still pass core validation."
);

assert.equal(
  ProviderValidator.isSchemaCapable(incompleteSchemaProvider),
  false,
  "A provider with an incomplete schema capability must not be schema capable."
);

assert.deepEqual(
  ProviderValidator.getMissingSchemaMethods(incompleteSchemaProvider),
  ["deleteTable"],
  "Validator must report missing schema capability methods."
);

assert.throws(
  () =>
    ProviderValidator.validateSchemaCapability(
      incompleteSchemaProvider
    ),
  /deleteTable/,
  "Capability validation error must identify the missing schema method."
);

console.log(
  "[Test] ✓ Incomplete SchemaCapability fails capability validation."
);

/*
 * ============================================================
 * INCOMPLETE OPTIONAL CAPABILITY: TRANSACTION
 * ============================================================
 */

class IncompleteTransactionProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  // Missing transaction()
}

const incompleteTransactionProvider =
  new IncompleteTransactionProvider();

assert.equal(
  ProviderValidator.validate(incompleteTransactionProvider),
  true,
  "A provider missing an optional transaction method must still pass core validation."
);

assert.equal(
  ProviderValidator.isTransactionCapable(incompleteTransactionProvider),
  false,
  "A provider without the transaction method must not be transaction capable."
);

assert.deepEqual(
  ProviderValidator.getMissingTransactionMethods(incompleteTransactionProvider),
  ["transaction"],
  "Validator must report missing transaction capability methods."
);

assert.throws(
  () =>
    ProviderValidator.validateTransactionCapability(
      incompleteTransactionProvider
    ),
  /transaction/,
  "Capability validation error must identify the missing transaction method."
);

console.log(
  "[Test] ✓ Incomplete TransactionCapability fails capability validation."
);

/*
 * ============================================================
 * FINAL
 * ============================================================
 */

console.log(
  "[Test] ✓ ProviderValidator test passed."
);
