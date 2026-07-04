<script setup>
import AdminSidebar from "../components/admin/AdminSidebar.vue";
import AdminHeader from "../components/admin/AdminHeader.vue";
</script>

<template>
  <div class="admin">

    <AdminSidebar />

    <div class="admin__content">

      <AdminHeader />

      <main class="admin__page">
        <RouterView />
      </main>

    </div>

  </div>
</template>

<style scoped>

.admin{
display:grid;
grid-template-columns:260px 1fr;
min-height:100vh;
background:#0E1117;
color:white;
}

.admin__content{
display:flex;
flex-direction:column;
}

.admin__page{
flex:1;
padding:32px;
overflow:auto;
}

@media(max-width:900px){

.admin{

grid-template-columns:1fr;

}

}

</style>