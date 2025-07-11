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

const getFollowers = async (req, res) => {
  const userId = req.user.id;
  const followers = await userService.getFollowers(userId);
  res.status(200).json({ followers });
};

const getFollowings = async (req, res) => {
  const userId = req.user.id;
  const followings = await userService.getFollowings(userId);
  res.status(200).json({ followings });
};

const followUser = async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  if (!followingId) {
    throw HttpError(400, "followingId is required.");
  }

  const follow = await userService.followUser(followerId, followingId);

  res.status(201).json({ message: "Followed successfully", follow });
};

const unfollowUser = async (req, res) => {
  const followerId = req.user.id; // ID авторизованого користувача
  const { followingId } = req.body; // ID користувача, з якого треба зняти підписку

  if (!followingId) {
    throw HttpError(400, "followingId is required.");
  }

  const result = await userService.unfollowUser(followerId, followingId);
  res.status(200).json(result);
};

export const unfollowUserWrapper = controllerWrapper(unfollowUser);
export const followUserWrapper = controllerWrapper(followUser);
export const getFollowingsWrapper = controllerWrapper(getFollowings);
export const getFollowersWrapper = controllerWrapper(getFollowers);
export const updateAvatarWrapper = controllerWrapper(updateAvatar);
export const registerWrapper = controllerWrapper(register);
export const loginWrapper = controllerWrapper(login);
export const logoutWrapper = controllerWrapper(logout);
export const getCurrentUserWrapper = controllerWrapper(getCurrentUser);
