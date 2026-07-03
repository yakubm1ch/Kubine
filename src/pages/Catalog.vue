<template>
  <section class="catalog">

    <header class="catalog-header">

      <div>
        <h1>Каталог</h1>

        <p>
          Компоненти, модулі, інструменти та все для Embedded-розробки.
        </p>
      </div>

      <button
        class="refresh"
        @click="loadProducts"
      >
        Оновити
      </button>

    </header>

    <SearchBar
      v-model="search"
    />

    <CategoryFilter
      v-model="selectedCategory"
      :categories="categories"
    />

    <div
      v-if="loading"
      class="loading"
    >
      Завантаження каталогу...
    </div>

    <ProductGrid
      v-else
      :products="filteredProducts"
    />

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

import SearchBar from "../components/product/SearchBar.vue";
import CategoryFilter from "../components/product/CategoryFilter.vue";
import ProductGrid from "../components/product/ProductGrid.vue";

import { getProducts } from "../services/products";

const products = ref([]);
const loading = ref(true);

const search = ref("");
const selectedCategory = ref("Усі");

const categories = computed(() => {

  const list = products.value
    .map(product => product.category)
    .filter(Boolean);

  return ["Усі", ...new Set(list)];

});

const filteredProducts = computed(() => {

  let list = products.value;

  if (selectedCategory.value !== "Усі") {

    list = list.filter(
      product => product.category === selectedCategory.value
    );

  }

  if (!search.value.trim()) {

    return list;

  }

  const q = search.value.toLowerCase();

  return list.filter(product => {

    return (

      product.name?.toLowerCase().includes(q) ||

      product.description?.toLowerCase().includes(q) ||

      product.category?.toLowerCase().includes(q)

    );

  });

});

async function loadProducts() {

  loading.value = true;

  products.value = await getProducts();

  loading.value = false;

}

onMounted(loadProducts);
</script>

<style scoped>

.catalog{

max-width:1400px;

margin:auto;

padding:60px 32px;

}

.catalog-header{

display:flex;

justify-content:space-between;

align-items:center;

gap:20px;

margin-bottom:40px;

}

.catalog-header h1{

font-size:48px;

margin-bottom:10px;

color:#00C896;

}

.catalog-header p{

font-size:18px;

color:#9CA3AF;

}

.refresh{

padding:12px 20px;

border:none;

border-radius:12px;

background:#00C896;

color:#111827;

font-weight:700;

cursor:pointer;

transition:.25s;

}

.refresh:hover{

transform:translateY(-2px);

}

.loading{

padding:100px;

text-align:center;

font-size:20px;

color:#9CA3AF;

}

@media(max-width:900px){

.catalog-header{

flex-direction:column;

align-items:flex-start;

}

}

</style>