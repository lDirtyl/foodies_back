// src/renderDbOverview.js
// Функція для отримання структури БД та формування HTML-розмітки

async function renderDbOverview({ sequelize }) {
  // Динамічно імпортуємо моделі (уникаємо циклічних залежностей)
  const { User, Recipe } = await import("../models/index.js");
  const userCount = await User.count();
  const users = await User.findAll({ attributes: ["name"] });
  const userNames = users.map(u => u.name).join(", ");
  const recipeCount = await Recipe.count();
  // Отримання списку таблиць через Sequelize
  const tableNames = await sequelize.getQueryInterface().showAllTables();
  let tablesMarkup = '';
  tablesMarkup += `<pre style='color:#666;background:#f6f6f6;padding:8px;border-radius:4px;'>tables: ${JSON.stringify(tableNames, null, 2)}</pre>`;
  for (const tableName of tableNames) {
    // Структура таблиці
    const [columns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`
    );
    // Вміст таблиці (до 100 рядків)
    const [rows] = await sequelize.query(
      `SELECT * FROM "${tableName}" LIMIT 100`
    );
    tablesMarkup += `
      <div style="margin-bottom:32px; display: flex; gap: 32px; align-items: flex-start;">
        <div style="min-width:270px;max-width:320px;">
          <div style="font-weight:bold;font-size:1.1em;margin-bottom:4px;">${tableName}</div>
          <table style="border-collapse:collapse;font-size:0.97em;">
            <thead><tr><th style="border:1px solid #ccc;padding:2px 8px;">Ім'я</th><th style="border:1px solid #ccc;padding:2px 8px;">Тип</th><th style="border:1px solid #ccc;padding:2px 8px;">Nullable</th></tr></thead>
            <tbody>
              ${columns.map(col => `<tr><td style='border:1px solid #ccc;padding:2px 8px;'>${col.column_name}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.data_type}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.is_nullable}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="flex:1; max-width:60vw;">
          <div style="font-size:0.98em; color:#888; margin-bottom:4px;">Вміст таблиці (до 100 рядків):</div>
          <div style="max-height:330px; overflow-y:auto; border:1px solid #eee; border-radius:4px; background:#fafbfc;">
            <table style="border-collapse:collapse; width:100%; font-size:0.96em;">
              <thead><tr>
                ${(columns.length ? columns : Object.keys(rows[0]||{})).map(col => `<th style='border:1px solid #ccc;padding:2px 8px;position:sticky;top:0;background:#f5f5f5;'>${col.column_name || col}</th>`).join('')}
              </tr></thead>
              <tbody>
                ${rows.length ? rows.map(row => `<tr>${(columns.length ? columns : Object.keys(row)).map(col => `<td style='border:1px solid #ccc;padding:2px 8px;'>${row[col.column_name || col] ?? ''}</td>`).join('')}</tr>`).join('') : `<tr><td colspan='${columns.length || 1}' style='color:#aaa;text-align:center;'>Немає даних</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  return {
    html: `
      <div style="font-family:sans-serif;max-width:fit-content;margin:40px auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#4caf50;">база завантажена з render</h2>
        <p><b>юзерів у базі:</b> ${userCount}</p>
        <p style="margin:0 0 16px 0;"><small>${userNames}</small></p>
        <p><b>рецептів у базі:</b> ${recipeCount}</p>
        <p><b>існуючі таблиці на рендер:</b></p>
        ${tablesMarkup}
      </div>
    `
  };
}

export default renderDbOverview;
