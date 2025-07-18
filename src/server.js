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
import authMiddleware from "../middlewares/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = "public/images";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://foodies-front-rouge.vercel.app",
  "https://foodies-back-x15g.onrender.com",
  "https://foodiesfront.vercel.app/"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Тестовый эндпоинт для диагностики
app.get('/test-endpoint', (req, res) => res.send('ok'));

// Сторінка додавання рецепта
app.get('/add-recipe', authMiddleware, (req, res) => {
  res.sendFile('add_recipe_page.html', { root: 'public' });
});

// Логирование всех маршрутов Express 5
function logExpressRoutes(app) {
  if (!app._router || !app._router.stack) {
    console.log('⚠️  No endpoints registered or Express internals changed!');
    return;
  }
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Это обычный маршрут
      const methods = Object.keys(middleware.route.methods)
        .map(m => m.toUpperCase())
        .join(', ');
      routes.push({ method: methods, path: middleware.route.path });
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      // Это роутер
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .map(m => m.toUpperCase())
            .join(', ');
          routes.push({ method: methods, path: handler.route.path });
        }
      });
    }
  });
  if (routes.length === 0) {
    console.log('⚠️  No endpoints registered!');
  } else {
    console.log('Registered endpoints:');
    console.table(routes);
  }
}

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
    logExpressRoutes(app);
  });
} catch (error) {
  console.error("❌ Unable to connect to the DB:", error);
}

export default app;
