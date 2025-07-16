import * as userService from "../services/userSevice.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import HttpError from "../helpers/HttpError.js";
import { registerUserSchema, loginUserSchema } from "../schemas/userSchema.js";

const register = async (req, res, next) => {
  const { error, value } = registerUserSchema.validate(req.body);
  if (error) throw HttpError(400, error.message);
  const result = await userService.registerUser(value);

  // Встановлюємо токен у cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      avatarURL: result.user.avatarURL,
    },
    token: result.token,
  });
};

const login = async (req, res, next) => {
  const { error, value } = loginUserSchema.validate(req.body);
  if (error) throw HttpError(400, error.message);
  const result = await userService.loginUser(value);

  // Встановлюємо токен у cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      avatarURL: result.user.avatarURL,
    },
    token: result.token,
  });
};

const logout = async (req, res, next) => {
  const userId = req.user.id;
  await userService.logoutUser(userId);
  res.status(204).send();
};

const getCurrentUser = async (req, res) => {
  const { id, name, email, avatarURL } = req.user;
  res.json({ id, name, email, avatarURL });
};

const updateAvatar = async (req, res) => {
  // Отримуємо URL з тіла запиту.
  const { avatarURL } = req.body;

  // Перевіряємо, чи було передано avatarURL
  if (typeof avatarURL === "undefined") {
    throw HttpError(400, "avatarURL is required in the request body");
  }

  // Викликаємо сервіс для оновлення аватара
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

const getUserDetails = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.userId;

  const userDetails = await userService.getUserDetails(
    currentUserId,
    targetUserId
  );
  res.status(200).json(userDetails);
};

export const getUserDetailsWrapper = controllerWrapper(getUserDetails);
export const unfollowUserWrapper = controllerWrapper(unfollowUser);
export const followUserWrapper = controllerWrapper(followUser);
export const getFollowingsWrapper = controllerWrapper(getFollowings);
export const getFollowersWrapper = controllerWrapper(getFollowers);
export const updateAvatarWrapper = controllerWrapper(updateAvatar);
export const registerWrapper = controllerWrapper(register);
export const loginWrapper = controllerWrapper(login);
export const logoutWrapper = controllerWrapper(logout);
export const getCurrentUserWrapper = controllerWrapper(getCurrentUser);
