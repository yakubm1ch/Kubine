/**

* Optional capability contract for database providers that
* support transactions.
*
* A provider is not required to implement TransactionCapability
* to satisfy the core DatabaseProvider contract. Providers that
* do implement it must expose the complete transaction contract.
*
* Providers that do not support transactions should not declare
* this capability; callers should check for its presence before
* attempting transactional operations.
  */

export class TransactionCapability {
/**

* Execute operations inside a provider transaction.
*
* The callback receives a transaction context and should return
* a promise. The provider commits the transaction when the
* callback resolves, and rolls back when it rejects.
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

export default TransactionCapability;
