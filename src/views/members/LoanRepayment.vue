<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import {
  CreditCardIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowPathIcon
} from "@heroicons/vue/24/outline";
import qrImg from "@/assets/image.png"; // ✅ Import the image

const API_BASE = "http://localhost:5000/api";

// ✅ Get user info from localStorage
const user = JSON.parse(localStorage.getItem("user")) || null;
const userID = user?.id; // 🔹 This will be used in requests
const qrCode = qrImg; // use this as the src

// State
const loans = ref([]);
const repayments = ref([]);
const loading = ref(false);
const error = ref(null);

// Forms
const requestForm = ref({
  amount: "",
  termMonths: "",
  reason: ""
});

const repayForm = ref({
  loanId: "",
  amount: "",
  referenceNo: "",
  notes: "",
  paymentProof: null
});

const onFileChange = (e) => {
  repayForm.value.paymentProof = e.target.files[0];
};

const previewImage = (url) => {
  Swal.fire({
    imageUrl: url,
    imageAlt: "Payment Proof",
    showCloseButton: true,
    showConfirmButton: false,
    width: "auto"
  });
};
// ✅ Fetch Loans & Repayments
const fetchLoans = async () => {
  if (!userID) return;
  try {
    loading.value = true;
    const res = await axios.get(`${API_BASE}/loans/user/${userID}`);
    loans.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load loans.";
  } finally {
    loading.value = false;
  }
};

const fetchRepayments = async () => {
  if (!userID) return;
  try {
    const res = await axios.get(`${API_BASE}/repayments/user/${userID}`);
    repayments.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load repayments.";
  }
};

// ✅ Request Loan
const handleRequestLoan = async () => {
  try {
    loading.value = true;
    error.value = null;

    const payload = {
      userID,
      memberID: userID, // if memberID = same as userID
      amount: requestForm.value.amount,
      reason: requestForm.value.reason,
      termMonths: requestForm.value.termMonths,
      interestRate: 0.05 // example: 5% interest
    };

    const res = await axios.post(`${API_BASE}/loans/request`, payload);

    Swal.fire({
      icon: "success",
      title: "Loan Requested",
      text: `Your loan (#${res.data.loanID}) has been submitted!`,
      confirmButtonColor: "#0ea5e9"
    });

    requestForm.value = { amount: "", termMonths: "", reason: "" };
    await fetchLoans();
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Request Failed",
      text: err.response?.data?.message || "Something went wrong",
      confirmButtonColor: "#ef4444"
    });
  } finally {
    loading.value = false;
  }
};

const handleRepayLoan = async () => {
  try {
    loading.value = true;

    const formData = new FormData();
    formData.append("loanID", repayForm.value.loanId);
    formData.append("userID", userID);
    formData.append("amount", repayForm.value.amount);
    formData.append("referenceNo", repayForm.value.referenceNo);
    formData.append("notes", repayForm.value.notes || "");
    formData.append("paymentMethod", "gcash"); // ✅ send payment method
    if (repayForm.value.paymentProof) {
      formData.append("paymentProof", repayForm.value.paymentProof);
    }
    const res = await axios.post(`${API_BASE}/repayments/repay`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    Swal.fire({
      icon: "success",
      title: "Repayment Submitted",
      text: "Waiting for admin confirmation.",
      confirmButtonColor: "#22c55e"
    });

    repayForm.value = { loanId: "", amount: "", referenceNo: "", notes: "", paymentProof: null };
    await fetchLoans();
    await fetchRepayments();
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Repayment Failed",
      text: err.response?.data?.message || "Something went wrong",
      confirmButtonColor: "#ef4444"
    });
  } finally {
    loading.value = false;
  }
};

// ✅ Status Colors
const getStatusColor = (status) => {
  switch (status) {
    case "approved":
    case "active":
      return "text-green-600 font-semibold";
    case "pending":
      return "text-yellow-600 font-semibold";
    case "confirmed":
      return "text-green-700 font-semibold";
    default:
      return "text-red-700";
  }
};

// Load on page start
onMounted(() => {
  fetchLoans();
  fetchRepayments();
});
</script>

