import express from "express";
import { getAllAreasWrapper } from "../controllers/areasController.js";
import validateBody from "../helpers/validateBody.js";
import { paginationSchema } from "../schemas/paginationSchema.js";

const router = express.Router();

router.get("/", validateBody(paginationSchema), getAllAreasWrapper);

export default router; 