/**
 * __tests__/recipe.test.js
 *
 * This test suite verifies the recipe API functionality in our refactored index.js.
 * It uses a mocked fileStorage module so that recipes are persisted in memory,
 * thereby avoiding file system I/O during tests.
 */

// Force the use of file-based storage.
process.env.USE_DB = "false";

// Use a variable name with a "mock" prefix so that Jest allows it in the module factory.
let mockRecipes = [];

// Helper to reset our in-memory storage before each test.
const resetMockRecipes = (recipes = []) => {
  mockRecipes = [...recipes];
};

// Mock the fileStorage module so that its getRecipes and saveRecipes functions
// work on our in-memory "mockRecipes" variable.
jest.mock("../fileStorage", () => {
  return {
    getRecipes: jest.fn(() => Promise.resolve(mockRecipes)),
    saveRecipes: jest.fn((recipes) => {
      mockRecipes = recipes;
      return Promise.resolve(true);
    }),
  };
});

// Now require the recipe API from our refactored index.js.
const { getRecipes, addRecipe, updateRecipe, deleteRecipe } = require("../index");

// A shared valid recipe used in tests.
const testRecipe = {
  name: "Chocolate Cake",
  ingredients: ["flour", "sugar"],
  instructions: "Bake at 350°F for 30 minutes.",
};

describe("Recipe API", () => {
  beforeEach(() => {
    // Reset our in-memory storage and clear any mock history.
    resetMockRecipes([]);
    jest.clearAllMocks();
  });

  test("should return an array of recipes", async () => {
    resetMockRecipes([testRecipe]);
    const recipes = await getRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes).toHaveLength(1);
  });

  test("should return an empty array if recipes.json is missing", async () => {
    // Simulate missing storage by resetting to an empty array.
    resetMockRecipes([]);
    const recipes = await getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should add a new recipe", async () => {
    resetMockRecipes([]);
    const result = await addRecipe(testRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].name).toBe(testRecipe.name);
  });

  test("should not add a duplicate recipe", async () => {
    resetMockRecipes([testRecipe]);
    const result = await addRecipe(testRecipe);
    // Duplicate prevention: adding a recipe with the same name (case-insensitive) should return false.
    expect(result).toBe(false);
    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
  });

  test("should update an existing recipe", async () => {
    resetMockRecipes([testRecipe]);
    const updatedRecipe = { ingredients: ["flour", "sugar", "vanilla"] };
    const result = await updateRecipe(testRecipe.name, updatedRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes[0].ingredients).toEqual(updatedRecipe.ingredients);
  });

  test("should return false if trying to update a non-existent recipe", async () => {
    resetMockRecipes([]);
    const result = await updateRecipe("Nonexistent Recipe", { ingredients: ["vanilla"] });
    expect(result).toBe(false);
  });

  test("should delete an existing recipe", async () => {
    resetMockRecipes([testRecipe]);
    const result = await deleteRecipe(testRecipe.name);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes).toHaveLength(0);
  });

  test("should return false if trying to delete a non-existent recipe", async () => {
    resetMockRecipes([]);
    const result = await deleteRecipe("Nonexistent Recipe");
    expect(result).toBe(false);
  });

  test("should add a recipe with categrory", async () => {
    resetMockRecipes([]);
    // A recipe with a misspelled key "categrory" should have that field filtered out.
    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350 F for 30 minutes.",
      categrory: "Desert",
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    // The invalid key should be removed by schema validation.
    expect(recipes[0]).not.toHaveProperty("categrory");
  });

  test("should ignore unexpected fields in recipe", async () => {
    resetMockRecipes([]);
    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350°F",
      category: "Dessert",
      maliciousField: "HACKER_DATA", // This field should be stripped out.
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes[0]).not.toHaveProperty("maliciousField");
    expect(recipes[0]).toHaveProperty("category", "Dessert");
  });

  test("should add a recipe with tags", async () => {
    resetMockRecipes([]);
    const newRecipe = {
      name: "Quinoa Salad",
      ingredients: ["quinoa", "cucumber", "lemon"],
      instructions: "Mix all ingredients and serve chilled.",
      tags: ["vegan", "gluten-free"],
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes[0]).toHaveProperty("tags");
    expect(recipes[0].tags).toContain("vegan");
  });

  test("should validate recipe schema and reject invalid fields", async () => {
    resetMockRecipes([]);
    const newRecipe = {
      name: "Vegan Burger",
      ingredients: ["chickpeas", "lettuce", "bun"],
      instructions: "Grill patty and assemble burger.",
      category: "Main Course",
      tags: ["vegan", "high-protein"],
      unexpectedField: "this should not exist", // This field must be filtered out.
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
    const recipes = await getRecipes();
    expect(recipes[0]).not.toHaveProperty("unexpectedField");
    expect(recipes[0]).toHaveProperty("category", "Main Course");
    expect(recipes[0]).toHaveProperty("tags");
    expect(recipes[0].tags).toContain("vegan");
  });
});
