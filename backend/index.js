/**
 * index.js
 *
 * This is our refactored recipe API module. It defines the core operations:
 *   - Retrieving recipes
 *   - Adding new recipes (with duplicate prevention and schema validation)
 *   - Updating existing recipes (only the schema-defined fields)
 *   - Deleting recipes (fails if the target is not found)
 *
 * The module delegates storage operations (read and write) to a separate storage
 * backend. The backend is chosen dynamically using the environment variable:
 *   - If process.env.USE_DB is "true", the database storage (dbStorage.js) is used.
 *   - Otherwise, file-based storage (fileStorage.js) is used.
 *
 * This decoupling allows the business logic here to remain agnostic of whether data
 * is stored in a file or a database.
 */

// Dynamically require the appropriate storage backend based on configuration,
// using __dirname to anchor our paths relative to this file's location.
const storage =
  process.env.USE_DB === "true"
    ? require(`${__dirname}/dbStorage`)
    : require(`${__dirname}/fileStorage`);

/**
 * Recipe Schema Definition.
 * Only keys defined here are allowed. Fields marked as required must be present
 * when adding a new recipe.
 */
const recipeSchema = {
  name: { type: "string", required: true },
  ingredients: { type: "array", required: true },
  instructions: { type: "string", required: true },
  category: { type: "string", required: false },
  tags: { type: "array", required: false },
};

/**
 * validateRecipe(recipe, isUpdate)
 *
 * Validates and sanitizes an input recipe against the defined schema.
 * - Only keys defined in the schema are kept.
 * - If a required field is missing (on creation), the function returns null.
 * - For an update (isUpdate=true), missing fields are ignored.
 *
 * @param {Object} recipe - The recipe object to validate.
 * @param {boolean} [isUpdate=false] - Indicates if this is a partial update.
 * @returns {Object|null} - A validated recipe object, or null if validation fails.
 */
const validateRecipe = (recipe, isUpdate = false) => {
  const validated = {};

  // Loop over allowed keys only
  for (const key in recipeSchema) {
    const rule = recipeSchema[key];
    if (recipe.hasOwnProperty(key)) {
      // Validate type: if type mismatches, use a default value.
      if (rule.type === "string" && typeof recipe[key] === "string") {
        validated[key] = recipe[key];
      } else if (rule.type === "array" && Array.isArray(recipe[key])) {
        validated[key] = recipe[key];
      } else {
        // If provided value doesn't match type, default to an empty value.
        validated[key] = rule.type === "string" ? "" : [];
      }
    } else if (rule.required && !isUpdate) {
      // For new recipes, a required field is missing → validation fails.
      return null;
    } else {
      // For optional fields or updates, set a default.
      validated[key] = rule.type === "string" ? "" : [];
    }
  }
  return validated;
};

/**
 * getRecipes()
 *
 * Retrieves the current list of recipes from the chosen storage.
 *
 * @returns {Promise<Array>} - Resolves with an array of recipes.
 */
const getRecipes = async () => {
  const data = await storage.getRecipes();
  return Array.isArray(data) ? data : [];
};

/**
 * saveRecipes(recipes)
 *
 * Persists the provided array of recipes to storage.
 *
 * @param {Array} recipes - The array of recipes to persist.
 * @returns {Promise<boolean>} - Resolves to true if save succeeded; false otherwise.
 */
const saveRecipes = async (recipes) => {
  return await storage.saveRecipes(recipes);
};

/**
 * addRecipe(recipe)
 *
 * Adds a new recipe after validating it.
 * - Prevents adding a duplicate (compared case-insensitively on name).
 * - Returns false if the recipe is invalid or already exists.
 *
 * @param {Object} recipe - The recipe to add.
 * @returns {Promise<boolean>} - Resolves to true if added; false otherwise.
 */
const addRecipe = async (recipe) => {
  const recipes = await getRecipes();

  // Check for duplicates (case-insensitive match on recipe name)
  const duplicate = recipes.some(
    (r) => r.name.trim().toLowerCase() === recipe.name.trim().toLowerCase()
  );
  if (duplicate) return false;

  // Validate and sanitize the recipe.
  const validatedRecipe = validateRecipe(recipe);
  if (!validatedRecipe) return false;

  recipes.push(validatedRecipe);
  return await saveRecipes(recipes);
};

/**
 * updateRecipe(recipeName, updatedRecipe)
 *
 * Updates an existing recipe with new data.
 * - Finds the recipe by name (case-insensitive).
 * - Only overwrites allowed fields (ignores unexpected ones).
 *
 * @param {string} recipeName - The name of the recipe to update.
 * @param {Object} updatedRecipe - The partial recipe data to update.
 * @returns {Promise<boolean>} - Resolves to true if updated; false if recipe not found.
 */
const updateRecipe = async (recipeName, updatedRecipe) => {
  const recipes = await getRecipes();
  const idx = recipes.findIndex(
    (r) => r.name.trim().toLowerCase() === recipeName.trim().toLowerCase()
  );
  if (idx === -1) return false; // Recipe not found

  // Filter to allowed fields from the update data for consistency
  const allowedUpdates = {};
  for (const key in recipeSchema) {
    if (updatedRecipe.hasOwnProperty(key)) {
      // Only update if type is valid.
      if (recipeSchema[key].type === "string" && typeof updatedRecipe[key] === "string") {
        allowedUpdates[key] = updatedRecipe[key];
      } else if (recipeSchema[key].type === "array" && Array.isArray(updatedRecipe[key])) {
        allowedUpdates[key] = updatedRecipe[key];
      }
    }
  }

  // Merge existing recipe with allowed updated data.
  recipes[idx] = { ...recipes[idx], ...allowedUpdates };
  return await saveRecipes(recipes);
};

/**
 * deleteRecipe(recipeName)
 *
 * Deletes a recipe identified by its name.
 * - Returns false if no matching recipe is found.
 *
 * @param {string} recipeName - The name of the recipe to delete.
 * @returns {Promise<boolean>} - Resolves to true if deletion succeeded; false otherwise.
 */
const deleteRecipe = async (recipeName) => {
  const recipes = await getRecipes();
  const filtered = recipes.filter(
    (r) => r.name.trim().toLowerCase() !== recipeName.trim().toLowerCase()
  );
  if (filtered.length === recipes.length) {
    return false; // No recipe was removed, i.e. not found.
  }
  return await saveRecipes(filtered);
};

// Export functions for use in other parts of the app.
module.exports = { getRecipes, addRecipe, updateRecipe, deleteRecipe, validateRecipe };
