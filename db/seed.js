import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import sequelize from "./sequelize.js";
import {
  Area,
  Category,
  Ingredient,
  User,
  Recipe,
  Testimonial,
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadJSON = async (filename) => {
  const data = await fs.readFile(
    path.join(__dirname, "source", filename),
    "utf-8"
  );
  return JSON.parse(data);
};

const runSeeding = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Database synced. Seeding...");

    const areas = await loadJSON("areas.json");
    const categories = await loadJSON("categories.json");
    const ingredients = await loadJSON("ingredients.json");
    const users = await loadJSON("users.json");
    const recipes = await loadJSON("recipes.json");
    const testimonials = await loadJSON("testimonials.json");

    await Area.bulkCreate(areas);
    await Category.bulkCreate(categories);
    await Ingredient.bulkCreate(ingredients);
    await User.bulkCreate(users);
    await Recipe.bulkCreate(recipes);
    await Testimonial.bulkCreate(testimonials);

    console.log("🌱 Seeding complete!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === "production") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "⚠️  You are in PRODUCTION. Do you really want to seed the DB? (yes/no) ",
    (answer) => {
      rl.close();
      if (answer.toLowerCase() !== "yes") {
        console.log("❌ Seeding aborted.");
        process.exit(1);
      } else {
        runSeeding();
      }
    }
  );
} else {
  runSeeding();
}
