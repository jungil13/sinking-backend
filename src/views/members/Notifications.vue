<template>
  <div class="min-h-screen  py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
            <p class="mt-2 text-gray-600">Stay updated with your account activities and messages</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="markAllAsRead"
              :disabled="isLoading"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Mark All Read
            </button>
            <button
              @click="refreshNotifications"
              :disabled="isLoading"
              class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && notifications.length === 0" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-lg p-6 animate-pulse">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'all'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              All Notifications
              <span v-if="unreadCount > 0" class="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {{ unreadCount }}
              </span>
            </button>
            <button
              @click="activeTab = 'status'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Status Updates
            </button>
            <button
              @click="activeTab = 'messages'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Messages
            </button>
          </nav>
        </div>
      </div>

      <!-- Notifications Content -->
      <div class="space-y-4">
        <!-- All Notifications Tab -->
        <div v-if="activeTab === 'all'">
          <div v-if="notifications.length === 0 && !isLoading" class="text-center py-12">
            <BellIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p class="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="notification in notifications"
              :key="notification.notificationID"
              :class="[
                'bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md',
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              ]"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4 flex-1">
                  <!-- Icon -->
                  <div :class="[
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                    getNotificationIconClass(notification.type)
                  ]">
                    <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <h3 class="text-sm font-medium text-gray-900">{{ notification.title }}</h3>
                      <span v-if="!notification.isRead" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>
                    <p class="mt-2 text-xs text-gray-500">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    v-if="!notification.isRead"
                    @click="markAsRead(notification.notificationID)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mark Read
                  </button>
                  <button
                    @click="deleteNotification(notification.notificationID)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Updates Tab -->
        <div v-if="activeTab === 'status'">
          <div v-if="statusUpdates.length === 0 && !isLoading" class="text-center py-12">
            <CheckCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No status updates</h3>
            <p class="mt-1 text-sm text-gray-500">Your recent activities will appear here</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="update in statusUpdates"
              :key="`${update.type}-${update.id}`"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div class="flex items-start space-x-4">
                <!-- Icon -->
                <div :class="[
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  getStatusIconClass(update.notificationType)
                ]">
                  <component :is="getStatusIcon(update.type)" class="w-5 h-5" />
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-sm font-medium text-gray-900 capitalize">{{ update.type }} Update</h3>
                    <span :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusBadgeClass(update.status)
                    ]">
                      {{ update.status }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600">{{ update.message }}</p>
                  <p class="mt-2 text-xs text-gray-500">
                    {{ formatDate(update.date) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages Tab -->
        <div v-if="activeTab === 'messages'">
          <div v-if="messages.length === 0 && !isLoading" class="text-center py-12">
            <ChatBubbleLeftRightIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p class="mt-1 text-sm text-gray-500">Your messages will appear here</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="message in messages"
              :key="message.messageID"
              :class="[
                'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
                !message.isRead ? 'border-l-4 border-l-green-500' : ''
              ]"
            >
              <div class="flex items-start space-x-4">
                <!-- Icon -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon class="w-5 h-5 text-green-600" />
                </div>
                
                <!-- Content -->
          <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-sm font-medium text-gray-900">Message from {{ message.senderName }}</h3>
                    <span v-if="!message.isRead" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Unread
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600">{{ message.message }}</p>
                  <p class="mt-2 text-xs text-gray-500">
                    {{ formatDate(message.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !isLoading" class="mt-8 text-center">
        <button
          @click="loadMore"
          class="bg-white border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

// Reactive data
const notifications = ref([])
const statusUpdates = ref([])
const messages = ref([])
const isLoading = ref(false)
const activeTab = ref('all')
const unreadCount = ref(0)
const hasMore = ref(true)
const currentPage = ref(1)

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Fetch notifications
const fetchNotifications = async (page = 1, append = false) => {
  try {
    isLoading.value = true
    const response = await axios.get(`http://localhost:5000/api/notifications?limit=20&offset=${(page - 1) * 20}`, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      if (append) {
        notifications.value = [...notifications.value, ...response.data.data.notifications]
      } else {
        notifications.value = response.data.data.notifications
      }
      unreadCount.value = response.data.data.unreadCount
      hasMore.value = response.data.data.notifications.length === 20
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    isLoading.value = false
  }
}

// Fetch status updates
const fetchStatusUpdates = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/notifications/status-updates', {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      statusUpdates.value = response.data.data.statusUpdates
    }
  } catch (error) {
    console.error('Error fetching status updates:', error)
  }
}

// Fetch messages (using existing message API)
const fetchMessages = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/messages/inbox', {
      headers: getAuthHeaders()
    })

    if (response.data) {
      messages.value = response.data
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

// Mark notification as read
const markAsRead = async (notificationID) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/notifications/${notificationID}/read`, {}, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      const notification = notifications.value.find(n => n.notificationID === notificationID)
      if (notification) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    isLoading.value = true
    const response = await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  } finally {
    isLoading.value = false
  }
}

// Delete notification
const deleteNotification = async (notificationID) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/notifications/${notificationID}`, {
      headers: getAuthHeaders()
    })

    if (response.data.success) {
      notifications.value = notifications.value.filter(n => n.notificationID !== notificationID)
      const deletedNotification = notifications.value.find(n => n.notificationID === notificationID)
      if (deletedNotification && !deletedNotification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Load more notifications
const loadMore = () => {
  currentPage.value++
  fetchNotifications(currentPage.value, true)
}

// Refresh notifications
const refreshNotifications = () => {
  currentPage.value = 1
  fetchNotifications(1, false)
  fetchStatusUpdates()
  fetchMessages()
}

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    default: return InformationCircleIcon
  }
}

const getNotificationIconClass = (type) => {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-600'
    case 'error': return 'bg-red-100 text-red-600'
    case 'warning': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-blue-100 text-blue-600'
  }
}

const getStatusIcon = (type) => {
  switch (type) {
    case 'contribution': return CurrencyDollarIcon
    case 'loan': return DocumentTextIcon
    case 'withdrawal': return ArrowDownTrayIcon
    default: return InformationCircleIcon
  }
}

const getStatusIconClass = (notificationType) => {
  switch (notificationType) {
    case 'success': return 'bg-green-100 text-green-600'
    case 'error': return 'bg-red-100 text-red-600'
    case 'warning': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-blue-100 text-blue-600'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'confirmed':
    case 'approved':
    case 'completed': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Load data on mount
onMounted(() => {
  fetchNotifications()
  fetchStatusUpdates()
  fetchMessages()
})
</script>