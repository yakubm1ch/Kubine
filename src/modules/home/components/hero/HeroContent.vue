<script setup>

import { computed } from "vue";

import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";
import { useSettingsStore } from "@/modules/settings/stores/settings.store";

const projectProfile = useProjectProfileStore();
const settings = useSettingsStore();

const hero = computed(() =>
  projectProfile.configuration?.hero ?? {}
);

</script>

<template>

<h1>

{{ hero.title }}

</h1>

<p>

{{ settings.settings?.about }}

</p>

</template>

<style scoped>

h1{

font-size:72px;

line-height:1.05;

font-weight:800;

color:#F9FAFB;

white-space:pre-line;

}

p{

max-width:700px;

font-size:20px;

line-height:1.8;

color:#9CA3AF;

}

@media(max-width:900px){

h1{

font-size:52px;

}

p{

font-size:18px;

}

}

</style>