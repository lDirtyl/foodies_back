import * as recipeService from '../services/recipeService.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import HttpError from '../helpers/HttpError.js';
import { validate as isUuid } from 'uuid';
import { paginationSchema } from '../schemas/paginationSchema.js';
import { createRecipeSchema } from '../schemas/recipeSchema.js';

const searchRecipes = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { category, ingredient, area, page, limit } = { ...req.query, ...value };
  const result = await recipeService.searchRecipes({ category, ingredient, area, page, limit });
  res.json(result);
};

const getRecipeById = async (req, res, next) => {
  const { id } = req.params;
  if (!isUuid(id)) throw HttpError(400, 'Invalid recipe id format');
  const recipe = await recipeService.getRecipeById(id);
  if (!recipe) throw HttpError(404, 'Recipe not found');
  res.json(recipe);
};

const getPopularRecipes = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const result = await recipeService.getPopularRecipes({ page, limit });
  res.json(result);
};

// Private routes
const createRecipe = async (req, res, next) => {
  const ownerId = req.user.id;
  const { error, value } = createRecipeSchema.validate(req.body);
  if (error) throw HttpError(400, error.message);
  const recipe = await recipeService.createRecipe(value, ownerId);
  res.status(201).json(recipe);
};

const deleteRecipe = async (req, res, next) => {
  const { id } = req.params;
  const ownerId = req.user.id;
  const recipe = await recipeService.getRecipeById(id);
  if (!recipe) throw HttpError(404, 'Recipe not found');
  if (recipe.ownerId !== ownerId) throw HttpError(403, 'Forbidden');
  await recipeService.deleteRecipe(id, ownerId);
  res.status(204).send();
};

const getOwnRecipes = async (req, res, next) => {
  const ownerId = req.user.id;
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const result = await recipeService.getRecipesByOwner(ownerId, { page, limit });
  res.json(result);
};

const addFavorite = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const recipe = await recipeService.addFavorite(id, userId);
  if (!recipe) throw HttpError(404, 'Recipe not found');
  res.json(recipe);
};

const removeFavorite = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const recipe = await recipeService.removeFavorite(id, userId);
  if (!recipe) throw HttpError(404, 'Recipe not found');
  res.json(recipe);
};

const getFavoriteRecipes = async (req, res, next) => {
  const userId = req.user.id;
  const { page, limit } = req.query;
  const result = await recipeService.getFavoriteRecipes(userId, { page: Number(page), limit: Number(limit) });
  res.json(result);
};

export const searchRecipesWrapper = controllerWrapper(searchRecipes);
export const getRecipeByIdWrapper = controllerWrapper(getRecipeById);
export const getPopularRecipesWrapper = controllerWrapper(getPopularRecipes);
export const createRecipeWrapper = controllerWrapper(createRecipe);
export const deleteRecipeWrapper = controllerWrapper(deleteRecipe);
export const getOwnRecipesWrapper = controllerWrapper(getOwnRecipes);
export const addFavoriteWrapper = controllerWrapper(addFavorite);
export const removeFavoriteWrapper = controllerWrapper(removeFavorite);
export const getFavoriteRecipesWrapper = controllerWrapper(getFavoriteRecipes);