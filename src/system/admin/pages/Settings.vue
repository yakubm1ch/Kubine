<script setup>
import { onMounted } from "vue";
import { useSettingsStore } from "@/modules/settings/stores/settings.store";

const settings = useSettingsStore();

onMounted(() => {
  settings.loadSettings();
});
</script>

<template>

<section class="settings-page">

    <h1>Site Settings</h1>

    <div
        v-if="settings.loading"
        class="loading"
    >
        Loading...
    </div>

    <div
        v-else-if="settings.settings"
        class="settings-card"
    >

        <div class="field">
            <label>Site name</label>
            <input
                :value="settings.settings.site_name"
                readonly
            >
        </div>

        <div class="field">
            <label>Email</label>
            <input
                :value="settings.settings.email"
                readonly
            >
        </div>

        <div class="field">
            <label>Phone</label>
            <input
                :value="settings.settings.phone"
                readonly
            >
        </div>

        <div class="field">
            <label>About</label>

            <textarea
                rows="6"
                :value="settings.settings.about"
                readonly
            />

        </div>

    </div>

</section>

</template>

<style scoped>

.settings-page{

padding:32px;

}

.settings-page h1{

margin-bottom:28px;

}

.settings-card{

display:flex;

flex-direction:column;

gap:20px;

max-width:700px;

}

.field{

display:flex;

flex-direction:column;

gap:8px;

}

label{

font-weight:600;

}

input,
textarea{

padding:12px;

border:1px solid #2B313D;

background:#161B22;

color:white;

border-radius:10px;

}

.loading{

color:#00C896;

}

</style>