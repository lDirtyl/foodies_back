import { Op } from "sequelize";
import { Category, Recipe, RecipeIngredient } from "../models/index.js";

export const getAllCategories = async () => {
  return await Category.findAll({
    order: [['name', 'ASC']],
  });
};
