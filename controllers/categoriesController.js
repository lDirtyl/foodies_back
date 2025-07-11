import * as categoriesService from "../services/categoriesService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import HttpError from "../helpers/HttpError.js";

const getAllCategories = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const result = await categoriesService.getAllCategories(page, limit);
  res.json(result);
};

export const getAllCategoriesWrapper = controllerWrapper(getAllCategories);
