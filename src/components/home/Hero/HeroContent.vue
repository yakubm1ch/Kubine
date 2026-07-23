<script setup>

import { useSettingsStore } from "@/stores/settings.store";

const settings = useSettingsStore();

</script>

<template>

<h1>

Build.<br>
Learn.<br>
Create.

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