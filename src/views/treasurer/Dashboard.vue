<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import API from '@/api.js'
import SimpleChart from '@/components/SimpleChart.vue'
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon,
  UserPlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EyeIcon,
  ChartPieIcon
} from '@heroicons/vue/24/outline'

// Dashboard Stats
const stats = ref([
  { 
    name: 'Fund Balance', 
    value: '₱ 0', 
    icon: BanknotesIcon, 
    color: 'from-indigo-500 to-indigo-700',
    change: '+12.5%',
    changeType: 'positive',
    description: 'Total available funds'
  },
  { 
    name: 'Total Contributions', 
    value: '₱ 0', 
    icon: ArrowTrendingUpIcon, 
    color: 'from-emerald-500 to-emerald-700',
    change: '+8.2%',
    changeType: 'positive',
    description: 'Member contributions'
  },
  { 
    name: 'Total Loans', 
    value: '₱ 0', 
    icon: CreditCardIcon, 
    color: 'from-orange-500 to-orange-700',
    change: '+15.3%',
    changeType: 'positive',
    description: 'Active loan amount'
  },
  { 
    name: 'Loan Payments', 
    value: '₱ 0', 
    icon: CurrencyDollarIcon, 
    color: 'from-cyan-500 to-cyan-700',
    change: '+22.1%',
    changeType: 'positive',
    description: 'Repayments this month'
  },
  { 
    name: 'Total Interest', 
    value: '₱ 0', 
    icon: CurrencyDollarIcon, 
    color: 'from-purple-500 to-purple-700',
    change: '+18.7%',
    changeType: 'positive',
    description: 'Interest earned'
  },
  { 
    name: 'Active Members', 
    value: '0', 
    icon: UserPlusIcon, 
    color: 'from-blue-500 to-blue-700',
    change: '+5.2%',
    changeType: 'positive',
    description: 'Registered members'
  }
])

// Pending Approvals
const pendingApprovals = ref([])

// Recent Transactions
const recentTransactions = ref([])

// Chart data for monthly contributions
const chartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  contributions: [45000, 52000, 48000, 61000, 55000, 67000, 58000, 72000, 65000, 78000, 82000, 95000],
  loans: [30000, 35000, 28000, 42000, 38000, 45000, 40000, 52000, 48000, 58000, 62000, 68000]
})

// Chart type selection
const chartType = ref('bar')
const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: ChartBarIcon },
  { value: 'line', label: 'Line Chart', icon: ChartPieIcon },
  { value: 'mixed', label: 'Mixed Chart', icon: EyeIcon }
]

// Loading and error states
const isLoading = ref(true)
const error = ref(null)

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('🔍 Fetching admin dashboard data...')
    console.log('🔍 Token:', localStorage.getItem('token') ? 'Present' : 'Missing')
    
    const response = await API.get('/admin/dashboard')
    
    console.log('🔍 API Response:', response.data)
    
    if (response.data.success) {
      const data = response.data.data
      
      // Update stats
      stats.value[0].value = data.stats.fundBalance.value
      stats.value[0].change = data.stats.fundBalance.change
      stats.value[0].changeType = data.stats.fundBalance.changeType
      
      stats.value[1].value = data.stats.totalContributions.value
      stats.value[1].change = data.stats.totalContributions.change
      stats.value[1].changeType = data.stats.totalContributions.changeType
      
      stats.value[2].value = data.stats.totalLoans.value
      stats.value[2].change = data.stats.totalLoans.change
      stats.value[2].changeType = data.stats.totalLoans.changeType
      
      stats.value[3].value = data.stats.loanRepayments.value
      stats.value[3].change = data.stats.loanRepayments.change
      stats.value[3].changeType = data.stats.loanRepayments.changeType
      
      stats.value[4].value = data.stats.totalInterest.value
      stats.value[4].change = data.stats.totalInterest.change
      stats.value[4].changeType = data.stats.totalInterest.changeType
      
      stats.value[5].value = data.stats.activeMembers.value
      stats.value[5].change = data.stats.activeMembers.change
      stats.value[5].changeType = data.stats.activeMembers.changeType
      
      // Update pending approvals
      pendingApprovals.value = data.pendingApprovals
      
      // Update recent transactions
      recentTransactions.value = data.recentTransactions
      
      // Update chart data if available
      if (data.monthlyOverview && data.monthlyOverview.length > 0) {
        chartData.value.contributions = data.monthlyOverview.map(month => month.contributions)
        chartData.value.loans = data.monthlyOverview.map(month => month.loans)
      }
    }
  } catch (err) {
    console.error('❌ Error fetching dashboard data:', err)
    console.error('❌ Error response:', err.response?.data)
    console.error('❌ Error status:', err.response?.status)
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
  } finally {
    isLoading.value = false
  }
}

const approveItem = (item) => {
  // Simulate approval
  item.status = 'approved'
  setTimeout(() => {
    pendingApprovals.value = pendingApprovals.value.filter(i => i.id !== item.id)
  }, 1000)
}

const rejectItem = (item) => {
  // Simulate rejection
  item.status = 'rejected'
  setTimeout(() => {
    pendingApprovals.value = pendingApprovals.value.filter(i => i.id !== item.id)
  }, 1000)
}

const getTypeIcon = (type) => {
  switch(type) {
    case 'registration': return UserPlusIcon
    case 'loan': return CreditCardIcon
    case 'withdrawal': return CurrencyDollarIcon
    default: return ClockIcon
  }
}

