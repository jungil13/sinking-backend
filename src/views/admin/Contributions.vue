<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import {
  BanknotesIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)

const allContributions = ref([])
const selectedContribution = ref(null)
const showDetailsModal = ref(false)

const showImagePreviewModal = ref(false)
const previewImageUrl = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() => {
  return Math.ceil(allContributions.value.length / itemsPerPage.value)
})

const contributions = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return allContributions.value.slice(startIndex, endIndex)
})

const filters = ref({
  status: '',
  paymentMethod: '',
  startDate: '',
  endDate: ''
})

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
  { value: 'maya', label: 'Maya' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' }
]

const fetchContributions = async () => {
  try {
    loading.value = true
    error.value = null

    const params = new URLSearchParams()
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.paymentMethod) params.append('paymentMethod', filters.value.paymentMethod)
    if (filters.value.startDate) params.append('startDate', filters.value.startDate)
    if (filters.value.endDate) params.append('endDate', filters.value.endDate)

    const response = await axios.get(`http://localhost:5000/api/contributions?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      allContributions.value = response.data.data
      currentPage.value = 1
    }
  } catch (err) {
    console.error('Error fetching contributions:', err)
    error.value = err.response?.data?.message || 'Failed to fetch contributions'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updateStatus = async (contributionID, newStatus, notes = '') => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/contributions/${contributionID}/status`, {
      status: newStatus,
      notes
    }, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      await fetchContributions()
    }
  } catch (err) {
    console.error('Error updating status:', err)
    error.value = err.response?.data?.message || 'Failed to update status'
  }
}

const viewDetails = (contribution) => {
  selectedContribution.value = contribution
  showDetailsModal.value = true
}

const openImagePreview = (proofFilename) => {
  if (proofFilename) {
    previewImageUrl.value = `http://localhost:5000/uploads/${proofFilename}`
    showImagePreviewModal.value = true
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
    case 'rejected': return XCircleIcon
    default: return ClockIcon
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPaymentMethod = (method) => {
  return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const applyFilters = () => {
  fetchContributions()
}

const clearFilters = () => {
  filters.value = {
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  }
  fetchContributions()
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchContributions()
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Contributions Management</h1>
          <p class="text-white/80 mt-2">Review and manage all member contributions</p>
        </div>
        <BanknotesIcon class="w-12 h-12 text-white/80" />
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-center">
        <XCircleIcon class="w-5 h-5 text-red-400 mr-2" />
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl p-6">
      <div class="flex items-center space-x-3 mb-4">
        <FunnelIcon class="w-5 h-5 text-gray-500" />
        <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">All Status</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select v-model="filters.paymentMethod"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">All Methods</option>
            <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
              {{ method.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input v-model="filters.startDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input v-model="filters.endDate" type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      <div class="flex space-x-3 mt-4">
        <button @click="applyFilters"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Apply Filters
        </button>
        <button @click="clearFilters"
          class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Clear Filters
        </button>
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">All Contributions</h3>
        <p class="text-sm text-gray-600 mt-1">Total: {{ allContributions.length }} contributions</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-2 text-gray-600">Loading contributions...</span>
      </div>

      <div v-else-if="contributions.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Proof
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contribution in contributions" :key="contribution.contributionID" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ contribution.firstName }} {{ contribution.lastName
                    }}</div>
                  <div class="text-sm text-gray-500">@{{ contribution.username }}</div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">₱{{ parseFloat(contribution.amount).toLocaleString() }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatPaymentMethod(contribution.paymentMethod) }}</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contribution.referenceNo || '—' }}</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="contribution.paymentProof">
                  <img :src="`http://localhost:5000/uploads/${contribution.paymentProof}`" alt="Payment Proof"
                    class="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                    @click="openImagePreview(contribution.paymentProof)" />
                </div>
                <div v-else class="text-gray-400 text-sm">No Proof</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(contribution.contributionDate) }}</div>
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

              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewDetails(contribution)"
                    class="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                    <EyeIcon class="w-4 h-4" />
                    View
                  </button>

                  <div v-if="contribution.status === 'pending'" class="flex space-x-1">
                    <button @click="updateStatus(contribution.contributionID, 'confirmed')"
                      class="text-green-600 hover:text-green-900">
                      Approve
                    </button>
                    <button @click="updateStatus(contribution.contributionID, 'rejected')"
                      class="text-red-600 hover:text-red-900">
                      Reject
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

        </table>
      </div>

      <div v-else class="text-center py-8">
        <BanknotesIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 text-lg mb-2">No contributions found</p>
        <p class="text-gray-400">Try adjusting your filters or check back later.</p>
      </div>

      <div v-if="allContributions.length > itemsPerPage && !loading" class="flex items-center justify-between p-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, allContributions.length) }}</span>
              of
              <span class="font-medium">{{ allContributions.length }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Previous</span>
                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <button v-for="page in totalPages" :key="page" @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]">
                {{ page }}
              </button>
              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Next</span>
                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Contribution Details</h3>
            <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircleIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div v-if="selectedContribution" class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Member Information</h4>
              <div class="space-y-2">
                <div>
                  <label class="text-sm font-medium text-gray-500">Name</label>
                  <p class="text-sm text-gray-900">{{ selectedContribution.firstName }} {{ selectedContribution.lastName
                    }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Username</label>
                  <p class="text-sm text-gray-900">@{{ selectedContribution.username }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Member ID</label>
                  <p class="text-sm text-gray-900">{{ selectedContribution.memberID }}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-3">Contribution Details</h4>
              <div class="space-y-2">
                <div>
                  <label class="text-sm font-medium text-gray-500">Amount</label>
                  <p class="text-sm font-medium text-gray-900">₱{{
                    parseFloat(selectedContribution.amount).toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Payment Method</label>
                  <p class="text-sm text-gray-900">{{ formatPaymentMethod(selectedContribution.paymentMethod) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Date</label>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedContribution.contributionDate) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Status</label>
                  <span
                    :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedContribution.status)}`">
                    {{ selectedContribution.status.charAt(0).toUpperCase() + selectedContribution.status.slice(1) }}
                  </span>
                </div>

                <div v-if="selectedContribution.paymentProof">
                  <label class="text-sm font-medium text-gray-500">Payment Proof</label>
                  <div class="mt-2">
                    <img :src="`http://localhost:5000/uploads/${selectedContribution.paymentProof}`" alt="Payment Proof"
                      class="w-40 h-40 object-contain border rounded-lg cursor-pointer hover:opacity-80"
                      @click="openImagePreview(selectedContribution.paymentProof)" />
                  </div>
                </div>

                <div v-if="selectedContribution.referenceNo">
                  <label class="text-sm font-medium text-gray-500">Reference No.</label>
                  <p class="text-sm text-gray-900">{{ selectedContribution.referenceNo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-if="showImagePreviewModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full p-4 relative">
        <button @click="showImagePreviewModal = false"
          class="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition-colors">
          <XCircleIcon class="w-7 h-7" />
        </button>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Payment Proof Preview</h3>
        <div class="flex justify-center items-center">
          <img :src="previewImageUrl" alt="Payment Proof Preview" class="max-w-full max-h-[70vh] object-contain" />
        </div>
      </div>
    </div>
  </div>
</template>