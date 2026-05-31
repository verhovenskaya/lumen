import {
  createUser,
  findUserByUsername,
} from "../user/user.repository";

import {
  hashPassword,
  comparePassword,
} from "../../utils/password";

import { generateToken } from "../../utils/jwt";

export const register = async (
  username: string,
  password: string
) => {
  const existingUser =
    await findUserByUsername(username);

  if (existingUser) {
    throw new Error("Пользователь уже существует");
  }

  const passwordHash =
    await hashPassword(password);

  const user = await createUser(
    username,
    passwordHash
  );

  const token = generateToken(user.id);

  return {
    user,
    token,
  };
};

export const login = async (
  username: string,
  password: string
) => {
  const user =
    await findUserByUsername(username);

  if (!user) {
    throw new Error("Неверный логин или пароль");
  }

  const isValid =
    await comparePassword(
      password,
      user.password_hash
    );

  if (!isValid) {
    throw new Error("Неверный логин или пароль");
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};