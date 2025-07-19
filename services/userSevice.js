import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Follow from "../models/follow.js";
import Recipe from "../models/Recipe.js";
import Favorite from "../models/favorite.js";
import { Op } from "sequelize";

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw HttpError(409, "Email in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    avatarURL,
  });

  // Создаем токен для нового пользователя
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  newUser.token = token;
  await newUser.save();

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarURL: newUser.avatarURL,
    },
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(401, "Email or password is wrong");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpError(401, "Email or password is wrong");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  user.token = token;
  await user.save();

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarURL: user.avatarURL,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "avatarURL"],
  });
  if (!user) {
    throw HttpError(401, "Not authorized");
  }
  return user;
}

export async function logoutUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw HttpError(401, "Not authorized");
  user.token = null;
  await user.save();
}

export const updateAvatar = async (userId, avatarURL) => {
  const user = await User.findByPk(userId);
  if (!user) throw HttpError(404, "Користувача не знайдено");

  await user.update({ avatarURL });

  return { avatarURL };
};

export async function getFollowers(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  const { rows: followRows, count } = await Follow.findAndCountAll({
    where: { followingId: userId },
    limit,
    offset,
  });

  if (followRows.length === 0) {
    return {
      followers: [],
      pagination: { page, limit, total: count },
    };
  }

  const followerIds = followRows.map((row) => row.followerId);

  const followers = await User.findAll({
    where: { id: { [Op.in]: followerIds } },
    attributes: ["id", "name"],
    include: [
      {
        model: Recipe,
        as: "recipes",
        attributes: ["thumb"],
        required: false,
        limit: 4,
      },
    ],
    group: ["User.id"],
  });

  // Get the current user's followings to check if they follow each follower
  const userFollowings = await Follow.findAll({
    where: { followerId: userId },
    attributes: ["followingId"],
  });
  const userFollowingIds = userFollowings.map((follow) => follow.followingId);

  // Format the response with recipe counts and following status
  const formattedFollowers = await Promise.all(
    followers.map(async (follower) => {
      const recipesCount = await Recipe.count({
        where: { ownerId: follower.id },
      });

      return {
        id: follower.id,
        name: follower.name,
        avatarURL: follower.avatarURL,
        recipes: follower.recipes,
        recipesCount,
        following: userFollowingIds.includes(follower.id),
      };
    }),
  );

  return {
    followers: formattedFollowers,
    pagination: { page, limit, total: count },
  };
}

export async function getFollowings(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  const { rows: followRows, count } = await Follow.findAndCountAll({
    where: { followerId: userId },
    limit,
    offset,
  });

  if (followRows.length === 0) {
    return {
      followings: [],
      pagination: { page, limit, total: count },
    };
  }

  const followingIds = followRows.map((row) => row.followingId);

  const followings = await User.findAll({
    where: { id: { [Op.in]: followingIds } },
    attributes: ["id", "name"],
    include: [
      {
        model: Recipe,
        as: "recipes",
        attributes: ["thumb"],
        required: false,
        limit: 4,
      },
    ],
    group: ["User.id"],
  });

  const userFollowers = await Follow.findAll({
    where: { followingId: userId },
    attributes: ["followerId"],
  });
  const userFollowerIds = userFollowers.map((follow) => follow.followerId);

  const formattedFollowings = await Promise.all(
    followings.map(async (following) => {
      const recipesCount = await Recipe.count({
        where: { ownerId: following.id },
      });

      return {
        id: following.id,
        name: following.name,
        avatarURL: following.avatarURL,
        recipes: following.recipes,
        recipesCount,
        following: userFollowerIds.includes(following.id),
      };
    }),
  );

  return {
    followings: formattedFollowings,
    pagination: { page, limit, total: count },
  };
}

export async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw HttpError(400, "You cannot follow yourself.");
  }

  const existingFollow = await Follow.findOne({
    where: { followerId, followingId },
  });

  if (existingFollow) {
    throw HttpError(400, "You are already following this user.");
  }

  return await Follow.create({ followerId, followingId });
}

export async function unfollowUser(followerId, followingId) {
  if (followerId === followingId) {
    throw HttpError(400, "You cannot unfollow yourself.");
  }

  const follow = await Follow.findOne({
    where: { followerId, followingId },
  });

  if (!follow) {
    throw HttpError(404, "You are not following this user.");
  }

  await follow.destroy();
  return { message: "Unfollowed successfully" };
}

export async function getUserDetails(userId) {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "avatarURL"],
  });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  // Подсчитываем всю статистику для пользователя
  const recipesCount = await Recipe.count({ where: { ownerId: userId } });
  const favoritesCount = await Favorite.count({ where: { userId: userId } });
  const followersCount = await Follow.count({ where: { followingId: userId } });
  const followingsCount = await Follow.count({ where: { followerId: userId } });

  // Возвращаем один плоский объект со всеми данными
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarURL: user.avatarURL,
    recipesCount,
    favoritesCount,
    followersCount,
    followingsCount,
  };
}
