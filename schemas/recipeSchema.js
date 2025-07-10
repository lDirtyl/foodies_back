import Joi from "joi";

export const createRecipeSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('', null),
  instructions: Joi.string().allow('', null),
  thumb: Joi.string().uri().allow('', null),
  time: Joi.string().allow('', null),
  areaId: Joi.string().guid({ version: 'uuidv4' }).allow(null),
  categoryId: Joi.string().guid({ version: 'uuidv4' }).required()
});
