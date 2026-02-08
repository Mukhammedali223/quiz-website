/**
 * Quiz Website - Client-Side JavaScript
 * Handles authentication, API calls, and UI interactions
 */

// ===== AUTHENTICATION =====

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

/**
 * Get auth token
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
    window.location.href = '/';
}

/**
 * Fetch with authentication header
 */
async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
        const data = await response.json();
        if (data.error && (data.error.includes('Token') || data.error.includes('token'))) {
            logout();
            showToast('Session expired. Please login again.', 'warning');
            return;
        }
    }

    return response;
}

// ===== UI UPDATES =====

/**
 * Update navbar based on auth state
 */
function updateAuthUI() {
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    // Show/hide logged in/out elements
    document.querySelectorAll('.logged-in').forEach(el => {
        el.style.display = loggedIn ? 'flex' : 'none';
    });

    document.querySelectorAll('.logged-out').forEach(el => {
        el.style.display = loggedIn ? 'none' : 'flex';
    });

    document.querySelectorAll('.logged-in-only').forEach(el => {
        el.style.display = loggedIn ? 'inline-flex' : 'none';
    });

    document.querySelectorAll('.logged-out-only').forEach(el => {
        el.style.display = loggedIn ? 'none' : 'inline-flex';
    });

    // Update user role badge
    if (user && document.getElementById('userRole')) {
        const badge = document.getElementById('userRole');
        badge.textContent = user.role;
        badge.className = `user-badge badge-${user.role}`;
    }
}

// ===== FORM HELPERS =====

/**
 * Show field-specific error
 */
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
        errorElement.textContent = message;
    }

    if (inputElement) {
        inputElement.classList.add('error');
    }
}

/**
 * Clear all form errors
 */
function clearErrors() {
    document.querySelectorAll('.error-text').forEach(el => {
        el.textContent = '';
    });

    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== TOAST NOTIFICATIONS =====

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== PASSWORD TOGGLE =====

/**
 * Setup password visibility toggle
 */
function setupPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });
}

// ===== MOBILE NAVIGATION =====

/**
 * Setup mobile nav toggle
 */
function setupMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }
}

// ===== LOGOUT BUTTON =====

/**
 * Setup logout button
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// ===== INITIALIZATION =====

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();
    setupPasswordToggle();
    setupMobileNav();
    setupLogout();
});

// Add slideOut animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);
