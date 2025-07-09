import sequelize from "../db/sequelize.js";

import User from "./User.js";
import Area from "./Area.js";
import Category from "./Category.js";
import Ingredient from "./Ingredient.js";
import Recipe from "./Recipe.js";
import Testimonial from "./Testimonial.js";

// User ↔ Recipe
User.hasMany(Recipe, { foreignKey: "ownerId", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Recipe ↔ Category
Recipe.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Recipe, { foreignKey: "categoryId", as: "recipes" });

// Recipe ↔ Area
Recipe.belongsTo(Area, { foreignKey: "areaId", as: "area" });
Area.hasMany(Recipe, { foreignKey: "areaId", as: "recipes" });

export { sequelize, User, Area, Category, Ingredient, Recipe, Testimonial };
