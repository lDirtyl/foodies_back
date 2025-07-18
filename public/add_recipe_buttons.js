async function openRecipeModal() {
    let modal = document.getElementById('recipe-modal');
    if (modal) return;

    // Блокируем прокрутку фона
    document.body.style.overflow = 'hidden';

    modal = document.createElement('div');
    modal.id = 'recipe-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    modal.style.overflowY = 'auto';

    const inner = document.createElement('div');
    inner.style.background = '#fff';
    inner.style.padding = '40px';
    inner.style.borderRadius = '16px';
    inner.style.maxWidth = '90vw';
    inner.style.maxHeight = '90vh';
    inner.style.width = '1200px';
    inner.style.position = 'relative';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '15px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'transparent';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        modal.remove();
        // Восстанавливаем прокрутку фона
        document.body.style.overflow = '';
    };

    inner.appendChild(closeBtn);

    try {
        const response = await fetch('/add_recipe_page.html');
        const formHtml = await response.text();
        const formContent = document.createElement('div');
        formContent.innerHTML = formHtml;
        // We need to append the scripts from the fetched html manually to make them work
        const scripts = formContent.querySelectorAll('script');
        inner.appendChild(formContent);
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if(script.src){
                newScript.src = script.src;
            } else {
                newScript.innerHTML = script.innerHTML;
            }
            document.body.appendChild(newScript);
        })

    } catch (error) {
        console.error('Error fetching recipe form:', error);
        inner.innerHTML += '<p>Error loading form. Please try again later.</p>';
    }

    modal.appendChild(inner);
    document.body.appendChild(modal);
}

/**
 * Инициализирует кнопку открытия модального окна добавления рецепта.
 * Находит кнопку и навешивает на нее обработчик клика.
 */
function initAddRecipeButton() {
    const modalBtn = document.getElementById('add-recipe-modal-btn');
    if (modalBtn) {
        modalBtn.addEventListener('click', openRecipeModal);
    } else {
        console.error('Кнопка для открытия модального окна рецепта не найдена.');
    }
}

// Экспортируем функцию для вызова из других скриптов
window.initAddRecipeButton = initAddRecipeButton;

