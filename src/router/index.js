import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

// Public pages
import Home from "../pages/Home.vue";
import Catalog from "../pages/Catalog.vue";
import Contacts from "../pages/Contacts.vue";
import About from "../pages/About.vue";
import Blog from "../pages/Blog.vue";
import Portfolio from "../pages/Portfolio.vue";
import NotFound from "../pages/NotFound.vue";

// Admin pages
import Dashboard from "../pages/admin/Dashboard.vue";
import Products from "../pages/admin/Products.vue";
import Categories from "../pages/admin/Categories.vue";
import AdminBlog from "../pages/admin/Blog.vue";
import AdminPortfolio from "../pages/admin/Portfolio.vue";
import Orders from "../pages/admin/Orders.vue";
import Settings from "../pages/admin/Settings.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: DefaultLayout,

      children: [
        {
          path: "",
          component: Home,
        },
        {
          path: "catalog",
          component: Catalog,
        },
        {
          path: "contacts",
          component: Contacts,
        },
        {
          path: "about",
          component: About,
        },
        {
          path: "blog",
          component: Blog,
        },
        {
          path: "portfolio",
          component: Portfolio,
        },
      ],
    },

    {
      path: "/admin",
      component: AdminLayout,

      children: [
        {
          path: "",
          component: Dashboard,
        },
        {
          path: "products",
          component: Products,
        },
        {
          path: "categories",
          component: Categories,
        },
        {
          path: "blog",
          component: AdminBlog,
        },
        {
          path: "portfolio",
          component: AdminPortfolio,
        },
        {
          path: "orders",
          component: Orders,
        },
        {
          path: "settings",
          component: Settings,
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      component: NotFound,
    },
  ],
});

export default router;