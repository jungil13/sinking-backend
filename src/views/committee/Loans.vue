<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Loan Management</h1>
      <p class="text-gray-600">Review and manage member loan applications and payments</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="!loading && stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pendingLoans || 0 }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ stats.activeLoans || 0 }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CurrencyDollarIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Amount</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalLoanAmount || 0) }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Overdue</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.overdueLoans || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div v-if="!loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by member name or loan ID..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            @input="debounceSearch"
          />
        </div>
        </div>
        <div class="lg:w-48">
          <select
            v-model="statusFilter"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            @change="fetchLoans"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="lg:w-48">
          <select
            v-model="sortBy"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            @change="fetchLoans"
          >
            <option value="createdAt">Date Created</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
            <option value="memberName">Member Name</option>
          </select>
        </div>
        <div class="lg:w-32">
          <button
            @click="fetchLoans"
            class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center"
          >
            <ArrowPathIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loans Table -->
    <div v-if="!loading" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan Details</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="loan in loans" :key="loan.loanID" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <span class="text-white font-semibold text-sm">
                      {{ loan.memberName ? loan.memberName.split(' ').map(n => n[0]).join('') : 'N/A' }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-gray-900">{{ loan.memberName || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">ID: {{ loan.memberID }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ loan.reason || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(loan.createdAt) }}</div>
                <div class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                  {{ loan.termMonths }} months
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(loan.amount) }}</div>
                <div class="text-sm text-gray-500">Remaining: {{ formatCurrency(loan.remainingBalance) }}</div>
                <div class="text-xs text-gray-400">Paid: {{ formatCurrency(loan.totalPaid) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800 border border-yellow-200': loan.status === 'pending',
                    'bg-green-100 text-green-800 border border-green-200': loan.status === 'approved' || loan.status === 'active',
                    'bg-blue-100 text-blue-800 border border-blue-200': loan.status === 'completed',
                    'bg-red-100 text-red-800 border border-red-200': loan.status === 'rejected'
                  }"
                >
                  {{ loan.status.charAt(0).toUpperCase() + loan.status.slice(1) }}
                </span>
                <div v-if="loan.daysOverdue > 0" class="text-xs text-red-600 mt-1 font-medium">
                  {{ loan.daysOverdue }} days overdue
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <button
                    v-if="loan.status === 'pending'"
                    @click="updateLoanStatus(loan.loanID, 'approved')"
                    :disabled="updatingStatus === loan.loanID"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <CheckIcon class="h-3 w-3 mr-1" />
                    {{ updatingStatus === loan.loanID ? 'Updating...' : 'Approve' }}
                  </button>
                  <button
                    v-if="loan.status === 'pending'"
                    @click="updateLoanStatus(loan.loanID, 'rejected')"
                    :disabled="updatingStatus === loan.loanID"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <XMarkIcon class="h-3 w-3 mr-1" />
                    {{ updatingStatus === loan.loanID ? 'Updating...' : 'Reject' }}
                  </button>
                  <button
                    @click="viewLoanDetails(loan)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <EyeIcon class="h-3 w-3 mr-1" />
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> to 
              <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> of 
              <span class="font-medium">{{ pagination.total }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="changePage(page)"
                :class="{
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium': true,
                  'z-10 bg-blue-50 border-blue-500 text-blue-600': page === pagination.page,
                  'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': page !== pagination.page
                }"
              >
                {{ page }}
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && loans.length === 0" class="text-center py-12">
      <div class="mx-auto h-12 w-12 text-gray-400">
        <ClipboardDocumentListIcon class="h-12 w-12" />
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new loan application.</p>
    </div>

    <!-- Loan Details Modal -->
    <div v-if="selectedLoan" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-lg bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900">Loan Details</h3>
            <button @click="selectedLoan = null" class="text-gray-400 hover:text-gray-600 transition-colors duration-150">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardDocumentListIcon class="h-5 w-5 mr-2 text-blue-600" />
                Loan Information
              </h4>
              <div class="space-y-3">
            <div>
                  <label class="text-sm font-medium text-gray-600">Loan ID</label>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedLoan.loanID }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Purpose</label>
                  <p class="text-sm text-gray-900">{{ selectedLoan.reason || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Application Date</label>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedLoan.createdAt) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Status</label>
                  <span
                    :class="{
                      'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800 border border-yellow-200': selectedLoan.status === 'pending',
                      'bg-green-100 text-green-800 border border-green-200': selectedLoan.status === 'approved' || selectedLoan.status === 'active',
                      'bg-blue-100 text-blue-800 border border-blue-200': selectedLoan.status === 'completed',
                      'bg-red-100 text-red-800 border border-red-200': selectedLoan.status === 'rejected'
                    }"
                  >
                    {{ selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon class="h-5 w-5 mr-2 text-green-600" />
                Financial Details
              </h4>
              <div class="space-y-3">
            <div>
                  <label class="text-sm font-medium text-gray-600">Loan Amount</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(selectedLoan.amount) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Term</label>
                  <p class="text-sm text-gray-900">{{ selectedLoan.termMonths }} months</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Interest Rate</label>
                  <p class="text-sm text-gray-900">{{ selectedLoan.interestRate }}%</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Total Paid</label>
                  <p class="text-sm font-semibold text-green-600">{{ formatCurrency(selectedLoan.totalPaid) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Remaining Balance</label>
                  <p class="text-sm font-semibold text-red-600">{{ formatCurrency(selectedLoan.remainingBalance) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedLoan.paymentHistory && selectedLoan.paymentHistory.length > 0" class="mt-8 pt-6 border-t border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon class="h-5 w-5 mr-2 text-purple-600" />
              Payment History
            </h4>
            <div class="space-y-3">
              <div v-for="payment in selectedLoan.paymentHistory" :key="payment.repaymentID" class="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ formatDate(payment.paymentDate) }}</p>
                  <p class="text-xs text-gray-500 capitalize">{{ payment.paymentMethod }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(payment.amount) }}</p>
                  <span
                    :class="{
                      'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-green-100 text-green-800 border border-green-200': payment.status === 'confirmed',
                      'bg-yellow-100 text-yellow-800 border border-yellow-200': payment.status === 'pending',
                      'bg-red-100 text-red-800 border border-red-200': payment.status === 'rejected'
                    }"
                  >
                    {{ payment.status.charAt(0).toUpperCase() + payment.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedLoan.status === 'pending'" class="mt-8 pt-6 border-t border-gray-200">
            <div class="flex space-x-4">
              <button
                @click="updateLoanStatus(selectedLoan.loanID, 'approved')"
                :disabled="updatingStatus === selectedLoan.loanID"
                class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150 flex items-center justify-center"
              >
                <CheckIcon class="h-5 w-5 mr-2" />
                {{ updatingStatus === selectedLoan.loanID ? 'Updating...' : 'Approve Loan' }}
              </button>
              <button
                @click="updateLoanStatus(selectedLoan.loanID, 'rejected')"
                :disabled="updatingStatus === selectedLoan.loanID"
                class="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 flex items-center justify-center"
              >
                <XMarkIcon class="h-5 w-5 mr-2" />
                {{ updatingStatus === selectedLoan.loanID ? 'Updating...' : 'Reject Loan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Repayment />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  EyeIcon
} from "@heroicons/vue/24/outline";
import Repayment from "./Repayment.vue";

let searchTimeout;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchLoans();
  }, 500);
};

// ✅ pagination helpers
const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  fetchLoans();
};

const getPageNumbers = () => {
  const pages = [];
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  const maxVisible = 5;

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};

const API_BASE = "http://localhost:5000/api/admin/loans";

const loans = ref([]);
const stats = ref({});
const loading = ref(false);
const error = ref(null);

const searchQuery = ref("");
const statusFilter = ref("");
const sortBy = ref("createdAt");
const sortDir = ref("DESC");

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});

// ✅ Currency formatter
const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(value);
};

