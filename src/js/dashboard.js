class DashboardManager {
  constructor() {
    this.userData = null;
    this.startTime = Date.now();
    this.uptimeInterval = null;
    
    this.initializeElements();
    this.setupEventListeners();
    this.loadUserData();
    this.startUptimeCounter();
  }

  initializeElements() {
    // Header elements
    this.userGreeting = document.getElementById('user-greeting');
    this.accountAvatar = document.getElementById('account-avatar');
    this.accountName = document.getElementById('account-name');
    this.addAccountBtn = document.getElementById('add-account-btn');
    
    // Profile elements
    this.profileAvatar = document.getElementById('profile-avatar');
    this.profileName = document.getElementById('profile-name');
    this.profileId = document.getElementById('profile-id');
    this.serverCount = document.getElementById('server-count');
    this.friendCount = document.getElementById('friend-count');
    this.nitroStatus = document.getElementById('nitro-status');
    this.commandsUsed = document.getElementById('commands-used');
    
    // Uptime elements
    this.uptimeDays = document.getElementById('uptime-days');
    this.uptimeHours = document.getElementById('uptime-hours');
    this.uptimeMinutes = document.getElementById('uptime-minutes');
    this.uptimeSeconds = document.getElementById('uptime-seconds');
    
    // Toggle elements
    this.discoverableToggle = document.getElementById('discoverable-toggle');
    this.privateToggle = document.getElementById('private-toggle');
    
    // Notification elements
    this.notificationList = document.getElementById('notification-list');
    this.clearNotificationsBtn = document.getElementById('clear-notifications');
    
    // Sidebar elements
    this.sidebarItems = document.querySelectorAll('.sidebar-item');
    
    // Title bar controls
    this.minimizeBtn = document.getElementById('minimize-btn');
    this.maximizeBtn = document.getElementById('maximize-btn');
    this.closeBtn = document.getElementById('close-btn');
  }

  setupEventListeners() {
    // Title bar controls
    this.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    this.maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
    this.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
    
    // Add account button
    this.addAccountBtn.addEventListener('click', () => this.handleAddAccount());
    
    // Toggle switches
    this.discoverableToggle.addEventListener('click', () => this.toggleDiscoverable());
    this.privateToggle.addEventListener('click', () => this.togglePrivateMode());
    
    // Clear notifications
    this.clearNotificationsBtn.addEventListener('click', () => this.clearNotifications());
    
    // Sidebar navigation
    this.sidebarItems.forEach(item => {
      item.addEventListener('click', () => this.handleSidebarClick(item));
    });
    
    // Notification items
    this.setupNotificationListeners();
  }

  loadUserData() {
    this.userData = window.electronAPI.getStore('user_data');
    
    if (this.userData) {
      this.updateUserInterface();
    } else {
      // Redirect to login if no user data
      window.electronAPI.navigateToLogin();
    }
  }

  updateUserInterface() {
    const { username, discriminator, id, avatar, premium_type } = this.userData;
    const displayName = discriminator !== '0' ? `${username}#${discriminator}` : username;
    
    // Update greeting
    this.userGreeting.textContent = username;
    
    // Update account switcher
    this.accountName.textContent = displayName;
    this.accountAvatar.textContent = username.charAt(0).toUpperCase();
    
    // Update profile card
    this.profileName.textContent = displayName;
    this.profileId.textContent = `ID: ${id}`;
    this.profileAvatar.textContent = username.charAt(0).toUpperCase();
    
    // Update Nitro status
    const nitroTypes = {
      0: 'Inactive',
      1: 'Nitro Classic',
      2: 'Nitro',
      3: 'Nitro Basic'
    };
    
    const nitroStatus = nitroTypes[premium_type] || 'Inactive';
    this.nitroStatus.innerHTML = `<span class="nitro-badge">${nitroStatus}</span>`;
    
    // Simulate some data (in a real app, this would come from Discord API)
    this.serverCount.textContent = Math.floor(Math.random() * 50) + 10;
    this.friendCount.textContent = Math.floor(Math.random() * 100) + 1;
    this.commandsUsed.textContent = Math.floor(Math.random() * 50) + 1;
  }

  startUptimeCounter() {
    this.updateUptime();
    this.uptimeInterval = setInterval(() => {
      this.updateUptime();
    }, 1000);
  }

  updateUptime() {
    const now = Date.now();
    const diff = Math.floor((now - this.startTime) / 1000);
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    this.uptimeDays.textContent = days.toString().padStart(2, '0');
    this.uptimeHours.textContent = hours.toString().padStart(2, '0');
    this.uptimeMinutes.textContent = minutes.toString().padStart(2, '0');
    this.uptimeSeconds.textContent = seconds.toString().padStart(2, '0');
  }

  handleAddAccount() {
    // In a real app, this would open a new login window or modal
    window.electronAPI.navigateToLogin();
  }

  toggleDiscoverable() {
    this.discoverableToggle.classList.toggle('active');
    const isActive = this.discoverableToggle.classList.contains('active');
    
    // Save setting
    window.electronAPI.setStore('velrath_discoverable', isActive);
    
    // Add notification
    this.addNotification(
      'success',
      `Velrath Discoverable: ${isActive ? 'Enabled' : 'Disabled'}`,
      'Settings'
    );
  }

  togglePrivateMode() {
    this.privateToggle.classList.toggle('active');
    const isActive = this.privateToggle.classList.contains('active');
    
    // Save setting
    window.electronAPI.setStore('private_mode', isActive);
    
    // Add notification
    this.addNotification(
      'info',
      `Private Mode: ${isActive ? 'Enabled' : 'Disabled'}`,
      'Settings'
    );
  }

  handleSidebarClick(clickedItem) {
    // Remove active class from all items
    this.sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    clickedItem.classList.add('active');
    
    // Get page name
    const page = clickedItem.dataset.page;
    
    // In a real app, this would switch content panels
    console.log(`Navigating to: ${page}`);
    
    // Add notification for demo
    this.addNotification(
      'info',
      `Navigated to ${page.charAt(0).toUpperCase() + page.slice(1)} section`,
      'Navigation'
    );
  }

  addNotification(type, message, channel = 'System') {
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    
    const iconMap = {
      info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
      success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z'
    };
    
    notificationItem.innerHTML = `
      <div class="notification-icon ${type}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="${iconMap[type]}"/>
        </svg>
      </div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
        <div class="notification-meta">
          <span class="notification-time">just now</span>
          <span class="notification-channel">${channel}</span>
        </div>
      </div>
    `;
    
    // Add to top of list
    this.notificationList.insertBefore(notificationItem, this.notificationList.firstChild);
    
    // Update notification count
    const countElement = document.querySelector('.notification-count');
    const currentCount = parseInt(countElement.textContent);
    countElement.textContent = currentCount + 1;
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notificationItem.parentNode) {
        notificationItem.remove();
        const newCount = parseInt(countElement.textContent) - 1;
        countElement.textContent = Math.max(0, newCount);
      }
    }, 30000);
  }

  setupNotificationListeners() {
    // Add click listeners to existing notifications
    const notifications = this.notificationList.querySelectorAll('.notification-item');
    notifications.forEach(notification => {
      notification.addEventListener('click', () => {
        notification.style.opacity = '0.5';
        setTimeout(() => {
          notification.remove();
          this.updateNotificationCount();
        }, 200);
      });
    });
  }

  clearNotifications() {
    const notifications = this.notificationList.querySelectorAll('.notification-item');
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          notification.remove();
        }, 200);
      }, index * 100);
    });
    
    // Reset count
    setTimeout(() => {
      document.querySelector('.notification-count').textContent = '0';
    }, notifications.length * 100 + 200);
  }

  updateNotificationCount() {
    const count = this.notificationList.querySelectorAll('.notification-item').length;
    document.querySelector('.notification-count').textContent = count;
  }

  destroy() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
    }
  }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DashboardManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.dashboardManager) {
    window.dashboardManager.destroy();
  }
});