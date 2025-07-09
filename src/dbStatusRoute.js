import express from "express";
import sequelize from "../db/sequelize.js";
import { User, Recipe } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Получение количества пользователей и рецептов
    const userCount = await User.count();
    const recipeCount = await Recipe.count();

    // Получение списка таблиц
    const [tables] = await sequelize.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`);

    res.json({
      dbSource: "база завантажена з render",
      userCount,
      recipeCount,
      tables: tables.map(t => t.table_name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
