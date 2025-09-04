<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  BanknotesIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/vue/24/outline";

const API_BASE = "http://localhost:5000/api";

// State
const repayments = ref([]);
const loading = ref(false);
const error = ref(null);

// Search and Filter
const searchQuery = ref("");
const statusFilter = ref("all");
const sortBy = ref("newest");

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Fetch all repayments
const fetchRepayments = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${API_BASE}/repayments`);
    repayments.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load repayments.";
  } finally {
    loading.value = false;
  }
};

// Preview payment proof with better mobile support
const previewImage = async (url) => {
  console.log('Previewing image:', url);
  
  // Test if image is accessible first
  const isAccessible = await testImageUrl(url);
  
  if (!isAccessible) {
    Swal.fire({
      icon: 'error',
      title: 'Image Not Found',
      text: 'The payment proof image could not be loaded. Please check if the file exists.',
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  
  Swal.fire({
    imageUrl: url,
    imageAlt: "Payment Proof",
    showCloseButton: true,
    showConfirmButton: false,
    width: "auto",
    maxWidth: "90vw",
    maxHeight: "80vh",
    imageWidth: "auto",
    imageHeight: "auto",
    backdrop: true,
    allowOutsideClick: true,
    customClass: {
      popup: 'swal-image-popup',
      image: 'swal-image-content'
    }
  });
};

// Test image URL accessibility for preview
const testImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log('Image URL test:', url, 'Status:', response.status);
    return response.ok;
  } catch (error) {
    console.log('Image URL test failed:', url, error);
    return false;
  }
};

// Update repayment status
const updateStatus = async (repaymentID, newStatus) => {
  try {
    const { value: notes } = await Swal.fire({
      title: `Set status to ${newStatus}?`,
      input: "textarea",
      inputLabel: "Optional Notes",
      inputPlaceholder: "Add notes (optional)",
      showCancelButton: true,
    });

    if (notes === null) return;

    await axios.put(`${API_BASE}/repayments/${repaymentID}/status`, {
      status: newStatus,
      notes: notes || "",
    });

    Swal.fire({
      icon: "success",
      title: "Status Updated",
      text: `Repayment marked as ${newStatus}`,
      confirmButtonColor: "#22c55e",
    });

    fetchRepayments();
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: err.response?.data?.message || "Something went wrong",
      confirmButtonColor: "#ef4444",
    });
  }
};

// Computed: filtered and sorted repayments
const filteredRepayments = computed(() => {
  let filtered = repayments.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(repayment => 
      repayment.fullName?.toLowerCase().includes(query) ||
      repayment.repaymentID.toString().includes(query) ||
      repayment.loanID.toString().includes(query) ||
      repayment.referenceNo?.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value !== "all") {
    filtered = filtered.filter(repayment => repayment.status === statusFilter.value);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case "newest":
        return new Date(b.createdAt || b.repaymentID) - new Date(a.createdAt || a.repaymentID);
      case "oldest":
        return new Date(a.createdAt || a.repaymentID) - new Date(b.createdAt || b.repaymentID);
      case "amount_high":
        return parseFloat(b.amount) - parseFloat(a.amount);
      case "amount_low":
        return parseFloat(a.amount) - parseFloat(b.amount);
      case "name":
        return (a.fullName || "").localeCompare(b.fullName || "");
      default:
        return 0;
    }
  });

  return filtered;
});

// Computed: paginated items
const paginatedRepayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRepayments.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredRepayments.value.length / itemsPerPage));

// Format currency
const formatCurrency = (amount) => {
  return parseFloat(amount || 0).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  });
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Reset pagination when filters change
const resetPagination = () => {
  currentPage.value = 1;
};

// Load on mount
onMounted(() => {
  fetchRepayments();
});
</script>
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div class="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <BanknotesIcon class="h-8 w-8 text-white" />
            </div>
            Loan Repayments
          </h1>
          <p class="text-gray-600 text-lg">Manage and track loan repayment submissions</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-emerald-600">
            {{ filteredRepayments.length }}
          </div>
          <div class="text-sm text-gray-500">Total Repayments</div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-medium text-red-800">Error</h3>
        <p class="text-sm text-red-700 mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="searchQuery"
            @input="resetPagination"
            type="text"
            placeholder="Search repayments..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
          />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <FunnelIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            v-model="statusFilter"
            @change="resetPagination"
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Sort -->
        <div class="relative">
          <select
            v-model="sortBy"
            @change="resetPagination"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Amount: High to Low</option>
            <option value="amount_low">Amount: Low to High</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <!-- Refresh Button -->
        <button
          @click="fetchRepayments"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center py-20 gap-4">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <BanknotesIcon class="h-6 w-6 text-emerald-600" />
        </div>
      </div>
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Loading Repayments</h3>
        <p class="text-gray-500">Please wait while we fetch the latest data...</p>
      </div>
    </div>

    <div v-else>
      <!-- Empty State -->
      <div v-if="filteredRepayments.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div class="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          <BanknotesIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-700 mb-2">
          {{ repayments.length === 0 ? 'No Repayments Yet' : 'No Matching Repayments' }}
        </h3>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          {{ repayments.length === 0 
            ? 'No users have submitted loan repayments yet. Check back later for new submissions.' 
            : 'Try adjusting your search criteria or filters to find the repayments you\'re looking for.' 
          }}
        </p>
        <button
          v-if="repayments.length > 0"
          @click="searchQuery = ''; statusFilter = 'all'; sortBy = 'newest'"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
        >
          Clear Filters
        </button>
      </div>

      <!-- Repayments Grid -->
      <div v-else class="space-y-6">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Repayments</p>
                <p class="text-2xl font-bold text-gray-900">{{ filteredRepayments.length }}</p>
              </div>
              <div class="p-3 bg-blue-100 rounded-lg">
                <BanknotesIcon class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-bold text-yellow-600">{{ filteredRepayments.filter(r => r.status === 'pending').length }}</p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon class="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Confirmed</p>
                <p class="text-2xl font-bold text-green-600">{{ filteredRepayments.filter(r => r.status === 'confirmed').length }}</p>
              </div>
              <div class="p-3 bg-green-100 rounded-lg">
                <CheckIcon class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Amount</p>
                <p class="text-2xl font-bold text-emerald-600">
                  {{ formatCurrency(filteredRepayments.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)) }}
                </p>
              </div>
              <div class="p-3 bg-emerald-100 rounded-lg">
                <CurrencyDollarIcon class="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
      </div>

        <!-- Repayment Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <div
            v-for="repayment in paginatedRepayments"
            :key="repayment.repaymentID"
            class="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <!-- Card Header -->
            <div class="p-4 sm:p-6 border-b border-gray-100">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon class="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate">{{ repayment.fullName || 'Unknown User' }}</h3>
                    <p class="text-xs sm:text-sm text-gray-500">ID: {{ repayment.repaymentID }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border flex-shrink-0',
                    getStatusColor(repayment.status)
                  ]"
                >
                  {{ repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1) }}
                </span>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 flex items-center gap-2">
                    <DocumentTextIcon class="h-4 w-4" />
                    Loan ID
                  </span>
                  <span class="font-medium text-gray-900">{{ repayment.loanID }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 flex items-center gap-2">
                    <CurrencyDollarIcon class="h-4 w-4" />
                    Amount
                  </span>
                  <span class="font-bold text-emerald-600 text-lg">{{ formatCurrency(repayment.amount) }}</span>
                </div>

                <div v-if="repayment.referenceNo" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Reference No</span>
                  <span class="font-medium text-gray-900 text-sm">{{ repayment.referenceNo }}</span>
                </div>

                <div v-if="repayment.createdAt" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarIcon class="h-4 w-4" />
                    Submitted
                  </span>
                  <span class="text-sm text-gray-500">{{ formatDate(repayment.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Proof -->
            <div class="p-4 sm:p-6 border-b border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Payment Proof</h4>
              <div v-if="repayment.paymentProof" class="flex items-center justify-center">
                <button
                  @click="previewImage(`http://localhost:5000/uploads/${repayment.paymentProof}`)"
                  class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <EyeIcon class="h-4 w-4" />
                  <span class="text-sm font-medium">View Payment Proof</span>
                </button>
              </div>
              <div v-else class="flex items-center justify-center">
                <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">No proof uploaded</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="repayment.notes" class="p-6 border-b border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
              <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{{ repayment.notes }}</p>
            </div>

            <!-- Actions -->
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
                <button
                  @click="updateStatus(repayment.repaymentID, 'confirmed')"
                  class="flex items-center justify-center gap-1 px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-xs font-medium transition-colors duration-200 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <CheckIcon class="h-3 w-3 sm:h-3 sm:w-3" />
                  <span class="hidden sm:inline">Confirm</span>
                  <span class="sm:hidden">✓ Confirm</span>
                </button>
                <button
                  @click="updateStatus(repayment.repaymentID, 'rejected')"
                  class="flex items-center justify-center gap-1 px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-xs font-medium transition-colors duration-200 bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <XMarkIcon class="h-3 w-3 sm:h-3 sm:w-3" />
                  <span class="hidden sm:inline">Reject</span>
                  <span class="sm:hidden">✗ Reject</span>
                </button>
                <button
                  @click="updateStatus(repayment.repaymentID, 'pending')"
                  class="flex items-center justify-center gap-1 px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-xs font-medium transition-colors duration-200 bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                >
                  <ClockIcon class="h-3 w-3 sm:h-3 sm:w-3" />
                  <span class="hidden sm:inline">Pending</span>
                  <span class="sm:hidden">⏱ Pending</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
              class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
              Previous
          </button>

            <div class="flex items-center gap-1">
            <button
                v-for="page in totalPages"
                :key="page"
              @click="currentPage = page"
              :class="{
                  'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105': currentPage === page,
                  'bg-gray-100 text-gray-700 hover:bg-gray-200': currentPage !== page
              }"
                class="px-4 py-2 rounded-xl font-medium transition-all duration-200 min-w-[40px]"
            >
              {{ page }}
            </button>
            </div>

          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
              class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
              Next
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          </div>
          
          <div class="text-center mt-3 text-sm text-gray-500">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredRepayments.length) }} of {{ filteredRepayments.length }} repayments
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Custom styles for SweetAlert image popup */
:deep(.swal-image-popup) {
  max-width: 95vw !important;
  max-height: 90vh !important;
  padding: 0 !important;
}

:deep(.swal-image-content) {
  max-width: 100% !important;
  max-height: 80vh !important;
  object-fit: contain !important;
  border-radius: 8px !important;
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  :deep(.swal-image-popup) {
    margin: 10px !important;
    width: calc(100vw - 20px) !important;
  }
  
  :deep(.swal-image-content) {
    max-height: 70vh !important;
  }
}
</style>
