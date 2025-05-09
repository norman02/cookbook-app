const fs = require("fs");
const path = require("path");

// Define path for recipe storage file
const filePath = path.join(__dirname, "recipes.json");

/**
 * Retrieves all recipes from the JSON file.
 * If the file is missing or unreadable, returns an empty array.
 */
const getRecipes = () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error reading recipes:", error);
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
  if (recipes.some(r => r.name.trim().toLowerCase() === recipe.name.trim().toLowerCase())) {
    console.error("⚠️ Recipe already exists!");
    return false;
  }

  // Assign a unique ID to the recipe
  recipe.id = recipes.length + 1;
  recipes.push(recipe);

  try {
    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving recipe:", error);
    return false;
  }
};

/**
 * Updates an existing recipe by name.
 * Merges new properties into the existing recipe.
 * Returns `true` if successful, `false` if the recipe is not found.
 */
const updateRecipe = (recipeName, updatedRecipe) => {
  const recipes = getRecipes();
  const index = recipes.findIndex(r => r.name.toLowerCase() === recipeName.toLowerCase());

  if (index === -1) {
    console.error("❌ Recipe not found!");
    return false;
  }

  // Merge updates into the existing recipe
  recipes[index] = { ...recipes[index], ...updatedRecipe };

  try {
    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving updated recipe:", error);
    return false;
  }
};

/**
 * Deletes a recipe by name.
 * Returns `true` if successful, `false` if the recipe does not exist.
 */
const deleteRecipe = (recipeName) => {
  const recipes = getRecipes();
  const updatedRecipes = recipes.filter(r => r.name.toLowerCase() !== recipeName.toLowerCase());

  if (updatedRecipes.length === recipes.length) {
    console.error("❌ Recipe not found!");
    return false;
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(updatedRecipes, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving updated recipe list:", error);
    return false;
  }
};

// Export functions for external use
module.exports = { getRecipes, addRecipe, updateRecipe, deleteRecipe };
