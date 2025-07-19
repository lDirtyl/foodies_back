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
  const options = {};
  // Check if the model has a 'createdAt' attribute before applying the order
  if (model.rawAttributes.createdAt) {
    options.order = [['createdAt', 'DESC']];
  }
  return await model.findAll(options);
};

export const adminService = {
  getTableNames,
  getTableContent,
};
