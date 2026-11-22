import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { bootstrapEngine } from "@/core/bootstrap/engine/bootstrap.engine";

import "@/styles/index.css";


async function start() {

  console.log("🚀 Starting application...");

  const app = createApp(App);

  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  await bootstrapEngine.initialize();

  app.mount("#app");

  console.log("✅ Application mounted.");

}


start().catch((error) => {

  console.error("Application failed to start:", error);

});