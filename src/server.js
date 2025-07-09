import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./middlewares/swaggerDocs.js";
import sequelize from "../db/sequelize.js";

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
      const [columns] = await sequelize.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`
      );
      tablesMarkup += `
        <div style="margin-bottom:24px;">
          <div style="font-weight:bold;font-size:1.1em;margin-bottom:4px;">${tableName}</div>
          <table style="border-collapse:collapse;font-size:0.97em;">
            <thead><tr><th style="border:1px solid #ccc;padding:2px 8px;">Имя</th><th style="border:1px solid #ccc;padding:2px 8px;">Тип</th><th style="border:1px solid #ccc;padding:2px 8px;">Nullable</th></tr></thead>
            <tbody>
              ${columns.map(col => `<tr><td style='border:1px solid #ccc;padding:2px 8px;'>${col.column_name}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.data_type}</td><td style='border:1px solid #ccc;padding:2px 8px;'>${col.is_nullable}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    res.send(`
      <div style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:24px;border:1px solid #eee;border-radius:8px;">
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
