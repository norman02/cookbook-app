const fs = require("fs");
const path = require("path");

// Define path for recipe storage file
const filePath = path.join(__dirname, "recipes.json");

/**
 * Helper function to save recipes asynchronously.
 * Returns `true` if successful, `false` otherwise.
 */
const saveRecipes = async (recipes) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving recipes asynchronously:", error);
    return false;
  }
};

/**
 * Retrieves all recipes from the JSON file.
 * If the file is missing or unreadable, returns an empty array.
 */
const getRecipes = () => {
  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ recipes.json file not found, returning an empty array.");
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : []; // Ensures valid output
  } catch (error) {
    console.error("❌ Failed to parse recipes.json:", error);
    return [];
  }
};

/**
 * Adds a new recipe to the storage file.
 * Prevents duplicate recipes based on name (case insensitive).
 * Returns `true` if successful, `false` otherwise.
 */
const addRecipe = async (recipe) => {
  const recipes = getRecipes();
  const recipeNames = new Set(recipes.map((r) => r.name.toLowerCase().trim()));

  if (recipeNames.has(recipe.name.toLowerCase().trim())) {
    console.error("⚠️ Recipe already exists!");
    return false;
  }

  // Assign a unique ID & push recipe
  recipe.id = recipes.length + 1;
  recipes.push(recipe);

  return await saveRecipes(recipes);
};

/**
 * Updates an existing recipe by name.
 * Merges new properties into the existing recipe.
 * Returns `true` if successful, `false` if the recipe is not found.
 */
const updateRecipe = async (recipeName, updatedRecipe) => {
  const recipes = getRecipes();
  const index = recipes.findIndex(
    (r) => r.name.toLowerCase() === recipeName.toLowerCase()
  );

  if (index === -1) {
    console.error("❌ Recipe not found!");
    return false;
  }

  // Merge updates into the existing recipe
  recipes[index] = { ...recipes[index], ...updatedRecipe };

  return await saveRecipes(recipes);
};

/**
 * Deletes a recipe by name.
 * Returns `true` if successful, `false` if the recipe does not exist.
 */
const deleteRecipe = async (recipeName) => {
  const recipes = getRecipes();
  const updatedRecipes = recipes.filter(
    (r) => r.name.toLowerCase() !== recipeName.toLowerCase()
  );

  if (updatedRecipes.length === recipes.length) {
    console.error("❌ Recipe not found!");
    return false;
  }

  return await saveRecipes(updatedRecipes);
};

// Export functions for external use
module.exports = {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
};
