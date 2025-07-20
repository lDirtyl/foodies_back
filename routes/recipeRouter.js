import express from "express";
import {
  searchRecipesWrapper,
  getPopularRecipesWrapper,
  getRecipeFormDataWrapper,
  getRecipeByIdWrapper,
  createRecipeWrapper,
  getOwnRecipesWrapper,
  deleteRecipeWrapper,
  addFavoriteWrapper,
  removeFavoriteWrapper,
  getFavoriteRecipesWrapper,
  updateRecipeWrapper,
  getUserRecipesWrapper,
} from "../controllers/recipesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import optionalAuthMiddleware from "../middlewares/optionalAuthMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import validateBody from "../helpers/validateBody.js";
import { recipeImageUploader } from "../middlewares/imageUploader.js";


const router = express.Router();

// Public routes first
router.get("/", optionalAuthMiddleware, searchRecipesWrapper);
router.get("/popular", getPopularRecipesWrapper);
router.get("/creation-data", getRecipeFormDataWrapper);

// Routes with auth and dynamic params later
router.get(
  "/own",
  authMiddleware,
  validateBody(paginationSchema),
  getOwnRecipesWrapper,
);
router.get("/favorites", authMiddleware, getFavoriteRecipesWrapper);

// Routes with dynamic :id at the very end
router.get(
  "/user/:id",
  authMiddleware,
  validateBody(paginationSchema),
  getUserRecipesWrapper,
);
router.get("/:id", getRecipeByIdWrapper);

router.post(
  "/",
  authMiddleware,
  recipeImageUploader.single("thumb"),
  createRecipeWrapper
);

router.put(
  "/:id",
  authMiddleware,
  recipeImageUploader.single("thumb"),
  updateRecipeWrapper
);
router.put(
  "/:id",
  authMiddleware,
  recipeImageUploader.single("thumb"),
  updateRecipeWrapper,
);

router.delete("/:id", authMiddleware, deleteRecipeWrapper);
router.post("/:id/favorite", authMiddleware, addFavoriteWrapper);
router.delete("/:id/favorite", authMiddleware, removeFavoriteWrapper);

export default router;
