<template>
  <DefaultLayout>

    <section class="hero">

      <span class="badge">
        Open Hardware • Embedded Systems • DIY
      </span>

      <h1>
        Build.<br>
        Learn.<br>
        Create.
      </h1>

      <p>
        TinkerSpace — це простір для інженерів, мейкерів та ентузіастів
        електроніки. Тут поєднуються магазин компонентів, власні проєкти,
        блог та експерименти з Embedded Systems.
      </p>

      <div class="buttons">
        <RouterLink to="/catalog" class="btn primary">
          Перейти в каталог
        </RouterLink>

        <RouterLink to="/contacts" class="btn secondary">
          Зв'язатися
        </RouterLink>
      </div>

    </section>

    <section class="features">

      <div class="feature">
        <div class="icon">📦</div>
        <h3>Каталог</h3>
        <p>
          Компоненти, модулі, інструменти та власні розробки.
        </p>
      </div>

      <div class="feature">
        <div class="icon">🛠</div>
        <h3>Проєкти</h3>
        <p>
          Авторські DIY-проєкти, робототехніка та Embedded.
        </p>
      </div>

      <div class="feature">
        <div class="icon">📚</div>
        <h3>Блог</h3>
        <p>
          Гайди, статті та власний досвід розробки.
        </p>
      </div>

      <div class="feature">
        <div class="icon">🚀</div>
        <h3>R&D</h3>
        <p>
          FPV, Edge AI, комп'ютерний зір та інші експерименти.
        </p>
      </div>

    </section>

  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from "../layouts/DefaultLayout.vue";
</script>

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

.badge{

padding:8px 18px;

background:#1F2937;

border:1px solid #2B313D;

border-radius:999px;

color:#00C896;

font-size:14px;

letter-spacing:.08em;

text-transform:uppercase;

}

.hero h1{

font-size:72px;

line-height:1.05;

font-weight:800;

color:#F9FAFB;

}

.hero p{

max-width:700px;

font-size:20px;

line-height:1.8;

color:#9CA3AF;

}

.buttons{

display:flex;

gap:20px;

margin-top:10px;

}

.btn{

padding:15px 32px;

border-radius:14px;

text-decoration:none;

font-weight:700;

transition:.25s;

}

.primary{

background:#00C896;

color:#111827;

}

.primary:hover{

transform:translateY(-5px);

box-shadow:0 12px 35px rgba(0,200,150,.25);

}

.secondary{

border:1px solid #374151;

color:#F9FAFB;

}

.secondary:hover{

border-color:#00C896;

background:#1B1F27;

}

.features{

max-width:1100px;

margin:80px auto 120px;

display:grid;

grid-template-columns:repeat(2,1fr);

gap:28px;

padding:0 20px;

}

.feature{

background:#1B1F27;

border:1px solid #2B313D;

border-radius:20px;

padding:36px;

transition:.25s;

}

.feature:hover{

transform:translateY(-6px);

border-color:#00C896;

}

.icon{

font-size:34px;

margin-bottom:20px;

}

.feature h3{

font-size:24px;

margin-bottom:12px;

color:#F9FAFB;

}

.feature p{

color:#9CA3AF;

line-height:1.7;

}

@media (max-width:900px){

.hero h1{

font-size:52px;

}

.hero p{

font-size:18px;

}

.features{

grid-template-columns:1fr;

}

.buttons{

width:100%;

flex-direction:column;

}

.btn{

width:100%;

text-align:center;

}

}

</style>