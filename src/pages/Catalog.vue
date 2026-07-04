<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "../stores/catalog.store";

const catalog = useCatalogStore();

const {
  products,
  loading,
  error,
  productCount,
} = storeToRefs(catalog);

onMounted(() => {
  catalog.loadProducts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-12">

    <h1 class="text-4xl font-bold mb-2">
      Catalog
    </h1>

    <p class="text-gray-400 mb-8">
      Products: {{ productCount }}
    </p>

    <div v-if="loading">
      Loading products...
    </div>

    <div
      v-else-if="error"
      class="text-red-500"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="grid gap-6"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="p-5 rounded-xl border border-neutral-700 bg-neutral-900"
      >
        <h2 class="text-xl font-semibold">
          {{ product.name }}
        </h2>

        <p class="text-neutral-400 mt-2">
          {{ product.description }}
        </p>

        <div class="mt-3 text-emerald-400 font-bold">
          {{ product.price }}
        </div>
      </div>
    </div>

  </div>
</template>