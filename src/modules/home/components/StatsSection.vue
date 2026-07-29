<template>

<section class="stats-section">

  <div class="container">

    <div class="stat-item">

      <h3>100+</h3>

      <p>Projects completed</p>

    </div>

    <div class="stat-item">

      <h3>50+</h3>

      <p>Happy customers</p>

    </div>

    <div class="stat-item">

      <h3>10+</h3>

      <p>Years of experience</p>

    </div>

  </div>

</section>

</template>

<style scoped>

.stats-section{

padding:100px 32px;

}

.container{

max-width:1400px;

margin:0 auto;

display:grid;

grid-template-columns:repeat(3,1fr);

gap:32px;

}

.stat-item{

padding:32px;

background:#11151D;

border:1px solid #232A35;

border-radius:20px;

text-align:center;

}

.stat-item h3{

font-size:42px;

margin-bottom:12px;

color:#00C896;

}

.stat-item p{

color:#8A94A6;

}

@media(max-width:768px){

.container{

grid-template-columns:1fr;

}

}

</style>