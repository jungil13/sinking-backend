<template>
  <div
    class="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 overflow-hidden">
    <!-- Blobby Background -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob">
      </div>
      <div
        class="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000">
      </div>
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1
          class="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent drop-shadow-sm mb-2">
          Reset Password
        </h1>
        <p class="text-gray-600">Enter your current password and choose a new one</p>
      </div>

      <!-- Reset Password Form -->
      <div class="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/30">
        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <!-- Current Password -->
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div class="relative">
              <input 
                id="currentPassword" 
                v-model="form.currentPassword" 
                :type="showCurrentPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your current password" 
                :disabled="isLoading" 
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div class="relative">
              <input 
                id="newPassword" 
                v-model="form.newPassword" 
                :type="showNewPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your new password" 
                :disabled="isLoading" 
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showNewPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div class="relative">
              <input 
                id="confirmPassword" 
                v-model="form.confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your new password" 
                :disabled="isLoading" 
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

          <!-- Password Requirements -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
            <ul class="text-xs text-blue-700 space-y-1">
              <li :class="{'text-green-600': form.newPassword.length >= 6}">
                • At least 6 characters long
              </li>
              <li :class="{'text-green-600': form.newPassword === form.confirmPassword && form.confirmPassword.length > 0}">
                • Passwords must match
              </li>
            </ul>
          </div>

          <!-- Error -->
          <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {{ error }}
          </div>

          <!-- Success -->
          <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
            {{ success }}
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="isLoading || !isFormValid"
            class="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Resetting password...
            </span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Remember your password?
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-semibold">
              Back to Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import axios from "axios"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const router = useRouter()
const route = useRoute()

const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
})

const isLoading = ref(false)
const error = ref("")
const success = ref("")
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Get token from URL query parameters
const resetToken = ref("")

const isFormValid = computed(() => {
  return form.value.currentPassword.length > 0 &&
         form.value.newPassword.length >= 6 &&
         form.value.newPassword === form.value.confirmPassword
})

onMounted(() => {
  // Get token from URL query parameters
  resetToken.value = route.query.token || ""
  
  if (!resetToken.value) {
    error.value = "Invalid or missing reset token. Please request a new password reset."
  }
})

async function handleResetPassword() {
  if (!resetToken.value) {
    error.value = "Invalid or missing reset token. Please request a new password reset."
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = "New passwords do not match."
    return
  }

  if (form.value.newPassword.length < 6) {
    error.value = "New password must be at least 6 characters long."
    return
  }

  isLoading.value = true
  error.value = ""
  success.value = ""

  try {
    const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
      token: resetToken.value,
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })

    success.value = res.data.message || "Password has been reset successfully!"
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err) {
    console.error("Reset password error:", err)
    error.value = err.response?.data?.message || err.message || "Failed to reset password."
  } finally {
    isLoading.value = false
  }
}
</script>

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
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
