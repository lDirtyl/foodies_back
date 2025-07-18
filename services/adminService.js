import { sequelize } from '../db.js';
import { QueryTypes } from 'sequelize';

const getTableNames = async () => {
  const tableNames = await sequelize.getQueryInterface().showAllTables();
  // Filter out SequelizeMeta if it exists
  return tableNames.filter(name => name.toLowerCase() !== 'sequelizemeta');
};

const getTableContent = async (tableName) => {
  const allTables = await getTableNames();
  if (!allTables.includes(tableName)) {
    throw new Error('Table not found or access denied.');
  }

  // Sanitize table name by quoting to be safe, though it's from a trusted list
  const quotedTableName = sequelize.getQueryInterface().quoteTable(tableName);

  const content = await sequelize.query(`SELECT * FROM ${quotedTableName} LIMIT 100`, {
    type: QueryTypes.SELECT,
  });
  return content;
};

export const adminService = {
  getTableNames,
  getTableContent,
};
