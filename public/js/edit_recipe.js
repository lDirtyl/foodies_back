document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-recipe-form');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeDescription = document.getElementById('recipe-description');
    const recipeCategory = document.getElementById('recipe-category');
    const recipeArea = document.getElementById('recipe-area');
    const recipeTime = document.getElementById('recipe-time');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const ingredientSelect = document.getElementById('ingredient-select');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const recipePreparation = document.getElementById('recipe-preparation');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('token');
    let selectedIngredients = [];

    const getRecipeIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const recipeId = getRecipeIdFromUrl();

    const fetchRecipeData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);
            if (!response.ok) throw new Error('Failed to fetch recipe data');
            const recipe = await response.json();

            recipeTitle.value = recipe.title;
            recipeDescription.value = recipe.description;
            recipeTime.value = recipe.time;
            recipePreparation.value = recipe.instructions;
            if (recipe.thumb) {
                imagePreview.src = recipe.thumb;
                imagePreview.style.display = 'block';
            }

            // Load categories and set the correct one
            await fetchCategories(recipe.categoryId);

            // Load areas and set the correct one
            await fetchAreas(recipe.areaId);

            // Load ingredients for the dropdown
            await fetchAllIngredients();

            // Populate existing ingredients
            selectedIngredients = recipe.ingredients.map(ing => ({ id: ing.id, measure: ing.RecipeIngredient.measure, name: ing.name }));
            renderSelectedIngredients();

        } catch (error) {
            console.error('Error loading recipe data:', error);
            alert('Could not load recipe data.');
        }
    };

    const fetchCategories = async (selectedCategoryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const { categories } = await response.json();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                if (cat.id === selectedCategoryId) {
                    option.selected = true;
                }
                recipeCategory.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAreas = async (selectedAreaId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/areas`);
            const { areas } = await response.json();
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area.id;
                option.textContent = area.name;
                if (area.id === selectedAreaId) {
                    option.selected = true;
                }
                recipeArea.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchAllIngredients = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredients`);
            const { ingredients } = await response.json();
            ingredients.forEach(ing => {
                const option = document.createElement('option');
                option.value = ing.id;
                option.textContent = ing.name;
                ingredientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const renderSelectedIngredients = () => {
        ingredientsContainer.innerHTML = '';
        selectedIngredients.forEach((ing, index) => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `<span>${ing.name} - ${ing.measure}</span><button type="button" class="remove-ingredient-btn" data-index="${index}">×</button>`;
            ingredientsContainer.appendChild(tag);
        });
    };

    addIngredientBtn.addEventListener('click', () => {
        const ingredientId = ingredientSelect.value;
        const ingredientName = ingredientSelect.options[ingredientSelect.selectedIndex].text;
        const quantity = document.getElementById('ingredient-quantity').value.trim();

        if (!ingredientId || !quantity) return alert('Please select an ingredient and enter a quantity.');
        if (selectedIngredients.some(ing => ing.id === ingredientId)) return alert('This ingredient has already been added.');

        selectedIngredients.push({ id: ingredientId, measure: quantity, name: ingredientName });
        renderSelectedIngredients();
        ingredientSelect.value = '';
        document.getElementById('ingredient-quantity').value = '';
    });

    ingredientsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient-btn')) {
            selectedIngredients.splice(e.target.dataset.index, 1);
            renderSelectedIngredients();
        }
    });

    imageUpload.addEventListener('change', () => {
        const file = imageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', recipeTitle.value);
        formData.append('description', recipeDescription.value);
        formData.append('categoryId', recipeCategory.value);
        formData.append('areaId', recipeArea.value);
        formData.append('time', recipeTime.value);
        formData.append('instructions', recipePreparation.value);
        formData.append('ingredients', JSON.stringify(selectedIngredients.map(ing => ({ id: ing.id, measure: ing.measure }))));
        if (imageUpload.files[0]) {
            formData.append('thumb', imageUpload.files[0]);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update recipe');
            }

            alert('Recipe updated successfully!');
            window.location.href = `/recipe_page.html?id=${recipeId}`;
        } catch (error) {
            console.error('Error updating recipe:', error);
            alert(`Error: ${error.message}`);
        }
    });

    if (recipeId) {
        fetchRecipeData();
    } else {
        alert('No recipe ID found. Cannot edit.');
        window.location.href = '/';
    }
});
