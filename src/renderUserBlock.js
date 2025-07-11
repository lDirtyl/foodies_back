// src/renderUserBlock.js
// Блок авторизації: логін, реєстрація, логаут, показ юзера

export default async function renderUserBlock() {
  // Блок для логіна/реєстрації + збоку профіль юзера
  return `
    <div id="user-block" style="margin-bottom:32px;max-width:370px;display:flex;gap:24px;align-items:flex-start;">
      <div style="flex:1;min-width:180px;">
        <div style="font-weight:bold;font-size:1.1em;margin-bottom:8px;">Аутентифікація</div>
        <form id="login-form" style="margin-bottom:8px;">
          <input name="email" type="email" placeholder="Email" required style="margin-right:4px;">
          <input name="password" type="password" placeholder="Пароль" required style="margin-right:4px;">
          <button type="submit" id="login-btn">Увійти</button>
        </form>
        <form id="register-form" style="margin-bottom:8px;">
          <input name="name" type="text" placeholder="Ім'я" required style="margin-right:4px;">
          <input name="email" type="email" placeholder="Email" required style="margin-right:4px;">
          <input name="password" type="password" placeholder="Пароль" required style="margin-right:4px;">
          <button type="submit">Реєстрація</button>
        </form>
      </div>
      <div id="profile-side" style="display:none;min-width:140px;padding:10px 12px;background:#f7f7f7;border-radius:8px;border:1px solid #e1e1e1;align-items:center;flex-direction:column;gap:10px;">
        <img id="current-avatar" src="/uploads/avatars/default.png" alt="avatar" style="width:56px;height:56px;border-radius:50%;border:1px solid #eee;object-fit:cover;margin-bottom:6px;">
        <div id="current-name" style="font-weight:bold;font-size:1.1em;word-break:break-all;"></div>
        <div id="current-email" style="font-size:0.95em;color:#555;word-break:break-all;"></div>
        <button id="logout-btn" style="margin-top:12px;">Вийти</button>
      </div>
      <script type="module">
        async function fetchCurrentUser() {
          const res = await fetch('/api/users/current', { credentials: 'include' });
          if (res.ok) {
            const user = await res.json();
            document.getElementById('profile-side').style.display = 'flex';
            document.getElementById('current-name').textContent = user.name;
            document.getElementById('current-email').textContent = user.email;
            document.getElementById('current-avatar').src = user.avatarURL || '/uploads/avatars/default.png';
            document.getElementById('logout-btn').style.display = '';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'none';
          } else {
            document.getElementById('profile-side').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('login-form').style.display = '';
            document.getElementById('register-form').style.display = '';
          }
        }
        fetchCurrentUser();
        document.getElementById('login-form').onsubmit = async e => {
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
        document.getElementById('register-form').onsubmit = async e => {
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

        document.getElementById('logout-btn').onclick = async () => {
          await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
          fetchCurrentUser();
        };
      </script>
    </div>
  `;
}
