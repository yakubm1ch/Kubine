<template>
  <div class="categories">

    <button
      v-for="cat in categories"
      :key="cat"
      @click="$emit('update:modelValue', cat)"
      :class="{ active: modelValue === cat }"
    >
      {{ cat }}
    </button>

  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  categories: Array
})

defineEmits([
  "update:modelValue"
])
</script>

<style scoped>

.categories{

display:flex;

flex-wrap:wrap;

gap:12px;

margin-bottom:28px;

}

button{

padding:10px 18px;

background:#1B1F27;

border:1px solid #2B313D;

color:#DDD;

border-radius:12px;

cursor:pointer;

transition:.2s;

}

button:hover{

border-color:#00C896;

}

.active{

background:#00C896;

color:#111827;

font-weight:700;

}

</style>