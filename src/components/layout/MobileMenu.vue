<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'
import { publicNavigation } from '@/config/navigation'

// Provided by DefaultLayout.vue
const mobileMenuOpen = inject('mobileMenuOpen')
const closeMenu      = inject('closeMenu')
</script>

<template>
  <Transition name="fade">
    <div
      v-if="mobileMenuOpen"
      class="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Мобільне меню"
      @click.self="closeMenu"
    >
      <Transition name="slide">
        <aside v-if="mobileMenuOpen" class="menu">

          <div class="menu-header">
            <span class="menu-logo">TinkerSpace</span>
            <button
              class="close-btn"
              @click="closeMenu"
              aria-label="Закрити меню"
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
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
}

.menu {
  width: min(300px, 85vw);
  height: 100%;
  background: #11151D;
  border-right: 1px solid #232A35;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  overflow-y: auto;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.menu-logo {
  font-size: 22px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #2A313D;
  border-radius: 8px;
  color: #8A94A6;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}
.close-btn:hover { color: white; border-color: #00C896; }

.link {
  display: block;
  padding: 14px 4px;
  text-decoration: none;
  color: #D5D9E2;
  font-size: 17px;
  font-weight: 500;
  border-bottom: 1px solid #1C2230;
  transition: color 0.2s;
}
.link:hover         { color: #00C896; }
.router-link-active { color: #00C896; font-weight: 600; }

.fade-enter-active,
.fade-leave-active  { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to      { opacity: 0; }

.slide-enter-active,
.slide-leave-active { transition: transform 0.28s ease; }
.slide-enter-from,
.slide-leave-to     { transform: translateX(-100%); }
</style>
