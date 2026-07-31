export class QueryHelper {

  select(client, table) {
    return client.from(table).select("*");
  }

  insert(client, table, data) {
    return client.from(table).insert(data);
  }

  update(client, table, data, column, value) {
    return client
      .from(table)
      .update(data)
      .eq(column, value);
  }

  remove(client, table, column, value) {
    return client
      .from(table)
      .delete()
      .eq(column, value);
  }

}

export default new QueryHelper();