document.addEventListener('DOMContentLoaded', () => {
    const headerNavContainer = document.getElementById('header-nav-container');
    const loggedOutTemplate = document.getElementById('logged-out-header-template');
    const loggedInTemplate = document.getElementById('logged-in-header-template');
    const token = localStorage.getItem('token');

    const formatImageUrl = (url) => {
        if (!url) return 'img/default-avatar.png';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            if (url.includes('localhost:3000/public')) {
                return url.split('localhost:3000/public')[1];
            }
            return url;
        }
        return url;
    };

    const setupLoggedInHeader = (user) => {
        const loggedInNode = loggedInTemplate.content.cloneNode(true);
        loggedInNode.getElementById('user-name').textContent = user.name;
        loggedInNode.getElementById('user-avatar').src = formatImageUrl(user.avatarURL);
        headerNavContainer.appendChild(loggedInNode);

        const userProfileToggle = headerNavContainer.querySelector('.user-profile-toggle');
        const userProfileDropdown = headerNavContainer.querySelector('.user-profile-dropdown');

        userProfileToggle.addEventListener('click', () => {
            userProfileDropdown.style.display = userProfileDropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (event) => {
            if (!userProfileToggle.contains(event.target)) {
                userProfileDropdown.style.display = 'none';
            }
        });

        // --- Modal Triggers in Header ---
        const addRecipeModalBtn = document.getElementById('open-add-recipe-modal');
        const addRecipeModal = document.getElementById('add-recipe-modal');
        const logoutBtn = document.getElementById('logout-btn');
        const logoutModal = document.getElementById('logout-modal');

        if (addRecipeModalBtn && addRecipeModal) {
            addRecipeModalBtn.addEventListener('click', () => {
                addRecipeModal.style.display = 'flex';
            });
            const closeBtn = addRecipeModal.querySelector('.modal-close-btn');
            if(closeBtn) {
                closeBtn.addEventListener('click', () => {
                    addRecipeModal.style.display = 'none';
                });
            }
        }

        if (logoutBtn && logoutModal) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutModal.style.display = 'flex';
            });
        }
    };

    const setupLoggedOutHeader = () => {
        const loggedOutNode = loggedOutTemplate.content.cloneNode(true);
        headerNavContainer.appendChild(loggedOutNode);
        // Note: All modal logic for sign-in/sign-up is in auth.js
    };

    if (token) {
        fetch('/api/users/current', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            localStorage.removeItem('token');
            throw new Error('Invalid token');
        })
        .then(data => {
            setupLoggedInHeader(data);
        })
        .catch(error => {
            console.error('Auth check failed:', error.message);
            setupLoggedOutHeader();
        });
    } else {
        setupLoggedOutHeader();
    }
});