// ✅ Date formatter
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const selectedLoan = ref(null);
const updatingStatus = ref(null);

const fetchLoans = async () => {
  try {
    loading.value = true;
    error.value = null;

    const res = await axios.get(API_BASE, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: statusFilter.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value
      }
    });

    // Fix: access nested data and pagination from the backend response
    loans.value = res.data.loans || [];
    pagination.value.total = res.data.total || 0;
    pagination.value.totalPages = res.data.totalPages || 1;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to fetch loans";
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats`);
    // Fix: access nested stats from the backend response
    stats.value = res.data.stats || {};
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  }
};

// ✅ Unified status updater
const updateLoanStatus = async (loanID, status) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: `This will set the loan to "${status}"`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: status === "rejected" ? "#ef4444" : "#22c55e",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, confirm"
  });

  if (!confirm.isConfirmed) return;

  try {
    updatingStatus.value = loanID;
    await axios.put(`${API_BASE}/${loanID}/status`, { status });

    Swal.fire({
      icon: "success",
      title: "Success",
      text: `Loan marked as ${status}`,
      confirmButtonColor: "#22c55e"
    });

    await fetchLoans();
    await fetchStats();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: err.response?.data?.message || "Something went wrong",
      confirmButtonColor: "#ef4444"
    });
  } finally {
    updatingStatus.value = null;
  }
};

const viewLoanDetails = async (loan) => {
  try {
    const res = await axios.get(`${API_BASE}/${loan.loanID}`);
    // Fix: access nested data from the backend response
    selectedLoan.value = res.data.data;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "Failed to fetch loan details"
    });
  }
};

onMounted(async () => {
  await fetchLoans();
  await fetchStats();
});
</script>