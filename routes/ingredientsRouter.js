import express from "express";
import { getAllIngredientsWrapper } from "../controllers/ingredientsController.js";
import validateBody from "../helpers/validateBody.js";
import { paginationSchema } from "../schemas/paginationSchema.js";

const router = express.Router();

router.get("/", validateBody(paginationSchema), getAllIngredientsWrapper);

export default router; 