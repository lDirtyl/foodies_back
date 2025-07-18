// src/userBlockHandlers.js

// === Cloudinary config ===
const CLOUDINARY_CLOUD_NAME = 'dlh9bzjk6';
const CLOUDINARY_PRESET = 'avatar_preset';
// === END Cloudinary config ===

// --- Рендеринг и навешивание обработчиков --- //

/**
 * Навешивает обработчики для состояния "Пользователь залогинен"
 * @param {object} user - Объект пользователя с сервера
 */
function attachLoggedInHandlers(user) {
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('current-avatar').src = user.avatarURL || '/uploads/avatars/default.png';

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
            renderUserBlock(); // Перерисовать блок после выхода
        };
    }

    // Обработчики аватара
    const avatarContainer = document.getElementById('avatar-container');
    const avatarImg = document.getElementById('current-avatar');
    const addIcon = document.getElementById('add-icon-overlay');
    const deleteBtn = document.getElementById('delete-avatar-btn');
    const input = document.getElementById('avatar-input');

    if (avatarContainer && avatarImg && addIcon && deleteBtn && input) {
        addIcon.onclick = () => input.click();

        deleteBtn.onclick = async () => {
            const res = await fetch('/api/users/avatar', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ avatarURL: '' })
            });
            if (res.ok) {
                avatarImg.src = '/uploads/avatars/default.png';
            } else {
                alert('Не вдалося видалити аватарку');
            }
        };

        input.onchange = async e => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_PRESET);
            
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.secure_url) {
                const saveRes = await fetch('/api/users/avatar', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ avatarURL: data.secure_url })
                });
                if (saveRes.ok) {
                    avatarImg.src = data.secure_url;
                } else {
                    alert('Не вдалося оновити аватарку на сервері');
                }
            } else {
                alert('Помилка завантаження на Cloudinary');
            }
        };
    }

    // Инициализируем кнопку добавления рецепта, так как она теперь в DOM
    if (window.initAddRecipeButton) {
        window.initAddRecipeButton();
    }
}

/**
 * Навешивает обработчики для состояния "Пользователь НЕ залогинен"
 */
function attachLoggedOutHandlers() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.onsubmit = async e => {
            e.preventDefault();
            const form = e.target;
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: form.email.value, password: form.password.value })
            });
            if (res.ok) {
                renderUserBlock(); // Перерисовать блок после логина
            } else {
                alert('Помилка логіну');
            }
        };
    }

    if (registerForm) {
        registerForm.onsubmit = async e => {
            e.preventDefault();
            const form = e.target;
            const email = form.email.value;
            const password = form.password.value;
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: form.name.value, email, password })
            });
            if (res.ok) {
                const messageDisplay = document.getElementById('message-display');
                if(messageDisplay) {
                    messageDisplay.textContent = 'Реєстрація успішна! Тепер увійдіть.';
                    messageDisplay.style.color = 'green';
                }
                document.querySelector('#login-form input[name=email]').value = email;
                document.querySelector('#login-form input[name=password]').value = password;
                document.getElementById('login-btn').focus();
            } else {
                alert('Помилка реєстрації');
            }
        };
    }
}

/**
 * Главная функция, которая определяет статус пользователя и рендерит соответствующий блок.
 */
async function renderUserBlock() {
    const userBlock = document.getElementById('user-block');
    if (!userBlock) return;

    userBlock.innerHTML = ''; // Очищаем контейнер

    try {
        const res = await fetch('/api/users/current', { credentials: 'include' });
        if (res.ok) {
            // Пользователь залогинен
            const user = await res.json();
            const template = document.getElementById('logged-in-template');
            const content = template.content.cloneNode(true);
            userBlock.appendChild(content);
            attachLoggedInHandlers(user);
        } else {
            // Пользователь НЕ залогинен
            const template = document.getElementById('logged-out-template');
            const content = template.content.cloneNode(true);
            userBlock.appendChild(content);
            attachLoggedOutHandlers();
        }
    } catch (error) {
        console.error('Не удалось получить статус пользователя:', error);
    }
}

/**
 * Инициализация всего функционала блока пользователя.
 */
export function initUserBlockHandlers() {
    // Убедимся, что DOM загружен, прежде чем что-то делать
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderUserBlock);
    } else {
        renderUserBlock();
    }
}
