const fs = require("fs");
const path = require("path");

// Define path for recipe storage file
const filePath = path.join(__dirname, "recipes.json");

/**
 * Saves recipes asynchronously to the JSON file.
 * - Uses `fs.promises.writeFile` to avoid blocking execution.
 * - Returns `true` on success, `false` on failure.
 * - Catches errors to prevent application crashes.
 *
 * @param {Array} recipes - List of recipes to be saved.
 * @returns {Promise<boolean>} - `true` if successful, `false` otherwise.
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
 * - Returns an empty array if the file is missing.
 * - Handles corrupted JSON gracefully to prevent application crashes.
 * - Ensures valid output by checking if parsed data is an array.
 *
 * @returns {Array} - Array of stored recipes.
 */
const getRecipes = () => {
  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ recipes.json file not found, returning an empty array.");
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : []; // Ensures valid output format
  } catch (error) {
    console.error("❌ Failed to parse recipes.json:", error);
    return [];
  }
};

/**
 * Adds a new recipe to the storage file.
 * - Prevents duplicates using a Set for fast lookup (O(1) complexity).
 * - Assigns a unique ID based on the number of existing recipes.
 * - Calls `saveRecipes()` to persist data.
 *
 * @param {Object} recipe - Recipe object with `name`, `ingredients`, and `instructions`.
 * @returns {Promise<boolean>} - `true` if successfully added, `false` if duplicate.
 */
const addRecipe = async (recipe) => {
  const recipes = getRecipes();
  const recipeNames = new Set(recipes.map((r) => r.name.toLowerCase().trim()));

  if (recipeNames.has(recipe.name.toLowerCase().trim())) {
    console.error("⚠️ Recipe already exists!");
    return false;
  }

  recipe.id = recipes.length + 1; // Assign unique ID
  recipes.push(recipe); // Add new recipe

  return await saveRecipes(recipes);
};

/**
 * Updates an existing recipe by name.
 * - Uses `findIndex()` to locate the recipe for modification.
 * - Merges new properties into the existing recipe to prevent overwriting.
 * - Calls `saveRecipes()` to persist the changes.
 *
 * @param {string} recipeName - Name of the recipe to update.
 * @param {Object} updatedRecipe - Object containing new properties (e.g., updated ingredients).
 * @returns {Promise<boolean>} - `true` if update is successful, `false` if recipe not found.
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

  recipes[index] = { ...recipes[index], ...updatedRecipe }; // Merge updates

  return await saveRecipes(recipes);
};

/**
 * Deletes a recipe by name.
 * - Uses `filter()` to remove the specified recipe.
 * - Returns `false` if the recipe does not exist.
 * - Calls `saveRecipes()` to persist the deletion.
 *
 * @param {string} recipeName - Name of the recipe to delete.
 * @returns {Promise<boolean>} - `true` if deletion was successful, `false` otherwise.
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

// Export functions for external use, enabling modularity and code reuse
module.exports = {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
};
