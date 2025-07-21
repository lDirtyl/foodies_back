import { Op } from "sequelize";
import HttpError from "../helpers/HttpError.js";
import {
  Recipe,
  Ingredient,
  RecipeIngredient,
  User,
  Category,
  Area,
} from "../models/index.js";

export const searchRecipes = async ({
  keyword,
  category,
  ingredient,
  area,
  page = 1,
  limit = 12,
  userId,
}) => {
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
      as: "ingredients",
      where: { id: ingredient },
      through: { attributes: [] },
      required: true,
    });
  }

  includeOptions.push({
    model: User,
    as: "owner",
    attributes: ["name", "avatarURL"],
  });

  const { rows, count } = await Recipe.findAndCountAll({
    where: filter,
    include: includeOptions,
    limit,
    offset,
    distinct: true,
  });

  if (userId) {
    const user = await User.findByPk(userId);
    if (user) {
      const favoriteRecipes = await user.getFavorites({ attributes: ["id"] });
      const favoriteRecipeIds = new Set(favoriteRecipes.map((r) => r.id));
      rows.forEach((recipe) => {
        recipe.dataValues.isFavorite = favoriteRecipeIds.has(recipe.id);
      });
    }
  }

  let availableIngredients = [];
  let availableAreas = [];

  if (category) {
    // Find all unique area IDs for the given category
    const areas = await Recipe.findAll({
      where: { categoryId: category },
      attributes: [[Recipe.sequelize.fn('DISTINCT', Recipe.sequelize.col('areaId')), 'areaId']],
      raw: true,
    });
    availableAreas = areas.map(a => a.areaId).filter(id => id);

    // Find all unique ingredient IDs for the given category
    const recipesInCategory = await Recipe.findAll({
      where: { categoryId: category },
      attributes: ['id'],
    });
    const recipeIds = recipesInCategory.map(r => r.id);

    if (recipeIds.length > 0) {
      const ingredients = await RecipeIngredient.findAll({
        where: { recipeId: { [Op.in]: recipeIds } },
        attributes: [[Recipe.sequelize.fn('DISTINCT', Recipe.sequelize.col('ingredientId')), 'ingredientId']],
        raw: true,
      });
      availableIngredients = ingredients.map(i => i.ingredientId);
    }
  }

  return {
    recipes: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
    availableAreas,
    availableIngredients,
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
          attributes: ["measure"],
        },
      },
      {
        model: User,
        as: "owner",
        attributes: ["id", "name"],
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

    const [popularRecipeIds] = await Recipe.sequelize.query(query);

    if (!popularRecipeIds.length) {
      return {
        recipes: [],
        pagination: { page, limit, total: 0 },
      };
    }

    const recipeIds = popularRecipeIds.map((r) => r.id);

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
  const { ingredients, ...recipeData } = data;
  let recipe;

  try {
    recipe = await Recipe.create({ ...recipeData, ownerId });

    if (ingredients && ingredients.length > 0) {
      const recipeIngredients = ingredients.map(({ id, measure }) => ({
        recipeId: recipe.id,
        ingredientId: id,
        measure,
      }));

      await RecipeIngredient.bulkCreate(recipeIngredients);
    }
  } catch (error) {
    throw HttpError(400, "Failed to create recipe: " + error.message);
  }

  return getRecipeById(recipe.id);
}

export async function updateRecipe(id, ownerId, data) {
  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }
  if (recipe.ownerId !== ownerId) {
    throw HttpError(403, "Not authorized to edit this recipe");
  }

  const { ingredients, ...recipeData } = data;

  await recipe.update(recipeData);

  if (ingredients) {
    await RecipeIngredient.destroy({ where: { recipeId: id } });
    const recipeIngredients = ingredients.map(
      ({ id: ingredientId, measure }) => ({
        recipeId: recipe.id,
        ingredientId,
        measure,
      }),
    );
    await RecipeIngredient.bulkCreate(recipeIngredients);
  }

  return getRecipeById(id);
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

  const totalCount = await Recipe.count({
    where: { ownerId },
  });

  const { rows } = await Recipe.findAndCountAll({
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
    distinct: true,
  });

  return {
    recipes: rows,
    pagination: { page, limit, total: totalCount },
  };
}

export async function addFavorite(recipeId, userId) {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw HttpError(404, "Recipe not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await user.addFavorite(recipe);

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

  await user.removeFavorite(recipe);

  return recipe;
}

export async function getFavoriteRecipes(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(404, "User not found");
  }

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

  const count = await user.countFavorites();

  return {
    recipes: favorites,
    pagination: { page, limit, total: count },
  };
}

export async function getCreationData() {
  const [categories, ingredients, areas] = await Promise.all([
    Category.findAll({ order: [["name", "ASC"]] }),
    Ingredient.findAll({ order: [["name", "ASC"]] }),
    Area.findAll({ order: [["name", "ASC"]] }),
  ]);

  return { categories, ingredients, areas };
}
