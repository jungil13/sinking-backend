<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
    <CheckCircleIcon class="w-24 h-24 text-green-500 mb-6" />
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Processing!</h1>
    <p class="text-gray-600 max-w-md mb-8">
      Thank you! We have received your payment information. Your contribution status will be updated to "Confirmed" shortly. This may take a few moments.
    </p>
    <router-link to="/member/contributions" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
      Back to Contributions
    </router-link>
  </div>
</template>

<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
</script>