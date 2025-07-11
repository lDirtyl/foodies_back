import * as testimonialsService from "../services/testimonialsService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import HttpError from "../helpers/HttpError.js";

const getAllTestimonials = async (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) throw HttpError(400, error.message);
  const { page, limit } = value;
  const result = await testimonialsService.getAllTestimonials(page, limit);
  res.json(result);
};

export const getAllTestimonialsWrapper = controllerWrapper(getAllTestimonials);