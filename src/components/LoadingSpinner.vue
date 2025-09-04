<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <!-- Outer ring -->
      <div class="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
      <!-- Inner ring -->
      <div class="absolute top-1 left-1 w-10 h-10 border-4 border-transparent rounded-full animate-spin border-t-green-600" style="animation-direction: reverse; animation-duration: 0.8s;"></div>
      <!-- Center dot -->
      <div class="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
    </div>
    <span v-if="text" class="ml-3 text-gray-600 font-medium">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: 'p-8'
  }
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
