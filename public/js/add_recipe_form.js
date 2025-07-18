document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recipe-form');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const categorySelect = document.getElementById('recipe-category');
    const ingredientSelect = document.getElementById('ingredient-select');
    const timeValueSpan = document.getElementById('time-value');
    const timeMinusBtn = document.getElementById('time-minus');
    const timePlusBtn = document.getElementById('time-plus');
    const recipeTimeInput = document.getElementById('recipe-time');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const selectedIngredientsList = document.getElementById('selected-ingredients-list');

    let selectedIngredients = [];

    // 1. Image Preview
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

    // 2. Fetch Categories and Ingredients
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
                option.value = item._id || item.id; // Adjust based on your API response
                option.textContent = item.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`Failed to fetch ${placeholder}:`, error);
        }
    }

    fetchData('/api/categories', categorySelect, 'Category');
    fetchData('/api/ingredients', ingredientSelect, 'Add the ingredient');

    // 3. Time Selector
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

    // 4. Manage Ingredients
    addIngredientBtn.addEventListener('click', () => {
        const ingredientId = ingredientSelect.value;
        const ingredientName = ingredientSelect.options[ingredientSelect.selectedIndex].text;
        const quantity = document.getElementById('ingredient-quantity').value.trim();

        if (!ingredientId || !quantity) {
            alert('Please select an ingredient and enter a quantity.');
            return;
        }

        if (selectedIngredients.some(ing => ing.id === ingredientId)) {
            alert('This ingredient has already been added.');
            return;
        }

        selectedIngredients.push({ id: ingredientId, measure: quantity });
        renderSelectedIngredients();
        
        // Reset fields
        ingredientSelect.value = '';
        document.getElementById('ingredient-quantity').value = '';
    });

    function renderSelectedIngredients() {
        selectedIngredientsList.innerHTML = '';
        selectedIngredients.forEach((ing, index) => {
            const ingredientName = document.querySelector(`#ingredient-select option[value="${ing.id}"]`).textContent;
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                <span>${ingredientName} - ${ing.measure}</span>
                <button type="button" class="remove-ingredient-btn" data-index="${index}">×</button>
            `;
            selectedIngredientsList.appendChild(tag);
        });
    }

    selectedIngredientsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient-btn')) {
            const index = e.target.dataset.index;
            selectedIngredients.splice(index, 1);
            renderSelectedIngredients();
        }
    });

    // 5. Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('recipe-title').value);
        formData.append('categoryId', document.getElementById('recipe-category').value);
        formData.append('description', document.getElementById('recipe-description').value);
        formData.append('time', recipeTimeInput.value);
        formData.append('instructions', document.getElementById('recipe-preparation').value);
        formData.append('ingredients', JSON.stringify(selectedIngredients));

        if (imageUpload.files[0]) {
            formData.append('thumb', imageUpload.files[0]);
        }

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create recipe');
            }

            alert('Recipe created successfully!');
            window.location.href = '/user_page.html'; // Redirect to the user's profile page

        } catch (error) {
            console.error('Error creating recipe:', error);
            alert(`Error: ${error.message}`);
        }
    });
});
