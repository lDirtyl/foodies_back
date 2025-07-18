document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('main-nav');
    const categoryFilter = document.getElementById('category-filter');
    const recipesGrid = document.getElementById('recipes-grid');
    const searchForm = document.getElementById('search-form');
    const searchKeywordInput = document.getElementById('search-keyword');
    const paginationControls = document.getElementById('pagination-controls');
    const recipesDisplayTitle = document.querySelector('#recipes-display h2');

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('token');
    let currentPage = 1;
    let currentQuery = {};

    // --- Dynamic Navigation ---
    const setupNavigation = () => {
        if (token) {
            mainNav.innerHTML = `
                <a href="/my_recipes.html">My Recipes</a>
                <a href="/add_recipe_page.html">Add Recipe</a>
                <a href="#" id="logout-btn">Logout</a>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.reload();
            });
        } else {
            // Using your user-block.html for login/register
            mainNav.innerHTML = `<a href="/user-block.html">Login / Register</a>`;
        }
    };

    // --- Data Fetching ---
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const categories = await response.json();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchRecipes = async (query = {}, page = 1) => {
        const { keyword, category } = query;
        let url = `${API_BASE_URL}/recipes?page=${page}`;
        if (keyword) url += `&keyword=${keyword}`;
        if (category) url += `&category=${category}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch recipes');
            const data = await response.json();
            displayRecipes(data.recipes);
            setupPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipesGrid.innerHTML = '<p>Could not load recipes.</p>';
        }
    };

    // --- UI Rendering ---
    const displayRecipes = (recipes) => {
        recipesGrid.innerHTML = '';
        if (recipes.length === 0) {
            recipesGrid.innerHTML = '<p>No recipes found.</p>';
            return;
        }
        recipes.forEach(recipe => {
            const card = document.createElement('a');
            card.href = `/recipe_page.html?id=${recipe.id}`;
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.thumb || 'placeholder.jpg'}" alt="${recipe.title}">
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                </div>
            `;
            recipesGrid.appendChild(card);
        });
    };

    const setupPagination = (pagination) => {
        paginationControls.innerHTML = '';
        if (pagination.page > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Previous';
            prevBtn.onclick = () => {
                currentPage--;
                fetchRecipes(currentQuery, currentPage);
            };
            paginationControls.appendChild(prevBtn);
        }
        if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.onclick = () => {
                currentPage++;
                fetchRecipes(currentQuery, currentPage);
            };
            paginationControls.appendChild(nextBtn);
        }
    };

    // --- Event Handlers ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1;
        currentQuery = {
            keyword: searchKeywordInput.value,
            category: categoryFilter.value
        };
        recipesDisplayTitle.textContent = 'Search Results';
        fetchRecipes(currentQuery, currentPage);
    });

    // --- Initial Load ---
    setupNavigation();
    fetchCategories();
    fetchRecipes(); // Fetch popular recipes on initial load
});
