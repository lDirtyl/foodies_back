import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { swaggerDocs } from "./middlewares/swaggerDocs.js";
import sequelize from "../db/sequelize.js";
import recipeRouter from "../routes/recipeRouter.js";
import userRouter from "../routes/userRouter.js";
import categoriesRouter from "../routes/categoriesRouter.js";
import areasRouter from "../routes/areasRouter.js";
import ingredientsRouter from "../routes/ingredientsRouter.js";
import testimonialsRouter from "../routes/testimonialsRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = "public/images";

// Дозволяємо cookie + credentials для фронта
app.use(
  cors({
    origin: "http://localhost:5173", // якщо фронт на іншому порту — вкажи його тут
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

// Роздача статичних файлів з папки 'public'
app.use(express.static("public"));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api-docs", ...swaggerDocs);

import dbStatusRoute from "./dbStatusRoute.js";
app.use("/db-status", dbStatusRoute);

app.use("/api/recipes", recipeRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/areas", areasRouter);
app.use("/api/ingredients", ingredientsRouter);
app.use("/api/testimonials", testimonialsRouter);

// Головна сторінка
app.get("/", async (req, res) => {
  try {
    const { default: renderDbOverview } = await import("./renderDbOverview.js");
    const { html } = await renderDbOverview({ sequelize });
    res.send(html);
  } catch (error) {
    res.status(500).send(`<pre>${error.message}</pre>`);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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
