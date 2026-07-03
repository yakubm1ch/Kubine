<template>
  <article class="card">
    <img
      :src="product.image_url || '/placeholder.png'"
      :alt="product.name"
      class="card-image"
    />

    <div class="card-body">
      <span class="category">
        {{ product.categories?.name || "Без категорії" }}
      </span>

      <h3>{{ product.name }}</h3>

      <p class="description">
        {{ product.short_description }}
      </p>

      <div class="bottom">
        <span class="price">
          ${{ product.price }}
        </span>

        <button>
          Детальніше
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  product: Object,
});
</script>

<style scoped>
.card{
    background:#1b1f27;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #2b313d;
    transition:.25s;
    display:flex;
    flex-direction:column;
}

.card:hover{
    transform:translateY(-6px);
    border-color:#00c896;
}

.card-image{
    width:100%;
    height:220px;
    object-fit:cover;
}

.card-body{
    padding:20px;
    display:flex;
    flex-direction:column;
    gap:12px;
    flex:1;
}

.category{
    color:#00c896;
    font-size:12px;
    text-transform:uppercase;
}

h3{
    color:white;
    font-size:22px;
}

.description{
    color:#9ca3af;
    flex:1;
}

.bottom{
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.price{
    color:white;
    font-size:22px;
    font-weight:700;
}

button{
    background:#00c896;
    color:#111827;
    border:none;
    border-radius:10px;
    padding:10px 18px;
    cursor:pointer;
    font-weight:600;
}
</style>