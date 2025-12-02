/**
 * Login System
 * Hidden credentials: username=saied, password=saied
 */

// Hidden login credentials (encoded for security)
const LOGIN_CREDENTIALS = {
    // username: saied, password: saied (base64 encoded)
    username: atob('c2FpZWQ='), // 'saied'
    password: atob('c2FpZWQ=')  // 'saied'
};

// Session management
const SESSION_KEY = 'employee_management_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if user is already logged in
 */
function checkLoginStatus() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            if (sessionData.timestamp && (now - sessionData.timestamp < SESSION_TIMEOUT)) {
                // Session is valid, redirect to main page
                window.location.href = 'index.html';
                return true;
            } else {
                // Session expired
                localStorage.removeItem(SESSION_KEY);
            }
        } catch (error) {
            // Invalid session data
            localStorage.removeItem(SESSION_KEY);
        }
    }
    return false;
}

/**
 * Create user session
 */
function createSession(username) {
    const sessionData = {
        username: username,
        timestamp: new Date().getTime(),
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Validate login credentials
 */
function validateLogin(username, password) {
    // Compare with hidden credentials
    return username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password;
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.querySelector('.login-btn');
    const errorElement = document.getElementById('error-message');
    
    // Hide previous error
    errorElement.classList.add('hidden');
    
    // Validate input
    if (!username || !password) {
        showError('Please enter both username and password.');
        return;
    }
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simulate login delay (for better UX)
    setTimeout(() => {
        if (validateLogin(username, password)) {
            // Success - create session and redirect
            createSession(username);
            
            // Show success briefly before redirect
            loginBtn.textContent = 'Login Successful!';
            loginBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            // Failed login
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            showError('Invalid username or password. Please try again.');
            
            // Clear password field
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    }, 1000); // 1 second delay to simulate server request
}

/**
 * Initialize login page
 */
function initializeLogin() {
    // Check if already logged in
    if (checkLoginStatus()) {
        return; // Will redirect automatically
    }
    
    // Add form event listener
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // Focus on username field
    document.getElementById('username').focus();
    
    // Add keyboard shortcut (Enter to submit)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.id === 'username' || activeElement.id === 'password') {
                handleLogin(event);
            }
        }
    });
    
    console.log('Login page initialized');
    console.log('Hint: Check the page source for login credentials 😉');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogin);

/**
 * Utility function to logout (can be called from main app)
 */
function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

// Export for use in main application
if (typeof window !== 'undefined') {
    window.logout = logout;
    window.checkLoginStatus = checkLoginStatus;
}