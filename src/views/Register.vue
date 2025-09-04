<script setup>
import { ref } from 'vue'
import axios from "axios"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  monthlyIncome: '',
  address: '',
  employment: '',
  emergencyContact: '',
  emergencyPhone: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegistration = async () => {
  error.value = ''
  success.value = ''

  // ✅ check confirm password
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords don't match."
    return
  }

  isLoading.value = true
  try {
    // ✅ send actual data (use .value)
    await axios.post("http://localhost:5000/api/auth/register", form.value)

    // fake delay to show loading
    await new Promise(resolve => setTimeout(resolve, 1500))

    success.value = 'Account created successfully! Your registration is pending admin approval. You will receive a notification once approved.'

    // ✅ reset form (clear all fields safely)
    Object.keys(form.value).forEach(key => {
      form.value[key] = ''
    })
  } catch (e) {
    // ✅ show backend error if available
    if (e.response?.data?.message) {
      error.value = e.response.data.message
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div class="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-green-100 p-6">
    <!-- Background blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-green-600 bg-clip-text text-transparent">Join FundEase</h1>
        <p class="text-gray-600">Create your account and start your financial journey</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegistration" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input v-model="form.firstName" type="text" required placeholder="Enter first name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input v-model="form.lastName" type="text" required placeholder="Enter last name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input v-model="form.username" type="text" required placeholder="Choose a username"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input v-model="form.email" type="email" required placeholder="Enter your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <div class="relative">
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                placeholder="Create a password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" 
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <div class="relative">
              <input 
                v-model="form.confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required 
                placeholder="Confirm your password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" 
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input v-model="form.phone" type="tel" required placeholder="Enter phone number"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Income *</label>
            <input v-model="form.monthlyIncome" type="number" required min="0" step="0.01" placeholder="Enter monthly income"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
        </div>

        <!-- Address & Employment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <textarea v-model="form.address" rows="3" required placeholder="Enter your complete address"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Employment Status *</label>
            <select v-model="form.employment" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
              <option value="">Select employment status</option>
              <option value="Employed">Employed</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Student">Student</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <!-- Emergency -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
            <input v-model="form.emergencyContact" type="text" placeholder="Enter emergency contact name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
            <input v-model="form.emergencyPhone" type="tel" placeholder="Enter emergency contact phone"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
          </div>
        </div>

        <!-- Messages -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{{ success }}</div>

        <!-- Submit -->
        <button type="submit" :disabled="isLoading"
          class="w-full bg-gradient-to-r from-sky-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-700 hover:to-green-700 transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"></path>
            </svg>
            Creating Account...
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Login link -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-sky-600 hover:text-sky-700 font-semibold">Sign in here</router-link>
        </p>
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
.animation-delay-4000 {
  animation-delay: 4s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
