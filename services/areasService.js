import Area from "../models/Area.js";

export async function getAllAreas(page, limit) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Area.findAndCountAll({
    order: [["name", "ASC"]],
    limit,
    offset,
  });
  return {
    areas: rows,
    pagination: { page, limit, total: count },
  };
} 