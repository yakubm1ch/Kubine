<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "@/modules/catalog/stores/catalog.store";

const catalog = useCatalogStore();

const {
  products,
  loading,
  error,
} = storeToRefs(catalog);

onMounted(() => {
  catalog.loadProducts();
});
</script>

<template>

<div class="card">

<h2>Products</h2>

<div v-if="loading">

Loading...

</div>

<div
v-else-if="error"
class="error"
>

{{ error }}

</div>

<table v-else>

<thead>

<tr>

<th>Title</th>

<th>Price</th>

<th>Stock</th>

<th>Status</th>

</tr>

</thead>

<tbody>

<tr
v-for="product in products"
:key="product.id"
>

<td>{{ product.title }}</td>

<td>{{ product.price }}</td>

<td>{{ product.stock }}</td>

<td>

<span
:class="product.published ? 'ok' : 'draft'"
>

{{ product.published ? "Published" : "Draft" }}

</span>

</td>

</tr>

</tbody>

</table>

</div>

</template>

<style scoped>

.card{

padding:24px;

background:#151922;

border:1px solid #2A313D;

border-radius:18px;

overflow:auto;

}

table{

width:100%;

border-collapse:collapse;

}

th{

text-align:left;

padding:14px;

border-bottom:1px solid #2A313D;

color:#8A94A6;

}

td{

padding:14px;

border-bottom:1px solid #252B35;

}

.ok{

color:#00C896;

font-weight:600;

}

.draft{

color:#F59E0B;

font-weight:600;

}

.error{

color:#EF4444;

}

</style>