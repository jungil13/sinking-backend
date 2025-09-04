<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600 mt-1">Manage and view all your notifications</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="refreshNotifications"
            :disabled="isLoading"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowPathIcon 
              class="h-5 w-5 text-gray-500" 
              :class="{ 'animate-spin': isLoading }"
            />
          </button>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Mark All Read
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <BellIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalNotifications }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Unread</p>
            <p class="text-2xl font-bold text-gray-900">{{ unreadCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Read</p>
            <p class="text-2xl font-bold text-gray-900">{{ readCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Today</p>
            <p class="text-2xl font-bold text-gray-900">{{ todayCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Filter by:</label>
          <select
            v-model="selectedType"
            @change="applyFilters"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select
            v-model="selectedStatus"
            @change="applyFilters"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Date:</label>
          <select
            v-model="selectedDateRange"
            @change="applyFilters"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <button
          @click="clearFilters"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">All Notifications</h2>
      </div>

      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-500 mt-2">Loading notifications...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center">
        <ExclamationTriangleIcon class="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button
          @click="fetchNotifications"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <div v-else-if="notifications.length === 0" class="p-8 text-center">
        <BellIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
        <p class="text-gray-500">Try adjusting your filters or check back later.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="notification in paginatedNotifications"
          :key="notification.notificationID"
          @click="handleNotificationClick(notification)"
          class="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          :class="{ 'bg-indigo-50/30': !notification.isRead }"
        >
          <div class="flex items-start gap-4">
            <!-- Notification Icon -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="getNotificationIconClass(notification.type)"
            >
              <component :is="getNotificationIcon(notification.type)" class="h-5 w-5" />
            </div>

            <!-- Notification Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-base font-semibold text-gray-900">
                      {{ notification.title }}
                    </h3>
                    <span
                      v-if="!notification.isRead"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      New
                    </span>
                  </div>
                  <p class="text-gray-600 mb-2">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span>{{ formatDateTime(notification.createdAt) }}</span>
                    <span class="capitalize">{{ notification.type }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button
                    v-if="!notification.isRead"
                    @click.stop="markAsRead(notification)"
                    class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckIcon class="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    @click.stop="deleteNotification(notification)"
                    class="p-1 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete notification"
                  >
                    <TrashIcon class="h-4 w-4 text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="p-6 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
            {{ Math.min(currentPage * itemsPerPage, totalCount) }} of 
            {{ totalCount }} notifications
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="px-3 py-2 text-sm font-medium text-gray-700">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api.js'
import {
  BellIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// Local state for notifications
const notifications = ref([])
const isLoading = ref(false)
const error = ref(null)

// Filter states
const selectedType = ref('')
const selectedStatus = ref('')
const selectedDateRange = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
const totalCount = ref(0)

// Computed properties
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.isRead).length
})

const readCount = computed(() => {
  return notifications.value.filter(notification => notification.isRead).length
})

const todayCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return notifications.value.filter(notification => {
    const notificationDate = new Date(notification.createdAt)
    return notificationDate >= today
  }).length
})

const totalNotifications = computed(() => {
  return notifications.value.length
})

// Since we're using server-side pagination, we don't need client-side filtering
const totalPages = computed(() => 
  Math.ceil(totalCount.value / itemsPerPage)
)

const paginatedNotifications = computed(() => {
  return notifications.value
})

// Methods
const fetchNotifications = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const params = new URLSearchParams()
    if (selectedType.value) params.append('type', selectedType.value)
    if (selectedStatus.value) params.append('isRead', selectedStatus.value === 'read')
    
    // Add pagination parameters
    const offset = (currentPage.value - 1) * itemsPerPage
    params.append('limit', itemsPerPage.toString())
    params.append('offset', offset.toString())
    
    const response = await api.get(`/notifications?${params.toString()}`)
    
    if (response.data.success) {
      notifications.value = response.data.data.notifications
      totalCount.value = response.data.data.total || notifications.value.length
    } else {
      error.value = response.data.message || 'Failed to fetch notifications'
    }
  } catch (err) {
    console.error('Error fetching notifications:', err)
    error.value = err.response?.data?.message || 'Failed to fetch notifications'
  } finally {
    isLoading.value = false
  }
}

const refreshNotifications = async () => {
  await fetchNotifications()
}

const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read')
    
    if (response.data.success) {
      // Update local state
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
    } else {
      error.value = response.data.message || 'Failed to mark all notifications as read'
    }
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
    error.value = err.response?.data?.message || 'Failed to mark all notifications as read'
  }
}

const markAsRead = async (notification) => {
  try {
    const response = await api.put(`/notifications/${notification.notificationID}/read`)
    
    if (response.data.success) {
      // Update local state
      const index = notifications.value.findIndex(n => n.notificationID === notification.notificationID)
      if (index > -1) {
        notifications.value[index].isRead = true
      }
    } else {
      error.value = response.data.message || 'Failed to mark notification as read'
    }
  } catch (err) {
    console.error('Error marking notification as read:', err)
    error.value = err.response?.data?.message || 'Failed to mark notification as read'
  }
}

const deleteNotification = async (notification) => {
  try {
    const response = await api.delete(`/notifications/${notification.notificationID}`)
    
    if (response.data.success) {
      // Remove from local state
      const index = notifications.value.findIndex(n => n.notificationID === notification.notificationID)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    } else {
      error.value = response.data.message || 'Failed to delete notification'
    }
  } catch (err) {
    console.error('Error deleting notification:', err)
    error.value = err.response?.data?.message || 'Failed to delete notification'
  }
}

const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (!notification.isRead) {
    await markAsRead(notification)
  }

  // Navigate based on notification content
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
}

const applyFilters = () => {
  currentPage.value = 1
  fetchNotifications()
}

const clearFilters = () => {
  selectedType.value = ''
  selectedStatus.value = ''
  selectedDateRange.value = ''
  currentPage.value = 1
  fetchNotifications()
}

const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await fetchNotifications()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await fetchNotifications()
  }
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

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for filter changes - removed automatic application
// Users now need to manually apply filters using the dropdown change events

// Lifecycle
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>


