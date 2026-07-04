<script setup>
import { ref } from "vue";
import { useCatalogStore } from "../stores/catalog.store";

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

  alert("Product created!");

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
<div class="max-w-3xl mx-auto py-10 px-6">

<h1 class="text-3xl font-bold mb-8">
Admin Panel
</h1>

<div class="space-y-5">

<input
v-model="form.title"
placeholder="Title"
class="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
/>

<textarea
v-model="form.description"
rows="5"
placeholder="Description"
class="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
/>

<input
v-model.number="form.price"
type="number"
placeholder="Price"
class="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
/>

<input
v-model.number="form.stock"
type="number"
placeholder="Stock"
class="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
/>

<input
v-model.number="form.category_id"
type="number"
placeholder="Category ID"
class="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
/>

<label class="flex gap-2">
<input type="checkbox" v-model="form.published">
Published
</label>

<label class="flex gap-2">
<input type="checkbox" v-model="form.featured">
Featured
</label>

<button
@click="submit"
class="px-6 py-3 rounded bg-emerald-500 hover:bg-emerald-600"
>
Create Product
</button>

</div>

</div>
</template>