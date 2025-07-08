import createHttpError from "http-errors";
import swaggerUI from "swagger-ui-express";
import fs from "node:fs";
import { SWAGGER_PATH } from "../constants/index.js";

let swaggerMiddleware;

try {
  const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf-8"));
  swaggerMiddleware = swaggerUI.setup(swaggerDoc);
} catch (err) {
  console.error("❌ Ошибка загрузки swagger.json:", err.message);
  swaggerMiddleware = (req, res, next) =>
    next(createHttpError(500, "Can't load swagger docs"));
}

export const swaggerDocs = [swaggerUI.serve, swaggerMiddleware];
