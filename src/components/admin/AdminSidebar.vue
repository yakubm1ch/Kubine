<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const sections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", to: "/admin", exact: true },
    ],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", to: "/admin/products" },
      { name: "Categories", to: "/admin/categories" },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Blog", to: "/admin/blog" },
      { name: "Portfolio", to: "/admin/portfolio" },
    ],
  },
  {
    title: "Sales",
    items: [
      { name: "Orders", to: "/admin/orders" },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", to: "/admin/settings" },
    ],
  },
];

function isActive(item) {
  if (item.exact) {
    return route.path === item.to;
  }

  return route.path.startsWith(item.to);
}
</script>

<template>
  <aside class="sidebar">

    <div class="logo">
      🛠 TinkerSpace
    </div>

    <div
      v-for="section in sections"
      :key="section.title"
      class="section"
    >
      <div class="section-title">
        {{ section.title }}
      </div>

      <RouterLink
        v-for="item in section.items"
        :key="item.to"
        :to="item.to"
        class="link"
        :class="{ active: isActive(item) }"
      >
        {{ item.name }}
      </RouterLink>

    </div>

  </aside>
</template>

<style scoped>

.sidebar{
display:flex;
flex-direction:column;
padding:28px 18px;
background:#11151D;
border-right:1px solid #232A35;
}

.logo{
font-size:24px;
font-weight:700;
margin-bottom:36px;
}

.section{
display:flex;
flex-direction:column;
gap:6px;
margin-bottom:28px;
}

.section-title{
font-size:12px;
text-transform:uppercase;
letter-spacing:.12em;
color:#7F8898;
margin-bottom:8px;
padding-left:10px;
}

.link{
padding:12px 14px;
border-radius:10px;
color:#D8DCE5;
text-decoration:none;
transition:.2s;
}

.link:hover{
background:#1A2130;
}

.active{
background:#00C896;
color:#08110D;
font-weight:700;
}

</style>