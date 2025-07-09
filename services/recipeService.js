import { Op } from 'sequelize';
import Recipe from '../models/Recipe.js';

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
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
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
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
  }
  if (recipe.ownerId !== ownerId) {
    const error = new Error('Not authorized to delete this recipe');
    error.status = 403;
    throw error;
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
  throw new Error('Favorites not supported by this model');
}
export async function removeFavorite() {
  throw new Error('Favorites not supported by this model');
}
export async function getFavoriteRecipes() {
  throw new Error('Favorites not supported by this model');
}