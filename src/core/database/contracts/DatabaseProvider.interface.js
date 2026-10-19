/**

* Base contract for all database providers.
*
* A database provider is responsible for exposing a stable
* database lifecycle and persistence API to the Database Engine.
*
* Provider-specific capabilities such as authentication,
* storage, realtime and serverless functions must be exposed
* by the concrete provider implementation without leaking
* provider-specific details into the generic Database Engine.
  */

export class DatabaseProvider {
/**

* Establish a connection with the underlying provider.
*
* @param {object} context
* @returns {Promise<void>}
  */
  async connect(context = {}) {
  throw new Error(
  `${this.constructor.name}.connect() must be implemented.`
  );
  }

/**

* Close the provider connection and release resources.
*
* @param {object} context
* @returns {Promise<void>}
  */
  async disconnect(context = {}) {
  throw new Error(
  `${this.constructor.name}.disconnect() must be implemented.`
  );
  }

/**

* Check provider availability and health.
*
* @param {object} context
* @returns {Promise<object>}
  */
  async health(context = {}) {
  throw new Error(
  `${this.constructor.name}.health() must be implemented.`
  );
  }

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

* Update a database table.
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

/**

* Insert records.
*
* @param {string} table
* @param {object|object[]} records
* @param {object} context
* @returns {Promise<unknown>}
  */
  async insert(table, records, context = {}) {
  throw new Error(
  `${this.constructor.name}.insert() must be implemented.`
  );
  }

/**

* Update records.
*
* @param {string} table
* @param {object} values
* @param {object} filters
* @param {object} context
* @returns {Promise<unknown>}
  */
  async update(table, values, filters = {}, context = {}) {
  throw new Error(
  `${this.constructor.name}.update() must be implemented.`
  );
  }

/**

* Delete records.
*
* @param {string} table
* @param {object} filters
* @param {object} context
* @returns {Promise<unknown>}
  */
  async delete(table, filters = {}, context = {}) {
  throw new Error(
  `${this.constructor.name}.delete() must be implemented.`
  );
  }

/**

* Select records.
*
* @param {string} table
* @param {object} query
* @param {object} context
* @returns {Promise<unknown>}
  */
  async select(table, query = {}, context = {}) {
  throw new Error(
  `${this.constructor.name}.select() must be implemented.`
  );
  }

/**

* Execute operations inside a provider transaction.
*
* @param {Function} callback
* @param {object} context
* @returns {Promise<unknown>}
  */
  async transaction(callback, context = {}) {
  throw new Error(
  `${this.constructor.name}.transaction() must be implemented.`
  );
  }
  }

export default DatabaseProvider;
