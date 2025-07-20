import { Ingredient } from '../db/models/index.js';

export const getAllIngredients = async () => {
  return await Ingredient.findAll({
    order: [['name', 'ASC']],
  });
};