<template>
  <div class="min-h-screen relative p-6">
    <div class="relative z-10 max-w-5xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-sky-700">Loan & Repayment</h1>

      <!-- Error/Success Messages -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center">
          <div class="w-5 h-5 text-red-400 mr-2">⚠️</div>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-center">
          <div class="w-5 h-5 text-green-400 mr-2">✅</div>
          <p class="text-green-800">{{ success }}</p>
        </div>
      </div>

      <!-- Request Loan -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
          <CreditCardIcon class="w-6 h-6 text-sky-600" /> Request a Loan
        </h2>
        <form @submit.prevent="handleRequestLoan" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-2">Amount (₱)</label>
            <input v-model="requestForm.amount" type="number" min="0" step="0.01"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">Term (months)</label>
            <input v-model="requestForm.termMonths" type="number" min="1" max="60"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required />
          </div>
          <div class="md:col-span-3">
            <label class="block text-sm text-gray-700 mb-2">Purpose</label>
            <input v-model="requestForm.reason" type="text" placeholder="e.g., school fees, medical, business capital"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required />
          </div>
          <div class="md:col-span-3 flex gap-3">
            <button :disabled="loading"
              class="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold">
              {{ loading ? 'Submitting...' : 'Submit Request' }}
            </button>
            <p class="text-sm text-gray-500 flex items-center gap-2">
              <ClipboardDocumentListIcon class="w-5 h-5" /> Requests are reviewed within 1–3 business days.
            </p>
          </div>
        </form>
      </div>
      <!-- Repay Loan -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
          <BanknotesIcon class="w-6 h-6 text-green-600" /> Repay a Loan
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <!-- Repayment Form (Left) -->
          <form @submit.prevent="handleRepayLoan" class="grid grid-cols-1 md:grid-cols-2 gap-4"
            enctype="multipart/form-data">
            <!-- Loan select -->
            <div class="md:col-span-2">
              <label class="block text-sm text-gray-700 mb-2">Loan ID</label>
              <select v-model="repayForm.loanId" class="w-full px-4 py-3 border rounded-lg" required>
                <option value="" disabled>Select a loan</option>
                <option v-for="loan in loans.filter(l => ['approved', 'active'].includes(l.status))" :key="loan.loanID"
                  :value="loan.loanID">
                  {{ loan.loanID }} — Bal: ₱{{ parseFloat(loan.remainingBalance).toLocaleString() }}
                </option>
              </select>
            </div>

            <!-- Amount -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">Amount (₱)</label>
              <input v-model="repayForm.amount" type="number" min="1" step="0.01"
                class="w-full px-4 py-3 border rounded-lg" required />
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">Payment Method</label>
              <select v-model="repayForm.paymentMethod" class="w-full px-4 py-3 border rounded-lg" required>
                <option value="gcash">GCash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <!-- Reference No -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">Reference No</label>
              <input v-model="repayForm.referenceNo" type="text" placeholder="GCash Ref No."
                class="w-full px-4 py-3 border rounded-lg" required />
            </div>

            <!-- Upload Proof -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">Upload Proof</label>
              <input type="file" @change="onFileChange" accept="image/*" class="w-full text-sm" required />
            </div>

            <!-- Submit -->
            <div class="md:col-span-2 flex items-end">
              <button :disabled="loading || !repayForm.loanId"
                class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
                {{ loading ? 'Processing...' : 'Pay Now' }}
              </button>
            </div>
          </form>

          <!-- QR Code (Right) -->
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-2">Scan to pay via GCash</p>
            <img :src="qrCode" alt="QR Code"
              class="w-56 h-56 mx-auto cursor-pointer rounded-lg shadow-md hover:scale-105 transition"
              @click="previewImage(qrCode)" />
            <p class="text-xs text-gray-500 mt-2">Click QR code to enlarge</p>
          </div>

        </div>
      </div>


      <!-- Loans Table -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Loans</h2>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <span class="ml-2 text-gray-600">Loading loans...</span>
        </div>

        <!-- Loans Table -->
        <div v-else-if="loans.length > 0" class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="text-left text-gray-600">
                <th class="p-3">Loan ID</th>
                <th class="p-3">Date</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Balance</th>
                <th class="p-3">Status</th>
                <th class="p-3">Term</th>
                <th class="p-3">Monthly Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loans" :key="loan.loanID" class="border-t">
                <td class="p-3">{{ loan.loanID }}</td>
                <td class="p-3">{{ new Date(loan.createdAt).toLocaleDateString() }}</td>
                <td class="p-3">₱{{ parseFloat(loan.amount).toLocaleString() }}</td>
                <td class="p-3">₱{{ parseFloat(loan.remainingBalance).toLocaleString() }}</td>
                <td class="p-3">
                  <span :class="getStatusColor(loan.status)">{{ loan.status.charAt(0).toUpperCase() +
                    loan.status.slice(1) }}</span>
                </td>
                <td class="p-3">{{ loan.termMonths }} months</td>
                <td class="p-3">₱{{ parseFloat(loan.monthlyPayment || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <CreditCardIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500 text-lg mb-2">No loans found</p>
          <p class="text-gray-400">You haven't applied for any loans yet.</p>
        </div>
      </div>

      <!-- Repayments Table -->
      <div v-if="repayments.length > 0" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Repayment History</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="text-left text-gray-600">
                <th class="p-3">Date</th>
                <th class="p-3">Loan ID</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Reference No</th>
                <th class="p-3">Payment Proof</th>
                <th class="p-3">Status</th>
                <th class="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="repayment in repayments" :key="repayment.repaymentID" class="border-t">
                <td class="p-3">{{ new Date(repayment.paymentDate).toLocaleDateString() }}</td>
                <td class="p-3">{{ repayment.loanID }}</td>
                <td class="p-3">₱{{ parseFloat(repayment.amount).toLocaleString() }}</td>
                <td class="p-3">{{ repayment.referenceNo || '-' }}</td>

                <!-- ✅ Payment Proof -->
                <td class="p-3">
                  <div v-if="repayment.paymentProof">
                    <img :src="`http://localhost:5000/uploads/${repayment.paymentProof}`" alt="Payment Proof"
                      class="w-16 h-16 object-cover rounded cursor-pointer hover:scale-105 transition"
                      @click="previewImage(`http://localhost:5000/uploads/${repayment.paymentProof}`)" />
                  </div>
                  <span v-else class="text-gray-400 italic">No proof</span>
                </td>

                <!-- ✅ Status -->
                <td class="p-3">
                  <span :class="getStatusColor(repayment.status)">
                    {{ repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1) }}
                  </span>
                </td>

                <td class="p-3">{{ repayment.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {

  0%,
  100% {
    transform: translate(0, 0) scale(1)
  }

  33% {
    transform: translate(30px, -50px) scale(1.1)
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9)
  }
}
</style>
