<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { adminNavigation } from '@/config/navigation'

const route = useRoute()

function isActive(item) {
  return item.exact
    ? route.path === item.path
    : route.path.startsWith(item.path)
}
</script>

<template>
  <aside class="sidebar" aria-label="Адмін навігація">

    <RouterLink to="/" class="logo" aria-label="На головний сайт">
      🛠 <AppLogo />
    </RouterLink>

    <nav class="nav">
      <div
        v-for="group in adminNavigation"
        :key="group.section"
        class="section"
      >
        <span class="section-title">{{ group.section }}</span>

        <RouterLink
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="link"
          :class="{ active: isActive(item) }"
        >
          <span class="link-icon" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </RouterLink>

      </div>
    </nav>

  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 28px 16px;
  background: #11151D;
  border-right: 1px solid #232A35;
  min-height: 100vh;
  width: 260px;
  flex-shrink: 0;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: white;
  text-decoration: none;
  margin-bottom: 36px;
  padding: 0 2px;
  letter-spacing: -0.02em;
  transition: color 0.2s;
}
.logo:hover { color: #00C896; }

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7F8898;
  padding: 0 12px;
  margin-bottom: 6px;
}

.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #D8DCE5;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.18s, color 0.18s;
}
.link:hover          { background: #1A2130; color: white; }
.link.active         { background: #00C896; color: #08110D; font-weight: 700; }
.link.active:hover   { background: #00b588; }

.link-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
</style>
