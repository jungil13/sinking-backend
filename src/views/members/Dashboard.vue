<script setup>
import { ref, onMounted } from 'vue'
import { BanknotesIcon, ArrowTrendingUpIcon, CreditCardIcon, CurrencyDollarIcon, UserGroupIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import API from '@/api.js'

// Reactive data
const stats = ref([])
const recentActivities = ref([])
const loading = ref(true)
const error = ref(null)

// Default stats structure with icons and colors
const defaultStats = [
  { 
    name: 'Fund Balance', 
    icon: BanknotesIcon, 
    color: 'from-sky-500 to-sky-700',
    bgColor: 'bg-sky-50',
    description: 'Total available funds'
  },
  { 
    name: 'Total Contributions', 
    icon: ArrowTrendingUpIcon, 
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    description: 'Your contributions this month'
  },
  { 
    name: 'Active Loans', 
    icon: CreditCardIcon, 
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    description: 'Outstanding loan amount'
  },
  { 
    name: 'Loan Repayment', 
    icon: CurrencyDollarIcon, 
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    description: 'Repaid this month'
  }
]

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await API.get('/member/dashboard')
    
    if (response.data.success) {
      const data = response.data.data
      
      // Map API data to stats with icons and colors
      stats.value = defaultStats.map((defaultStat, index) => {
        const statKeys = ['fundBalance', 'totalContributions', 'activeLoans', 'loanRepayment']
        const apiStat = data.stats[statKeys[index]]
        
        return {
          ...defaultStat,
          value: apiStat.value,
          change: apiStat.change,
          changeType: apiStat.changeType
        }
      })
      
      recentActivities.value = data.recentActivities || []
    } else {
      error.value = 'Failed to load dashboard data'
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err)
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
    
    // Fallback to default data if API fails
    stats.value = defaultStats.map(stat => ({
      ...stat,
      value: '₱ 0',
      change: '0%',
      changeType: 'positive'
    }))
    recentActivities.value = []
  } finally {
    loading.value = false
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
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Welcome back!</h1>
          <p class="text-blue-100 text-lg">Here's what's happening with your account today.</p>
        </div>
        <div class="hidden md:block">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <UserGroupIcon class="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="i in 4" 
        :key="i"
        class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div>
          <div class="w-24 h-4 bg-gray-200 rounded mb-2"></div>
          <div class="w-20 h-8 bg-gray-200 rounded mb-2"></div>
          <div class="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div class="flex items-center">
        <div class="text-red-600 mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-red-800 font-medium">Error loading dashboard</h3>
          <p class="text-red-600 text-sm">{{ error }}</p>
          <button 
            @click="fetchDashboardData"
            class="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
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

    <!-- Recent Activities & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Activities -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Recent Activities</h2>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div v-if="loading" class="space-y-4">
            <div 
              v-for="i in 3" 
              :key="i"
              class="flex items-center p-4 rounded-xl bg-gray-50 animate-pulse"
            >
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
              <div class="flex-1 min-w-0">
                <div class="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                <div class="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
              <div class="text-right">
                <div class="w-16 h-4 bg-gray-200 rounded mb-2"></div>
                <div class="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div v-else-if="recentActivities.length === 0" class="text-center py-8">
            <CalendarIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 text-sm">No recent activities</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="index"
              class="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <CalendarIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 capitalize">
                  {{ activity.type.replace('_', ' ') }}
                </p>
                <p class="text-xs text-gray-500">{{ activity.date }}</p>
                <p v-if="activity.paymentMethod" class="text-xs text-gray-400">
                  via {{ activity.paymentMethod.replace('_', ' ') }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ activity.amount }}</p>
                <span 
                  :class="[
                    'text-xs px-2 py-1 rounded-full',
                    activity.status === 'confirmed' || activity.status === 'completed' ? 'text-green-600 bg-green-100' : 
                    activity.status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
                  ]"
                >
                  {{ activity.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="lg:col-span-1 w-full">
  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
    <div class="flex flex-col gap-4">
      <RouterLink
        to="/member/contributions"
        class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
      >
        Make Contribution
      </RouterLink>

      <RouterLink
        to="/member/loans"
        class="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
      >
        Apply for Loan
      </RouterLink>

      <RouterLink
        to="/member/withdrawals"
        class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
      >
        Request Withdrawal
      </RouterLink>

      <RouterLink
        to="/member/messages"
        class="w-full sm:w-auto border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 text-center"
      >
        View Messages
      </RouterLink>
    </div>
  </div>
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
