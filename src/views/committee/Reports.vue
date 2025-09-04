<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
      <h1 class="text-3xl font-bold">Committee Reports</h1>
      <p class="text-white/80 mt-2">Generate comprehensive committee reports and analytics</p>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            v-model="selectedPeriod"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
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
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          />
          <span class="text-gray-500">to</span>
          <input
            v-model="endDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          />
        </div>
        <button
          @click="generateReport"
          class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Generate Report
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <UsersIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Members</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalMembers }}</p>
            <p class="text-sm text-purple-600">+5 new this month</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Approved Loans</p>
            <p class="text-2xl font-bold text-gray-900">{{ approvedLoans }}</p>
            <p class="text-sm text-green-600">+12 this month</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending Reviews</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingReviews }}</p>
            <p class="text-sm text-yellow-600">8 loan applications</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ChartBarIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Approval Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ approvalRate }}%</p>
            <p class="text-sm text-blue-600">+3% from last month</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Loan Approval Trend -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Loan Approval Trend</h3>
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <ChartBarIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">Loan Approval Trend Chart</p>
            <p class="text-sm text-gray-400">Monthly approval rates</p>
          </div>
        </div>
      </div>

      <!-- Member Growth Chart -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <ChartPieIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">Member Growth Chart</p>
            <p class="text-sm text-gray-400">Monthly member additions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Loan Applications Summary -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Loan Applications Summary</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Total Applications</p>
              <p class="text-xs text-gray-500">This reporting period</p>
            </div>
            <span class="text-lg font-bold text-purple-600">{{ totalApplications }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Approved</p>
              <p class="text-xs text-gray-500">Applications approved</p>
            </div>
            <span class="text-lg font-bold text-green-600">{{ approvedApplications }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Rejected</p>
              <p class="text-xs text-gray-500">Applications rejected</p>
            </div>
            <span class="text-lg font-bold text-red-600">{{ rejectedApplications }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Under Review</p>
              <p class="text-xs text-gray-500">Currently being reviewed</p>
            </div>
            <span class="text-lg font-bold text-yellow-600">{{ underReviewApplications }}</span>
          </div>
        </div>
      </div>

      <!-- Committee Performance -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Committee Performance</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Average Review Time</p>
              <p class="text-xs text-gray-500">Days to process application</p>
            </div>
            <span class="text-lg font-bold text-blue-600">{{ averageReviewTime }} days</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Committee Meetings</p>
              <p class="text-xs text-gray-500">This reporting period</p>
            </div>
            <span class="text-lg font-bold text-green-600">{{ committeeMeetings }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Member Attendance</p>
              <p class="text-xs text-gray-500">Average attendance rate</p>
            </div>
            <span class="text-lg font-bold text-purple-600">{{ memberAttendance }}%</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Decision Consistency</p>
              <p class="text-xs text-gray-500">Unanimous decisions</p>
            </div>
            <span class="text-lg font-bold text-yellow-600">{{ decisionConsistency }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Loan Applications -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Loan Applications</h3>
        <button class="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors">
          View All Applications
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="application in recentApplications" :key="application.id" class="hover:bg-purple-50 transition-colors duration-200">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(application.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ application.memberName }}</div>
                <div class="text-sm text-gray-500">{{ application.memberId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ application.loanType }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₱{{ application.amount.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': application.status === 'pending',
                    'bg-green-100 text-green-800': application.status === 'approved',
                    'bg-red-100 text-red-800': application.status === 'rejected',
                    'bg-blue-100 text-blue-800': application.status === 'under_review'
                  }"
                >
                  {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <button 
                    v-if="application.status === 'pending'"
                    @click="reviewApplication(application.id)"
                    class="text-purple-600 hover:text-purple-900 text-sm font-medium transition-colors"
                  >
                    Review
                  </button>
                  <button 
                    @click="viewApplication(application.id)"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
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

    <!-- Export Options -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
      <div class="flex flex-wrap gap-4">
        <button 
          @click="exportToExcel"
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Export to Excel
        </button>
        <button 
          @click="exportToPDF"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          Export to PDF
        </button>
        <button 
          @click="printReport"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center"
        >
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Report
        </button>
      </div>
    </div>

    <!-- Success Alert -->
    <div v-if="showSuccessAlert" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 mr-2" />
        {{ successMessage }}
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="showErrorAlert" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn">
      <div class="flex items-center">
        <XCircleIcon class="h-5 w-5 mr-2" />
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

const selectedPeriod = ref('month')
const startDate = ref('')
const endDate = ref('')
const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Static data for reports
const totalMembers = ref(156)
const approvedLoans = ref(45)
const pendingReviews = ref(8)
const approvalRate = ref(87)

const totalApplications = ref(52)
const approvedApplications = ref(45)
const rejectedApplications = ref(4)
const underReviewApplications = ref(3)

const averageReviewTime = ref(3.2)
const committeeMeetings = ref(12)
const memberAttendance = ref(92)
const decisionConsistency = ref(78)

const recentApplications = ref([
  {
    id: 1,
    date: '2024-01-20T14:30:00',
    memberName: 'Maria Santos Cruz',
    memberId: 'MEM001',
    loanType: 'Personal',
    amount: 50000,
    status: 'pending'
  },
  {
    id: 2,
    date: '2024-01-20T11:15:00',
    memberName: 'Carlos Rodriguez',
    memberId: 'MEM002',
    loanType: 'Business',
    amount: 100000,
    status: 'approved'
  },
  {
    id: 3,
    date: '2024-01-19T16:45:00',
    memberName: 'Isabella Garcia',
    memberId: 'MEM003',
    loanType: 'Emergency',
    amount: 25000,
    status: 'under_review'
  },
  {
    id: 4,
    date: '2024-01-19T13:20:00',
    memberName: 'Antonio Martinez',
    memberId: 'MEM004',
    loanType: 'Education',
    amount: 75000,
    status: 'rejected'
  },
  {
    id: 5,
    date: '2024-01-19T10:30:00',
    memberName: 'Elena Fernandez',
    memberId: 'MEM005',
    loanType: 'Personal',
    amount: 30000,
    status: 'approved'
  }
])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showAlert = (type, message) => {
  if (type === 'success') {
    successMessage.value = message
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 3000)
  } else {
    errorMessage.value = message
    showErrorAlert.value = true
    setTimeout(() => {
      showErrorAlert.value = false
    }, 3000)
  }
}

const generateReport = () => {
  // This would typically call an API to generate reports based on the selected period
  console.log('Generating committee report for period:', selectedPeriod.value)
  if (selectedPeriod.value === 'custom') {
    console.log('Custom date range:', startDate.value, 'to', endDate.value)
  }
  showAlert('success', 'Committee report generated successfully!')
}

const reviewApplication = (id) => {
  showAlert('success', `Redirecting to review application ${id}`)
}

const viewApplication = (id) => {
  showAlert('success', `Viewing application ${id}`)
}

const exportToExcel = () => {
  showAlert('success', 'Committee report exported to Excel successfully!')
}

const exportToPDF = () => {
  showAlert('success', 'Committee report exported to PDF successfully!')
}

const printReport = () => {
  showAlert('success', 'Committee report sent to printer!')
}
</script>

<style scoped>
.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
