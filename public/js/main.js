document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('main-nav');
    const token = localStorage.getItem('token');

    // --- Dynamic Navigation ---
    const setupNavigation = () => {
        if (!mainNav) return; // Exit if nav element doesn't exist

        if (token) {
            mainNav.innerHTML = `
                <a href="/my_recipes.html">My Recipes</a>
                <a href="/add_recipe_page.html">Add Recipe</a>
                <a href="#" id="logout-btn">Logout</a>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.reload();
                });
            }
        } else {
            mainNav.innerHTML = `<a href="/user-block.html">Login / Register</a>`;
        }
    };

    // --- Initial Load ---
    setupNavigation();

    // --- Recipe Card Details Button ---
    document.body.addEventListener('click', (e) => {
        const detailsButton = e.target.closest('.details-btn');
        if (detailsButton) {
            const recipeId = detailsButton.dataset.recipeId;
            if (recipeId) {
                window.location.href = `/recipe_page.html?id=${recipeId}`;
            }
        }
    });
});
