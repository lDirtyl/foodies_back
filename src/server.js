import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./middlewares/swaggerDocs.js";
import sequelize from "../db/sequelize.js";
import recipeRouter from '../routes/recipeRouter.js';
import userRouter from '../routes/userRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = "public/images";

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api-docs", ...swaggerDocs);

import dbStatusRoute from "./dbStatusRoute.js";
app.use("/db-status", dbStatusRoute);

app.use('/api/recipes', recipeRouter);
app.use('/api/users', userRouter);

// Главная страница
app.get("/", async (req, res) => {
  try {
    // Получение количества пользователей и рецептов
    const { User, Recipe } = await import("../models/index.js");
    const userCount = await User.count();
    const users = await User.findAll({ attributes: ["name"] });
    const userNames = users.map(u => u.name).join(", ");
    const recipeCount = await Recipe.count();
    // Получение списка таблиц через Sequelize
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    let tablesMarkup = '';
    // DEBUG: показать, что реально приходит из БД
    tablesMarkup += `<pre style='color:#666;background:#f6f6f6;padding:8px;border-radius:4px;'>tables: ${JSON.stringify(tableNames, null, 2)}</pre>`;
    for (const tableName of tableNames) {
      // Структура таблицы
      const [columns] = await sequelize.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`
      );
      // Содержимое таблицы (до 100 строк)
      const [rows] = await sequelize.query(
        `SELECT * FROM "${tableName}" LIMIT 100`
      );
      // Формируем таблицу структуры и таблицу данных в flex-контейнере
      tablesMarkup += `
        <div style="margin-bottom:32px; display: flex; gap: 32px; align-items: flex-start;">
          <div style="min-width:270px;max-width:320px;">
            <div style="font-weight:bold;font-size:1.1em;margin-bottom:4px;">${tableName}</div>
            <table style="border-collapse:collapse;font-size:0.97em;">
              <thead><tr><th style="border:1px solid #ccc;padding:2px 8px;">Имя</th><th style="border:1px solid #ccc;padding:2px 8px;">Тип</th><th style="border:1px solid #ccc;padding:2px 8px;">Nullable</th></tr></thead>
              <tbody>
                ${columns.map(col => `<tr><td style='border:1px solid #ccc;padding:2px 8px;'>${col.column_name}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.data_type}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.is_nullable}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="flex:1; max-width:60vw;">
            <div style="font-size:0.98em; color:#888; margin-bottom:4px;">Содержимое таблицы (до 100 строк):</div>
            <div style="max-height:330px; overflow-y:auto; border:1px solid #eee; border-radius:4px; background:#fafbfc;">
              <table style="border-collapse:collapse; width:100%; font-size:0.96em;">
                <thead><tr>
                  ${(columns.length ? columns : Object.keys(rows[0]||{})).map(col => `<th style='border:1px solid #ccc;padding:2px 8px;position:sticky;top:0;background:#f5f5f5;'>${col.column_name || col}</th>`).join('')}
                </tr></thead>
                <tbody>
                  ${rows.length ? rows.map(row => `<tr>${(columns.length ? columns : Object.keys(row)).map(col => `<td style='border:1px solid #ccc;padding:2px 8px;'>${row[col.column_name || col] ?? ''}</td>`).join('')}</tr>`).join('') : `<tr><td colspan='${columns.length || 1}' style='color:#aaa;text-align:center;'>Нет данных</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
    res.send(`
      <div style="font-family:sans-serif;max-width:fit-content;margin:40px auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#4caf50;">база завантажена з render</h2>
        <p><b>юзерів у базі:</b> ${userCount}</p>
        <p style="margin:0 0 16px 0;"><small>${userNames}</small></p>
        <p><b>рецептів у базі:</b> ${recipeCount}</p>
        <p><b>існуючі таблиці на рендер:</b></p>
        ${tablesMarkup}
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<pre>${error.message}</pre>`);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("✅ DB connected");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("❌ Unable to connect to the DB:", error);
}

export default app;