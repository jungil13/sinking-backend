<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
    <XCircleIcon class="w-24 h-24 text-red-500 mb-6" />
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
    <p class="text-gray-600 max-w-md mb-8">
      Unfortunately, your payment could not be processed. No charges were made. Please try again or choose a different payment method.
    </p>
    <router-link to="/member/contributions" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
      Try Again
    </router-link>
  </div>
</template>

<script setup>
import { XCircleIcon } from '@heroicons/vue/24/outline'
</script>