import User from '../models/User.js';
import HttpError from '../helpers/HttpError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';


export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw HttpError(409, "Email in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    avatarURL
  });

  return {
    user: {
      name: newUser.name,
      email: newUser.email,
      avatarURL: newUser.avatarURL
    }
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(401, "Email or password is wrong");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpError(401, "Email or password is wrong");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  user.token = token;
  await user.save();

  return {
    token,
    user: {
      name: user.name,
      email: user.email,
      avatarURL: user.avatarURL
    }
  };
}

export async function logoutUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw HttpError(401, "Not authorized");
  user.token = null;
  await user.save();
}

export const updateAvatar = async (userId, avatarURL) => {
  const user = await User.findByPk(userId);
  if (!user) throw HttpError(404, 'Користувача не знайдено');

  await user.update({ avatarURL });

  return { avatarURL };
};

export async function getFollowers(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: User,
        as: "followers",
        attributes: ["id", "name", "email", "avatarURL"],
      },
    ],
  });

  if (!user || !user.followers || user.followers.length === 0) {
    return [];
  }

  return user.followers;
}

export async function getFollowings(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: User,
        as: "followings",
        attributes: ["id", "name", "email", "avatarURL"],
      },
    ],
  });

  if (!user || !user.followings || user.followings.length === 0) {
    return [];
  }

  return user.followings;
}