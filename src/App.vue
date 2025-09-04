<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import logo from '@/assets/fun.png'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Navigation -->
    <nav 
      v-if="!authStore.isAuthenticated" 
      class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo + Brand -->
          <div class="flex items-center space-x-2">
            <router-link to="/" class="flex items-center space-x-2">
              <!-- Logo placeholder -->
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span class="text-white font-bold">F</span>
              </div>
              <span class="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FundEase
              </span>
            </router-link>
          </div>

          <!-- Right Side Nav -->
          <div class="flex items-center space-x-4">
            <router-link 
              to="/login"
              class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Login
            </router-link>
            <router-link 
              to="/register"
              class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow hover:shadow-lg transition-all"
            >
              Register
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Router view -->
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
