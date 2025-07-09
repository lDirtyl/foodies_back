import * as recipeService from '../services/recipeService.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import HttpError from '../helpers/HttpError.js';
import { validate as isUuid } from 'uuid';

const searchRecipes = async (req, res, next) => {
  let { category, ingredient, area, page, limit } = req.query;
  page = Number(page);
  limit = Number(limit);
  if (!page || isNaN(page) || page < 1) page = 1;
  if (!limit || isNaN(limit) || limit < 1) limit = 10;
  const result = await recipeService.searchRecipes({ category, ingredient, area, page: Number(page), limit: Number(limit) });
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
  let { page, limit } = req.query;
  page = Number(page);
  limit = Number(limit);
  if (!page || isNaN(page) || page < 1) page = 1;
  if (!limit || isNaN(limit) || limit < 1) limit = 10;
  const result = await recipeService.getPopularRecipes({ page: Number(page), limit: Number(limit) });
  res.json(result);
};


// Private routes
const createRecipe = async (req, res, next) => {
  const ownerId = req.user.id;
  const data = req.body;
  if (!data.title) throw HttpError(400, 'Title is required');
  const recipe = await recipeService.createRecipe(data, ownerId);
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
  let { page, limit } = req.query;
  page = Number(page);
  limit = Number(limit);
  if (!page || isNaN(page) || page < 1) page = 1;
  if (!limit || isNaN(limit) || limit < 1) limit = 10;
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