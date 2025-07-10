import express from "express";
import { getAllTestimonialsWrapper } from "../controllers/testimonialsController.js";
import validateBody from "../helpers/validateBody.js";
import { paginationSchema } from "../schemas/paginationSchema.js";

const router = express.Router();

router.get("/", validateBody(paginationSchema), getAllTestimonialsWrapper);

export default router; 