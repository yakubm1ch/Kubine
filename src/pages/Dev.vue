<template>
  <div class="dev">
    <div class="container">

      <h1>Developer Dashboard</h1>
      <p class="subtitle">
        Supabase Database Status
      </p>

      <div class="grid">

        <div
          v-for="table in tables"
          :key="table.name"
          class="card"
        >

          <div class="left">

            <div class="dot"
              :class="table.ok ? 'online' : 'offline'"
            />

            <span>{{ table.name }}</span>

          </div>

          <span
            class="status"
            :class="table.ok ? 'ok' : 'bad'"
          >
            {{ table.ok ? 'CONNECTED' : 'ERROR' }}
          </span>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";

const tables = ref([
  "products",
  "categories",
  "blog_posts",
  "portfolio_projects",
  "site_settings",
  "profiles",
  "orders",
  "order_items",
  "analytics_events",
].map(name => ({
  name,
  ok: false
})));

onMounted(async () => {

  for (const table of tables.value) {

    const { error } = await supabase
      .from(table.name)
      .select("*")
      .limit(1);

    table.ok = !error;

  }

});
</script>

<style scoped>

.dev{

min-height:100vh;
background:#0F1117;
padding:80px 20px;
color:white;

}

.container{

max-width:900px;
margin:auto;

}

h1{

font-size:42px;
margin-bottom:10px;

}

.subtitle{

color:#9CA3AF;
margin-bottom:40px;

}

.grid{

display:grid;
gap:18px;

}

.card{

display:flex;
justify-content:space-between;
align-items:center;

padding:18px 22px;

background:#1A1F28;

border-radius:16px;

border:1px solid #2A3240;

}

.left{

display:flex;
align-items:center;
gap:14px;

font-size:18px;

}

.dot{

width:12px;
height:12px;
border-radius:50%;

}

.online{

background:#00D27A;
box-shadow:0 0 12px #00D27A;

}

.offline{

background:#FF4B55;

}

.status{

font-weight:700;

}

.ok{

color:#00D27A;

}

.bad{

color:#FF4B55;

}

</style>