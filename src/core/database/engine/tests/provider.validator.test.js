import assert from "node:assert/strict";

import ProviderValidator from "../validators/provider.validator.js";

console.log(
  "[Test] Starting ProviderValidator test."
);

/*
 * ============================================================
 * VALID PROVIDER
 * ============================================================
 */

class ValidProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async createTable() {}
  async updateTable() {}
  async deleteTable() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async transaction() {}
}

const validProvider =
  new ValidProvider();

assert.equal(
  ProviderValidator.validate(validProvider),
  true,
  "A complete provider must pass validation."
);

assert.equal(
  ProviderValidator.isValid(validProvider),
  true,
  "isValid() must return true for a valid provider."
);

assert.deepEqual(
  ProviderValidator.getMissingMethods(validProvider),
  [],
  "A valid provider must have no missing methods."
);

console.log(
  "[Test] ✓ Valid provider passed."
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
  "Undefined provider must report all required methods as missing."
);

console.log(
  "[Test] ✓ Undefined provider guard passed."
);

/*
 * ============================================================
 * MISSING METHODS
 * ============================================================
 */

class IncompleteProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async transaction() {}
}

const incompleteProvider =
  new IncompleteProvider();

const missingMethods =
  ProviderValidator.getMissingMethods(
    incompleteProvider
  );

assert.deepEqual(
  missingMethods,
  [
    "createTable",
    "updateTable",
    "deleteTable",
  ],
  "Validator must report every missing required method."
);

assert.equal(
  ProviderValidator.isValid(
    incompleteProvider
  ),
  false,
  "Incomplete provider must be invalid."
);

/*
 * validate() is fail-fast.
 *
 * It must reject the provider as soon as the first
 * missing required method is encountered.
 */
assert.throws(
  () =>
    ProviderValidator.validate(
      incompleteProvider
    ),
  /createTable/,
  "Validation error must identify the first missing required method."
);

console.log(
  "[Test] ✓ Missing method detection passed."
);

/*
 * ============================================================
 * NON-FUNCTION MEMBERS
 * ============================================================
 */

class InvalidMemberProvider {
  connect = "not-a-function";

  async disconnect() {}
  async health() {}

  async createTable() {}
  async updateTable() {}
  async deleteTable() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async transaction() {}
}

const invalidMemberProvider =
  new InvalidMemberProvider();

assert.equal(
  ProviderValidator.isValid(
    invalidMemberProvider
  ),
  false,
  "A required member that is not a function must invalidate the provider."
);

assert.deepEqual(
  ProviderValidator.getMissingMethods(
    invalidMemberProvider
  ),
  ["connect"],
  "Non-function required members must be reported as missing."
);

assert.throws(
  () =>
    ProviderValidator.validate(
      invalidMemberProvider
    ),
  /connect/,
  "Validation error must identify the invalid required member."
);

console.log(
  "[Test] ✓ Non-function member detection passed."
);

/*
 * ============================================================
 * OPTIONAL CAPABILITIES
 *
 * A provider does not need to expose auth/storage/realtime/
 * functions directly to satisfy the core DatabaseProvider
 * contract.
 * ============================================================
 */

class DatabaseOnlyProvider {
  async connect() {}
  async disconnect() {}
  async health() {}

  async createTable() {}
  async updateTable() {}
  async deleteTable() {}

  async insert() {}
  async update() {}
  async delete() {}
  async select() {}

  async transaction() {}
}

const databaseOnlyProvider =
  new DatabaseOnlyProvider();

assert.equal(
  ProviderValidator.validate(
    databaseOnlyProvider
  ),
  true,
  "A provider must not be required to expose optional capabilities."
);

console.log(
  "[Test] ✓ Optional capability separation passed."
);

/*
 * ============================================================
 * FINAL
 * ============================================================
 */

console.log(
  "[Test] ✓ ProviderValidator test passed."
);