/**
 * Base interface for all database providers.
 */

export class DatabaseProvider {
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