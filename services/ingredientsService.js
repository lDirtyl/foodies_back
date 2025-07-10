import RecipeIngredient from "../models/RecipeIngredient.js";

export async function getAllIngredients(page, limit) {
  const offset = (page - 1) * limit;
  const { rows, count } = await RecipeIngredient.findAndCountAll({
    order: [["id", "ASC"]],
    limit,
    offset,
  });
  return {
    ingredients: rows,
    pagination: { page, limit, total: count },
  };
} 