// src/renderCategoriesBlock.js
// Блок категорій: отримання всіх категорій (name, thumb) і формування HTML

export default async function renderCategoriesBlock({ sequelize }) {
  const [categories] = await sequelize.query('SELECT name, thumb FROM categories ORDER BY name');
  return `
    <div style="margin-bottom:32px;">
      <div style="font-weight:bold;font-size:1.1em;margin-bottom:8px;">Категорії</div>
      <div style="display:flex;flex-wrap:wrap;gap:18px 26px;">
        ${categories.map(cat => `
          <div style="display:flex;flex-direction:column;align-items:center;width:70px;">
            <img src="${cat.thumb}" alt="${cat.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;border:1px solid #eee;background:#fafbfc;">
            <div style="font-size:0.95em;margin-top:4px;text-align:center;">${cat.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
