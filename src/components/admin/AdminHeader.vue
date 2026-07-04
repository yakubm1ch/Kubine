<script setup>
</script>

<template>
<header class="header">

    <div>

        <h1>Admin Panel</h1>

        <p>
            Manage your entire TinkerSpace platform
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

padding:24px 32px;

border-bottom:1px solid #2A313D;

background:#151922;

}

h1{

font-size:28px;

font-weight:700;

}

p{

margin-top:6px;

color:#8A94A6;

}

.user{

display:flex;

align-items:center;

gap:12px;

}

.avatar{

width:44px;

height:44px;

border-radius:50%;

background:#00C896;

display:flex;

align-items:center;

justify-content:center;

font-weight:700;

font-size:18px;

color:#111827;

}

</style>