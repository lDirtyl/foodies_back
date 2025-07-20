import { Area } from '../db/models/index.js';

export const getAllAreas = async () => {
  return await Area.findAll({
    order: [['name', 'ASC']],
  });
};
