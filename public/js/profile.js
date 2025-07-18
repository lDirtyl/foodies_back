document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html'; // Redirect if not logged in
        return;
    }

    const getUserIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        if (pathParts[1] === 'user' && pathParts[2]) {
            return pathParts[2];
        }
        return null;
    };

    const fetchUserData = async (userId) => {
        const url = userId ? `/api/users/${userId}/details` : '/api/users/current';
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const renderUserProfile = (userData) => {
        if (!userData) return;
        document.getElementById('profile-name').textContent = userData.name;
        document.getElementById('profile-email').textContent = userData.email;
        document.getElementById('current-avatar').src = userData.avatarURL || '/img/default-avatar.png';
        document.getElementById('recipes-count').textContent = userData.recipesCount || 0;
        document.getElementById('favorites-count').textContent = userData.favoritesCount || 0;
        document.getElementById('followers-count').textContent = userData.followersCount || 0;
        document.getElementById('following-count').textContent = userData.followingCount || 0;
    };

    const userId = getUserIdFromUrl();
    const userData = await fetchUserData(userId);
    renderUserProfile(userData);
});
