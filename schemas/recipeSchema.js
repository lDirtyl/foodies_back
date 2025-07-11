import Joi from "joi";

export const createRecipeSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('', null),
  instructions: Joi.string().allow('', null),
  thumb: Joi.string().uri().allow('', null),
  time: Joi.string().allow('', null),
  areaId: Joi.string().guid({ version: 'uuidv4' }).allow(null),
  categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
  ingredients: Joi.array().items(
    Joi.object({
      id: Joi.string().guid({ version: 'uuidv4' }).required(),
      measure: Joi.string().required()
    })
  )
});

// Schema for validating recipe ID parameters
export const recipeIdSchema = Joi.object({
  id: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Invalid recipe ID format, must be a valid UUID',
      'any.required': 'Recipe ID is required'
    })
});
