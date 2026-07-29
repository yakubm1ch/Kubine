<script setup>

import { RouterLink, useRoute } from "vue-router";

import AppLogo from "@/shared/ui/AppLogo.vue";

const route = useRoute();

function isActive(item){

return item.exact
? route.path===item.path
: route.path.startsWith(item.path);

}

</script>

<template>

<aside
class="sidebar"
aria-label="Адмін навігація"
>

    <RouterLink
        to="/"
        class="logo"
        aria-label="На головний сайт"
    >

        <AppLogo />

    </RouterLink>

    <nav class="nav">

        <div

            v-for="group in adminNavigation"

            :key="group.section"

            class="section"

        >

            <span class="section-title">

                {{ group.section }}

            </span>

            <RouterLink

                v-for="item in group.items"

                :key="item.path"

                :to="item.path"

                class="link"

                :class="{ active:isActive(item) }"

            >

                <span
                    class="link-icon"
                    aria-hidden="true"
                >

                    {{ item.icon }}

                </span>

                <span>

                    {{ item.name }}

                </span>

            </RouterLink>

        </div>

    </nav>

</aside>

</template>

<style scoped>

.sidebar{

display:flex;

flex-direction:column;

width:var(--sidebar-width);

min-height:100vh;

flex-shrink:0;

padding:var(--space-7) var(--space-4);

background:var(--surface-primary);

border-right:1px solid var(--border-primary);

}

.logo{

display:flex;

align-items:center;

text-decoration:none;

margin-bottom:var(--space-9);

color:var(--text-primary);

transition:var(--transition-fast);

}

.logo:hover{

color:var(--brand-accent);

}

.nav{

display:flex;

flex-direction:column;

gap:var(--space-2);

flex:1;

}

.section{

display:flex;

flex-direction:column;

gap:2px;

margin-bottom:var(--space-5);

}

.section-title{

padding:0 var(--space-3);

margin-bottom:var(--space-2);

font-size:11px;

font-weight:var(--weight-semibold);

letter-spacing:.12em;

text-transform:uppercase;

color:var(--text-muted);

}

.link{

display:flex;

align-items:center;

gap:var(--space-3);

padding:var(--space-3);

border-radius:var(--radius-md);

text-decoration:none;

font-size:var(--text-sm);

font-weight:var(--weight-medium);

color:var(--text-secondary);

transition:var(--transition-fast);

}

.link:hover{

background:var(--surface-secondary);

color:var(--text-primary);

}

.link.active{

background:var(--brand-accent);

color:var(--color-dark);

font-weight:var(--weight-bold);

}

.link.active:hover{

opacity:.92;

}

.link-icon{

width:20px;

flex-shrink:0;

text-align:center;

font-size:var(--text-md);

}

</style>