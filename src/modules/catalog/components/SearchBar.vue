<template>
  <div class="search">

    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      placeholder="Пошук товарів..."
    />

  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

defineEmits([
  "update:modelValue"
]);
</script>

<style scoped>

.search{

margin-bottom:32px;

}

input{

width:100%;

padding:14px 18px;

border-radius:14px;

background:#1B1F27;

border:1px solid #2B313D;

color:white;

font-size:16px;

outline:none;

transition:.2s;

}

input:focus{

border-color:#00C896;

}

</style>