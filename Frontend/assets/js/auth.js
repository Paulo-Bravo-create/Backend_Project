
const API_BASE_URL = 'http://localhost:3000/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    
    const token = localStorage.getItem('moodnight_jwt');
    if (token) {
       
        window.location.href = 'dashboard.html';
        return;
    }
    
    
    const authForm = document.getElementById('authForm');
    const fullNameInput = document.getElementById('fullNameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');

  
    const showMessage = (element, message, isError = false) => {
        authError.classList.add('d-none');
        authSuccess.classList.add('d-none');
        
        if (isError) {
            authError.textContent = message;
            authError.classList.remove('d-none');
        } else {
            authSuccess.textContent = message;
            authSuccess.classList.remove('d-none');
        }
    };

    /**
     * Handles the API call for both Register and Login
     * @param {string} endpoint - 'register' or 'login'
     */
    
    const handleAuth = async (endpoint) => {
        const full_name = fullNameInput ? fullNameInput.value.trim() : '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        
        if (!email || !password) {
            return showMessage(authError, 'Please enter both email and password.', true);
        }
        if (endpoint === 'register' && !full_name) {
            return showMessage(authError, 'Please enter your full name for registration.', true);
        }
        if (password.length < 8) {
            return showMessage(authError, 'Password must be at least 8 characters.', true);
        }
        
        showMessage(authSuccess, 'Processing...', false);

        const payload = { email, password };
        if (endpoint === 'register') {
            payload.full_name = full_name;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (endpoint === 'register') {
                    
                    showMessage(authSuccess, 'Registration successful! You can now log in.', false);
                } else {
                   
                    localStorage.setItem('moodnight_jwt', data.token);
                    localStorage.setItem('moodnight_user_name', data.user.full_name);
                    
                    showMessage(authSuccess, 'Login successful. Redirecting to dashboard...', false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }
            } else {
               
                showMessage(authError, data.message || `API error during ${endpoint}.`, true);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showMessage(authError, 'Could not connect to the server. Check console for details.', true);
        }
    };

 
    
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('register');
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('login');
    });


    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        handleAuth('login'); 
    });
});