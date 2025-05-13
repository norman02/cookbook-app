const fs = require("fs");
const path = require("path");

// Define the path for storing recipe data
const filePath = path.join(__dirname, "recipes.json");

/**
 * Centralized schema definition for recipe validation.
 * - Allows easy modifications without refactoring core logic.
 * - Defines required fields and their expected types.
 */
const recipeSchema = {
  name: { type: "string", required: true },
  ingredients: { type: "array", required: true },
  instructions: { type: "string", required: true },
  category: { type: "string", required: false },
  tags: { type: "array", required: false } // Enables dietary labels like 'vegan' and 'gluten-free'
};

/**
 * Validates a recipe (or update) against the defined schema.
 * - Only copies fields that exist in the schema.
 * - Checks that the provided value's type matches the expected type.
 * - For new recipes (isUpdate == false) it rejects if a required field is missing.
 * - After validation, any missing optional field is given a default value.
 *
 * @param {Object} recipe - The recipe (or update) to validate.
 * @param {boolean} [isUpdate=false] - If true, do not require missing fields.
 * @returns {Object|null} - The validated recipe or `null` if validation fails.
 */
const validateRecipe = (recipe, isUpdate = false) => {
  const validatedRecipe = {};

  // Only consider keys from the schema; ignore any unexpected fields.
  for (const [key, rule] of Object.entries(recipeSchema)) {
    if (recipe[key] !== undefined) {
      if (rule.type === "array" && !Array.isArray(recipe[key])) {
        // If an array is expected but not provided correctly, use an empty array
        validatedRecipe[key] = [];
      } else if (rule.type === "string" && typeof recipe[key] !== "string") {
        // If a string is expected but the type doesn’t match, default to empty string
        validatedRecipe[key] = "";
      } else {
        validatedRecipe[key] = recipe[key];
      }
    } else if (rule.required && !isUpdate) {
      // For new recipes, if a required field is missing, fail validation
      console.error(`❌ Missing required field: ${key}`);
      return null;
    }
  }

  // Append default values for missing optional fields.
  // This ensures fields like "tags" are always defined (useful for later checks)
  for (const [key, rule] of Object.entries(recipeSchema)) {
    if (validatedRecipe[key] === undefined) {
      if (rule.type === "array") {
        validatedRecipe[key] = [];
      } else if (rule.type === "string") {
        validatedRecipe[key] = "";
      }
    }
  }

  return validatedRecipe;
};

/**
 * Saves recipes asynchronously to the JSON file.
 * - Uses `fs.promises.writeFile` to prevent blocking execution.
 * - Catches errors to avoid application crashes.
 *
 * @param {Array} recipes - Array of recipes to save.
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
 * - Handles corrupted JSON gracefully to prevent crashes.
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
 * Adds a new recipe to storage.
 * - Validates the recipe using the schema.
 * - Ensures the recipe name is unique.
 *
 * @param {Object} recipe - Recipe object to add.
 * @returns {Promise<boolean>} - `true` if successfully added, `false` otherwise.
 */
const addRecipe = async (recipe) => {
  const validatedRecipe = validateRecipe(recipe);
  if (!validatedRecipe) return false; // Reject if validation fails

  const recipes = getRecipes();
  const recipeNames = new Set(
    recipes.map((r) => r.name.toLowerCase().trim())
  );

  if (recipeNames.has(validatedRecipe.name.toLowerCase().trim())) {
    console.error("⚠️ Recipe already exists!");
    return false;
  }

  validatedRecipe.id = recipes.length + 1; // Assign a unique ID
  recipes.push(validatedRecipe);

  return await saveRecipes(recipes);
};

/**
 * Updates an existing recipe.
 * - Validates the updated fields (allows partial updates).
 * - Merges the validated update data into the existing recipe.
 *
 * @param {string} recipeName - Name of the recipe to update.
 * @param {Object} updatedRecipe - New properties to update.
 * @returns {Promise<boolean>} - `true` if updated, `false` otherwise.
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

  // For updates, we allow partial changes; hence pass 'true' for isUpdate.
  const validatedUpdate = validateRecipe(updatedRecipe, true);
  if (!validatedUpdate) return false; // Reject invalid updates

  recipes[index] = { ...recipes[index], ...validatedUpdate };

  return await saveRecipes(recipes);
};

/**
 * Deletes a recipe by name.
 * - Ensures only existing recipes are removed.
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

// Export functions for modularity and code reuse
module.exports = {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
};
