import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([
    // Mock data to prevent undefined errors during development
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
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      notificationID: '3',
      title: 'Loan Application Approved',
      message: 'Your loan application for ₱50,000 has been approved.',
      type: 'success',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      notificationID: '4',
      title: 'Contribution Received',
      message: 'Maria Santos has made a contribution of ₱2,500.00',
      type: 'success',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
    },
    {
      notificationID: '5',
      title: 'Withdrawal Request',
      message: 'Pedro Cruz has requested a withdrawal of ₱15,000.00',
      type: 'warning',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
    },
    {
      notificationID: '6',
      title: 'Payment Overdue',
      message: 'Loan payment from Ana Reyes is 3 days overdue',
      type: 'error',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      notificationID: '7',
      title: 'Monthly Meeting Scheduled',
      message: 'The monthly committee meeting is scheduled for next Friday at 2:00 PM',
      type: 'info',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
  ])
  const isLoading = ref(false)
  const lastFetchTime = ref(null)

  // Getters
  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 10) // Show only recent 10 notifications
  })

  const unreadCount = computed(() => {
    return notifications.value.filter(notification => !notification.isRead).length
  })

  const hasUnreadNotifications = computed(() => {
    return unreadCount.value > 0
  })

  // Actions
  const fetchNotifications = async (limit = 20, forceRefresh = false) => {
    // Don't fetch if we already have recent data and not forcing refresh
    if (!forceRefresh && lastFetchTime.value && (Date.now() - lastFetchTime.value) < 30000) {
      return
    }

    isLoading.value = true
    try {
      const response = await api.get('/notifications', {
        params: { limit }
      })
      
      if (response.data && response.data.success) {
        notifications.value = response.data.notifications || []
        lastFetchTime.value = Date.now()
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Keep existing notifications (mock data) when API fails
      // Only set empty array if we don't have any notifications at all
      if (notifications.value.length === 0) {
        console.log('Using mock notifications for development')
      }
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      
      if (response.data && response.data.success) {
        // Update the notification in the local state
        const notification = notifications.value.find(n => n.notificationID === notificationId)
        if (notification) {
          notification.isRead = true
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      
      if (response.data && response.data.success) {
        // Update all notifications in the local state
        notifications.value.forEach(notification => {
          notification.isRead = true
        })
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const addNotification = (notification) => {
    // Add new notification to the beginning of the array
    notifications.value.unshift(notification)
    
    // Keep only the most recent 50 notifications in memory
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.notificationID === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
    lastFetchTime.value = null
  }

  const filterNotifications = (filters = {}) => {
    let filtered = [...notifications.value]

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filters.type)
    }

    // Filter by status (read/unread)
    if (filters.status && filters.status !== 'all') {
      const isRead = filters.status === 'read'
      filtered = filtered.filter(notification => notification.isRead === isRead)
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.createdAt)
        
        switch (filters.dateRange) {
          case 'today':
            return notificationDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return notificationDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return notificationDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }

  // Additional computed properties for statistics
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

  return {
    // State
    notifications,
    isLoading,
    lastFetchTime,
    
    // Getters
    recentNotifications,
    unreadCount,
    hasUnreadNotifications,
    readCount,
    todayCount,
    totalNotifications,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearNotifications,
    filterNotifications
  }
})
