/**

* Optional capability contract for database providers that
* support schema management (DDL).
*
* A provider is not required to implement SchemaCapability
* to satisfy the core DatabaseProvider contract. Providers that
* do implement it must expose the complete schema contract.
*
* Read-only providers or providers that delegate schema
* management to external tools should not declare this
* capability; callers should check for its presence before
* attempting schema operations.
  */

export class SchemaCapability {
/**

* Create a database table.
*
* @param {string} name
* @param {object} definition
* @param {object} context
* @returns {Promise<unknown>}
  */
  async createTable(name, definition, context = {}) {
  throw new Error(
  `${this.constructor.name}.createTable() must be implemented.`
  );
  }

/**

* Update a database table schema.
*
* @param {string} name
* @param {object} definition
* @param {object} context
* @returns {Promise<unknown>}
  */
  async updateTable(name, definition, context = {}) {
  throw new Error(
  `${this.constructor.name}.updateTable() must be implemented.`
  );
  }

/**

* Delete a database table.
*
* @param {string} name
* @param {object} context
* @returns {Promise<unknown>}
  */
  async deleteTable(name, context = {}) {
  throw new Error(
  `${this.constructor.name}.deleteTable() must be implemented.`
  );
  }
}

export default SchemaCapability;
