"use strict";

const recipesDataRaw = require("../db/source/recipes.json");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || "";
const baseUrl = port ? `http://${host}:${port}` : `http://${host}`;

const imagesDir = path.resolve(__dirname, "../public/images/recipies");

// 🔧 Удаление MongoDB ObjectId обёрток
function sanitizeMongoIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoIds);
  } else if (obj && typeof obj === "object") {
    if (obj.$oid) return obj.$oid;
    const newObj = {};
    for (const key in obj) {
      newObj[key] = sanitizeMongoIds(obj[key]);
    }
    return newObj;
  }
  return obj;
}

const recipesRawSanitized = sanitizeMongoIds(recipesDataRaw);

module.exports = {
  async up(queryInterface, Sequelize) {
    const areas = await queryInterface.sequelize.query(
      "SELECT id, name FROM areas",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const categories = await queryInterface.sequelize.query(
      "SELECT id, name FROM categories",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query("SELECT id FROM users", {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (users.length === 0) {
      throw new Error("❌ No users found in the database!");
    }

    const areaMap = Object.fromEntries(
      areas.map((a) => [a.name.toLowerCase().trim(), a.id])
    );
    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.name.toLowerCase().trim(), c.id])
    );

    await fsp.mkdir(imagesDir, { recursive: true });

    const recipesData = [];
    const recipesMap = [];

    for (const recipe of recipesRawSanitized) {
      const id = uuidv4(); // 🆕 генерируем валидный UUID
      const ownerId = users[Math.floor(Math.random() * users.length)].id;

      const areaId = recipe.area
        ? areaMap[recipe.area.toLowerCase().trim()] || null
        : null;
      const categoryId = recipe.category
        ? categoryMap[recipe.category.toLowerCase().trim()] || null
        : null;

      if (!categoryId) {
        console.warn(`⚠️ Category not found: ${recipe.category}`);
        continue;
      }

      let thumb = `${baseUrl}/public/images/recipies/default.png`;

      if (recipe.thumb) {
        try {
          const filename = path.basename(new URL(recipe.thumb).pathname);
          const sanitized = decodeURI(filename).replace(/ /g, "_");
          const localPath = path.join(imagesDir, sanitized);
          if (!fs.existsSync(localPath)) {
            const response = await axios({
              url: recipe.thumb,
              method: "GET",
              responseType: "stream",
            });

            await new Promise((resolve, reject) => {
              const writer = fs.createWriteStream(localPath);
              response.data.pipe(writer);
              writer.on("finish", resolve);
              writer.on("error", reject);
            });
          }

          thumb = `${baseUrl}/public/images/recipies/${sanitized}`;
        } catch (e) {
          console.warn(`⚠️ Could not download image: ${recipe.thumb}`);
        }
      }

      recipesMap.push({ title: recipe.title.trim(), newId: id });

      recipesData.push({
        id,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions || null,
        thumb,
        time: recipe.time || null,
        areaId,
        categoryId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("recipes", recipesData);

    const tempDir = path.resolve(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    fs.writeFileSync(
      path.join(tempDir, "recipes-map.json"),
      JSON.stringify(recipesMap, null, 2)
    );

    console.log("📝 Saved temp/recipes-map.json");
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("recipes", null, {});

    const dir = path.resolve(__dirname, "../public/images/recipies");

    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file !== "default.png") {
        const fullPath = path.join(dir, file);
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.warn(`⚠️ Could not delete file: ${fullPath}`, err);
        }
      }
    }
  },
};
