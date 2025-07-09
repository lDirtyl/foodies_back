"use strict";

const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || "";
const baseUrl = port ? `http://${host}:${port}` : `http://${host}`;

module.exports = {
  async up(queryInterface) {
    const dataPath = path.join(__dirname, "../db/source/users.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);

    const users = parsed;
    const relationships = { followers: {} };

    const now = new Date();

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        id: uuidv4(), // ← обязательно заменить!
        name: user.name,
        email: user.email,
        password: await bcrypt.hash("password123", 10),
        avatarURL:
          user.name === "Foodies Admin"
            ? `${baseUrl}/public/images/avatars/admin.png`
            : `${baseUrl}/public/images/avatars/default.png`,
        token: null,
        createdAt: now,
        updatedAt: now,
      }))
    );

    await queryInterface.bulkInsert("users", hashedUsers);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
