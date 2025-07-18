import sequelize from "../db/sequelize.js";

const getTableNames = async () => {
  return Object.keys(sequelize.models);
};

const getTableContent = async (tableName) => {
  const allTables = await getTableNames();
  if (!allTables.includes(tableName)) {
    throw new Error('Table not found or access denied.');
  }

  const model = sequelize.models[tableName];
  if (!model) {
    throw new Error(`Model ${tableName} not found`);
  }
  return await model.findAll();
};

export const adminService = {
  getTableNames,
  getTableContent,
};
