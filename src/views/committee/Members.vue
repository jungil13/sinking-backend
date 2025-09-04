<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'

// API base URL - replace with your actual backend URL
const API_URL = 'http://localhost:5000/api'

const searchQuery = ref('')
const selectedMember = ref(null)
const showTransactionModal = ref(false)

// Data and state management
const members = ref([])
const filteredMembers = ref([])
const transactionHistory = ref([])
const isLoading = ref(true)
const error = ref(null)

// Function to fetch all members (with optional search query)
const fetchMembers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token') // Assuming token is stored in localStorage
    const response = await axios.get(`${API_URL}/members`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        search: searchQuery.value
      }
    })
    members.value = response.data
    filteredMembers.value = response.data // Initial filter is the full list
  } catch (err) {
    console.error('Failed to fetch members:', err)
    error.value = 'Failed to load members. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Function to search members (now triggers a new fetch)
const searchMembers = () => {
  fetchMembers()
}

// Function to fetch and display a member's transaction history
const viewTransactions = async (member) => {
  selectedMember.value = member
  transactionHistory.value = []
  isLoading.value = true
  error.value = null
  showTransactionModal.value = true

  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/members/${member.memberID  }/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    transactionHistory.value = response.data
  } catch (err) {
    console.error('Failed to fetch transaction history:', err)
    error.value = 'Failed to load transaction history.'
  } finally {
    isLoading.value = false
  }
}

// Helper functions for UI
const getStatusColor = (status) => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

const getTransactionIcon = (type) => {
  switch(type) {
    case 'contribution': return '💰'
    case 'loan_payment': return '💳'
    case 'penalty': return '⚠️'
    default: return '📝'
  }
}

const getTransactionColor = (type) => {
  switch(type) {
    case 'contribution': return 'text-green-600'
    case 'loan_payment': return 'text-blue-600'
    case 'penalty': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

// Fetch members on component mount
onMounted(() => {
  fetchMembers()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Members Management</h1>
          <p class="text-white/80 mt-2">View and manage all fund members and their transaction history</p>
        </div>
        <UserGroupIcon class="w-12 h-12 text-white/80" />
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl p-4">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          @input="searchMembers"
          type="text"
          placeholder="Search members by name, email, or phone..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <div v-if="isLoading" class="p-6 text-center text-gray-500">
        Loading members...
      </div>
      <div v-else-if="error" class="p-6 text-center text-red-500">
        {{ error }}
      </div>
      <div v-else-if="!filteredMembers.length" class="p-6 text-center text-gray-500">
        No members found.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment</th>
               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Income</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                  <div class="text-sm text-gray-500">Joined {{ member.joinDate }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ member.email }}</div>
                <div class="text-sm text-gray-500">{{ member.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`">
                  {{ member.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ member.address }}
              </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ member.employment }}
              </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
               ₱ {{ member.monthlyIncome }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewTransactions(member)"
                  class="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                >
                  <EyeIcon class="w-4 h-4" />
                  View History
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showTransactionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedMember?.name }} - Transaction History</h2>
              <p class="text-gray-600 mt-1">Complete financial activity overview</p>
            </div>
            <button
              @click="showTransactionModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div v-if="selectedMember" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <EnvelopeIcon class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ selectedMember.email }}</span>
            </div>
            <div class="flex items-center gap-2">
              <PhoneIcon class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ selectedMember.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPinIcon class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ selectedMember.address }}</span>
            </div>
          </div>
          
          <div v-if="isLoading" class="p-6 text-center text-gray-500">
            Loading transactions...
          </div>
          <div v-else-if="error" class="p-6 text-center text-red-500">
            {{ error }}
          </div>
          <div v-else-if="!transactionHistory.length" class="p-6 text-center text-gray-500">
            No transactions found for this member.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="transaction in transactionHistory"
              :key="transaction.id"
              class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getTransactionIcon(transaction.type) }}</span>
                <div>
                  <p class="font-medium text-gray-900">{{ transaction.type.replace('_', ' ').toUpperCase() }}</p>
                  <p class="text-sm text-gray-500">{{ transaction.date }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="`font-semibold ${getTransactionColor(transaction.type)}`">
                  {{ transaction.amount }}
                </p>
                <span class="text-sm text-green-600">{{ transaction.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>