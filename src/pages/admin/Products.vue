<script setup>
import ProductForm from "../../components/admin/ProductForm.vue";
import ProductTable from "../../components/admin/ProductTable.vue";
</script>

<template>

<div class="products">

    <div class="page-header">

        <h1>Products</h1>

        <p>
            Manage products available in the catalog.
        </p>

    </div>

    <div class="content">

        <ProductForm />

        <ProductTable />

    </div>

</div>

</template>

<style scoped>

.products{

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

grid-template-columns:420px 1fr;

gap:32px;

align-items:start;

}

@media(max-width:1200px){

.content{

grid-template-columns:1fr;

}

}

</style>