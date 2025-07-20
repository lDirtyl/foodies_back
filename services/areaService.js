import { Op } from "sequelize";
import { Area, Recipe, RecipeIngredient } from "../models/index.js";

export const getAllAreas = async () => {
  return await Area.findAll({
    order: [['name', 'ASC']],
  });
};
