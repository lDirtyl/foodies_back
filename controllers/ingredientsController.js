import * as ingredientsService from "../services/ingredientsService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";

const getAllIngredients = async (req, res, next) => {
  const { page, limit, name } = req.query;
  const result = await ingredientsService.getAllIngredients(page, limit, name);
  res.json(result);
};

export const getAllIngredientsWrapper = controllerWrapper(getAllIngredients); 