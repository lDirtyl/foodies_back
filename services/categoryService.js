import { Category } from '../db/models/index.js';

export const getAllCategories = async () => {
  return await Category.findAll({
    order: [['name', 'ASC']],
  });
};
