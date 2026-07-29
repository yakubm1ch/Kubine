<script setup>

import { ref } from "vue";

const form = ref({

title:"",

slug:"",

description:"",

published:true,

});

function generateSlug(){

form.value.slug=form.value.title

.toLowerCase()

.trim()

.replace(/\s+/g,"-")

.replace(/[^\w-]/g,"");

}

async function submit(){

generateSlug();

console.log(form.value);

form.value={

title:"",

slug:"",

description:"",

published:true,

};

}

</script>

<template>

<div class="card">

    <h2>

        New Category

    </h2>

    <input

        v-model="form.title"

        placeholder="Category title"

    />

    <textarea

        v-model="form.description"

        rows="5"

        placeholder="Description"

    />

    <label class="checkbox">

        <input

            type="checkbox"

            v-model="form.published"

        >

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

gap:var(--space-4);

padding:var(--space-6);

background:var(--surface-primary);

border:1px solid var(--border-primary);

border-radius:var(--radius-lg);

}

h2{

margin:0;

font-size:var(--text-xl);

font-weight:var(--weight-bold);

color:var(--text-primary);

}

input,
textarea{

padding:var(--space-3);

background:var(--surface-background);

border:1px solid var(--border-primary);

border-radius:var(--radius-md);

color:var(--text-primary);

font-size:var(--text-md);

font-family:inherit;

transition:var(--transition-fast);

}

input:focus,
textarea:focus{

outline:none;

border-color:var(--brand-accent);

}

.checkbox{

display:flex;

align-items:center;

gap:var(--space-2);

font-size:var(--text-sm);

color:var(--text-secondary);

}

button{

padding:var(--space-4);

border:none;

border-radius:var(--radius-md);

background:var(--brand-accent);

color:var(--color-dark);

font-size:var(--text-md);

font-weight:var(--weight-bold);

cursor:pointer;

transition:var(--transition-fast);

}

button:hover{

opacity:.92;

}

</style>