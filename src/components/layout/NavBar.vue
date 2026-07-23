<script setup>
import { inject } from "vue";
import { RouterLink } from "vue-router";

import AppLogo from "@/components/ui/AppLogo.vue";
import { publicNavigation } from "@/config/navigation";

const openMenu = inject("openMenu");
</script>

<template>
  <header class="navbar">

    <RouterLink
      to="/"
      class="logo"
      aria-label="TinkerSpace — на головну"
    >
      <AppLogo />
    </RouterLink>

    <nav
      class="desktop-nav"
      aria-label="Основна навігація"
    >
      <RouterLink
        v-for="item in publicNavigation"
        :key="item.path"
        :to="item.path"
        class="nav-link"
      >
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="actions">
      <button
        class="burger"
        @click="openMenu"
        aria-label="Відкрити меню"
        aria-expanded="false"
      >
        <span class="burger-line" />
        <span class="burger-line" />
        <span class="burger-line" />
      </button>
    </div>

  </header>
</template>

<style scoped>

.navbar{
  position:fixed;

  top:0;
  left:0;
  right:0;

  height:72px;

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:0 clamp(16px,4vw,32px);

  background:var(--surface-primary);

  border-bottom:1px solid var(--border-primary);

  z-index:1000;
}

.logo{
  display:flex;
  align-items:center;

  flex-shrink:0;

  text-decoration:none;
}

.desktop-nav{
  display:flex;

  gap:clamp(16px,2.5vw,28px);
}

.nav-link{

  text-decoration:none;

  color:var(--text-secondary);

  font-size:15px;
  font-weight:500;

  transition:color .2s;

  white-space:nowrap;

}

.nav-link:hover{

  color:var(--brand-accent);

}

.router-link-active{

  color:var(--brand-accent);

}

.actions{

  display:flex;
  align-items:center;

}

.burger{

  display:none;

  flex-direction:column;
  justify-content:center;

  gap:5px;

  width:40px;
  height:40px;

  padding:8px;

  background:none;

  border:none;

  cursor:pointer;

  border-radius:8px;

  transition:background .2s;

}

.burger:hover{

  background:var(--surface-hover);

}

.burger-line{

  display:block;

  height:2px;

  background:var(--text-primary);

  border-radius:2px;

  transition:.2s;

}

@media (max-width:900px){

.desktop-nav{

display:none;

}

.burger{

display:flex;

}

}

</style>