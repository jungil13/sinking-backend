import api from '@/api'

class NotificationService {
  /**
   * Fetch notifications for the current user
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of notifications to fetch
   * @param {number} params.offset - Offset for pagination
   * @param {boolean} params.unreadOnly - Fetch only unread notifications
   * @returns {Promise<Object>} API response
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>} API response
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} API response
   */
  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      return response.data
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>} API response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  /**
   * Create a new notification (admin only)
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} notificationData.type - Notification type (info, success, warning, error)
   * @param {string} notificationData.userId - Target user ID (optional, for specific user)
   * @returns {Promise<Object>} API response
   */
  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications', notificationData)
      return response.data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Get notification statistics
   * @returns {Promise<Object>} API response with stats
   */
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time notifications (WebSocket)
   * @param {Function} callback - Callback function for new notifications
   * @returns {Function} Unsubscribe function
   */
  subscribeToNotifications(callback) {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement a polling mechanism
    const interval = setInterval(async () => {
      try {
        const response = await this.getNotifications({ limit: 1 })
        if (response.success && response.notifications.length > 0) {
          const latestNotification = response.notifications[0]
          // Check if this is a new notification
          callback(latestNotification)
        }
      } catch (error) {
        console.error('Error in notification subscription:', error)
      }
    }, 30000) // Poll every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval)
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService()
export default notificationService
