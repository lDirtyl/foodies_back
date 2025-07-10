import { Op } from 'sequelize';
import Recipe from '../models/Recipe.js';
import HttpError from '../helpers/HttpError.js';

export async function searchRecipes({ category, area, page = 1, limit = 10 }) {
  const filter = {};
  if (category) filter.categoryId = category;
  if (area) filter.areaId = area;
  // No ingredient filter, as model does not support it
  const offset = (page - 1) * limit;
  const { rows, count } = await Recipe.findAndCountAll({
    where: filter,
    limit,
    offset
  });
  return {
    recipes: rows,
    pagination: { page, limit, total: count }
  };
}

export async function getRecipeById(id) {
  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    throw HttpError(404, 'Recipe not found');
  }
  return recipe;
}

export async function getPopularRecipes({ page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  // No favorites/viewsCount, just return paginated recipes
  const { rows, count } = await Recipe.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
  return {
    recipes: rows,
    pagination: { page, limit, total: count }
  };
}

export async function createRecipe(data, ownerId) {
  const recipe = await Recipe.create({ ...data, ownerId });
  return recipe;
}

export async function deleteRecipe(id, ownerId) {
  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    throw HttpError(404, 'Recipe not found');
  }
  if (recipe.ownerId !== ownerId) {
    throw HttpError(403, 'Not authorized to delete this recipe');
  }
  await recipe.destroy();
  return;
}

export async function getRecipesByOwner(ownerId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Recipe.findAndCountAll({
    where: { ownerId },
    limit,
    offset
  });
  return {
    recipes: rows,
    pagination: { page, limit, total: count }
  };
}
// The following are not supported by the model and are left as stubs
export async function addFavorite() {
  throw HttpError(501, 'Favorites not supported by this model');
}
export async function removeFavorite() {
  throw HttpError(501, 'Favorites not supported by this model');
}
export async function getFavoriteRecipes() {
  throw HttpError(501, 'Favorites not supported by this model');
}