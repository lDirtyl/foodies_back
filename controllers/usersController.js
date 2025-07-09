import * as userService from '../services/userSevice.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import HttpError from '../helpers/HttpError.js';

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw HttpError(400, 'Name, email and password are required');
  const result = await userService.registerUser({ name, email, password });
  res.status(201).json(result);
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw HttpError(400, 'Email and password are required');
  const result = await userService.loginUser({ email, password });
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

export const registerWrapper = controllerWrapper(register);
export const loginWrapper = controllerWrapper(login);
export const logoutWrapper = controllerWrapper(logout);
export const getCurrentUserWrapper = controllerWrapper(getCurrentUser);
