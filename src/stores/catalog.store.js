import { defineStore } from "pinia";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service";

export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    productCount: (state) => state.products.length,

    featuredProducts: (state) =>
      state.products.filter((p) => p.featured),

    availableProducts: (state) =>
      state.products.filter((p) => p.in_stock),
  },

  actions: {
    async loadProducts(force = false) {
      if (this.initialized && !force) return;

      this.loading = true;
      this.error = null;

      try {
        this.products = await getProducts();
        this.initialized = true;
      } catch (err) {
        this.error = err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async addProduct(product) {
      const created = await createProduct(product);
      this.products.unshift(created);
    },

    async editProduct(id, product) {
      const updated = await updateProduct(id, product);

      const index = this.products.findIndex((p) => p.id === id);

      if (index !== -1) {
        this.products[index] = updated;
      }
    },

    async removeProduct(id) {
      await deleteProduct(id);

      this.products = this.products.filter((p) => p.id !== id);
    },
  },
});