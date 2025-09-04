<script setup>
import { ref } from 'vue'
import { CreditCardIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const amount = ref('')
const selectedMethod = ref(null)

const methods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCardIcon, description: 'Pay using Visa, Mastercard, or JCB' },
  { id: 'gcash', name: 'GCash', icon: BanknotesIcon, description: 'Pay instantly via GCash wallet' },
  { id: 'maya', name: 'Maya', icon: BanknotesIcon, description: 'Pay using Maya wallet' },
]

const payNow = () => {
  alert(`Payment of ₱${amount.value || '0'} using ${selectedMethod?.value?.name || 'N/A'} (Static Placeholder)`)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
      <h1 class="text-2xl font-bold">Make a Payment</h1>
      <p class="text-white/80">Select your payment method and complete your contribution or loan repayment.</p>
    </div>

    <!-- Amount Input -->
    <div class="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow">
      <label class="block text-gray-700 font-semibold mb-2">Amount (₱)</label>
      <input 
        v-model="amount"
        type="number"
        placeholder="Enter amount"
        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>

    <!-- Payment Methods -->
    <div class="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow space-y-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Choose Payment Method</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div 
          v-for="method in methods" 
          :key="method.id"
          @click="selectedMethod = method"
          class="flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200"
          :class="selectedMethod?.id === method.id 
            ? 'border-blue-600 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:bg-gray-50'"
        >
          <component :is="method.icon" class="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p class="font-medium text-gray-800">{{ method.name }}</p>
            <p class="text-sm text-gray-500">{{ method.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pay Now Button -->
    <div class="text-right">
      <button
        @click="payNow"
        class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold shadow hover:scale-105 hover:from-blue-700 hover:to-green-700 transition"
        :disabled="!amount || !selectedMethod"
      >
        <CheckCircleIcon class="h-5 w-5 mr-2"/>
        Pay Now
      </button>
    </div>
  </div>
</template>
