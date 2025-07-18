import { Op } from "sequelize";
import { Ingredient, Recipe, RecipeIngredient } from "../models/index.js";

export async function getAllIngredients(page, limit, name, categoryId) {
  const offset = (page - 1) * limit;
  const filter = {};
  if (name) {
    filter.name = { [Op.iLike]: `%${name}%` };
  }

  let ingredientIds = null;

  if (categoryId) {
    // 1. Find all recipes in the given category
    const recipes = await Recipe.findAll({
      where: { categoryId },
      attributes: ['id'],
    });
    const recipeIds = recipes.map(r => r.id);

    // 2. Find all unique ingredient IDs from those recipes
    const recipeIngredients = await RecipeIngredient.findAll({
      where: { recipeId: { [Op.in]: recipeIds } },
      attributes: ['ingredientId'],
      group: ['ingredientId'],
    });
    ingredientIds = recipeIngredients.map(ri => ri.ingredientId);

    // Add this to the main filter
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