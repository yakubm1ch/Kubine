<script setup>
import { ref, provide, onMounted } from "vue";
import NavBar from "@/shared/layout/NavBar.vue";
import MobileMenu from "@/shared/layout/MobileMenu.vue";
import Footer from "@/shared/layout/Footer.vue";
import { useSettingsStore } from "@/modules/settings/stores/settings.store";
import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";

const settings = useSettingsStore();
const projectProfile = useProjectProfileStore();

onMounted(() => {
  settings.loadSettings();
  projectProfile.load();
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