<template>
  <header class="navbar">
    <div class="navbar__inner">
      <router-link to="/" class="logo">TinkerSpace</router-link>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/catalog">Catalog</router-link>
        <router-link to="/contacts">Contacts</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar{
background:#111;
border-bottom:1px solid #333;
padding:1rem;
}

.navbar__inner{
display:flex;
justify-content:space-between;
align-items:center;
max-width:1200px;
margin:auto;
}

nav{
display:flex;
gap:1rem;
}

a{
color:white;
text-decoration:none;
}

.logo{
font-weight:bold;
color:#facc15;
}
</style>
