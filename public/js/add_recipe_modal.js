document.addEventListener('DOMContentLoaded', () => {
    const addRecipeModal = document.getElementById('add-recipe-modal');
    if (!addRecipeModal) return;

    const initializeModal = () => {
        const closeModalBtn = addRecipeModal.querySelector('.modal-close-btn');
        const form = document.getElementById('recipe-form-modal');
        const imageUpload = document.getElementById('image-upload-modal');
        const imagePreview = document.getElementById('image-preview-modal');
        const uploadPlaceholder = document.getElementById('upload-placeholder-modal');
        const categorySelect = document.getElementById('recipe-category-modal');
        const ingredientSelect = document.getElementById('ingredient-select-modal');
        const timeValueSpan = document.getElementById('time-value-modal');
        const timeMinusBtn = document.getElementById('time-minus-modal');
        const timePlusBtn = document.getElementById('time-plus-modal');
        const recipeTimeInput = document.getElementById('recipe-time-modal');
        const addIngredientBtn = document.getElementById('add-ingredient-btn-modal');
        const selectedIngredientsList = document.getElementById('selected-ingredients-list-modal');

        if (!form || !closeModalBtn) {
            console.error('Core modal elements (form, close button) not found.');
            return;
        }

        let selectedIngredients = [];

        const closeModal = () => {
            addRecipeModal.classList.remove('display-flex');
            addRecipeModal.classList.add('display-none');
        };

        closeModalBtn.addEventListener('click', closeModal);
        addRecipeModal.addEventListener('click', (e) => {
            if (e.target === addRecipeModal) closeModal();
        });

        imageUpload.addEventListener('change', () => {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    uploadPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        let currentTime = 10;
        timeMinusBtn.addEventListener('click', () => {
            if (currentTime > 5) {
                currentTime -= 5;
                timeValueSpan.textContent = `${currentTime} min`;
                recipeTimeInput.value = currentTime;
            }
        });

        timePlusBtn.addEventListener('click', () => {
            currentTime += 5;
            timeValueSpan.textContent = `${currentTime} min`;
            recipeTimeInput.value = currentTime;
        });

        addIngredientBtn.addEventListener('click', () => {
            const ingredientId = ingredientSelect.value;
            const quantity = document.getElementById('ingredient-quantity-modal').value.trim();

            if (!ingredientId || !quantity) return alert('Please select an ingredient and enter a quantity.');
            if (selectedIngredients.some(ing => ing.id === ingredientId)) return alert('This ingredient has already been added.');

            selectedIngredients.push({ id: ingredientId, measure: quantity });
            renderSelectedIngredients();
            ingredientSelect.value = '';
            document.getElementById('ingredient-quantity-modal').value = '';
        });

        function renderSelectedIngredients() {
            selectedIngredientsList.innerHTML = '';
            selectedIngredients.forEach((ing, index) => {
                const option = document.querySelector(`#ingredient-select-modal option[value="${ing.id}"]`);
                const ingredientName = option ? option.textContent : 'Unknown Ingredient';
                const tag = document.createElement('div');
                tag.className = 'ingredient-tag';
                tag.innerHTML = `<span>${ingredientName} - ${ing.measure}</span><button type="button" class="remove-ingredient-btn" data-index="${index}">×</button>`;
                selectedIngredientsList.appendChild(tag);
            });
        }

        selectedIngredientsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ingredient-btn')) {
                selectedIngredients.splice(e.target.dataset.index, 1);
                renderSelectedIngredients();
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('recipe-title-modal').value);
            formData.append('description', document.getElementById('recipe-description-modal').value);
            formData.append('categoryId', categorySelect.value);
            formData.append('time', recipeTimeInput.value);
            formData.append('instructions', document.getElementById('recipe-preparation-modal').value);
            formData.append('ingredients', JSON.stringify(selectedIngredients));
            if (imageUpload.files[0]) formData.append('thumb', imageUpload.files[0]);

            try {
                const response = await fetch('/api/recipes', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: formData
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to create recipe');
                alert('Recipe created successfully!');
                closeModal();
                window.location.reload(); // Reload to see the new recipe on the main page
            } catch (error) {
                console.error('Error creating recipe:', error);
                alert(`Error: ${error.message}`);
            }
        });

        async function fetchData(url, selectElement, placeholder) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const items = Array.isArray(data) ? data : (data.categories || data.ingredients);

                if (!items) {
                    console.error('Could not find an array to populate dropdown from response:', data);
                    return;
                }

                selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
                items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item._id || item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
            } catch (error) {
                console.error(`Failed to fetch ${placeholder}:`, error);
            }
        }

        // Initial data fetch
        fetchData('/api/categories', categorySelect, 'Category');
        fetchData('/api/ingredients', ingredientSelect, 'Add the ingredient');
    };

    // Global function to open the modal
    window.openAddRecipeModal = () => {
        addRecipeModal.classList.remove('display-none');
        addRecipeModal.classList.add('display-flex');
    };

    initializeModal();
});
