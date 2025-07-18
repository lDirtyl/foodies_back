document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const signInModal = document.getElementById('signin-modal');
    const signUpModal = document.getElementById('signup-modal');
    const logoutModal = document.getElementById('logout-modal');
    const modals = [signInModal, signUpModal, logoutModal];

    // Forms and Errors
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    const signInError = document.getElementById('signin-error');
    const signUpError = document.getElementById('signup-error');

    // --- Modal Control --- //
    const setActiveAuthButton = (activeBtnId) => {
        const signInBtn = document.getElementById('open-signin-modal');
        const signUpBtn = document.getElementById('open-signup-modal');
        if (!signInBtn || !signUpBtn) return;

        signInBtn.classList.remove('active');
        signUpBtn.classList.remove('active');

        if (activeBtnId === 'open-signin-modal') {
            signInBtn.classList.add('active');
        } else if (activeBtnId === 'open-signup-modal') {
            signUpBtn.classList.add('active');
        }
    };

    const openModal = (modal) => {
        modal.style.display = 'flex';
        if (modal.id === 'signin-modal') setActiveAuthButton('open-signin-modal');
        if (modal.id === 'signup-modal') setActiveAuthButton('open-signup-modal');
    };
    const closeModal = (modal) => {
        modal.style.display = 'none';
        setActiveAuthButton(null); // Clear active state
    };

    // General closing behavior
    modals.forEach(modal => {
        if (!modal) return;
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // --- Event Listeners for Opening Modals --- //
    // These listeners are set up in header.js after the templates are cloned.
    // We use event delegation on the document to catch clicks from dynamically added elements.
    document.addEventListener('click', (e) => {
        if (e.target.id === 'open-signin-modal') openModal(signInModal);
        if (e.target.id === 'open-signup-modal') openModal(signUpModal);
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            openModal(logoutModal);
        }
        // Switching between modals
        if (e.target.id === 'switch-to-signup') {
            closeModal(signInModal);
            openModal(signUpModal);
        }
        if (e.target.id === 'switch-to-signin') {
            closeModal(signUpModal);
            openModal(signInModal);
        }
    });

    // --- Form Submission --- //
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            signInError.textContent = '';
            const formData = new FormData(signInForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Login failed');
                
                localStorage.setItem('token', result.token);
                window.location.reload();
            } catch (error) {
                signInError.textContent = error.message;
            }
        });
    }

    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            signUpError.textContent = '';
            const formData = new FormData(signUpForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Registration failed');

                // Automatically log in the user after successful registration
                localStorage.setItem('token', result.token);
                window.location.reload();
            } catch (error) {
                signUpError.textContent = error.message;
            }
        });
    }

    // --- Logout Logic --- //
    if (logoutModal) {
        const confirmBtn = document.getElementById('confirm-logout-btn');
        const cancelBtn = document.getElementById('cancel-logout-btn');

        confirmBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });

        cancelBtn.addEventListener('click', () => closeModal(logoutModal));
    }
});
