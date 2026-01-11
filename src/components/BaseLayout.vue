<template>
  <div class="app-layout">
    <BaseHeader />
    <main class="main-content">
      <slot />
    </main>
    <BaseFooter />
  </div>
</template>

<script setup>
import BaseHeader from './BaseHeader.vue'
import BaseFooter from './BaseFooter.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Account for fixed header */
}
</style> 