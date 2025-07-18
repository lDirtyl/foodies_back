import { Op } from "sequelize";
import { Area, Recipe, RecipeIngredient } from "../models/index.js";

export async function getAllAreas(page, limit, name, categoryId, ingredientId) {
  const offset = (page - 1) * limit;
  const filter = {};

  if (name) {
    filter.name = { [Op.iLike]: `%${name}%` };
  }

  if (categoryId) {
    const recipeFilter = { categoryId };

    if (ingredientId) {
      const recipeIngredients = await RecipeIngredient.findAll({
        where: { ingredientId },
        attributes: ['recipeId'],
      });
      const recipeIdsWithIngredient = recipeIngredients.map(ri => ri.recipeId);
      recipeFilter.id = { [Op.in]: recipeIdsWithIngredient };
    }

    const recipes = await Recipe.findAll({
      where: recipeFilter,
      attributes: ['areaId'],
      group: ['areaId'],
    });

    const areaIds = recipes.map(r => r.areaId).filter(id => id);

    if (areaIds.length === 0) {
      return {
        areas: [],
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
      };
    }

    filter.id = { [Op.in]: areaIds };
  }

  const { rows, count } = await Area.findAndCountAll({
    where: filter,
    order: [["name", "ASC"]],
    limit,
    offset,
  });

  return {
    areas: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
}
