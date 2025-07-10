import express from "express";
import { getAllCategoriesWrapper } from "../controllers/categoriesController.js";
import validateBody from "../helpers/validateBody.js";
import { paginationSchema } from "../schemas/paginationSchema.js";

const router = express.Router();

router.get("/", validateBody(paginationSchema), getAllCategoriesWrapper);

export default router;
