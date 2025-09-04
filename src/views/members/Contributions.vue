<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import {
  CalendarDaysIcon,
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const showAddModal = ref(false)
const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)
const paymentProofFile = ref(null)

const formState = reactive({
  isOnlinePayment: false,
  isQrPayment: false,
  qrCodeUrl: '/frontend/src/assets/qr.jfif',
  contributionDetails: {
    amount: '',
    paymentMethod: 'gcash',
    contributionDate: '',
    notes: '',
    referenceNo: ''
  }
})

const contributions = ref([])
const stats = ref({
  totalContributions: 0,
  totalConfirmed: 0,
  totalPending: 0,
  totalRejected: 0,
  averageAmount: 0
})

const paymentMethods = [
  { value: 'qrph', label: 'In-Store QR PH (via PayMongo)', type: 'qr' },
  { value: 'cash', label: 'Cash (Manual Entry)', type: 'manual' }
]

const displayStats = computed(() => [
  {
    name: 'Total Contributions',
    value: `${stats.value.totalContributions.toLocaleString()}`,
    icon: BanknotesIcon,
    color: 'from-emerald-500 to-emerald-700',
    description: 'Total contributions made'
  },
  {
    name: 'Confirmed Payments',
    value: `₱ ${stats.value.totalConfirmed.toLocaleString()}`,
    icon: CheckCircleIcon,
    color: 'from-blue-500 to-blue-700',
    description: 'Approved contributions'
  },
  {
    name: 'Pending Payments',
    value: `₱ ${stats.value.totalPending.toLocaleString()}`,
    icon: ClockIcon,
    color: 'from-orange-500 to-orange-700',
    description: 'Awaiting approval'
  }
])

const resetFormAndState = () => {
  formState.contributionDetails = {
    amount: '',
    paymentMethod: 'gcash',
    contributionDate: '',
    notes: '',
    referenceNo: ''
  }
  formState.isOnlinePayment = false
  formState.isQrPayment = false
  showAddModal.value = false
  error.value = null
  paymentProofFile.value = null
}

const showModal = () => {
  resetFormAndState()
  showAddModal.value = true
}

// Watch for changes in payment method to update UI state
watch(() => formState.contributionDetails.paymentMethod, (newValue) => {
  const selectedMethod = paymentMethods.find(m => m.value === newValue)
  formState.isOnlinePayment = selectedMethod?.type === 'online'
  formState.isQrPayment = selectedMethod?.type === 'qr'
})

const fetchContributions = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await axios.get('http://localhost:5000/api/contributions/user', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      contributions.value = response.data.data.contributions
      stats.value = response.data.data.stats
    }
  } catch (err) {
    console.error('Error fetching contributions:', err)
    error.value = err.response?.data?.message || 'Failed to fetch contributions'
  } finally {
    loading.value = false
  }
}

const createContribution = async () => {
  try {
    const { amount, paymentMethod, contributionDate, notes, referenceNo } = formState.contributionDetails
    const amountFloat = parseFloat(amount)

    if (isNaN(amountFloat) || amountFloat <= 0) {
      error.value = 'Please enter a valid amount.'
      return
    }

    // ✅ For PayMongo online flow
    if (paymentMethod === 'gcash') {
      loading.value = true
      error.value = null
      successMessage.value = null

      const response = await axios.post(
        'http://localhost:5000/api/payments/create-source',
        { amount: Math.round(amountFloat * 100), type: 'gcash' }, // amount in centavos
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      )

      if (response.data?.checkoutUrl) {
        // Redirect user to PayMongo checkout page
        window.location.href = response.data.checkoutUrl
        return
      } else {
        error.value = 'Failed to create PayMongo payment session.'
        return
      }
    }

    // ✅ For QR or Cash/manual payments
    if (paymentMethod === 'cash' || paymentMethod === 'qrph') {
      const formData = new FormData()
      formData.append('amount', amountFloat)
      formData.append('paymentMethod', paymentMethod)

      if (contributionDate) formData.append('contributionDate', contributionDate)
      if (notes) formData.append('notes', notes)
      if (referenceNo) formData.append('referenceNo', referenceNo)
      if (paymentProofFile.value) formData.append('paymentProof', paymentProofFile.value)

      loading.value = true
      error.value = null
      successMessage.value = null

      const response = await axios.post(
        'http://localhost:5000/api/contributions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        resetFormAndState()
        successMessage.value = 'Contribution successfully added! Awaiting approval.'
        await fetchContributions()
      }
    }
  } catch (err) {
    console.error('Error creating contribution:', err)
    error.value = err.response?.data?.message || 'Failed to process contribution.'
  } finally {
    loading.value = false
  }
}


