import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "@/shared/layout/DefaultLayout.vue";
import AdminLayout from "@/shared/layout/AdminLayout.vue";

// Public
import Home from "@/modules/home/pages/Home.vue";
import Catalog from "@/modules/catalog/pages/Catalog.vue";
import Contacts from "@/modules/contacts/pages/Contacts.vue";
import About from "@/modules/about/pages/About.vue";
import Blog from "@/modules/blog/pages/Blog.vue";
import Portfolio from "@/modules/portfolio/pages/Portfolio.vue";

// System
import NotFound from "@/system/error/NotFound.vue";

// Admin
import Dashboard from "@/system/admin/pages/Dashboard.vue";
import Products from "@/system/admin/pages/Products.vue";
import Categories from "@/system/admin/pages/Categories.vue";
import AdminBlog from "@/system/admin/pages/Blog.vue";
import AdminPortfolio from "@/system/admin/pages/Portfolio.vue";
import Orders from "@/system/admin/pages/Orders.vue";
import Settings from "@/system/admin/pages/Settings.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: DefaultLayout,

      children: [
        { path: "", component: Home },
        { path: "catalog", component: Catalog },
        { path: "contacts", component: Contacts },
        { path: "about", component: About },
        { path: "blog", component: Blog },
        { path: "portfolio", component: Portfolio },
      ],
    },

    {
      path: "/admin",
      component: AdminLayout,

      children: [
        { path: "", component: Dashboard },
        { path: "products", component: Products },
        { path: "categories", component: Categories },
        { path: "blog", component: AdminBlog },
        { path: "portfolio", component: AdminPortfolio },
        { path: "orders", component: Orders },
        { path: "settings", component: Settings },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      component: NotFound,
    },
  ],
});

export default router;