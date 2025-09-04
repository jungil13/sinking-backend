<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2' // Import SweetAlert2
import axios from 'axios'

import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ArrowRightOnRectangleIcon as LogoutIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const userFirstName = ref('')
const userRole = ref('')
const notifications = ref([])
const hasNewNotifications = ref(false)

// Function to get user data from localStorage
const getUserData = () => {
  const userData = JSON.parse(localStorage.getItem('user'))
  if (userData && userData.firstName) {
    userFirstName.value = userData.firstName
    userRole.value = userData.role // Assuming role is in the user object
  }
}

// Prepare notifications for the backend
const fetchNotifications = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    notifications.value = response.data
    // Check if there are any unread notifications
    hasNewNotifications.value = notifications.value.some(n => !n.read)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

// Navigation links
const navigation = [
  { name: 'Dashboard', path: '/committee/dashboard', icon: HomeIcon },
  { name: 'Members', path: '/committee/members', icon: UserGroupIcon },
  { name: 'Loans', path: '/committee/loans', icon: DocumentTextIcon },
  { name: 'Messages', path: '/committee/messages', icon: DocumentTextIcon },
  { name: 'Settings', path: '/committee/settings', icon: CogIcon },
]

// Logout with SweetAlert2 confirmation
const handleLogout = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of your session.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, log me out!'
  }).then((result) => {
    if (result.isConfirmed) {
      // Clear token and user data from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Clear the pinia store state
      authStore.logout()

      Swal.fire(
        'Logged Out!',
        'You have been successfully logged out.',
        'success'
      )
      router.push('/login')
    }
  })
}

// Call on component mount
onMounted(() => {
  getUserData()
  // You would typically call fetchNotifications here as well:
  // fetchNotifications();
})
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-50 inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="p-8 border-b border-gray-200/50">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              FundEase
            </h1>
            <p class="text-sm text-gray-500 font-medium">Committee Portal</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-8 space-y-3">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          class="group flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-fuchsia-50 hover:shadow-md hover:scale-105"
          active-class="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-lg scale-105"
        >
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-white/20 transition-all duration-300 mr-4">
            <component :is="item.icon" class="h-5 w-5" />
          </div>
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-6 border-t border-gray-200/50 space-y-4">
        <div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50">
          <img class="h-10 w-10 rounded-full ring-2 ring-purple-200" src="https://i.pravatar.cc/40" alt="avatar"/>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userFirstName || authStore.userDisplayName }}</p>
            <p class="text-xs text-gray-500">{{ userRole || 'Committee Member' }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 font-medium"
        >
          <LogoutIcon class="h-5 w-5 mr-2"/>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-72">
      <!-- Header -->
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div class="flex items-center justify-between px-8 py-4">
          <div class="flex items-center space-x-4">
            <button
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              @click="sidebarOpen = !sidebarOpen"
            >
              <svg class="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              {{ userFirstName || 'Committee' }} Dashboard
            </h1>
          </div>

          <div class="flex items-center space-x-6">
            <!-- Notifications -->
            <button class="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
              <BellIcon class="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors"/>
              <span v-if="hasNewNotifications" class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <!-- User Menu -->
            <div class="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
              <img class="h-9 w-9 rounded-full ring-2 ring-purple-200" src="https://i.pravatar.cc/40" alt="avatar"/>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">{{ userFirstName || authStore.userDisplayName }}</p>
                <p class="text-xs text-gray-500">{{ userRole || 'Committee Member' }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
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
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}
</style>