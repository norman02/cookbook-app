const fs = require("fs");
const {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
} = require("../index");

// Use a variable name with a "mock" prefix to satisfy Jest's module factory restrictions.
let mockFileContents = "[]";

// Replace the fs mocks with a stateful implementation using our in-memory variable.
jest.mock("fs", () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => mockFileContents),
  promises: {
    writeFile: jest.fn((filePath, data) => {
      mockFileContents = data; // Update our in-memory file data.
      return Promise.resolve();
    }),
  },
}));

// Shared test recipe.
const testRecipe = {
  name: "Chocolate Cake",
  ingredients: ["flour", "sugar"],
  instructions: "Bake at 350°F for 30 minutes.",
};

// Helper function to reset the in-memory file system before each test.
const resetFakeFileSystem = (recipes = []) => {
  mockFileContents = JSON.stringify(recipes);
};

beforeEach(() => {
  resetFakeFileSystem();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
  jest.restoreAllMocks();
});

describe("Recipe API", () => {
  test("should return an array of recipes", () => {
    resetFakeFileSystem([testRecipe]);

    const recipes = getRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes).toHaveLength(1);
  });

  test("should return an empty array if recipes.json is missing", () => {
    // Override existsSync for this test.
    fs.existsSync.mockReturnValueOnce(false);

    const recipes = getRecipes();
    expect(recipes).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ recipes.json file not found, returning an empty array."
    );
  });

  test("should add a new recipe", async () => {
    resetFakeFileSystem([]);
    const result = await addRecipe(testRecipe);
    expect(result).toBe(true);
  });

  test("should not add a duplicate recipe", async () => {
    resetFakeFileSystem([testRecipe]);
    const result = await addRecipe(testRecipe);
    expect(result).toBe(false);
  });

  test("should update an existing recipe", async () => {
    resetFakeFileSystem([testRecipe]);
    const updatedRecipe = { ingredients: ["flour", "sugar", "vanilla"] };
    const result = await updateRecipe(testRecipe.name, updatedRecipe);
    expect(result).toBe(true);
  });

  test("should delete an existing recipe", async () => {
    resetFakeFileSystem([testRecipe]);
    const result = await deleteRecipe(testRecipe.name);
    expect(result).toBe(true);
  });

  test("should return false if writing recipes file fails", async () => {
    fs.promises.writeFile.mockRejectedValueOnce(new Error("Write failed"));
    const result = await saveRecipes([testRecipe]);
    expect(result).toBe(false);
  });

  test("should return an empty array if recipes.json contains invalid JSON", () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("INVALID_JSON"); // Corrupted JSON.

    const recipes = getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should return false if trying to update a non-existent recipe", async () => {
    resetFakeFileSystem([]);
    const result = await updateRecipe("Nonexistent Recipe", {
      ingredients: ["vanilla"],
    });
    expect(result).toBe(false);
  });

  test("should return false if trying to delete a non-existent recipe", async () => {
    resetFakeFileSystem([]);
    const result = await deleteRecipe("Nonexistent Recipe");
    expect(result).toBe(false);
  });

  test("should return an empty array if parsed data is not an array", () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce(
      JSON.stringify({ invalidKey: "Not an array" })
    );
    const recipes = getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should add a recipe with categrory", async () => {
    resetFakeFileSystem([]);
    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350 F for 30 minutes.",
      categrory: "Desert", // Intentional typo to simulate an unexpected field.
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
  });

  test("should ignore unexpected fields in recipe", async () => {
    resetFakeFileSystem([]);
    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350°F",
      category: "Dessert",
      maliciousField: "HACKER_DATA", // Unwanted field.
    };

    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);

    const recipes = getRecipes();
    // Ensure unexpected "maliciousField" is not present.
    expect(recipes.some((r) => r.maliciousField !== undefined)).toBe(false);
  });

  test("should add a recipe with tags", async () => {
    resetFakeFileSystem([]);
    const newRecipe = {
      name: "Quinoa Salad",
      ingredients: ["quinoa", "cucumber", "lemon"],
      instructions: "Mix all ingredients and serve chilled.",
      tags: ["vegan", "gluten-free"],
    };

    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);

    const recipes = getRecipes();
    expect(
      recipes.some((r) => r.name === "Quinoa Salad" && r.tags.includes("vegan"))
    ).toBe(true);
  });

  test("should validate recipe schema and reject invalid fields", async () => {
    resetFakeFileSystem([]);
    const newRecipe = {
      name: "Vegan Burger",
      ingredients: ["chickpeas", "lettuce", "bun"],
      instructions: "Grill patty and assemble burger.",
      category: "Main Course",
      tags: ["vegan", "high-protein"],
      unexpectedField: "this should not exist", // Invalid field.
    };

    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);

    const recipes = getRecipes();
    // Ensure the recipe was added without the unwanted "unexpectedField".
    expect(
      recipes.some(
        (r) => r.name === "Vegan Burger" && r.unexpectedField === undefined
      )
    ).toBe(true);
  });
  
});
