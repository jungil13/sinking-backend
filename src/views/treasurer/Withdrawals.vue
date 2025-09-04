<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import {
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

// API
const API_BASE = "http://localhost:5000/api/withdrawals";

// State
const withdrawals = ref([]);
const selectedWithdrawal = ref(null);
const searchQuery = ref("");
const statusFilter = ref("");
const typeFilter = ref("");
const isLoading = ref(false);

// Fetch withdrawals
const fetchWithdrawals = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    // Assuming API data structure matches property names in computed properties and template
    withdrawals.value = res.data;
  } catch (err) {
    console.error("Error fetching withdrawals:", err);
  } finally {
    isLoading.value = false;
  }
};

// Filters
const filteredWithdrawals = computed(() => {
  return withdrawals.value.filter((w) => {
    const q = searchQuery.value.toLowerCase();
    return (
      (!q || w.memberName?.toLowerCase().includes(q) || w.withdrawalID?.toLowerCase().includes(q)) &&
      (!statusFilter.value || w.status === statusFilter.value) &&
      (!typeFilter.value || w.paymentMethod?.toLowerCase().includes(typeFilter.value))
    );
  });
});

// Stats
const pendingWithdrawals = computed(() =>
  withdrawals.value.filter((w) => w.status === "pending")
);
const approvedWithdrawals = computed(() =>
  withdrawals.value.filter((w) => w.status === "approved" || w.status === "processed")
);
const rejectedWithdrawals = computed(() =>
  withdrawals.value.filter((w) => w.status === "rejected")
);
const totalWithdrawalAmount = computed(() =>
  withdrawals.value.reduce((sum, w) => sum + Number(w.amount), 0)
);

// Actions
const approveWithdrawal = async (withdrawalId) => {
  try {
    await axios.put(
      `${API_BASE}/${withdrawalId}/status`,
      { status: "approved" },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    await fetchWithdrawals(); // Re-fetch data to reflect changes
    selectedWithdrawal.value = null; // Close the modal
  } catch (err) {
    console.error(err);
  }
};

const rejectWithdrawal = async (withdrawalId) => {
  try {
    await axios.put(
      `${API_BASE}/${withdrawalId}/status`,
      { status: "rejected" },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    await fetchWithdrawals(); // Re-fetch data to reflect changes
    selectedWithdrawal.value = null; // Close the modal
  } catch (err) {
    console.error(err);
  }
};

// View details
const viewWithdrawalDetails = (withdrawal) => (selectedWithdrawal.value = withdrawal);

// Format date
const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

onMounted(fetchWithdrawals);
</script>

<template>
  <div class="min-h-screen p-6 font-sans">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
        Withdrawal Management
      </h1>
      <p class="text-gray-600 text-sm">Review and approve member withdrawal requests with ease.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div
        class="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-md p-6 hover:scale-105 transform transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <ClockIcon class="h-7 w-7 text-yellow-700" />
          <div>
            <p class="text-sm font-medium text-yellow-800">Pending</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingWithdrawals.length }}</p>
          </div>
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md p-6 hover:scale-105 transform transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <CheckCircleIcon class="h-7 w-7 text-green-700" />
          <div>
            <p class="text-sm font-medium text-green-800">Approved / Processed</p>
            <p class="text-2xl font-bold text-gray-900">{{ approvedWithdrawals.length }}</p>
          </div>
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md p-6 hover:scale-105 transform transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <CurrencyDollarIcon class="h-7 w-7 text-blue-700" />
          <div>
            <p class="text-sm font-medium text-blue-800">Total Amount</p>
            <p class="text-2xl font-bold text-gray-900">
              ₱{{ totalWithdrawalAmount.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-md p-6 hover:scale-105 transform transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <XCircleIcon class="h-7 w-7 text-red-700" />
          <div>
            <p class="text-sm font-medium text-red-800">Rejected</p>
            <p class="text-2xl font-bold text-gray-900">{{ rejectedWithdrawals.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        v-model="searchQuery"
        placeholder="Search by member or ID..."
        class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        v-model="statusFilter"
        class="sm:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="processed">Processed</option>
      </select>
      <select
        v-model="typeFilter"
        class="sm:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Types</option>
        <option value="bank">Bank Transfer</option>
        <option value="cash">Cash</option>
        <option value="check">Check</option>
      </select>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <span class="ml-4 text-gray-700">Loading withdrawals...</span>
    </div>

    <div v-else class="overflow-x-auto bg-white rounded-xl shadow-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="filteredWithdrawals.length === 0" class="text-center">
            <td colspan="5" class="py-6 text-gray-500">
              No withdrawals found.
            </td>
          </tr>
          <tr
            v-for="w in filteredWithdrawals"
            :key="w.withdrawalID"
            class="hover:bg-gray-50 transition-colors duration-200"
          >
            <td class="px-6 py-4 flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold"
              >
                <span class="text-white font-semibold text-sm">
                  {{ w.memberName?.split(" ").map((n) => n[0]).join("") || "NA" }}
                </span>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ w.name }}</div>
                <div class="text-xs text-gray-500">ID: {{ w.withdrawalID }}</div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
              {{ w.withdrawalType }} <br />
              {{ formatDate(w.date) }} <br />
              <span class="text-xs text-gray-400">{{ w.reason }}</span>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">
              ₱{{ Number(w.amount).toLocaleString() }} <br />
              <span class="text-xs text-gray-500">{{ w.paymentMethod }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-yellow-100 text-yellow-800': w.status === 'pending',
                  'bg-green-100 text-green-800':
                    w.status === 'approved' || w.status === 'processed',
                  'bg-red-100 text-red-800': w.status === 'rejected',
                }"
                >{{ w.status.charAt(0).toUpperCase() + w.status.slice(1) }}</span
              >
            </td>
            <td class="px-6 py-4 flex gap-2">
              <button
                v-if="w.status === 'pending'"
                @click="approveWithdrawal(w.withdrawalID)"
                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                v-if="w.status === 'pending'"
                @click="rejectWithdrawal(w.withdrawalID)"
                class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                @click="viewWithdrawalDetails(w)"
                class="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="selectedWithdrawal"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto pt-20 px-4"
    >
      <div
        class="bg-white rounded-xl shadow-lg w-full md:w-3/4 lg:w-1/2 p-6 transform transition-all duration-300"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Withdrawal Details</h3>
          <XMarkIcon
            class="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700"
            @click="selectedWithdrawal = null"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Withdrawal Info</h4>
            <p><strong>ID:</strong> {{ selectedWithdrawal.withdrawalID }}</p>
            <p><strong>Name:</strong> {{ selectedWithdrawal.name }}</p>
            <p><strong>Reason:</strong> {{ selectedWithdrawal.reason }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedWithdrawal.date) }}</p>
            <p><strong>Status:</strong> {{ selectedWithdrawal.status }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Payment Info</h4>
            <p>
              <strong>Amount:</strong> ₱{{ Number(selectedWithdrawal.amount).toLocaleString() }}
            </p>
          </div>
        </div>
        <div v-if="selectedWithdrawal.status === 'pending'" class="mt-6 flex gap-3">
          <button
            @click="approveWithdrawal(selectedWithdrawal.withdrawalID)"
            class="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            @click="rejectWithdrawal(selectedWithdrawal.withdrawalID)"
            class="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>