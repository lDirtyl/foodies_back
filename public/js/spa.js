document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const categoryGridContainer = document.getElementById('category-grid-container');
    const categoryGrid = document.getElementById('category-grid');
    const recipeViewContainer = document.getElementById('recipe-view-container');
    const recipeListGrid = document.getElementById('recipe-list-grid');
    const backToCategoriesBtn = document.getElementById('back-to-categories-btn');
    const recipeViewTitle = document.getElementById('recipe-view-title');
    const ingredientFilter = document.getElementById('spa-ingredient-filter');
    const areaFilter = document.getElementById('spa-area-filter');
    const mainCategoryFilter = document.getElementById('category-filter');

    // --- State Management ---
    let allCategories = [];
    let currentCategory = null;
    let currentPage = 1;
    const recipesPerPage = 12;
    let isLoading = false;

    // --- Data Fetching ---
    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    };

    // --- Rendering ---
    const renderCategories = (categories) => {
        categoryGrid.innerHTML = '';
        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="/images/categories/${category.name.toLowerCase()}.jpg" alt="${category.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200.png/000000/FFFFFF?text=Image+Not+Found';">
                <div class="category-name">${category.name}</div>
            `;
            card.addEventListener('click', () => {
                const selectedCategory = allCategories.find(c => c.name === category.name);
                if (selectedCategory) {
                    showRecipeView(selectedCategory);
                }
            });
            categoryGrid.appendChild(card);
        });
    };

    const populateMainCategoryFilter = (categories) => {
        if (!mainCategoryFilter) return;
        mainCategoryFilter.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Categories';
        mainCategoryFilter.appendChild(defaultOption);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id; // Categories use _id
            option.textContent = category.name;
            mainCategoryFilter.appendChild(option);
        });
    };

    const renderRecipes = (recipes, append = false) => {
        if (!append) {
            recipeListGrid.innerHTML = '';
        }

        if (!recipes || recipes.length === 0) {
            if (!append) {
                recipeListGrid.innerHTML = '<p>No recipes found for this selection.</p>';
            }
            removeLoadMoreButton();
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${(recipe.thumb && recipe.thumb.replace('recipies', 'recipes')) || 'https://via.placeholder.com/300x180.png/CCCCCC/FFFFFF?text=No+Image'}" alt="${recipe.title}">
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                </div>
            `;
            recipeListGrid.appendChild(card);
        });
    };

    const populateFilters = async (categoryId = null) => {
        let ingredientUrl = `/api/ingredients?limit=1000`;
        let areaUrl = `/api/areas?limit=1000`;

        if (categoryId) {
            ingredientUrl += `&categoryId=${categoryId}`;
            areaUrl += `&categoryId=${categoryId}`;
        }

        const [ingredientsResponse, areasResponse] = await Promise.all([
            fetchData(ingredientUrl),
            fetchData(areaUrl)
        ]);

        const populateSelect = (selectElement, items, defaultOptionText) => {
            const currentValue = selectElement.value;
            selectElement.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = defaultOptionText;
            selectElement.appendChild(defaultOption);

            if (Array.isArray(items)) {
                items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
            }
            selectElement.value = currentValue;
        };

        populateSelect(ingredientFilter, ingredientsResponse?.ingredients, 'All Ingredients');
        populateSelect(areaFilter, areasResponse?.areas, 'All Areas');
    };

    // --- Logic & View Switching ---
    const loadFilteredRecipes = async (append = false) => {
        if (isLoading) return;
        isLoading = true;

        if (!currentCategory) {
            isLoading = false;
            return;
        }

        const params = new URLSearchParams({
            category: currentCategory.id,
            page: currentPage,
            limit: recipesPerPage
        });

        if (ingredientFilter.value) params.append('ingredient', ingredientFilter.value);
        if (areaFilter.value) params.append('area', areaFilter.value);

        const url = `/api/recipes?${params.toString()}`;
        const data = await fetchData(url);
        
        renderRecipes(data ? data.recipes : [], append);

        // Handle 'Load More' button
        removeLoadMoreButton();
        if (data && data.pagination && (data.pagination.page * data.pagination.limit < data.pagination.total)) {
            addLoadMoreButton();
        }

        isLoading = false;
    };

    const showRecipeView = (category) => {
        currentCategory = category;
        currentPage = 1;
        categoryGridContainer.style.display = 'none';
        recipeViewContainer.style.display = 'block';
        recipeViewTitle.textContent = `${category.name} Recipes`;
        
        // Reset filters before populating and loading
        ingredientFilter.value = '';
        areaFilter.value = '';

        loadFilteredRecipes(false); // Load first page of recipes
        populateFilters(category.id); // Populate filters based on category
    };

    const showCategoryView = () => {
        recipeViewContainer.style.display = 'none';
        categoryGridContainer.style.display = 'block';
        currentCategory = null;
        removeLoadMoreButton();
    };

    // --- Pagination ---
    const addLoadMoreButton = () => {
        let button = document.getElementById('load-more-btn');
        if (!button) {
            button = document.createElement('button');
            button.id = 'load-more-btn';
            button.textContent = 'Load More';
            button.className = 'load-more-btn';
            button.addEventListener('click', () => {
                currentPage++;
                loadFilteredRecipes(true); // Append new recipes
            });
            recipeViewContainer.appendChild(button);
        }
    };

    const removeLoadMoreButton = () => {
        const button = document.getElementById('load-more-btn');
        if (button) {
            button.remove();
        }
    };

    // --- Event Handlers ---
    backToCategoriesBtn.addEventListener('click', showCategoryView);

    const handleFilterChange = () => {
        currentPage = 1; // Reset page number on any filter change
        loadFilteredRecipes(false); // Reload recipes from the first page
    };

    ingredientFilter.addEventListener('change', handleFilterChange);
    areaFilter.addEventListener('change', handleFilterChange);

    // --- Initial Load ---
    const initialize = async () => {
        const response = await fetchData('/api/categories?limit=100'); // Fetch all categories
        allCategories = response?.categories || response || [];
        renderCategories(allCategories);
        populateMainCategoryFilter(allCategories);
    };

    initialize();
});
