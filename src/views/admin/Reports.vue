<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
      <p class="text-gray-600">Comprehensive financial reports and fund performance analytics</p>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            v-model="selectedPeriod"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div v-if="selectedPeriod === 'custom'" class="flex items-center space-x-2">
          <input
            v-model="startDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-gray-500">to</span>
          <input
            v-model="endDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          @click="generateReport"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Generating...' : 'Generate Report' }}
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Fund Balance</p>
            <div v-if="loading" class="h-8 bg-gray-200 rounded animate-pulse"></div>
            <p v-else class="text-2xl font-bold text-gray-900">₱{{ totalFundBalance.toLocaleString() }}</p>
            <p class="text-sm text-green-600">+12.5% from last month</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ArrowUpIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Contributions</p>
            <div v-if="loading" class="h-8 bg-gray-200 rounded animate-pulse"></div>
            <p v-else class="text-2xl font-bold text-gray-900">₱{{ totalContributions.toLocaleString() }}</p>
            <p class="text-sm text-blue-600">+8.3% from last month</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <BanknotesIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Active Loans</p>
            <div v-if="loading" class="h-8 bg-gray-200 rounded animate-pulse"></div>
            <p v-else class="text-2xl font-bold text-gray-900">₱{{ activeLoans.toLocaleString() }}</p>
            <p class="text-sm text-yellow-600">15 active loans</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <ChartBarIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Interest Earned</p>
            <div v-if="loading" class="h-8 bg-gray-200 rounded animate-pulse"></div>
            <p v-else class="text-2xl font-bold text-gray-900">₱{{ interestEarned.toLocaleString() }}</p>
            <p class="text-sm text-purple-600">+15.2% from last month</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Fund Growth Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Fund Growth Trend</h3>
          <div class="flex space-x-2">
            <button 
              @click="chartType1 = 'line'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType1 === 'line' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Line
            </button>
            <button 
              @click="chartType1 = 'bar'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType1 === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Bar
            </button>
            <button 
              @click="chartType1 = 'mixed'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType1 === 'mixed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Mixed
            </button>
          </div>
        </div>
        <div class="h-64">
          <div v-if="loading" class="h-full bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
            <div class="h-12 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-1"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
          </div>
          </div>
          <FinancialChart 
            v-else
            :data="fundGrowthData"
            :type="chartType1"
            :height="256"
          />
        </div>
      </div>

      <!-- Contribution vs Withdrawal Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Contributions vs Withdrawals</h3>
          <div class="flex space-x-2">
            <button 
              @click="chartType2 = 'bar'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType2 === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Bar
            </button>
            <button 
              @click="chartType2 = 'line'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType2 === 'line' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Line
            </button>
            <button 
              @click="chartType2 = 'mixed'"
              :class="['px-3 py-1 text-xs rounded-md transition-colors', chartType2 === 'mixed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              Mixed
            </button>
          </div>
        </div>
        <div class="h-64">
          <div v-if="loading" class="h-full bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
            <div class="h-12 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto mb-1"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
          </div>
          </div>
          <FinancialChart 
            v-else
            :data="contributionWithdrawalData"
            :type="chartType2"
            :height="256"
          />
        </div>
      </div>
    </div>

    <!-- Pie Chart Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Transaction Distribution -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution</h3>
        <div class="h-64">
          <div v-if="loading" class="h-full bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="h-12 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-1"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
            </div>
          </div>
          <PieChart 
            v-else
            :data="transactionDistributionData"
            :height="256"
            title="Monthly Transaction Types"
          />
        </div>
      </div>

      <!-- Fund Allocation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Fund Allocation</h3>
        <div class="h-64">
          <div v-if="loading" class="h-full bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="h-12 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-1"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
            </div>
          </div>
          <PieChart 
            v-else
            :data="fundAllocationData"
            :height="256"
            title="Current Fund Allocation"
          />
        </div>
      </div>
    </div>

    <!-- Detailed Reports -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Member Activity Report -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Activity Summary</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Active Members</p>
              <p class="text-xs text-gray-500">Members with contributions this month</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-blue-600">{{ activeMembers }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">New Members</p>
              <p class="text-xs text-gray-500">Members joined this month</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-green-600">{{ newMembers }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Loan Applications</p>
              <p class="text-xs text-gray-500">Pending loan requests</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-yellow-600">{{ loanApplications }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Withdrawal Requests</p>
              <p class="text-xs text-gray-500">Pending withdrawal requests</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-purple-600">{{ withdrawalRequests }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Average Contribution</p>
              <p class="text-xs text-gray-500">Per member this month</p>
            </div>
            <span v-if="loading" class="h-6 w-24 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-blue-600">₱{{ averageContribution.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Average Loan Amount</p>
              <p class="text-xs text-gray-500">Per approved loan</p>
            </div>
            <span v-if="loading" class="h-6 w-24 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-green-600">₱{{ averageLoanAmount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Loan Repayment Rate</p>
              <p class="text-xs text-gray-500">On-time payments</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-yellow-600">{{ loanRepaymentRate }}%</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Fund Utilization</p>
              <p class="text-xs text-gray-500">Loans as % of total fund</p>
            </div>
            <span v-if="loading" class="h-6 w-16 bg-gray-200 rounded animate-pulse"></span>
            <span v-else class="text-lg font-bold text-purple-600">{{ fundUtilization }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All Transactions
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" v-for="i in 5" :key="i" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </td>
            </tr>
            <tr v-else-if="recentTransactions.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No transactions found for the selected period
              </td>
            </tr>
            <tr v-else v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ transaction.memberName }}</div>
                <div class="text-sm text-gray-500">{{ transaction.memberId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-green-100 text-green-800': transaction.type === 'contribution',
                    'bg-blue-100 text-blue-800': transaction.type === 'loan',
                    'bg-yellow-100 text-yellow-800': transaction.type === 'withdrawal',
                    'bg-purple-100 text-purple-800': transaction.type === 'interest'
                  }"
                >
                  {{ transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₱{{ transaction.amount.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-green-100 text-green-800': transaction.status === 'completed',
                    'bg-yellow-100 text-yellow-800': transaction.status === 'pending',
                    'bg-red-100 text-red-800': transaction.status === 'failed'
                  }"
                >
                  {{ transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Export Options -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
      <div class="flex flex-wrap gap-4">
        <button 
          @click="exportReport('excel')"
          :disabled="loading"
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Export to Excel
        </button>
        <button 
          @click="exportReport('pdf')"
          :disabled="loading"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Export to PDF
        </button>
        <button 
          @click="window.print()"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Report
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import FinancialChart from '@/components/FinancialChart.vue'
import PieChart from '@/components/PieChart.vue'
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const selectedPeriod = ref('month')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const error = ref(null)

// Chart type controls
const chartType1 = ref('line')
const chartType2 = ref('bar')

// Reactive data for reports
const keyMetrics = ref({
  totalFundBalance: 0,
  totalContributions: 0,
  activeLoans: 0,
  interestEarned: 0
})

const memberActivity = ref({
  activeMembers: 0,
  newMembers: 0,
  loanApplications: 0,
  withdrawalRequests: 0
})

const financialSummary = ref({
  averageContribution: 0,
  averageLoanAmount: 0,
  loanRepaymentRate: 0,
  fundUtilization: 0
})

const recentTransactions = ref([])
const monthlyOverview = ref([])

// Computed properties for display
const totalFundBalance = computed(() => keyMetrics.value.totalFundBalance)
const totalContributions = computed(() => keyMetrics.value.totalContributions)
const activeLoans = computed(() => keyMetrics.value.activeLoans)
const interestEarned = computed(() => keyMetrics.value.interestEarned)

const activeMembers = computed(() => memberActivity.value.activeMembers)
const newMembers = computed(() => memberActivity.value.newMembers)
const loanApplications = computed(() => memberActivity.value.loanApplications)
const withdrawalRequests = computed(() => memberActivity.value.withdrawalRequests)

const averageContribution = computed(() => financialSummary.value.averageContribution)
const averageLoanAmount = computed(() => financialSummary.value.averageLoanAmount)
const loanRepaymentRate = computed(() => financialSummary.value.loanRepaymentRate)
const fundUtilization = computed(() => financialSummary.value.fundUtilization)

// Chart data computed properties
const fundGrowthData = computed(() => {
  if (!monthlyOverview.value || monthlyOverview.value.length === 0) {
    return {
      labels: [],
      contributions: [],
      loans: [],
      loansLabel: 'Loans'
    }
  }

  // Calculate cumulative fund balance over time
  let cumulativeBalance = 0
  const fundBalanceData = monthlyOverview.value.map(month => {
    cumulativeBalance += month.contributions - month.withdrawals
    return cumulativeBalance
  })

  return {
    labels: monthlyOverview.value.map(month => {
      const date = new Date(month.month + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }),
    contributions: fundBalanceData,
    loans: monthlyOverview.value.map(month => month.loans),
    loansLabel: 'Loans'
  }
})

const contributionWithdrawalData = computed(() => {
  if (!monthlyOverview.value || monthlyOverview.value.length === 0) {
    return {
      labels: [],
      contributions: [],
      loans: [],
      loansLabel: 'Withdrawals'
    }
  }

  return {
    labels: monthlyOverview.value.map(month => {
      const date = new Date(month.month + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }),
    contributions: monthlyOverview.value.map(month => month.contributions),
    loans: monthlyOverview.value.map(month => month.withdrawals),
    loansLabel: 'Withdrawals'
  }
})

// Pie chart data computed properties
const transactionDistributionData = computed(() => {
  if (!monthlyOverview.value || monthlyOverview.value.length === 0) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2
      }]
    }
  }

  // Calculate totals for the current period
  const totalContributions = monthlyOverview.value.reduce((sum, month) => sum + month.contributions, 0)
  const totalWithdrawals = monthlyOverview.value.reduce((sum, month) => sum + month.withdrawals, 0)
  const totalLoans = monthlyOverview.value.reduce((sum, month) => sum + month.loans, 0)

  return {
    labels: ['Contributions', 'Withdrawals', 'Loans'],
    datasets: [{
      data: [totalContributions, totalWithdrawals, totalLoans],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)'
      ],
      borderWidth: 2
    }]
  }
})

const fundAllocationData = computed(() => {
  const totalFundBalance = keyMetrics.value.totalFundBalance
  const activeLoans = keyMetrics.value.activeLoans
  const availableFunds = Math.max(0, totalFundBalance - activeLoans)

  return {
    labels: ['Available Funds', 'Active Loans'],
    datasets: [{
      data: [availableFunds, activeLoans],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)'
      ],
      borderWidth: 2
    }]
  }
})

// Fetch reports data from API
const fetchReportsData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = { period: selectedPeriod.value }
    if (selectedPeriod.value === 'custom' && startDate.value && endDate.value) {
      params.startDate = startDate.value
      params.endDate = endDate.value
    }

    const response = await api.get('/reports', { params })

    if (response.data.success) {
      const { data } = response.data
      
      // Update reactive data
      keyMetrics.value = data.keyMetrics
      memberActivity.value = data.memberActivity
      financialSummary.value = data.financialSummary
      recentTransactions.value = data.recentTransactions
      monthlyOverview.value = data.monthlyOverview
      
      console.log('Reports data loaded successfully:', data)
    } else {
      error.value = response.data.message || 'Failed to load reports data'
    }
  } catch (err) {
    console.error('Error fetching reports:', err)
    error.value = err.response?.data?.message || 'Failed to load reports data'
  } finally {
    loading.value = false
  }
}

// Export report
const exportReport = async (format) => {
  try {
    loading.value = true
    
    const exportData = {
      format,
      period: selectedPeriod.value
    }
    
    if (selectedPeriod.value === 'custom' && startDate.value && endDate.value) {
      exportData.startDate = startDate.value
      exportData.endDate = endDate.value
    }

    const response = await api.post('/reports/export', exportData)

    if (response.data.success) {
      // In a real implementation, you would handle the download
      console.log('Export successful:', response.data.message)
      alert(`${format.toUpperCase()} report generated successfully!`)
    } else {
      error.value = response.data.message || 'Failed to export report'
    }
  } catch (err) {
    console.error('Error exporting report:', err)
    error.value = err.response?.data?.message || 'Failed to export report'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const generateReport = () => {
  fetchReportsData()
}

// Load initial data
onMounted(() => {
  fetchReportsData()
})
</script>
