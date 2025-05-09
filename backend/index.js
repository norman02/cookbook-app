const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "recipes.json");

const getRecipes = () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error reading recipes:", error);
    return [];
  }
};

const addRecipe = (recipe) => {
  const recipes = getRecipes();

  // Prevent duplicates - Check existing recipes
  if (
    recipes.some(
      (r) => r.name.trim().toLowerCase() === recipe.name.trim().toLowerCase(),
    )
  ) {
    console.error("⚠️ Recipe already exists!");
    return false; // Ensure function returns false when a duplicate is found
  }

  // Assign unique ID
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
module.exports = { getRecipes, addRecipe };
