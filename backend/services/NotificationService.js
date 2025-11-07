const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.notifications = new Map();
    this.userSubscriptions = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for various events that should trigger notifications
    this.on('assessment_submitted', this.handleAssessmentSubmitted.bind(this));
    this.on('assessment_verified', this.handleAssessmentVerified.bind(this));
    this.on('video_processed', this.handleVideoProcessed.bind(this));
    this.on('user_registered', this.handleUserRegistered.bind(this));
    this.on('password_reset', this.handlePasswordReset.bind(this));
  }

  // Create a new notification
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = {
        id: this.generateNotificationId(),
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: this.getNotificationPriority(type)
      };

      // Store notification
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId).push(notification);

      // Emit real-time notification if user is subscribed
      if (this.isUserSubscribed(userId)) {
        this.emit('real_time_notification', { userId, notification });
      }

      console.log(`Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, unreadOnly = false } = options;
      
      let userNotifications = this.notifications.get(userId) || [];
      
      // Filter unread notifications if requested
      if (unreadOnly) {
        userNotifications = userNotifications.filter(n => !n.read);
      }

      // Sort by createdAt (newest first)
      userNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Apply pagination
      const paginatedNotifications = userNotifications.slice(offset, offset + limit);
      
      return {
        notifications: paginatedNotifications,
        total: userNotifications.length,
        unread: userNotifications.filter(n => !n.read).length,
        hasMore: userNotifications.length > offset + limit
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const notification = userNotifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        return notification;
      }
      
      return null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      userNotifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
        }
      });
      
      return { success: true, count: userNotifications.length };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const index = userNotifications.findIndex(n => n.id === notificationId);
      
      if (index !== -1) {
        userNotifications.splice(index, 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Subscribe user to real-time notifications
  subscribeUser(userId, socketId) {
    try {
      this.userSubscriptions.set(userId, { socketId, subscribedAt: new Date().toISOString() });
      console.log(`User ${userId} subscribed to real-time notifications`);
      return true;
    } catch (error) {
      console.error('Error subscribing user:', error);
      throw new Error('Failed to subscribe user');
    }
  }

  // Unsubscribe user from real-time notifications
  unsubscribeUser(userId) {
    try {
      const result = this.userSubscriptions.delete(userId);
      if (result) {
        console.log(`User ${userId} unsubscribed from real-time notifications`);
      }
      return result;
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      throw new Error('Failed to unsubscribe user');
    }
  }

  // Check if user is subscribed
  isUserSubscribed(userId) {
    return this.userSubscriptions.has(userId);
  }

  // Get subscription info
  getSubscriptionInfo(userId) {
    return this.userSubscriptions.get(userId) || null;
  }

  // Event handlers
  async handleAssessmentSubmitted(data) {
    const { userId, assessmentId, testType } = data;
    await this.createNotification(
      userId,
      'assessment_submitted',
      'Assessment Submitted',
      `Your ${testType} assessment has been submitted successfully and is pending verification.`,
      { assessmentId, testType }
    );
  }

  async handleAssessmentVerified(data) {
    const { userId, assessmentId, testType, verifiedBy } = data;
    await this.createNotification(
      userId,
      'assessment_verified',
      'Assessment Verified',
      `Your ${testType} assessment has been verified by ${verifiedBy}.`,
      { assessmentId, testType, verifiedBy }
    );
  }

  async handleVideoProcessed(data) {
    const { userId, videoId, analysisResults } = data;
    await this.createNotification(
      userId,
      'video_processed',
      'Video Analysis Complete',
      'Your video has been processed and analysis results are available.',
      { videoId, analysisResults }
    );
  }

  async handleUserRegistered(data) {
    const { userId, email } = data;
    await this.createNotification(
      userId,
      'welcome',
      'Welcome to Uttarakhand Sports Assessment Portal',
      'Thank you for registering! Complete your profile to get started with assessments.',
      { email }
    );
  }

  async handlePasswordReset(data) {
    const { userId, email } = data;
    await this.createNotification(
      userId,
      'password_reset',
      'Password Reset Request',
      'A password reset request has been initiated for your account.',
      { email }
    );
  }

  // Bulk notifications
  async sendBulkNotification(userIds, type, title, message, data = {}) {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => 
          this.createNotification(userId, type, title, message, data)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        total: userIds.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          userId: userIds[index],
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : null,
          reason: result.status === 'rejected' ? result.reason : null
        }))
      };
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw new Error('Failed to send bulk notification');
    }
  }

  // Notification preferences (mock implementation)
  async getNotificationPreferences(userId) {
    // In a real implementation, this would come from a database
    return {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      quietHours: { start: '22:00', end: '08:00' },
      notificationTypes: {
        assessment_submitted: true,
        assessment_verified: true,
        video_processed: true,
        welcome: true,
        password_reset: true
      }
    };
  }

  // Utility methods
  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getNotificationPriority(type) {
    const priorities = {
      'welcome': 'low',
      'assessment_submitted': 'medium',
      'assessment_verified': 'high',
      'video_processed': 'medium',
      'password_reset': 'high',
      'system_alert': 'critical'
    };
    
    return priorities[type] || 'medium';
  }

  // Cleanup old notifications (keep last 100 per user)
  cleanupOldNotifications() {
    try {
      for (const [userId, userNotifications] of this.notifications) {
        if (userNotifications.length > 100) {
          // Keep only the last 100 notifications
          const sortedNotifications = userNotifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 100);
          
          this.notifications.set(userId, sortedNotifications);
        }
      }
      
      console.log('Old notifications cleaned up');
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  // Get service statistics
  getStatistics() {
    const totalNotifications = Array.from(this.notifications.values())
      .reduce((sum, userNotifs) => sum + userNotifs.length, 0);
    
    const totalUsers = this.notifications.size;
    const totalSubscribers = this.userSubscriptions.size;
    
    return {
      totalNotifications,
      totalUsers,
      totalSubscribers,
      averageNotificationsPerUser: totalUsers > 0 ? Math.round(totalNotifications / totalUsers) : 0,
      timestamp: new Date().toISOString()
    };
  }

  // Health check
  healthCheck() {
    return {
      status: 'healthy',
      totalNotifications: Array.from(this.notifications.values())
        .reduce((sum, userNotifs) => sum + userNotifs.length, 0),
      totalUsers: this.notifications.size,
      totalSubscribers: this.userSubscriptions.size,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Set up periodic cleanup (run every hour)
setInterval(() => {
  notificationService.cleanupOldNotifications();
}, 60 * 60 * 1000);

module.exports = notificationService;