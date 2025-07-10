import Testimonial from "../models/Testimonial.js";

export async function getAllTestimonials(page, limit) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Testimonial.findAndCountAll({
    order: [["id", "ASC"]],
    limit,
    offset,
  });
  return {
    testimonials: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
} 