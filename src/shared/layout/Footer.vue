<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import AppLogo from "@/shared/ui/AppLogo.vue";
import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";
const currentYear = new Date().getFullYear();

const projectProfile = useProjectProfileStore();

const publicNavigation = computed(() =>
  projectProfile.configuration?.navigation?.public ?? []
);
</script>

<template>

<footer class="footer">

  <div class="footer__container">

    <div class="footer__brand">

      <RouterLink
        to="/"
        class="footer__logo"
      >
        <AppLogo />
      </RouterLink>

      <p class="footer__copyright">
        © {{ currentYear }}
      </p>

    </div>

    <nav
      class="footer__links"
      aria-label="Footer navigation"
    >

      <RouterLink
        v-for="item in publicNavigation"
        :key="item.path"
        :to="item.path"
      >
        {{ item.name }}
      </RouterLink>

    </nav>

  </div>

</footer>

</template>

<style scoped>

.footer{

margin-top:auto;

background:var(--surface-primary);

border-top:1px solid var(--border-primary);

}

.footer__container{

max-width:var(--container-width);

margin:0 auto;

padding:36px 32px;

display:flex;

justify-content:space-between;

align-items:flex-start;

gap:48px;

flex-wrap:wrap;

}

.footer__brand{

display:flex;

flex-direction:column;

gap:12px;

}

.footer__copyright{

font-size:14px;

line-height:1.6;

color:var(--text-muted);

}

.footer__links{

display:flex;

flex-wrap:wrap;

gap:18px;

}

.footer__links a{

text-decoration:none;

color:var(--text-secondary);

font-size:15px;

transition:.2s;

}

.footer__links a:hover{

color:var(--brand-accent);

}

.router-link-active{

color:var(--brand-accent);

}

@media(max-width:768px){

.footer__container{

flex-direction:column;

padding:28px 20px;

gap:28px;

}

.footer__links{

flex-direction:column;

gap:14px;

}

}

</style>