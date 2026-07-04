<script setup>
import { ref } from "vue";

const form = ref({
  title: "",
  slug: "",
  description: "",
  published: true,
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

  console.log(form.value);

  form.value = {
    title: "",
    slug: "",
    description: "",
    published: true,
  };
}
</script>

<template>

<div class="card">

<h2>New Category</h2>

<input
v-model="form.title"
placeholder="Category title"
/>

<textarea
v-model="form.description"
rows="5"
placeholder="Description"
/>

<label>

<input
type="checkbox"
v-model="form.published"
/>

Published

</label>

<button @click="submit">

Create Category

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

padding:14px;

background:#00C896;

border:none;

border-radius:12px;

cursor:pointer;

font-weight:700;

}

</style>