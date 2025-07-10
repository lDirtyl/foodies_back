import * as areasService from "../services/areasService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";

const getAllAreas = async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await areasService.getAllAreas(page, limit);
  res.json(result);
};

export const getAllAreasWrapper = controllerWrapper(getAllAreas); 