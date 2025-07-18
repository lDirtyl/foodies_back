import { Op } from "sequelize";
import { Area, Recipe } from "../models/index.js";

export async function getAllAreas(page, limit, name, categoryId) {
  const offset = (page - 1) * limit;
  const filter = {};
  if (name) {
    filter.name = { [Op.iLike]: `%${name}%` };
  }

  if (categoryId) {
    // 1. Find all recipes in the given category
    const recipes = await Recipe.findAll({
      where: { categoryId },
      attributes: ['areaId'], // We only need the areaId
      group: ['areaId'],     // Group by areaId to get unique values
    });
    const areaIds = recipes.map(r => r.areaId).filter(id => id !== null);

    // Add this to the main filter
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
