document.addEventListener('DOMContentLoaded', () => {
    const ownRecipesList = document.getElementById('own-recipes-list');
    const favoriteRecipesList = document.getElementById('favorite-recipes-list');

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('User not authenticated. Redirecting to login.');
        // window.location.href = '/login.html'; // Or your user-block login form
        return;
    }

    const createRecipeCard = (recipe, isOwn) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.thumb || 'placeholder.jpg'}" alt="${recipe.title}">
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <p>${recipe.description || 'No description available.'}</p>
            </div>
            <div class="recipe-card-actions">
                ${isOwn 
                    ? `<button class="btn-delete" data-id="${recipe.id}">Delete</button>` 
                    : `<button class="btn-unfavorite" data-id="${recipe.id}">Unfavorite</button>`}
            </div>
        `;
        return card;
    };

    const fetchAndDisplayRecipes = async (url, container, isOwn) => {
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch recipes. Status: ${response.status}`);
            const result = await response.json();
            const recipes = result.recipes || [];

            container.innerHTML = ''; // Clear existing content
            if (recipes.length === 0) {
                container.innerHTML = '<p>No recipes found.</p>';
                return;
            }

            recipes.forEach(recipe => {
                const card = createRecipeCard(recipe, isOwn);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching recipes:', error);
            container.innerHTML = `<p>Error loading recipes: ${error.message}</p>`;
        }
    };

    const handleDelete = async (e) => {
        if (!e.target.matches('.btn-delete')) return;
        const recipeId = e.target.dataset.id;
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                alert('Recipe deleted successfully.');
                e.target.closest('.recipe-card').remove();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleUnfavorite = async (e) => {
        if (!e.target.matches('.btn-unfavorite')) return;
        const recipeId = e.target.dataset.id;

        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/favorite`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Recipe removed from favorites.');
                e.target.closest('.recipe-card').remove();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to unfavorite recipe');
            }
        } catch (error) {
            console.error('Error unfavoriting recipe:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Initial fetch
    fetchAndDisplayRecipes(`${API_BASE_URL}/recipes/own`, ownRecipesList, true);
    fetchAndDisplayRecipes(`${API_BASE_URL}/recipes/favorites`, favoriteRecipesList, false);

    // Add event listeners
    ownRecipesList.addEventListener('click', handleDelete);
    favoriteRecipesList.addEventListener('click', handleUnfavorite);
});
