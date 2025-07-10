import * as testimonialsService from "../services/testimonialsService.js";
import controllerWrapper from "../helpers/controllerWrapper.js";

const getAllTestimonials = async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await testimonialsService.getAllTestimonials(page, limit);
  res.json(result);
};

export const getAllTestimonialsWrapper = controllerWrapper(getAllTestimonials); 