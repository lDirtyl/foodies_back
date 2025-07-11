import * as areasService from "../services/areasService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import HttpError from "../helpers/HttpError.js";

const getAllAreas = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const result = await areasService.getAllAreas(page, limit);
  res.json(result);
};

export const getAllAreasWrapper = controllerWrapper(getAllAreas);