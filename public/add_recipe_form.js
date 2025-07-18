document.addEventListener('DOMContentLoaded', () => {
  const addRecipeForm = document.getElementById('add-recipe-form');
  const categorySelect = document.getElementById('category-select');
  const ingredientsList = document.getElementById('ingredients-list');
  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  const timeDecrementBtn = document.getElementById('time-decrement');
  const timeIncrementBtn = document.getElementById('time-increment');
  const timeValueSpan = document.getElementById('time-value');

  const API_BASE_URL = '/api';
  const token = localStorage.getItem('token'); // Assuming token is in localStorage

  if (!token) {
    // Redirect to login if not authenticated
    // window.location.href = '/login.html'; 
    console.warn('User is not authenticated. Redirect to login is required.');
  }

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const categories = await response.json();
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Add new ingredient selector
  const addIngredientSelector = async () => {
    const listItem = document.createElement('li');
    const ingredientSelect = document.createElement('select');
    ingredientSelect.className = 'ingredient-select';
    const measureInput = document.createElement('input');
    measureInput.type = 'text';
    measureInput.className = 'ingredient-measure';
    measureInput.placeholder = 'Measure';
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-ingredient-btn';
    removeBtn.type = 'button';

    removeBtn.onclick = () => listItem.remove();

    try {
        const response = await fetch(`${API_BASE_URL}/ingredients`);
        if (!response.ok) throw new Error('Failed to fetch ingredients');
        const ingredients = await response.json();
        ingredients.forEach(ing => {
            const option = document.createElement('option');
            option.value = ing.id;
            option.textContent = ing.name;
            ingredientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
    }

    listItem.appendChild(ingredientSelect);
    listItem.appendChild(measureInput);
    listItem.appendChild(removeBtn);
    ingredientsList.appendChild(listItem);
  };

  // Cooking time controls
  timeDecrementBtn.addEventListener('click', () => {
    let currentValue = parseInt(timeValueSpan.textContent);
    if (currentValue > 5) {
      timeValueSpan.textContent = currentValue - 5;
    }
  });

  timeIncrementBtn.addEventListener('click', () => {
    let currentValue = parseInt(timeValueSpan.textContent);
    timeValueSpan.textContent = currentValue + 5;
  });

  // Add ingredient button
  addIngredientBtn.addEventListener('click', addIngredientSelector);

  // Form submission
  addRecipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- Image Upload --- 
    // This part requires integration with a service like Cloudinary.
    // 1. Get the file from the input: `const imageFile = document.getElementById('photo-upload').files[0];`
    // 2. Upload the file to Cloudinary using their SDK/API.
    // 3. Get the secure URL of the uploaded image.
    // For now, we'll use a placeholder URL.
    const imageUrl = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/your-image-id.jpg'; // Placeholder

    const ingredientsData = Array.from(ingredientsList.children).map(item => ({
      id: item.querySelector('.ingredient-select').value,
      measure: item.querySelector('.ingredient-measure').value,
    }));

    const formData = new FormData();
    const imageFile = document.getElementById('photo-upload').files[0];

    if (imageFile) {
      formData.append('thumb', imageFile);
    }

    formData.append('title', document.getElementById('recipe-name').value);
    formData.append('instructions', document.getElementById('preparation-textarea').value);
    formData.append('time', timeValueSpan.textContent);
    formData.append('categoryId', categorySelect.value);
    formData.append('ingredients', JSON.stringify(ingredientsData)); // Stringify for FormData

    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type' is not needed; browser sets it for FormData
        },
        body: formData,
      });

      if (response.status === 201) {
        const newRecipe = await response.json();
        alert('Recipe created successfully!');
        // Redirect to the new recipe's page
        window.location.href = `/recipe_page.html?id=${newRecipe.id}`;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create recipe');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Initial data fetch
  fetchCategories();
  addIngredientSelector(); // Add the first ingredient selector by default
});
