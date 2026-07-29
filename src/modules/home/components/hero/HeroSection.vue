<script setup>
import HeroBadge from "./HeroBadge.vue";
import HeroContent from "./HeroContent.vue";
import HeroButtons from "./HeroButtons.vue";
</script>

<template>
<section class="hero">

    <HeroBadge />

    <HeroContent />

    <HeroButtons />

</section>
</template>

<style scoped>

.hero{

max-width:900px;

margin:100px auto;

padding:20px;

display:flex;

flex-direction:column;

align-items:center;

text-align:center;

gap:28px;

}

</style>