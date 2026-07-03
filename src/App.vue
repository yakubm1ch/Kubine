<script setup>
import NavBar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="app">
    <NavBar />

    <main class="app__main">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
  padding-top: 72px;
}
</style>