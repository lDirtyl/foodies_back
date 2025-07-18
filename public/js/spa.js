document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const categoryGridContainer = document.getElementById('category-grid-container');
    const categoryGrid = document.getElementById('category-grid');
    const recipeViewContainer = document.getElementById('recipe-view-container');
    const recipeViewTitle = document.getElementById('recipe-view-title');
    const recipeListGrid = document.getElementById('recipe-list-grid');
    const backToCategoriesBtn = document.getElementById('back-to-categories-btn');
    const ingredientFilter = document.getElementById('spa-ingredient-filter');
    const areaFilter = document.getElementById('spa-area-filter');

    // --- State Management ---
    let currentCategory = null;
    let currentPage = 1;
    const recipesPerPage = 12;
    let isLoading = false;
    let allIngredientsForCategory = [];
    let allAreasForCategory = [];

    // --- API Calls ---
    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            return null;
        }
    };

    // --- Rendering Functions ---
    const renderCategories = (categories) => {
        categoryGrid.innerHTML = '';
        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="${category.thumb || 'img/default-category.jpg'}" alt="${category.name}">
                <h3>${category.name}</h3>
            `;
            card.addEventListener('click', () => showRecipeView(category));
            categoryGrid.appendChild(card);
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
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.thumb || 'img/default-recipe.jpg'}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
            `;
            recipeListGrid.appendChild(card);
        });
    };

    const populateSelect = (selectElement, allOptions, activeOptions, defaultOptionText) => {
        const currentValue = selectElement.value;
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        const activeIds = new Set(activeOptions.map(item => item.id));

        allOptions.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            // Disable the option if the active list has items and this item is not in it
            if (activeOptions.length > 0 && !activeIds.has(item.id)) {
                option.disabled = true;
                option.style.color = '#aaa';
            }
            selectElement.appendChild(option);
        });
        selectElement.value = currentValue;
    };

    // --- Event Handlers and Logic ---
    const updateFilters = async () => {
        if (!currentCategory) return;

        const selectedIngredient = ingredientFilter.value;
        const selectedArea = areaFilter.value;

        const ingredientParams = new URLSearchParams({ categoryId: currentCategory.id, limit: 1000 });
        if (selectedArea) ingredientParams.append('areaId', selectedArea);
        const activeIngredientsData = await fetchData(`/api/ingredients?${ingredientParams.toString()}`);

        const areaParams = new URLSearchParams({ categoryId: currentCategory.id, limit: 1000 });
        if (selectedIngredient) areaParams.append('ingredientId', selectedIngredient);
        const activeAreasData = await fetchData(`/api/areas?${areaParams.toString()}`);

        populateSelect(ingredientFilter, allIngredientsForCategory, activeIngredientsData ? activeIngredientsData.ingredients : [], 'All Ingredients');
        populateSelect(areaFilter, allAreasForCategory, activeAreasData ? activeAreasData.areas : [], 'All Areas');
    };

    const loadFilteredRecipes = async (append = false) => {
        if (isLoading) return;
        isLoading = true;

        if (!append) {
            currentPage = 1;
        }

        const params = new URLSearchParams({
            category: currentCategory.id,
            page: currentPage,
            limit: recipesPerPage
        });

        if (ingredientFilter.value) params.append('ingredient', ingredientFilter.value);
        if (areaFilter.value) params.append('area', areaFilter.value);

        const data = await fetchData(`/api/recipes?${params.toString()}`);
        renderRecipes(data ? data.recipes : [], append);

        removeLoadMoreButton();
        if (data && data.pagination && (data.pagination.page * data.pagination.limit < data.pagination.total)) {
            addLoadMoreButton();
        }

        isLoading = false;
    };

    const showRecipeView = async (category) => {
        currentCategory = category;
        categoryGridContainer.style.display = 'none';
        recipeViewContainer.style.display = 'block';
        recipeViewTitle.textContent = `${category.name} Recipes`;
        
        ingredientFilter.value = '';
        areaFilter.value = '';

        const ingredientsData = await fetchData(`/api/ingredients?categoryId=${category.id}&limit=1000`);
        allIngredientsForCategory = ingredientsData ? ingredientsData.ingredients : [];
        
        const areasData = await fetchData(`/api/areas?categoryId=${category.id}&limit=1000`);
        allAreasForCategory = areasData ? areasData.areas : [];

        populateSelect(ingredientFilter, allIngredientsForCategory, allIngredientsForCategory, 'All Ingredients');
        populateSelect(areaFilter, allAreasForCategory, allAreasForCategory, 'All Areas');
        
        loadFilteredRecipes(false);
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
            recipeViewContainer.appendChild(button);
        }
        button.style.display = 'block';
        button.onclick = () => {
            currentPage++;
            loadFilteredRecipes(true);
        };
    };

    const removeLoadMoreButton = () => {
        const button = document.getElementById('load-more-btn');
        if (button) {
            button.style.display = 'none';
        }
    };

    // --- Initialization ---
    const init = async () => {
        const categoriesData = await fetchData('/api/categories?limit=100');
        if (categoriesData && categoriesData.categories) {
            renderCategories(categoriesData.categories);
        }

        backToCategoriesBtn.addEventListener('click', showCategoryView);

        const handleFilterChange = () => {
            loadFilteredRecipes(false);
            updateFilters();
        };

        ingredientFilter.addEventListener('change', handleFilterChange);
        areaFilter.addEventListener('change', handleFilterChange);

        showCategoryView();
    };

    init();
});
