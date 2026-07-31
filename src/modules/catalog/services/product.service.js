import Database from "@/core/database/adapters/database/database.adapter";

const TABLE = "products";

export async function getProducts() {
  const { data, error } = await Database.select(
    TABLE,
    "*",
    {
      order: {
        column: "create_at",
        ascending: false,
      },
    }
  );

  if (error) throw error;

  return data;
}

export async function getProduct(id) {
  const { data, error } = await Database.select(
    TABLE,
    "*",
    {
      filters: { id },
      single: true,
    }
  );

  if (error) throw error;

  return data;
}

export async function createProduct(product) {
  const { data, error } = await Database.insert(
    TABLE,
    product,
    {
      single: true,
    }
  );

  if (error) throw error;

  return data;
}

export async function updateProduct(id, product) {
  const { data, error } = await Database.update(
    TABLE,
    product,
    { id },
    {
      single: true,
    }
  );

  if (error) throw error;

  return data;
}

export async function deleteProduct(id) {
  const { error } = await Database.delete(
    TABLE,
    { id }
  );

  if (error) throw error;

  return true;
}