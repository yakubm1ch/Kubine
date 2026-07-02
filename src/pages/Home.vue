<template>

<DefaultLayout>

<div class="hero">

    <h2>TinkerSpace</h2>

    <p>
        Electronics • Embedded Systems • DIY
    </p>

    <div class="cards">

        <div class="card">
            Catalog
        </div>

        <div class="card">
            Portfolio
        </div>

        <div class="card">
            Blog
        </div>

        <div class="card">
            Contacts
        </div>

    </div>

</div>

</DefaultLayout>

</template>

<script setup>

import DefaultLayout from "../layouts/DefaultLayout.vue"

</script>

<style scoped>

.hero{

display:flex;
flex-direction:column;

align-items:center;

gap:30px;

width:100%;

}

.hero h2{

font-size:56px;

color:#00C896;

}

.hero p{

color:#9CA3AF;

font-size:18px;

}

.cards{

display:grid;

grid-template-columns:repeat(2,240px);

gap:24px;

margin-top:30px;

}

.card{

height:130px;

border-radius:20px;

background:#1B1F27;

display:flex;

justify-content:center;

align-items:center;

font-size:22px;

font-weight:600;

cursor:pointer;

transition:.25s;

border:1px solid #2B313D;

}

.card:hover{

transform:translateY(-6px);

border-color:#00C896;

}

@media(max-width:700px){

.cards{

grid-template-columns:1fr;

width:100%;

}

.card{

width:100%;

}

.hero h2{

font-size:40px;

}

}

</style>