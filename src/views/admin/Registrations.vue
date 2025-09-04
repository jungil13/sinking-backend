<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Member Registrations</h1>
      <p class="text-gray-600">Review and approve new member applications</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6 flex items-center gap-3" role="alert">
      <ExclamationTriangleIcon class="h-6 w-6 text-red-500" />
      <span class="font-medium">{{ error }}</span>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UserPlusIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Active</p>
            <p class="text-2xl font-bold text-gray-900">{{ approvedCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Suspended</p>
            <p class="text-2xl font-bold text-gray-900">{{ suspendedCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <XCircleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Inactive</p>
            <p class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <UsersIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ registrations.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or phone..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="sm:w-48">
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"></path>
        </svg>
        <span class="text-gray-600">Loading registrations...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRegistrations.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <UsersIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
      <p class="text-gray-500">No registrations match your current filters.</p>
    </div>

    <!-- Registrations Table -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="registration in filteredRegistrations" :key="registration.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">
                      {{ registration.name.split(' ').map(n => n[0]).join('') }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ registration.name }}</div>
                    <div class="text-sm text-gray-500">ID: {{ registration.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ registration.email }}</div>
                <div class="text-sm text-gray-500">{{ registration.phone }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ formatDate(registration.applicationDate) }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': registration.status === 'pending',
                    'bg-green-100 text-green-800': registration.status === 'active',
                    'bg-orange-100 text-orange-800': registration.status === 'suspended',
                    'bg-red-100 text-red-800': registration.status === 'inactive'
                  }"
                >
                  {{ registration.status.charAt(0).toUpperCase() + registration.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button
                    v-if="registration.status === 'pending'"
                    @click="approveRegistration(registration.id)"
                    class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    v-if="registration.status === 'pending'"
                    @click="rejectRegistration(registration.id)"
                    class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Reject
                  </button>
                  <button
                    v-if="registration.status === 'active'"
                    @click="suspendMember(registration.id)"
                    class="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Suspend
                  </button>
                  <button
                    v-if="registration.status === 'suspended'"
                    @click="reactivateMember(registration.id)"
                    class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Reactivate
                  </button>
                  <button
                    @click="viewDetails(registration)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration Details Modal -->
    <div v-if="selectedRegistration" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Registration Details</h3>
            <button @click="selectedRegistration = null" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Personal Information</h4>
              <div class="space-y-2">
                <div>
                  <label class="text-sm font-medium text-gray-500">Full Name</label>
                  <p class="text-sm text-gray-900">{{ selectedRegistration.name }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Email</label>
                  <p class="text-sm text-gray-900">{{ selectedRegistration.email }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Phone</label>
                  <p class="text-sm text-gray-900">{{ selectedRegistration.phone }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Address</label>
                  <p class="text-sm text-gray-900">{{ selectedRegistration.address }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Application Information</h4>
              <div class="space-y-2">
                <div>
                  <label class="text-sm font-medium text-gray-500">Application Date</label>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedRegistration.applicationDate) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Status</label>
                  <span
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': selectedRegistration.status === 'pending',
                      'bg-green-100 text-green-800': selectedRegistration.status === 'active',
                      'bg-orange-100 text-orange-800': selectedRegistration.status === 'suspended',
                      'bg-red-100 text-red-800': selectedRegistration.status === 'inactive'
                    }"
                  >
                    {{ selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1) }}
                  </span>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Employment</label>
                  <p class="text-sm text-gray-900">{{ selectedRegistration.employment }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Monthly Income</label>
                  <p class="text-sm text-gray-900">₱{{ selectedRegistration.monthlyIncome.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedRegistration.status === 'pending'" class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                @click="approveRegistration(selectedRegistration.id)"
                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Approve Registration
              </button>
              <button
                @click="rejectRegistration(selectedRegistration.id)"
                class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Reject Registration
              </button>
            </div>
          </div>
          
          <div v-else-if="selectedRegistration.status === 'active'" class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                @click="suspendMember(selectedRegistration.id)"
                class="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Suspend Member
              </button>
            </div>
          </div>
          
          <div v-else-if="selectedRegistration.status === 'suspended'" class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                @click="reactivateMember(selectedRegistration.id)"
                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Reactivate Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const API_BASE = 'http://localhost:5000/api'

const searchQuery = ref('')
const statusFilter = ref('')
const selectedRegistration = ref(null)
const registrations = ref([])
const loading = ref(false)
const error = ref('')

const filteredRegistrations = computed(() => {
  let filtered = registrations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(reg => 
      reg.name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.phone.includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(reg => reg.status === statusFilter.value)
  }

  return filtered
})

const pendingCount = computed(() => registrations.value.filter(reg => reg.status === 'pending').length)
const approvedCount = computed(() => registrations.value.filter(reg => reg.status === 'active').length)
const rejectedCount = computed(() => registrations.value.filter(reg => reg.status === 'inactive').length)
const suspendedCount = computed(() => registrations.value.filter(reg => reg.status === 'suspended').length)

// Load registrations from API
const loadRegistrations = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_BASE}/admin/registrations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    registrations.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load registrations'
    console.error('Error loading registrations:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const approveRegistration = async (id) => {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`${API_BASE}/admin/registrations/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Registration approved successfully',
      timer: 2000,
      showConfirmButton: false
    })
    
    await loadRegistrations()
    selectedRegistration.value = null
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'Failed to approve registration'
    })
  }
}

const rejectRegistration = async (id) => {
  const { value: reason } = await Swal.fire({
    title: 'Reject Registration',
    text: 'Please provide a reason for rejection (optional):',
    input: 'textarea',
    inputPlaceholder: 'Enter reason for rejection...',
    showCancelButton: true,
    confirmButtonText: 'Reject',
    confirmButtonColor: '#dc2626',
    cancelButtonText: 'Cancel'
  })
  
  if (reason !== undefined) {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE}/admin/registrations/${id}/reject`, 
        { reason: reason || null }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Registration rejected successfully',
        timer: 2000,
        showConfirmButton: false
      })
      
      await loadRegistrations()
      selectedRegistration.value = null
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to reject registration'
      })
    }
  }
}

const suspendMember = async (id) => {
  const { value: reason } = await Swal.fire({
    title: 'Suspend Member',
    text: 'Please provide a reason for suspension:',
    input: 'textarea',
    inputPlaceholder: 'Enter reason for suspension...',
    showCancelButton: true,
    confirmButtonText: 'Suspend',
    confirmButtonColor: '#f59e0b',
    cancelButtonText: 'Cancel'
  })
  
  if (reason !== undefined) {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE}/admin/registrations/${id}/suspend`, 
        { reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Member suspended successfully',
        timer: 2000,
        showConfirmButton: false
      })
      
      await loadRegistrations()
    selectedRegistration.value = null
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to suspend member'
      })
    }
  }
}

const reactivateMember = async (id) => {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`${API_BASE}/admin/registrations/${id}/reactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Member reactivated successfully',
      timer: 2000,
      showConfirmButton: false
    })
    
    await loadRegistrations()
    selectedRegistration.value = null
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'Failed to reactivate member'
    })
  }
}

const viewDetails = (registration) => {
  selectedRegistration.value = registration
}

// Load data on component mount
onMounted(() => {
  loadRegistrations()
})
</script>
