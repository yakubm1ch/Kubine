<template>
  <div class="portfolio-preview">
    <h2>Portfolio Preview</h2>
    <div class="projects">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <img :src="project.image" :alt="project.title" />
        <h3>{{ project.title }}</h3>
        <p>{{ project.description }}</p>
      </div>
    </div>
  </div>
</template>