<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ArrowUpRightIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'

const API_BASE = "http://localhost:5000/api/withdrawals"

// ✅ Load logged-in user from localStorage
const user = JSON.parse(localStorage.getItem("user"))

// form state
const withdrawForm = ref({
  amount: '',
  date: '',
  reason: ''
})

const requests = ref([])
const note = ref('')
const isLoading = ref(false)
const error = ref(null)

// ✅ Fetch withdrawals for logged-in user
const fetchWithdrawals = async () => {
  try {
    const res = await axios.get(`${API_BASE}/user/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    requests.value = res.data || []
  } catch (err) {
    console.error("Error fetching withdrawals:", err)
    error.value = err.response?.data?.message || "Failed to load withdrawals"
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

// ✅ Submit withdrawal request
const submitWithdrawal = async () => {
  note.value = ''
  isLoading.value = true
  try {
    if (!withdrawForm.value.amount || !withdrawForm.value.date || !withdrawForm.value.reason) {
      note.value = "All fields required."
      return
    }

    const payload = {
      amount: withdrawForm.value.amount,
      reason: withdrawForm.value.reason,
      date: withdrawForm.value.date
    }

    const res = await axios.post(API_BASE, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })

    note.value = res.data.message || 'Withdrawal request submitted.'
    requests.value.unshift(res.data.withdrawal)
    setTimeout(() => {
      location.reload()
    }, 50)
    // reset form
    withdrawForm.value = { amount: '', date: '', reason: '' }
  } catch (err) {
    console.error("Error submitting withdrawal:", err)
    note.value = err.response?.data?.message || "Failed to submit withdrawal"
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchWithdrawals()
})
</script>

<template>
  <div class="min-h-screen p-6 font-sans">
    <div class="max-w-4xl mx-auto space-y-8">

      <h1 class="text-4xl font-extrabold text-sky-700 tracking-wide">Withdrawals</h1>

      <!-- Request Form -->
      <div
        class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <h2 class="text-2xl font-semibold flex items-center gap-3 mb-6">
          <ArrowUpRightIcon class="w-7 h-7 text-sky-600 animate-bounce" /> Request Withdrawal
        </h2>
        <form @submit.prevent="submitWithdrawal" class="grid grid-cols-1 md:grid-cols-4 gap-6">

          <!-- Name (auto-filled) -->
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-600 mb-2">Name</label>
            <input type="text" :value="`${user.firstName} ${user.lastName}`" disabled
              class="w-full px-5 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed shadow-inner" />
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Amount (₱)</label>
            <input v-model="withdrawForm.amount" type="number" min="1" step="0.01" required
              class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm hover:shadow-md transition duration-300" />
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Date</label>
            <input v-model="withdrawForm.date" type="date" required
              class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm hover:shadow-md transition duration-300" />
          </div>

          <!-- Reason -->
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-600 mb-2">Reason</label>
            <input v-model="withdrawForm.reason" type="text" placeholder="Reason for withdrawal" required
              class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm hover:shadow-md transition duration-300" />
          </div>

          <!-- Submit -->
          <div class="md:col-span-4">
            <button :disabled="isLoading"
              class="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Submit Request
            </button>
          </div>
        </form>
        <p v-if="note" class="mt-4 text-green-700 bg-green-50 p-3 rounded-xl text-sm">{{ note }}</p>
      </div>

      <!-- Withdrawals Table -->
      <div
        class="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <h2 class="text-2xl font-semibold flex items-center gap-3 mb-4">
          <ClipboardDocumentCheckIcon class="w-7 h-7 text-green-600 animate-pulse" /> Recent Requests
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-gray-700">
            <thead>
              <tr class="text-left text-gray-500 uppercase tracking-wide border-b">
                <th class="p-3">ID</th>
                <th class="p-3">Name</th>
                <th class="p-3">Date</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Reason</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in requests" :key="r.id"
                class="border-b hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <td class="p-3">{{ r.memberID }}</td>
                <td class="p-3 font-semibold">{{ r.name || `${user.firstName} ${user.lastName}` }}</td>
                <td class="p-3">{{ formatDate(r.date) }}</td>
                <td class="p-3 font-extrabold">₱{{ Number(r.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</td>
                <td class="p-3">{{ r.reason || '-' }}</td>
                <td class="p-3">
                  <span :class="`${r.status === 'approved' ? 'text-green-600 font-bold'
                      : r.status === 'pending' ? 'text-amber-600 font-bold'
                        : 'text-red-600 font-bold'}`">
                    {{ r.status || 'rejected' }}
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>