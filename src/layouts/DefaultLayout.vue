<script setup>
import NavBar from "../components/layout/NavBar.vue";
import MobileMenu from "../components/layout/MobileMenu.vue";
import Footer from "../components/layout/Footer.vue";

import { ref, provide } from "vue";

const mobileMenuOpen = ref(false);

function openMenu() {
  mobileMenuOpen.value = true;
}

function closeMenu() {
  mobileMenuOpen.value = false;
}

provide("openMenu", openMenu);
provide("closeMenu", closeMenu);
provide("mobileMenuOpen", mobileMenuOpen);
</script>

<template>

<div class="layout">

    <NavBar />

    <MobileMenu />

    <main class="content">

        <RouterView />

    </main>

    <Footer />

</div>

</template>

<style scoped>

.layout{

min-height:100vh;

display:flex;

flex-direction:column;

background:#0E1117;

color:white;

}

.content{

flex:1;

padding-top:72px;

}

</style>