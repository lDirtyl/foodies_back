import * as ingredientsService from "../services/ingredientsService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import HttpError from "../helpers/HttpError.js";

const getAllIngredients = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const { name } = req.query;
  const result = await ingredientsService.getAllIngredients(page, limit, name);
  res.json(result);
};

export const getAllIngredientsWrapper = controllerWrapper(getAllIngredients);