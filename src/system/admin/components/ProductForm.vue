<script setup>
import { ref } from "vue";
import { useCatalogStore } from "@/modules/catalog/stores/catalog.store";
import { uploadImage } from "@/modules/settings/services/storage.service";

const catalog = useCatalogStore();

const form = ref({
  title: "",
  description: "",
  slug: "",
  price: 0,
  stock: 0,
  published: true,
  featured: false,
  images: [],
  category_id: null,
});

function generateSlug() {
  form.value.slug = form.value.title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

async function submit() {
  generateSlug();

  await catalog.addProduct(form.value);

  form.value = {
    title: "",
    description: "",
    slug: "",
    price: 0,
    stock: 0,
    published: true,
    featured: false,
    images: [],
    category_id: null,
  };
}
</script>

<template>

<div class="card">

<h2>New Product</h2>

<input
v-model="form.title"
placeholder="Title"
/>

<textarea
v-model="form.description"
rows="5"
placeholder="Description"
/>

<input
v-model.number="form.price"
type="number"
placeholder="Price"
/>

<input
v-model.number="form.stock"
type="number"
placeholder="Stock"
/>

<input
v-model.number="form.category_id"
type="number"
placeholder="Category"
/>

<label>

<input
type="checkbox"
v-model="form.published"
/>

Published

</label>

<label>

<input
type="checkbox"
v-model="form.featured"
/>

Featured

</label>

<ImageUploader
  @uploaded="form.images = $event"
/>

<button @click="submit">

Create Product

</button>

</div>

</template>

<style scoped>

.card{

display:flex;

flex-direction:column;

gap:16px;

padding:24px;

background:#151922;

border:1px solid #2A313D;

border-radius:18px;

}

input,
textarea{

padding:12px;

background:#0E1117;

border:1px solid #2A313D;

border-radius:10px;

color:white;

}

button{

margin-top:10px;

padding:14px;

background:#00C896;

border:none;

border-radius:12px;

cursor:pointer;

font-weight:700;

}

button:hover{

opacity:.9;

}

</style>