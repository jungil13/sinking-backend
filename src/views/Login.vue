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
          Welcome Back
        </h1>
        <p class="text-gray-600">Sign in to your FundEase account</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/30">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input id="username" v-model="form.username" type="text" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your username" :disabled="isLoading" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <input 
                id="password" 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password" 
                :disabled="isLoading" 
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

          <!-- Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button type="button" @click="showForgotPassword = true"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </button>
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
          <button type="submit" :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Demo Accounts -->
<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <button 
    type="button"
    @click="showDemoAccounts = !showDemoAccounts"
    class="flex items-center justify-between w-full text-left text-sm font-semibold text-blue-800"
  >
    Demo Accounts
    <svg 
      :class="{'rotate-180': showDemoAccounts}" 
      class="w-4 h-4 transform transition-transform duration-200" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <div v-if="showDemoAccounts" class="mt-3 space-y-2">
    <button 
      v-for="account in demoAccounts" 
      :key="account.username" 
      @click="fillDemoAccount(account)"
      class="w-full text-left p-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs text-blue-700 transition-colors border border-blue-200"
    >
      <div class="font-medium text-sm">{{ account.displayName }}</div>
      <div class="text-blue-600 text-xs">{{ account.username }} / {{ account.password }}</div>
      <div class="text-blue-500 capitalize text-xs">{{ account.role.replace('_', ' ') }}</div>
    </button>
  </div>
</div>


        <!-- Register -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Reset Password</h3>
            <button @click="showForgotPassword = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                id="email" 
                v-model="forgotPasswordForm.email" 
                type="email" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>
            
            <div v-if="forgotPasswordError" class="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
              {{ forgotPasswordError }}
            </div>
            
            <div v-if="forgotPasswordSuccess" class="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
              {{ forgotPasswordSuccess }}
            </div>
            
            <div class="flex space-x-3">
              <button 
                type="button" 
                @click="showForgotPassword = false"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="forgotPasswordLoading"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ forgotPasswordLoading ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import { useAuthStore } from "@/stores/auth"
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/vue/24/outline"

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: "",
  password: ""
})

const showDemoAccounts = ref(false)

const isLoading = ref(false)
const error = ref("")
const success = ref("")
const showPassword = ref(false)

// Forgot Password
const showForgotPassword = ref(false)
const forgotPasswordForm = ref({
  email: ""
})
const forgotPasswordLoading = ref(false)
const forgotPasswordError = ref("")
const forgotPasswordSuccess = ref("")

const demoAccounts = ref([
  { username: "admin", displayName: "Administrator", role: "admin", password: "admin" },
  { username: "treasurer", displayName: "Treasurer", role: "treasurer", password: "123456" },
  { username: "committee", displayName: "Committee Member", role: "screening_committee", password: "123456" },
  { username: "john_doe", displayName: "John Doe", role: "member", password: "password123" },
  { username: "jane_smith", displayName: "Jane Smith", role: "member", password: "password123" },
  { username: "mike_wilson", displayName: "Mike Wilson", role: "member", password: "password123" },
  { username: "sarah_jones", displayName: "Sarah Jones", role: "member", password: "password123" },
  { username: "david_brown", displayName: "David Brown", role: "member", password: "password123" },
  { username: "lisa_davis", displayName: "Lisa Davis", role: "member", password: "password123" },
  { username: "tom_miller", displayName: "Tom Miller", role: "member", password: "password123" },
  { username: "emma_taylor", displayName: "Emma Taylor", role: "member", password: "password123" }
])

async function handleLogin() {
  isLoading.value = true
  error.value = ""
  success.value = ""

  try {
    // ✅ Call backend login API
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      username: form.value.username,
      password: form.value.password
    })

    const token = res.data.token
    const user = res.data.user || {} // fallback to empty object

    if (!token || !user.role) {
      throw new Error("Invalid login response. Missing token or role.")
    }

    // ✅ Use auth store to save token + user
    authStore.loginSuccess(token, user)

    // ✅ Map database roles to router paths
    let routerPath = user.role
    if (user.role === 'screening_committee') {
      routerPath = 'committee'  // ← map to the correct route
    }

    // ✅ Redirect based on the corrected path
    router.push(`/${routerPath}/dashboard`)
  } catch (err) {
    console.error("Login error:", err)
    error.value = err.response?.data?.message || err.message || "Invalid username or password."
  } finally {
    isLoading.value = false
  }
}

function fillDemoAccount(account) {
    form.value.username = account.username
  form.value.password = account.password
}

async function handleForgotPassword() {
  forgotPasswordLoading.value = true
  forgotPasswordError.value = ""
  forgotPasswordSuccess.value = ""

  try {
    const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
      email: forgotPasswordForm.value.email
    })

    forgotPasswordSuccess.value = res.data.message || "Password reset link sent to your email"
    
    // Clear form after success
    setTimeout(() => {
      showForgotPassword.value = false
      forgotPasswordForm.value.email = ""
      forgotPasswordSuccess.value = ""
    }, 3000)
  } catch (err) {
    forgotPasswordError.value = err.response?.data?.message || "Failed to send reset link"
  } finally {
    forgotPasswordLoading.value = false
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
