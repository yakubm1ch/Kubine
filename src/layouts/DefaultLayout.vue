<template>
  <div class="layout">

    <header class="header">
      <h1>TinkerSpace</h1>
    </header>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">
      © 2026 TinkerSpace
    </footer>

  </div>
</template>

<style scoped>

.layout{
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

.header{
  height:72px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-bottom:1px solid #232832;

  background:#171B22;
}

.header h1{
  color:#00C896;

  font-size:28px;
  font-weight:700;
  letter-spacing:1px;
}

.content{
  flex:1;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:40px;
}

.footer{

  height:60px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-top:1px solid #232832;

  color:#9CA3AF;

  background:#171B22;
}

</style>