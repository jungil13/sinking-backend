<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
    >
      <BellIcon class="h-6 w-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-xl z-50"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-200/50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark all read
            </button>
            <button
              @click="refreshNotifications"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              :disabled="isLoading"
            >
              <ArrowPathIcon 
                class="h-4 w-4 text-gray-500" 
                :class="{ 'animate-spin': isLoading }"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="isLoading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Loading notifications...</p>
        </div>

        <div v-else-if="notifications.length === 0" class="p-8 text-center">
          <BellIcon class="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 text-sm">No notifications yet</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="notification in recentNotifications"
            :key="notification.notificationID"
            @click="handleNotificationClick(notification)"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            :class="{ 'bg-indigo-50/50': !notification.isRead }"
          >
            <div class="flex items-start gap-3">
              <!-- Notification Icon -->
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getNotificationIconClass(notification.type)"
              >
                <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
              </div>

              <!-- Notification Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 mb-1">
                      {{ notification.title }}
                    </p>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ notification.message }}
                    </p>
                  </div>
                  <div class="flex-shrink-0 ml-2">
                    <div
                      v-if="!notification.isRead"
                      class="w-2 h-2 bg-indigo-500 rounded-full"
                    ></div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="p-4 border-t border-gray-200/50">
        <button
          @click="viewAllNotifications"
          class="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// Local state for notifications
const notifications = ref([
  // Mock data
  {
    notificationID: '1',
    title: 'Welcome to FundEase',
    message: 'Your account has been successfully created. Start managing your finances today!',
    type: 'info',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    notificationID: '2',
    title: 'New Member Registration',
    message: 'John Doe has registered for membership. Please review their application.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    notificationID: '3',
    title: 'Loan Application Approved',
    message: 'Your loan application for ₱50,000 has been approved.',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    notificationID: '4',
    title: 'Contribution Received',
    message: 'Maria Santos has made a contribution of ₱2,500.00',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    notificationID: '5',
    title: 'Withdrawal Request',
    message: 'Pedro Cruz has requested a withdrawal of ₱15,000.00',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
])

const isLoading = ref(false)

// Reactive data
const isOpen = ref(false)

// Computed properties
const recentNotifications = computed(() => {
  return notifications.value.slice(0, 10) // Show only recent 10 notifications
})

const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.isRead).length
})

const hasUnreadNotifications = computed(() => {
  return unreadCount.value > 0
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const fetchNotifications = async () => {
  isLoading.value = true
  // Simulate API call delay
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

const refreshNotifications = async () => {
  isLoading.value = true
  // Simulate API call delay
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

const markAllAsRead = async () => {
  notifications.value.forEach(notification => {
    notification.isRead = true
  })
}

const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (!notification.isRead) {
    const index = notifications.value.findIndex(n => n.notificationID === notification.notificationID)
    if (index > -1) {
      notifications.value[index].isRead = true
    }
  }

  // Navigate based on notification type
  navigateToNotification(notification)
  closeDropdown()
}

const navigateToNotification = (notification) => {
  // Navigate based on notification content or type
  if (notification.title.includes('Registration')) {
    router.push('/admin/registrations')
  } else if (notification.title.includes('Loan')) {
    router.push('/admin/loans')
  } else if (notification.title.includes('Contribution')) {
    router.push('/admin/contributions')
  } else if (notification.title.includes('Withdrawal')) {
    router.push('/admin/withdrawals')
  } else if (notification.title.includes('Message')) {
    router.push('/admin/messages')
  }
  // Add more navigation logic as needed
}

const viewAllNotifications = () => {
  router.push('/admin/notifications')
  closeDropdown()
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'info':
    default:
      return InformationCircleIcon
  }
}

const getNotificationIconClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-600'
    case 'error':
      return 'bg-red-100 text-red-600'
    case 'warning':
      return 'bg-yellow-100 text-yellow-600'
    case 'info':
    default:
      return 'bg-blue-100 text-blue-600'
  }
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Auto-refresh notifications every 30 seconds
let refreshInterval = null

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    if (!isOpen.value) {
      fetchNotifications()
    }
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(() => {
  fetchNotifications()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
