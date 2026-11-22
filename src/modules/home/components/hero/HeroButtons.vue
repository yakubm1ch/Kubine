<script setup>

import { computed } from "vue";
import { RouterLink } from "vue-router";

import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";

const projectProfile = useProjectProfileStore();

const hero = computed(() =>
  projectProfile.configuration?.hero ?? {}
);

</script>

<template>

<div class="buttons">

  <RouterLink
    v-if="hero.primaryButtonLink"
    :to="hero.primaryButtonLink"
    class="btn primary"
  >
    {{ hero.primaryButton }}
  </RouterLink>

  <RouterLink
    v-if="hero.secondaryButtonLink"
    :to="hero.secondaryButtonLink"
    class="btn secondary"
  >
    {{ hero.secondaryButton }}
  </RouterLink>

</div>

</template>

<style scoped>

.buttons{

display:flex;

gap:20px;

margin-top:10px;

}

.btn{

padding:15px 32px;

border-radius:14px;

text-decoration:none;

font-weight:700;

transition:.25s;

}

.primary{

background:#00C896;

color:#111827;

}

.primary:hover{

transform:translateY(-5px);

box-shadow:0 12px 35px rgba(0,200,150,.25);

}

.secondary{

border:1px solid #374151;

color:#F9FAFB;

}

.secondary:hover{

border-color:#00C896;

background:#1B1F27;

}

@media(max-width:900px){

.buttons{

width:100%;

flex-direction:column;

}

.btn{

width:100%;

text-align:center;

}

}

</style>