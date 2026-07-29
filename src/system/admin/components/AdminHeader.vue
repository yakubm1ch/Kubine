<script setup>
</script>

<template>

<header class="header">

    <div>

        <h1>Admin Panel</h1>

        <p>
            Manage your project
        </p>

    </div>

    <div class="user">

        <div class="avatar">
            M
        </div>

    </div>

</header>

</template>

<style scoped>

.header{

display:flex;

justify-content:space-between;

align-items:center;

padding:var(--space-6) var(--space-7);

background:var(--surface-primary);

border-bottom:1px solid var(--border-primary);

}

h1{

margin:0;

font-size:var(--text-3xl);

font-weight:var(--weight-bold);

color:var(--text-primary);

}

p{

margin-top:var(--space-2);

margin-bottom:0;

font-size:var(--text-sm);

color:var(--text-muted);

}

.user{

display:flex;

align-items:center;

gap:var(--space-3);

}

.avatar{

width:var(--size-lg);

height:var(--size-lg);

display:flex;

align-items:center;

justify-content:center;

border-radius:var(--radius-round);

background:var(--brand-accent);

color:var(--color-dark);

font-size:var(--text-lg);

font-weight:var(--weight-bold);

}

</style>