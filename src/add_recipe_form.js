// Проверка авторизации (пример: по localStorage, cookie или глобальной переменной)
function isUserLoggedIn() {
    // Здесь можно поменять на свою реальную логику
    // Например, если есть токен в localStorage:
    // return !!localStorage.getItem('token');
    return window.isUserLoggedIn === true; // для теста
}

function createRecipeButtons() {
    if (!isUserLoggedIn()) return;
    
    // Создаём контейнер для кнопок
    const btnContainer = document.createElement('div');
    btnContainer.style.margin = '40px 0 20px 0';
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '16px';
    btnContainer.id = 'create-recipe-btns';

    // Кнопка для модального окна
    const modalBtn = document.createElement('button');
    modalBtn.textContent = 'Створити рецепт (модальне вікно)';
    modalBtn.style.padding = '10px 20px';
    modalBtn.style.fontSize = '16px';
    modalBtn.onclick = openRecipeModal;

    // Кнопка для перехода на отдельную страницу
    const pageBtn = document.createElement('button');
    pageBtn.textContent = 'Створити рецепт (окрема сторінка)';
    pageBtn.style.padding = '10px 20px';
    pageBtn.style.fontSize = '16px';
    pageBtn.onclick = function() {
        window.location.href = '/create-recipe'; // поменяйте на свой реальный путь
    };

    btnContainer.appendChild(modalBtn);
    btnContainer.appendChild(pageBtn);

    // Вставляем кнопки в начало body
    document.body.insertBefore(btnContainer, document.body.firstChild);
}

function openRecipeModal() {
    // Создаём модальное окно на весь экран
    let modal = document.getElementById('recipe-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recipe-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';

        const inner = document.createElement('div');
        inner.style.background = '#fff';
        inner.style.padding = '40px';
        inner.style.borderRadius = '16px';
        inner.style.maxWidth = '600px';
        inner.style.width = '90vw';
        inner.innerHTML = '<h2 style="margin-bottom:24px;">Тут будет форма создания рецепта</h2><button id="close-modal-btn" style="padding:10px 20px;">Закрыть</button>';
        modal.appendChild(inner);
        document.body.appendChild(modal);

        document.getElementById('close-modal-btn').onclick = function() {
            modal.remove();
        };
    }
}

window.addEventListener('DOMContentLoaded', createRecipeButtons);

// Для теста: включить залогиненность
window.isUserLoggedIn = true; // уберите или замените на свою механику
