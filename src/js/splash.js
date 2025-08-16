class SplashManager {
  constructor() {
    this.currentTip = 1;
    this.totalTips = 4;
    this.tipInterval = null;
    
    this.initializeElements();
    this.setupEventListeners();
    this.startTipRotation();
    this.startLoadingSequence();
  }

  initializeElements() {
    // Title bar controls
    this.minimizeBtn = document.getElementById('minimize-btn');
    this.maximizeBtn = document.getElementById('maximize-btn');
    this.closeBtn = document.getElementById('close-btn');
    
    // Loading elements
    this.loadingProgress = document.querySelector('.loading-progress');
    this.loadingText = document.querySelector('.loading-text');
    
    // Tip elements
    this.tipCards = document.querySelectorAll('.tip-card');
  }

  setupEventListeners() {
    // Title bar controls
    this.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    this.maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
    this.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
  }

  startTipRotation() {
    this.tipInterval = setInterval(() => {
      this.showNextTip();
    }, 2500);
  }

  showNextTip() {
    // Hide current tip
    const currentTipElement = document.getElementById(`tip-${this.currentTip}`);
    if (currentTipElement) {
      currentTipElement.classList.remove('active');
    }
    
    // Move to next tip
    this.currentTip = this.currentTip >= this.totalTips ? 1 : this.currentTip + 1;
    
    // Show next tip
    const nextTipElement = document.getElementById(`tip-${this.currentTip}`);
    if (nextTipElement) {
      setTimeout(() => {
        nextTipElement.classList.add('active');
      }, 300);
    }
  }

  startLoadingSequence() {
    const loadingMessages = [
      'Starting Velrath...',
      'Loading Discord API...',
      'Initializing features...',
      'Almost ready...'
    ];
    
    let messageIndex = 0;
    
    const updateMessage = () => {
      if (messageIndex < loadingMessages.length) {
        this.loadingText.textContent = loadingMessages[messageIndex];
        messageIndex++;
        setTimeout(updateMessage, 750);
      }
    };
    
    updateMessage();
    
    // Navigate to login after loading completes
    setTimeout(() => {
      this.navigateToLogin();
    }, 3500);
  }

  async navigateToLogin() {
    // Check if user is already logged in
    const savedToken = window.electronAPI.getStore('discord_token');
    const userData = window.electronAPI.getStore('user_data');
    
    if (savedToken && userData) {
      // Try to validate the saved token
      try {
        const result = await window.electronAPI.discordLogin(savedToken);
        if (result.success) {
          // Update user data and go to dashboard
          window.electronAPI.setStore('user_data', result.user);
          await window.electronAPI.navigateToDashboard();
          return;
        }
      } catch (error) {
        // Token is invalid, clear it
        window.electronAPI.removeStore('discord_token');
        window.electronAPI.removeStore('user_data');
      }
    }
    
    // Navigate to login
    await window.electronAPI.navigateToLogin();
  }

  destroy() {
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
    }
  }
}

// Initialize splash manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.splashManager = new SplashManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.splashManager) {
    window.splashManager.destroy();
  }
});