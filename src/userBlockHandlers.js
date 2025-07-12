// src/userBlockHandlers.js
// Инициализация обработчиков для блока пользователя (логин, регистрация, аватарка)

// === Cloudinary config ===
const CLOUDINARY_CLOUD_NAME = 'dlh9bzjk6';
const CLOUDINARY_PRESET = 'avatar_preset';
// === END Cloudinary config ===

export function initUserBlockHandlers() {
  // Проверяем наличие элементов перед навешиванием обработчиков
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutBtn = document.getElementById('logout-btn');
  const profileSide = document.getElementById('profile-side');
  const avatarContainer = document.getElementById('avatar-container');
  const avatarImg = document.getElementById('current-avatar');
  const editBtn = document.getElementById('edit-avatar-btn');
  const deleteBtn = document.getElementById('delete-avatar-btn');
  const input = document.getElementById('avatar-input');

  async function fetchCurrentUser() {
    const res = await fetch('/api/users/current', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      profileSide.style.display = 'flex';
      document.getElementById('current-name').textContent = user.name;
      document.getElementById('current-email').textContent = user.email;
      avatarImg.src = user.avatarURL || '/uploads/avatars/default.png';
      logoutBtn.style.display = '';
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
    } else {
      profileSide.style.display = 'none';
      logoutBtn.style.display = 'none';
      loginForm.style.display = '';
      registerForm.style.display = '';
    }
  }

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
      if (res.ok) fetchCurrentUser();
      else alert('Помилка логіну');
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
        // Показати повідомлення
        let msg = document.getElementById('register-success-msg');
        if (!msg) {
          msg = document.createElement('div');
          msg.id = 'register-success-msg';
          msg.style.color = 'green';
          msg.style.margin = '8px 0 8px 0';
          form.parentNode.insertBefore(msg, form.nextSibling);
        }
        msg.textContent = 'Реєстрація успішна! Тепер увійдіть.';
        // Підставити email і пароль у форму логіну
        document.querySelector('#login-form input[name=email]').value = email;
        document.querySelector('#login-form input[name=password]').value = password;
        // Фокус на кнопку "Увійти"
        document.getElementById('login-btn').focus();
      } else {
        alert('Помилка реєстрації');
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
      fetchCurrentUser();
    };
  }

  // === Аватарка: UI и загрузка ===
  if (avatarContainer && avatarImg && editBtn && deleteBtn && input) {
    avatarContainer.addEventListener('mouseenter', () => {
      editBtn.style.display = 'block';
      deleteBtn.style.display = 'block';
    });
    avatarContainer.addEventListener('mouseleave', () => {
      editBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
    });

    // Клик по карандашу — открыть выбор файла
    editBtn.onclick = () => input.click();

    // Загрузка файла на Cloudinary
    input.onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      // Cloudinary unsigned upload
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        // Отправить PATCH/PUT на backend, чтобы сохранить новый avatarURL
        const saveRes = await fetch('/api/users/avatar', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
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

    // Клик по корзине — удалить аватарку (сбросить на дефолтную)
    deleteBtn.onclick = async () => {
      const res = await fetch('/api/users/avatar', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ avatarURL: '' }) // сервер должен сбросить на дефолтную
      });
      if (res.ok) {
        avatarImg.src = '/uploads/avatars/default.png';
      } else {
        alert('Не вдалося видалити аватарку');
      }
    };
  }
  // === END Аватарка ===

  // Изначально получить статус пользователя
  fetchCurrentUser();
}
