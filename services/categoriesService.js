import Category from "../models/Category.js";

export async function getAllCategories(page, limit) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Category.findAndCountAll({
    order: [["name", "ASC"]],
    limit,
    offset,
  });
  return {
    categories: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
}