const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-orange-100 text-orange-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'confirmed': return CheckCircleIcon
    case 'pending': return ClockIcon
    case 'rejected': return ExclamationTriangleIcon
    default: return ClockIcon
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    paymentProofFile.value = file
  }
}


const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPaymentMethod = (method) => {
  return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const showPreview = ref(false)


onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchContributions()
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Contributions</h1>
          <p class="text-sky-100 text-lg">Manage your fund contributions and track payment history</p>
        </div>
        <div class="hidden md:block">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <BanknotesIcon class="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-400 mr-2" />
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>

    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4">
      <div class="flex items-center">
        <CheckCircleIcon class="w-5 h-5 text-green-400 mr-2" />
        <p class="text-green-800">{{ successMessage }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="stat in displayStats" :key="stat.name"
        class="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div :class="`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mb-2">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <CalendarDaysIcon class="w-6 h-6 text-sky-600" />
          <h2 class="text-xl font-bold text-gray-900">Contribution History</h2>
        </div>
        <button @click="showModal"
          class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
          <PlusIcon class="w-4 h-4" />
          <span>Add Contribution</span>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        <p class="mt-4 text-sm text-gray-600 font-medium">Loading contributions...</p>
      </div>

      <div v-else-if="contributions.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contribution in contributions" :key="contribution.contributionID"
              class="hover:bg-sky-50 transition-colors duration-200">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatDate(contribution.contributionDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">₱{{ parseFloat(contribution.amount).toLocaleString() }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 flex items-center space-x-2">
                  <component
                    :is="paymentMethods.find(m => m.value === contribution.paymentMethod)?.type === 'online' ? BoltIcon : BanknotesIcon"
                    class="w-4 h-4 text-gray-500" />
                  <span>{{ formatPaymentMethod(contribution.paymentMethod) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <component :is="getStatusIcon(contribution.status)" class="w-4 h-4" />
                  <span
                    :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contribution.status)}`">
                    {{ contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ contribution.notes || '-' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8">
        <BanknotesIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 text-lg mb-2">No contributions yet</p>
        <p class="text-gray-400">Start contributing to your fund by clicking the "Add Contribution" button above.</p>
      </div>
    </div>

    <div v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform scale-95 opacity-0 transition-transform duration-300 ease-in-out"
        :class="{ 'scale-100 opacity-100': showAddModal }">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900">Make a Contribution</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
              <input v-model.number="formState.contributionDetails.amount" type="number" min="100" step="0.01"
                placeholder="Enter amount (min ₱100)"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select v-model="formState.contributionDetails.paymentMethod"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
                <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
                  {{ method.label }}
                </option>
              </select>
            </div>

            <div v-if="!formState.isOnlinePayment">
              <label class="block text-sm font-medium text-gray-700 mb-2">Contribution Date</label>
              <input v-model="formState.contributionDetails.contributionDate" type="date"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            </div>

            <div v-if="formState.isQrPayment">
              <label class="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
              <input v-model="formState.contributionDetails.referenceNo" type="text"
                placeholder="Enter reference number from transaction"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            </div>

            <div v-if="formState.isQrPayment" class="mt-6 flex flex-col items-center space-y-4">
              <p class="text-sm text-gray-600"><span class="font-bold">CLICK</span>  and Scan this QR code using your GCash or Maya app:</p>
              <img src="@/assets/image.png" alt="GCash QR Code"
                class="w-64 h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                @click="showPreview = true" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea v-model="formState.contributionDetails.notes" rows="3"
                placeholder="E.g., for electricity bill, monthly dues..."
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"></textarea>
            </div>

            <div v-if="!formState.isOnlinePayment">
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Proof (screenshot/photo)</label>
              <input type="file" accept="image/*" @change="handleFileUpload" class="block w-full text-sm text-gray-700 border rounded-md file:mr-4 file:py-2 file:px-4 
         file:rounded-md file:border-0 file:text-sm file:font-semibold 
         file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button @click="createContribution" :disabled="loading"
              class="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Processing...
              </span>
              <span v-else>
                {{ formState.isOnlinePayment ? 'Proceed to Pay' : 'Add Contribution' }}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center">
        <!-- Modal Preview -->
        <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div class="relative bg-white p-4 rounded-lg shadow-lg">
            <!-- Close Button -->
            <button @click="showPreview = false"
              class="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl">
              ✕
            </button>

            <!-- Large QR -->
            <img src="@/assets/image.png" alt="QR Preview" class="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>