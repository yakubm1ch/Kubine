<script setup>

import { computed, watch } from "vue";
import { useSettingsStore } from "@/stores/settings.store";
import { getStorageUrl } from "@/services/storage.service";

const settings = useSettingsStore();

/*
 * Тимчасово.
 * Пізніше підтягнемо тему автоматично.
 */

const darkTheme = true;

const logoUrl = computed(() => {

  if (!settings.settings) return "";

  const path = darkTheme
    ? settings.settings.logo_full_dark
    : settings.settings.logo_full_light;

  return getStorageUrl(path);

});

watch(logoUrl, (value) => {

  console.log("LOGO URL:", value);

});

</script>

<template>

<img
  v-if="logoUrl"
  :src="logoUrl"
  alt="TinkerSpace Logo"
  class="logo"
/>

</template>

<style scoped>

.logo{

height:52px;

width:auto;

display:block;

object-fit:contain;

}

</style>