import { Op, Sequelize } from "sequelize";
import Recipe from "../models/Recipe.js";
import Ingredient from "../models/Ingredient.js";
import RecipeIngredient from "../models/RecipeIngredient.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";

export const searchRecipes = async ({ keyword, category, ingredient, area, page = 1, limit = 12, userId }) => {
  const filter = {};
  if (keyword) {
    filter.title = { [Op.iLike]: `%${keyword}%` };
  }
  if (category) {
    filter.categoryId = category;
  }
  if (area) {
    filter.areaId = area;
  }

  const offset = (page - 1) * limit;

  const includeOptions = [];
  if (ingredient) {
    includeOptions.push({
      model: Ingredient,
      as: 'ingredients',
      where: { id: ingredient },
      through: { attributes: [] }, // Don't need data from the junction table here
      required: true, // This makes it an INNER JOIN
    });
  }

  includeOptions.push({
    model: User,
    as: 'owner',
    attributes: ['name', 'avatarURL'],
  });

  const { rows, count } = await Recipe.findAndCountAll({
    where: filter,
    include: includeOptions,
    limit,
    offset,
    distinct: true, // Necessary when using includes with limits
  });

  // If a user is logged in, check which recipes are favorites
  if (userId) {
    const user = await User.findByPk(userId);
    if (user) {
      const favoriteRecipes = await user.getFavorites({ attributes: ['id'] });
      const favoriteRecipeIds = new Set(favoriteRecipes.map(r => r.id));
      rows.forEach(recipe => {
        recipe.dataValues.isFavorite = favoriteRecipeIds.has(recipe.id);
      });
    }
  }

  return {
    recipes: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
};

export async function getRecipeById(id) {
  const recipe = await Recipe.findByPk(id, {
    include: [
      {
        model: Ingredient,
        as: "ingredients",
        through: {
          model: RecipeIngredient,
          attributes: ["measure"], // Include the measure attribute from the junction table
        },
      },
    ],
  });

  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }

  return recipe;
}

export async function getPopularRecipes({ page = 1, limit = 10 }) {
  try {
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.id, COUNT(f.id) as favorites_count
      FROM recipes r
      LEFT JOIN favorites f ON r.id = f."recipeId"
      GROUP BY r.id
      ORDER BY favorites_count DESC, r."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    let popularRecipeIds;
    try {
      [popularRecipeIds] = await Recipe.sequelize.query(query);
    } catch (err) {
      throw HttpError(
        500,
        "Failed to retrieve popular recipes: " + err.message,
      );
    }

    if (!popularRecipeIds.length) {
      return {
        recipes: [],
        pagination: { page, limit, total: 0 },
      };
    }

    const recipeIds = popularRecipeIds.map((r) => r.id);

    // Fetch full recipe details, preserving order
    const recipes = await Recipe.findAll({
      where: { id: { [Op.in]: recipeIds } },
      include: [
        {
          model: Ingredient,
          as: "ingredients",
          through: { model: RecipeIngredient, attributes: ["measure"] },
        },
      ],
    });

    // Map favorite counts to recipes and preserve order
    const recipesWithCounts = recipeIds
      .map((id) => {
        const recipe = recipes.find((r) => r.id === id);
        const favInfo = popularRecipeIds.find((r) => r.id === id);
        if (recipe)
          recipe.dataValues.favoriteCount = favInfo
            ? parseInt(favInfo.favorites_count)
            : 0;
        return recipe;
      })
      .filter(Boolean);

    // Get total count for pagination
    const totalCount = await Recipe.count();

    return {
      recipes: recipesWithCounts,
      pagination: { page, limit, total: totalCount },
    };
  } catch (err) {
    console.error("[getPopularRecipes] Top-level error:", err);
    throw err;
  }
}

export async function createRecipe(data, ownerId) {
  // Extract ingredients from the data
  const { ingredients, ...recipeData } = data;
  let recipe;

  try {
    // Create the recipe
    recipe = await Recipe.create({ ...recipeData, ownerId });

    // If ingredients were provided, associate them with the recipe
    if (ingredients && ingredients.length > 0) {
      // Create the recipe-ingredient associations with measures
      const recipeIngredients = ingredients.map(({ id, measure }) => ({
        recipeId: recipe.id,
        ingredientId: id,
        measure,
      }));

      // Get the RecipeIngredient model
      await RecipeIngredient.bulkCreate(recipeIngredients);
    }
  } catch (error) {
    throw HttpError(400, "Failed to create recipe: " + error.message);
  }

  // Return the newly created recipe with its ingredients
  return getRecipeById(recipe.id);
}

export async function deleteRecipe(id, ownerId) {
  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }
  if (recipe.ownerId !== ownerId) {
    throw HttpError(403, "Not authorized to delete this recipe");
  }
  await recipe.destroy();
  return;
}

export async function getRecipesByOwner(ownerId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Recipe.findAndCountAll({
    where: { ownerId },
    limit,
    offset,
    include: [
      {
        model: Ingredient,
        as: "ingredients",
        through: {
          model: RecipeIngredient,
          attributes: ["measure"],
        },
      },
    ],
  });
  return {
    recipes: rows,
    pagination: { page, limit, total: count },
  };
}
// Favorites functionality
export async function addFavorite(recipeId, userId) {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(404, "User not found");
  }

  // Add to favorites using the association method
  await user.addFavorite(recipe);

  // Return the recipe with updated favorites info
  return recipe;
}

export async function removeFavorite(recipeId, userId) {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(404, "User not found");
  }

  // Remove from favorites using the association method
  await user.removeFavorite(recipe);

  // Return the recipe with updated favorites info
  return recipe;
}

export async function getFavoriteRecipes(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(404, "User not found");
  }

  // Get the favorites with pagination
  const favorites = await user.getFavorites({
    limit,
    offset,
    include: [
      {
        model: Ingredient,
        as: "ingredients",
        through: {
          model: RecipeIngredient,
          attributes: ["measure"],
        },
      },
    ],
  });

  // Count the total favorites
  const count = await user.countFavorites();

  return {
    recipes: favorites,
    pagination: { page, limit, total: count },
  };
}
