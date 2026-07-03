<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <p>© {{ currentYear }} TinkerSpace</p>

      <nav class="footer__links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/catalog">Catalog</RouterLink>
        <RouterLink to="/projects">Projects</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.footer__container {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 1.5rem var(--content-pad);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__links {
  display: flex;
  gap: 1rem;
}

.footer__links a {
  color: var(--color-text-muted);
  text-decoration: none;
}

.footer__links a:hover {
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .footer__container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>