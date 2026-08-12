<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="fixed top-4 right-4 z-10">
    <ThemeToggle />
  </div>
  <RouterView />
</template>
