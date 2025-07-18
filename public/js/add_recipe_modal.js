document.addEventListener('DOMContentLoaded', () => {
    const addRecipeModal = document.getElementById('add-recipe-modal');
    if (!addRecipeModal) return;

    const form = document.getElementById('recipe-form-modal');
    const categorySelect = document.getElementById('recipe-category-modal');
    const ingredientsList = document.getElementById('ingredients-list-modal');
    const addIngredientBtn = document.getElementById('add-ingredient-modal');

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('token');

    const fetchAndPopulate = async (url, selectElement, valueField, textField) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
            let data = await response.json();
            // Handle cases where API returns { categories: [...] }
            const items = Array.isArray(data) ? data : data.categories;
            if (!items) {
                console.error('Could not find an array to populate dropdown from response:', data);
                return;
            }
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`Error populating ${selectElement.id}:`, error);
        }
    };

    const addIngredientSelector = async () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';

        const select = document.createElement('select');
        select.name = 'ingredient-name';
        await fetchAndPopulate(`${API_BASE_URL}/ingredients`, select, 'id', 'name');

        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.name = 'ingredient-quantity';
        quantityInput.placeholder = 'Enter quantity';

        row.appendChild(select);
        row.appendChild(quantityInput);
        ingredientsList.appendChild(row);
    };

    // Initial Population
    fetchAndPopulate(`${API_BASE_URL}/categories`, categorySelect, 'id', 'name');
    addIngredientSelector(); // Add the first ingredient row

    // Event Listeners
    addIngredientBtn.addEventListener('click', addIngredientSelector);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!token) {
            alert('You must be logged in to add a recipe.');
            return;
        }

        const formData = new FormData(form);
        const recipeData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            time: formData.get('time'),
            // Placeholder for image URL until upload is implemented
            imageUrl: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/your-image-id.jpg',
            ingredients: []
        };

        const ingredientNames = formData.getAll('ingredient-name');
        const ingredientQuantities = formData.getAll('ingredient-quantity');
        for (let i = 0; i < ingredientNames.length; i++) {
            recipeData.ingredients.push({
                id: ingredientNames[i],
                measure: ingredientQuantities[i]
            });
        }

        try {
            const response = await fetch(`${API_BASE_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(recipeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add recipe');
            }

            alert('Recipe added successfully!');
            addRecipeModal.style.display = 'none'; // Close modal on success
            location.reload(); // Refresh to see the new recipe
        } catch (error) {
            console.error('Error adding recipe:', error);
            alert(`Error: ${error.message}`);
        }
    });
});
