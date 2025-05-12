const fs = require("fs");
const path = require("path");

// Define path for recipe storage file
const filePath = path.join(__dirname, "recipes.json");

/**
 * Helper function to save recipes to the JSON file.
 * Returns `true` if successful, `false` otherwise.
 */
const saveRecipes = (recipes) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving recipes:", error);
    return false;
  }
};

/**
 * Retrieves all recipes from the JSON file.
 * If the file is missing or unreadable, returns an empty array.
 */
const getRecipes = () => {
  if (!fs.existsSync(filePath)) {
    console.warn("recipes.json file not found returning an empty array.");
    return []; // Ensures consistency in return type
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) || []; // Fallback to an empty array
  } catch (error) {
    console.error("Failed to parse recipes.json", error);
    return [];
  }
};

/**
 * Adds a new recipe to the storage file.
 * Prevents duplicate recipes based on name (case insensitive).
 * Returns `true` if successful, `false` otherwise.
 */
const addRecipe = (recipe) => {
  const recipes = getRecipes();

  // Prevent duplicate recipes based on name
  if (
    recipes.some(
      (r) => r.name.trim().toLowerCase() === recipe.name.trim().toLowerCase(),
    )
  ) {
    console.error("⚠️ Recipe already exists!");
    return false;
  }

  // Assign a unique ID to the recipe
  recipe.id = recipes.length + 1;
  recipes.push(recipe);

  return saveRecipes(recipes); // Use helper function
};

/**
 * Updates an existing recipe by name.
 * Merges new properties into the existing recipe.
 * Returns `true` if successful, `false` if the recipe is not found.
 */
const updateRecipe = (recipeName, updatedRecipe) => {
  const recipes = getRecipes();
  const index = recipes.findIndex(
    (r) => r.name.toLowerCase() === recipeName.toLowerCase(),
  );

  if (index === -1) {
    console.error("❌ Recipe not found!");
    return false;
  }

  // Merge updates into the existing recipe
  recipes[index] = { ...recipes[index], ...updatedRecipe };

  return saveRecipes(recipes);
};

/**
 * Deletes a recipe by name.
 * Returns `true` if successful, `false` if the recipe does not exist.
 */
const deleteRecipe = (recipeName) => {
  const recipes = getRecipes();
  const updatedRecipes = recipes.filter(
    (r) => r.name.toLowerCase() !== recipeName.toLowerCase(),
  );

  if (updatedRecipes.length === recipes.length) {
    console.error("❌ Recipe not found!");
    return false;
  }

  return saveRecipes(updatedRecipes);
};

// Export functions for external use
module.exports = {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
};
