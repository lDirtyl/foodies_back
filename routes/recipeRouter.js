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
  getFavoriteRecipesWrapper
} from '../controllers/recipesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/own', authMiddleware, getOwnRecipesWrapper);
router.get('/favorites', authMiddleware, getFavoriteRecipesWrapper);
router.get('/popular', getPopularRecipesWrapper);
router.get('/:id', getRecipeByIdWrapper);
router.get('/', searchRecipesWrapper);

router.post('/', authMiddleware, upload.single('thumb'), createRecipeWrapper);
router.delete('/:id', authMiddleware, deleteRecipeWrapper);
router.post('/:id/favorite', authMiddleware, addFavoriteWrapper);
router.delete('/:id/favorite', authMiddleware, removeFavoriteWrapper);

export default router;