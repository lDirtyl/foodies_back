import { Op } from "sequelize";
import Ingredient from "../models/Ingredient.js";

export async function getAllIngredients(page, limit, name) {
  const offset = (page - 1) * limit;
  const filter = {};
  if (name) {
    filter.name = { [Op.iLike]: `%${name}%` };
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