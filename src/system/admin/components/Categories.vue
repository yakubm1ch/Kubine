<script setup>
import CategoryForm from "@/system/admin/components/CategoryForm.vue";
import CategoryTable from "@/system/admin/components/CategoryTable.vue";
</script>

<template>

<div class="categories">

    <div class="page-header">

        <h1>Categories</h1>

        <p>
            Manage product categories.
        </p>

    </div>

    <div class="content">

        <CategoryForm />

        <CategoryTable />

    </div>

</div>

</template>

<style scoped>

.categories{

display:flex;

flex-direction:column;

gap:var(--space-7);

}

.page-header h1{

margin:0;

font-size:var(--text-4xl);

font-weight:var(--weight-bold);

color:var(--text-primary);

}

.page-header p{

margin-top:var(--space-2);

margin-bottom:0;

font-size:var(--text-md);

color:var(--text-muted);

}

.content{

display:grid;

grid-template-columns:360px 1fr;

gap:var(--space-7);

align-items:start;

}

@media(max-width:1200px){

.content{

grid-template-columns:1fr;

}

}

</style>