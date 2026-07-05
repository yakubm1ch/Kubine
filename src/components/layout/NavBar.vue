<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'
import { publicNavigation } from '@/config/navigation'

// Provided by DefaultLayout.vue
const openMenu = inject('openMenu')
</script>

<template>
  <header class="navbar">

    <RouterLink to="/" class="logo" aria-label="TinkerSpace — на головну">
      <AppLogo />
    </RouterLink>

    <nav class="desktop-nav" aria-label="Основна навігація">
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
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px, 4vw, 32px);
  background: #11151D;
  border-bottom: 1px solid #232A35;
  z-index: 1000;
}

.logo {
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 700;
  text-decoration: none;
  color: white;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

/* Desktop nav */
.desktop-nav {
  display: flex;
  gap: clamp(16px, 2.5vw, 28px);
}

.nav-link {
  text-decoration: none;
  color: #C7CCD6;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}
.nav-link:hover          { color: #00C896; }
.router-link-active      { color: #00C896; }

/* Burger */
.actions {
  display: flex;
  align-items: center;
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}
.burger:hover { background: #1A2130; }

.burger-line {
  display: block;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: 0.2s;
}

/* Responsive */
@media (max-width: 900px) {
  .desktop-nav { display: none; }
  .burger      { display: flex; }
}
</style>