const getTypeColor = (type) => {
  switch(type) {
    case 'registration': return 'bg-blue-100 text-blue-700'
    case 'loan': return 'bg-green-100 text-green-700'
    case 'withdrawal': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getTransactionIcon = (type) => {
  switch(type) {
    case 'contribution': return ArrowTrendingUpIcon
    case 'loan_payment': return CreditCardIcon
    case 'withdrawal': return CurrencyDollarIcon
    default: return ClockIcon
  }
}

const getTransactionColor = (type) => {
  switch(type) {
    case 'contribution': return 'text-green-600'
    case 'loan_payment': return 'text-blue-600'
    case 'withdrawal': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

// Load data on component mount
onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Treasurer Dashboard</h1>
          <p class="text-emerald-100 text-lg">Manage fund finances, approve withdrawals, and monitor financial activities</p>
        </div>
        <div class="hidden md:block">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <BanknotesIcon class="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading dashboard</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button 
            @click="fetchDashboardData"
            class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Loading Skeletons -->
      <div v-if="isLoading" v-for="n in 6" :key="n" class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div>
          <div class="w-24 h-4 bg-gray-200 rounded mb-2"></div>
          <div class="w-32 h-8 bg-gray-200 rounded mb-2"></div>
          <div class="w-20 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <!-- Actual Stats -->
      <div 
        v-else
        v-for="stat in stats" 
        :key="stat.name" 
        class="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="text-right">
            <span 
              :class="[
                'text-sm font-medium px-2 py-1 rounded-full',
                stat.changeType === 'positive' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              ]"
            >
              {{ stat.change }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mb-2">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pending Approvals -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Pending Approvals</h2>
          <span v-if="!isLoading" class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            {{ pendingApprovals.length }} pending
          </span>
          <div v-else class="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="n in 3" :key="n" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div class="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                <div class="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="flex space-x-2">
              <div class="w-16 h-8 bg-gray-200 rounded"></div>
              <div class="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

        <!-- Actual Content -->
        <div v-else class="space-y-4">
          <div v-if="pendingApprovals.length === 0" class="text-center py-8 text-gray-500">
            <ClockIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No pending approvals</p>
        </div>
          <div 
            v-else
            v-for="item in pendingApprovals" 
            :key="item.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex items-center space-x-4">
              <div :class="`p-2 rounded-lg ${getTypeColor(item.type)}`">
                <component :is="getTypeIcon(item.type)" class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-500 capitalize">{{ item.type }} • {{ item.date }}</p>
                <p v-if="item.amount" class="text-sm font-semibold text-gray-700">{{ item.amount }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="approveItem(item)"
                class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Approve
              </button>
              <button 
                @click="rejectItem(item)"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Reject
              </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <button v-if="!isLoading" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All</button>
          <div v-else class="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="n in 5" :key="n" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div class="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                <div class="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="text-right">
              <div class="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div class="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <!-- Actual Content -->
        <div v-else class="space-y-4">
          <div v-if="recentTransactions.length === 0" class="text-center py-8 text-gray-500">
            <ChartBarIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent transactions</p>
      </div>
        <div 
            v-else
          v-for="transaction in recentTransactions" 
          :key="transaction.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
        >
          <div class="flex items-center space-x-4">
            <div :class="`p-2 rounded-lg bg-gray-100 ${getTransactionColor(transaction.type)}`">
              <component :is="getTransactionIcon(transaction.type)" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ transaction.member }}</p>
              <p class="text-sm text-gray-500 capitalize">{{ transaction.type.replace('_', ' ') }} • {{ transaction.date }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ transaction.amount }}</p>
            <span 
              :class="[
                'text-xs px-2 py-1 rounded-full font-medium',
                  transaction.status === 'completed' || transaction.status === 'confirmed' ? 'text-green-600 bg-green-100' : 
                  transaction.status === 'rejected' ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100'
              ]"
            >
              {{ transaction.status }}
            </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Monthly Financial Overview</h2>
        <div class="flex items-center space-x-4">
          <!-- Chart Type Selector -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 font-medium">Chart Type:</span>
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                v-for="type in chartTypes"
                :key="type.value"
                @click="chartType = type.value"
                :class="[
                  'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  chartType === type.value 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <component :is="type.icon" class="w-4 h-4" />
                <span>{{ type.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- Legend -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Contributions</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Loans</span>
          </div>
          </div>
        </div>
      </div>
      
      <!-- Chart Container -->
      <div class="h-80 w-full">
        <SimpleChart 
          :data="chartData" 
          :type="chartType"
          :height="320"
        />
      </div>
      
      <!-- Chart Info -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center space-x-4">
          <span>📊 Interactive chart with hover details</span>
          <span>🔄 Real-time data updates</span>
        </div>
        <div class="text-xs">
          Last updated: {{ new Date().toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">View All Members</h3>
          <UserPlusIcon class="w-8 h-8 text-white/80" />
        </div>
        <p class="text-indigo-100 mb-6">Manage member information and view transaction history</p>
        <router-link 
          to="/admin/members"
          class="inline-flex items-center bg-white text-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          Go to Members
        </router-link>
      </div>
      
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Loan Management</h3>
          <CreditCardIcon class="w-8 h-8 text-white/80" />
        </div>
        <p class="text-emerald-100 mb-6">Review and approve loan applications</p>
        <router-link 
          to="/admin/loans"
          class="inline-flex items-center bg-white text-emerald-600 px-4 py-2 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          Manage Loans
        </router-link>
      </div>
      
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Financial Reports</h3>
          <ChartBarIcon class="w-8 h-8 text-white/80" />
        </div>
        <p class="text-purple-100 mb-6">Generate detailed financial reports and analytics</p>
        <router-link 
          to="/admin/reports"
          class="inline-flex items-center bg-white text-purple-600 px-4 py-2 rounded-xl font-medium hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          View Reports
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for cards */
.group:hover .transform {
  transform: translateY(-4px);
}
</style>

