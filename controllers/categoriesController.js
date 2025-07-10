import * as categoriesService from "../services/categoriesService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";

const getAllCategories = async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await categoriesService.getAllCategories(page, limit);
  res.json(result);
};

export const getAllCategoriesWrapper = controllerWrapper(getAllCategories);
