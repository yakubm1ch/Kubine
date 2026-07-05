<script setup>
import { RouterLink } from "vue-router";
import { publicNavigation } from "@/config/navigation";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer">

    <div class="footer__container">

      <div class="footer__brand">
        <RouterLink
          to="/"
          class="footer__logo"
        >
          <AppLogo />
        </RouterLink>

        <p class="footer__copyright">
          © {{ currentYear }} <AppLogo />
          <br>
          Built with passion.
        </p>
      </div>

      <nav
        class="footer__links"
        aria-label="Footer navigation"
      >
        <RouterLink
          v-for="item in publicNavigation"
          :key="item.path"
          :to="item.path"
        >
          {{ item.name }}
        </RouterLink>
      </nav>

    </div>

  </footer>
</template>

<style scoped>

.footer{

margin-top:auto;

background:#11151D;

border-top:1px solid #232A35;

}

.footer__container{

max-width:1400px;

margin:0 auto;

padding:36px 32px;

display:flex;

justify-content:space-between;

align-items:flex-start;

gap:48px;

flex-wrap:wrap;

}

.footer__brand{

display:flex;

flex-direction:column;

gap:12px;

}

.footer__logo{

font-size:24px;

font-weight:700;

color:white;

text-decoration:none;

letter-spacing:-0.02em;

transition:.2s;

}

.footer__logo:hover{

color:#00C896;

}

.footer__copyright{

font-size:14px;

line-height:1.6;

color:#8A94A6;

}

.footer__links{

display:flex;

flex-wrap:wrap;

gap:18px;

}

.footer__links a{

text-decoration:none;

color:#C7CCD6;

font-size:15px;

transition:.2s;

}

.footer__links a:hover{

color:#00C896;

}

.router-link-active{

color:#00C896;

}

@media(max-width:768px){

.footer__container{

flex-direction:column;

padding:28px 20px;

gap:28px;

}

.footer__links{

flex-direction:column;

gap:14px;

}

}

</style>