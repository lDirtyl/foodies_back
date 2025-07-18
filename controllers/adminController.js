import { adminService } from '../services/adminService.js';

const getTables = async (req, res, next) => {
  try {
    const tables = await adminService.getTableNames();
    res.json({ tables });
  } catch (error) {
    next(error);
  }
};

const getContent = async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const content = await adminService.getTableContent(tableName);
    res.json({ content });
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getTables,
  getContent,
};
