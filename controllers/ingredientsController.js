import * as ingredientsService from "../services/ingredientService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import HttpError from "../helpers/HttpError.js";

const getAllIngredients = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const { name, categoryId, areaId } = req.query;
  const result = await ingredientsService.getAllIngredients(page, limit, name, categoryId, areaId);
  res.json(result);
};

export const getAllIngredientsWrapper = controllerWrapper(getAllIngredients);