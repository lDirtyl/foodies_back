import HttpError from "./HttpError.js";

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return next(HttpError(400, error.message));
  }
  next();
};

export default validateBody;
