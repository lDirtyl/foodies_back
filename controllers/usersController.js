import * as userService from '../services/userSevice.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import HttpError from '../helpers/HttpError.js';
import { registerUserSchema, loginUserSchema } from '../schemas/userSchema.js';

const register = async (req, res, next) => {
  const { error, value } = registerUserSchema.validate(req.body);
  if (error) throw HttpError(400, error.message);
  const result = await userService.registerUser(value);
  res.status(201).json(result);
};

const login = async (req, res, next) => {
  const { error, value } = loginUserSchema.validate(req.body);
  if (error) throw HttpError(400, error.message);
  const result = await userService.loginUser(value);
  res.json(result);
};

const logout = async (req, res, next) => {
  const userId = req.user.id;
  await userService.logoutUser(userId);
  res.status(204).send();
};

const getCurrentUser = async (req, res) => {
  const { name, email, avatarURL } = req.user;
  res.json({ name, email, avatarURL });
};

const updateAvatar = async (req, res) => {
  if (!req.file) throw HttpError(400, 'Файл не завантажено');

  const avatarURL = `/uploads/avatars/${req.file.filename}`;
  const result = await userService.updateAvatar(req.user.id, avatarURL);

  res.json(result);
};

export const updateAvatarWrapper = controllerWrapper(updateAvatar);
export const registerWrapper = controllerWrapper(register);
export const loginWrapper = controllerWrapper(login);
export const logoutWrapper = controllerWrapper(logout);
export const getCurrentUserWrapper = controllerWrapper(getCurrentUser);
