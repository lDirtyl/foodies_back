import { Op } from "sequelize";
import { Ingredient, Recipe, RecipeIngredient } from "../models/index.js";

export async function getAllIngredients(page, limit, name, categoryId, areaId) {
  const offset = (page - 1) * limit;
  const filter = {};

  if (name) {
    filter.name = { [Op.iLike]: `%${name}%` };
  }

  if (categoryId) {
    const recipeFilter = { categoryId };
    if (areaId) {
      recipeFilter.areaId = areaId;
    }
    const recipes = await Recipe.findAll({
      where: recipeFilter,
      attributes: ['id'],
    });
    const recipeIds = recipes.map(r => r.id);

    if (recipeIds.length === 0) {
      return {
        ingredients: [],
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
      };
    }

    const recipeIngredients = await RecipeIngredient.findAll({
      where: { recipeId: { [Op.in]: recipeIds } },
      attributes: ['ingredientId'],
      group: ['ingredientId'],
    });
    const ingredientIds = recipeIngredients.map(ri => ri.ingredientId);

    if (ingredientIds.length === 0) {
        return {
            ingredients: [],
            pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
        };
    }

    filter.id = { [Op.in]: ingredientIds };
  }

  const { rows, count } = await Ingredient.findAndCountAll({
    where: filter,
    order: [["name", "ASC"]],
    limit,
    offset,
  });

  return {
    ingredients: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
}