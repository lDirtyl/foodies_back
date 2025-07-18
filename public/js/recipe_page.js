document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.getElementById('recipe-container');
    const template = document.getElementById('recipe-details-template');

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('token');

    const getRecipeIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const fetchRecipeDetails = async (recipeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);
            if (!response.ok) {
                throw new Error(`Recipe not found. Status: ${response.status}`);
            }
            const recipe = await response.json();
            displayRecipe(recipe);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            recipeContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    };

    const displayRecipe = async (recipe) => {
        let currentUser = null;
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/current`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) currentUser = await response.json();
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        }
        const clone = template.content.cloneNode(true);

        clone.getElementById('recipe-title').textContent = recipe.title;
        clone.getElementById('recipe-category').textContent = `Category: ${recipe.category?.name || 'N/A'}`;
        clone.getElementById('recipe-time').textContent = `Time: ${recipe.time} mins`;
        clone.getElementById('recipe-thumb').src = recipe.thumb || 'placeholder.jpg';
        clone.getElementById('recipe-thumb').alt = recipe.title;
        clone.getElementById('recipe-description').textContent = recipe.description;
        clone.getElementById('recipe-instructions').textContent = recipe.instructions;

        const ingredientsList = clone.getElementById('recipe-ingredients');
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = `${ing.name} - ${ing.RecipeIngredient.measure}`;
            ingredientsList.appendChild(li);
        });

        const addToFavoritesBtn = clone.getElementById('add-to-favorites-btn');
        if (token) {
            addToFavoritesBtn.classList.remove('hidden');
            addToFavoritesBtn.addEventListener('click', () => addToFavorites(recipe.id));
        } else {
            addToFavoritesBtn.classList.add('hidden');
        }

                const editRecipeBtn = clone.getElementById('edit-recipe-btn');
        if (currentUser && recipe.owner && currentUser.id === recipe.owner.id) {
            editRecipeBtn.style.display = 'block';
            editRecipeBtn.addEventListener('click', () => {
                window.location.href = `/edit_recipe_page.html?id=${recipe.id}`;
            });
        }

        recipeContainer.appendChild(clone);
    };

    const addToFavorites = async (recipeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Recipe added to favorites!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add to favorites');
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const recipeId = getRecipeIdFromUrl();
    if (recipeId) {
        fetchRecipeDetails(recipeId);
    } else {
        recipeContainer.innerHTML = '<p>No recipe ID provided.</p>';
    }
});
