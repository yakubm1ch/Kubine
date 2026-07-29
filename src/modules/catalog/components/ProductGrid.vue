<template>
  <div class="grid">

    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />

    <div
      v-if="products.length === 0"
      class="empty"
    >
      <h2>Поки що товарів немає</h2>
      <p>Додай перший товар у Supabase.</p>
    </div>

  </div>
</template>

<script setup>
import ProductCard from "./ProductCard.vue";

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>

.grid{

display:grid;

grid-template-columns:repeat(auto-fill,minmax(320px,1fr));

gap:28px;

}

.empty{

grid-column:1/-1;

padding:80px;

text-align:center;

border:1px dashed #374151;

border-radius:20px;

color:#9CA3AF;

}

.empty h2{

margin-bottom:12px;

color:white;

}

</style>