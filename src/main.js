import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { bootstrap } from "@/core/bootstrap/engine/bootstrap.engine";

import { bootstrapProviders } from "@/core/database/providers/provider.bootstrap";


import "@/styles/index.css";


async function start() {

  console.log("🚀 Starting application...");

  const app = createApp(App);

  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  await bootstrapProviders();

  await bootstrap();

  app.mount("#app");

  console.log("✅ Application mounted.");

}


start().catch((error) => {

  console.error("Application failed to start:", error);

});