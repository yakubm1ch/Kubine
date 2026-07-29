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
gap:32px;

}

.page-header h1{

font-size:34px;
font-weight:700;

}

.page-header p{

margin-top:8px;
color:#8A94A6;

}

.content{

display:grid;
grid-template-columns:360px 1fr;
gap:32px;
align-items:start;

}

@media(max-width:1200px){

.content{

grid-template-columns:1fr;

}

}

</style>