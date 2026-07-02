<template>
  <div class="min-h-screen p-8 bg-neutral-950 text-white">
    <h1 class="text-3xl font-bold mb-8">
      🛠 TinkerSpace Dev Center
    </h1>

    <div
      v-for="table in tables"
      :key="table.name"
      class="mb-4 p-4 rounded-xl bg-neutral-900 border border-neutral-700"
    >
      <div class="flex justify-between items-center">
        <span class="font-semibold">{{ table.name }}</span>

        <span
          :class="table.ok ? 'text-green-400' : 'text-red-400'"
        >
          {{ table.ok ? '✅ Connected' : '❌ Not Found' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";

const tables = ref([
  { name: "products", ok: false },
  { name: "categories", ok: false },
  { name: "blog_posts", ok: false },
  { name: "portfolio_projects", ok: false },
  { name: "site_settings", ok: false },
  { name: "profiles", ok: false },
  { name: "orders", ok: false },
  { name: "order_items", ok: false },
  { name: "analytics_events", ok: false },
]);

onMounted(async () => {
  for (const table of tables.value) {
    const { error } = await supabase
      .from(table.name)
      .select("*")
      .limit(1);

    table.ok = !error;

    if (error) {
      console.warn(table.name, error.message);
    }
  }
});
</script>