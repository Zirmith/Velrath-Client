class LoginManager {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadSavedToken();
  }

  initializeElements() {
    this.form = document.getElementById('login-form');
    this.tokenInput = document.getElementById('token-input');
    this.tokenToggle = document.getElementById('token-toggle');
    this.rememberCheckbox = document.getElementById('remember-token');
    this.loginBtn = document.getElementById('login-btn');
    this.loginText = document.getElementById('login-text');
    this.loginSpinner = document.getElementById('login-spinner');
    this.errorMessage = document.getElementById('error-message');
    this.oauthBtn = document.getElementById('oauth-btn');
    
    // Title bar controls
    this.minimizeBtn = document.getElementById('minimize-btn');
    this.maximizeBtn = document.getElementById('maximize-btn');
    this.closeBtn = document.getElementById('close-btn');
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleLogin(e));
    
    // Token visibility toggle
    this.tokenToggle.addEventListener('click', () => this.toggleTokenVisibility());
    
    // OAuth button (placeholder)
    this.oauthBtn.addEventListener('click', () => this.handleOAuthLogin());
    
    // Title bar controls
    this.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    this.maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
    this.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
    
    // Input validation
    this.tokenInput.addEventListener('input', () => this.clearError());
  }

  loadSavedToken() {
    const savedToken = window.electronAPI.getStore('discord_token');
    const rememberToken = window.electronAPI.getStore('remember_token');
    
    if (savedToken && rememberToken) {
      this.tokenInput.value = savedToken;
      this.rememberCheckbox.checked = true;
    }
  }

  toggleTokenVisibility() {
    const isPassword = this.tokenInput.type === 'password';
    this.tokenInput.type = isPassword ? 'text' : 'password';
    
    // Update icon
    const icon = this.tokenToggle.querySelector('svg path');
    if (isPassword) {
      // Eye with slash (hidden)
      icon.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.41-1.41L3.51 1.93 2.1 3.34l2.36 2.36C4.1 6.55 3.5 7.23 3 8.13c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l2.92 2.92 1.41-1.41L12 7z');
    } else {
      // Regular eye (visible)
      icon.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const token = this.tokenInput.value.trim();
    if (!token) {
      this.showError('Please enter a Discord token');
      return;
    }

    this.setLoading(true);
    this.clearError();

    try {
      const result = await window.electronAPI.discordLogin(token);
      
      if (result.success) {
        // Save token if remember is checked
        if (this.rememberCheckbox.checked) {
          window.electronAPI.setStore('discord_token', token);
          window.electronAPI.setStore('remember_token', true);
        } else {
          window.electronAPI.removeStore('discord_token');
          window.electronAPI.removeStore('remember_token');
        }
        
        // Save user data
        window.electronAPI.setStore('user_data', result.user);
        
        // Navigate to dashboard
        await window.electronAPI.navigateToDashboard();
      } else {
        this.showError(result.error || 'Login failed. Please check your token.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('An unexpected error occurred. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  handleOAuthLogin() {
    this.showError('OAuth2 login is coming soon! Please use a Discord user token for now.');
  }

  setLoading(loading) {
    this.loginBtn.disabled = loading;
    this.tokenInput.disabled = loading;
    
    if (loading) {
      this.loginText.style.display = 'none';
      this.loginSpinner.style.display = 'block';
    } else {
      this.loginText.style.display = 'block';
      this.loginSpinner.style.display = 'none';
    }
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  clearError() {
    this.errorMessage.classList.remove('show');
  }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginManager();
});