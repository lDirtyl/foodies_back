import express from 'express';
import {
  searchRecipesWrapper,
  getPopularRecipesWrapper,
  getRecipeByIdWrapper,
  createRecipeWrapper,
  getOwnRecipesWrapper,
  deleteRecipeWrapper,
  addFavoriteWrapper,
  removeFavoriteWrapper,
  getFavoriteRecipesWrapper,
  updateRecipeWrapper
} from '../controllers/recipesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware.js';
import { upload } from "../middlewares/uploadMiddleware.js";
import cloudinaryMiddleware from '../middlewares/cloudinaryMiddleware.js';

const router = express.Router();

router.get('/own', authMiddleware, getOwnRecipesWrapper);
router.get('/favorites', authMiddleware, getFavoriteRecipesWrapper);
router.get('/popular', getPopularRecipesWrapper);
router.get('/:id', getRecipeByIdWrapper);
router.get('/', optionalAuthMiddleware, searchRecipesWrapper);

router.post('/', authMiddleware, upload.single('thumb'), cloudinaryMiddleware, createRecipeWrapper);
router.put("/:id", authMiddleware, upload.single('thumb'), cloudinaryMiddleware, updateRecipeWrapper);

router.delete("/:id", authMiddleware, deleteRecipeWrapper);
router.post('/:id/favorite', authMiddleware, addFavoriteWrapper);
router.delete('/:id/favorite', authMiddleware, removeFavoriteWrapper);

export default router;