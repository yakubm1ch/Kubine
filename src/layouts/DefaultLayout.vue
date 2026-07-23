<script setup>
import { ref, provide, onMounted } from "vue";
import NavBar from "@/components/layout/NavBar.vue";
import MobileMenu from "@/components/layout/MobileMenu.vue";
import Footer from "@/components/layout/Footer.vue";
import { useSettingsStore } from "@/stores/settings.store";

const settings = useSettingsStore();

onMounted(() => {
  settings.loadSettings();
});

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

  background:var(--surface-secondary);
  color:var(--text-primary);
}

.content{
  flex:1;
  padding-top:72px;
}

</style>