import { Op } from "sequelize";
import { Ingredient, Recipe, RecipeIngredient } from "../models/index.js";

export const getAllIngredients = async () => {
  return await Ingredient.findAll({
    order: [['name', 'ASC']],
  });
};
