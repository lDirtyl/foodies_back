document.addEventListener('DOMContentLoaded', () => {
    // Note: The forms might not be on every page, so we check for their existence.
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    const API_BASE_URL = '/api/users';

    // --- Registration Handler ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('input[name="name"]').value;
            const email = registerForm.querySelector('input[name="email"]').value;
            const password = registerForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                if (response.status === 201) {
                    alert('Registration successful! Please log in.');
                    window.location.reload(); // Or switch to login tab
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // --- Login Handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const { token } = await response.json();
                    localStorage.setItem('token', token);
                    alert('Login successful!');
                    window.location.href = '/index.html'; // Redirect to homepage
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // --- SPA Navigation for Profile Link ---
    // We use event delegation on the body because the #profile-link is added dynamically.
    document.body.addEventListener('click', async (event) => {
        const profileLink = event.target.closest('#profile-link');
        if (profileLink) {
            event.preventDefault();
            const mainContent = document.querySelector('main-content');

            if (mainContent) {
                try {
                    const response = await fetch('/profile.html');
                    if (!response.ok) throw new Error('Failed to load profile page');
                    mainContent.innerHTML = await response.text();

                    // Clean up old script and add new one to run profile page logic
                    const oldScript = document.querySelector('script[src="/js/profile.js"]');
                    if (oldScript) oldScript.remove();

                    const newScript = document.createElement('script');
                    newScript.src = '/js/profile.js';
                    newScript.type = 'module';
                    document.body.appendChild(newScript);

                } catch (error) {
                    console.error('SPA nav error:', error);
                    mainContent.innerHTML = '<p>Error loading page.</p>';
                }
            } else {
                // Fallback if main-content isn't on the page, just navigate normally
                window.location.href = profileLink.href;
            }
        }
    });
});
