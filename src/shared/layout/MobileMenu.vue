<script setup>
import { inject, computed } from "vue";
import { RouterLink } from "vue-router";

import AppLogo from "@/shared/ui/AppLogo.vue";
import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";

const mobileMenuOpen = inject("mobileMenuOpen");
const closeMenu = inject("closeMenu");

const projectProfile = useProjectProfileStore();

const publicNavigation = computed(() =>
  projectProfile.configuration?.navigation?.public ?? []
);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="mobileMenuOpen"
      class="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
      @click.self="closeMenu"
    >
      <Transition name="slide">
        <aside
          v-if="mobileMenuOpen"
          class="menu"
        >

          <div class="menu-header">

            <AppLogo />

            <button
              class="close-btn"
              @click="closeMenu"
              aria-label="Close menu"
            >
              ✕
            </button>

          </div>

          <nav>

            <RouterLink
              v-for="item in publicNavigation"
              :key="item.path"
              :to="item.path"
              class="link"
              @click="closeMenu"
            >
              {{ item.name }}
            </RouterLink>

          </nav>

        </aside>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>

.overlay{
position:fixed;
inset:0;
background:rgba(0,0,0,.6);
backdrop-filter:blur(4px);
-webkit-backdrop-filter:blur(4px);
z-index:2000;
display:flex;
}

.menu{
width:min(300px,85vw);
height:100%;
background:var(--surface-primary);
border-right:1px solid var(--border-primary);
display:flex;
flex-direction:column;
padding:24px 20px;
overflow-y:auto;
}

.menu-header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:32px;
}

.close-btn{
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
background:none;
border:1px solid var(--border-primary);
border-radius:var(--radius-sm);
color:var(--text-muted);
font-size:16px;
cursor:pointer;
transition:.2s;
}

.close-btn:hover{
color:var(--text-primary);
border-color:var(--brand-accent);
}

.link{
display:block;
padding:14px 4px;
text-decoration:none;
color:var(--text-secondary);
font-size:17px;
font-weight:500;
border-bottom:1px solid var(--surface-hover);
transition:.2s;
}

.link:hover{
color:var(--brand-accent);
}

.router-link-active{
color:var(--brand-accent);
font-weight:600;
}

.fade-enter-active,
.fade-leave-active{
transition:opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to{
opacity:0;
}

.slide-enter-active,
.slide-leave-active{
transition:transform .28s ease;
}

.slide-enter-from,
.slide-leave-to{
transform:translateX(-100%);
}

</style>