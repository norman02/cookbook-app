/* eslint-env jest */
const {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
} = require("../index");
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../recipes.json");

describe("Recipe API", () => {
  // Reset the recipes file before every test to ensure isolation
  beforeEach(() => {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  });
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore default logging after each test
  });
  test("should return an array of recipes", () => {
    const recipes = getRecipes();
    expect(Array.isArray(recipes)).toBe(true); // Expect result to be an array
  });

  test("should add a new recipe", () => {
    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar", "cocoa powder"],
      instructions: "Mix ingredients and bake.",
    };

    const result = addRecipe(newRecipe);
    expect(result).toBe(true);

    const updatedRecipes = getRecipes();
    expect(updatedRecipes.some((r) => r.name === "Chocolate Cake")).toBe(true);
  });

  test("should return an empty array if recipes.json is missing", () => {
    // Simulate missing file by mocking fs.readFileSync to throw an error
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("File not found");
    });

    expect(getRecipes()).toEqual([]);
    // Restore the original implementation so other tests are not affected
    fs.readFileSync.mockRestore();
  });

  test("should not add a duplicate recipe", () => {
    const recipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar", "cocoa powder"],
      instructions: "Mix ingredients and bake.",
    };

    // First addition should succeed
    const result1 = addRecipe(recipe);
    expect(result1).toBe(true);

    // Second addition with the same recipe should be rejected as a duplicate
    const result2 = addRecipe(recipe);
    expect(result2).toBe(false);
  });
  test("should update an existing recipe", () => {
    const recipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar", "cocoa powder"],
      instructions: "Mix ingredients and bake.",
    };

    addRecipe(recipe); // Add initial recipe

    const updatedRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar", "cocoa powder", "vanilla"],
      instructions: "Mix ingredients and bake with vanilla.",
    };

    const result = updateRecipe(recipe.name, updatedRecipe); // Attempt update

    expect(result).toBe(true); // Expect success
    expect(
      getRecipes().some(
        (r) => r.name === "Chocolate Cake" && r.ingredients.includes("vanilla"),
      ),
    ).toBe(true);
  });

  test("should deletet an existing recipe", () => {
    const recipe = {
      name: "Chocolate Cake",
      inngredients: ["flour", "sugar", "cocoa powder"],
      instructions: "Mix ingredients and bake.",
    };

    addRecipe(recipe); // Add initial recipe

    const result = deleteRecipe(recipe.name); // Attempt delete

    expect(result).toBe(true); // Expeect success
    expect(getRecipes().some((r) => r.name === "Chocolate Cake")).toBe(false); // Should be removed
  });

  test("should return false if trying to delete a non-existent recipe", () => {
    const result = deleteRecipe("Invisible Recipe");
    expect(result).toBe(false); // Ensure false is returned
  });

  test("should return false when trying to update a recipe that doesn't exist", () => {
    const updatedRecipe = { ingredients: ["extra vanilla"] };
    const result = updateRecipe("Nonexistent Recipe", updatedRecipe);
    expect(result).toBe(false);
  });
  test("should return false if writing recipes file fails", () => {
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("Write failed");
    });

    const newRecipe = {
      name: "Test Recipe",
      ingredients: ["item"],
      instructions: "Do something",
    };
    const result = addRecipe(newRecipe);

    expect(result).toBe(false); // Should fail gracefully
    fs.writeFileSync.mockRestore(); // Restore normal behavior after test
  });
  test("should return false if writing updated recipe file fails", () => {
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("Write failed");
    });

    const recipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar", "cocoa powder"],
      instructions: "Mix ingredients and bake.",
    };

    addRecipe(recipe); // Ensure recipe exists before updating

    const updatedRecipe = {
      ingredients: ["flour", "sugar", "cocoa powder", "vanilla"],
      instructions: "Mix ingredients and bake with vanilla.",
    };

    const result = updateRecipe(recipe.name, updatedRecipe);

    expect(result).toBe(false); // Function should fail gracefully
    fs.writeFileSync.mockRestore(); // Restore normal behavior after test
  });
  test("should return false if writing deleted recipe file fails", () => {
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("Write failed");
    });

    const recipe = {
      name: "Chocolate Cake",
      ingredients: ["flour"],
      instructions: "Bake.",
    };
    addRecipe(recipe); // Ensure recipe exists before deleting

    const result = deleteRecipe(recipe.name);

    expect(result).toBe(false); // Function should fail gracefully
    fs.writeFileSync.mockRestore(); // Restore normal behavior after test
  });
  test("should return false if writing recipes file fails using saveRecipes", ()=> {
    jest.spyOn(fs, "writeFileSync").mockImplementation(()=> {
      throw new Error("Write failed");
    })

    const recipes = [{ name: "Chocolate Cake", ingredients: ["flour", "sugar"], instructions: "Mix & bake "}];
    const result = saveRecipes(recipes); // Attempt to save recipes

    expect(result).toBe(false); // Expect the function to gracefully fail
    fs.writeFileSync.mockRestore(); // Restore normal behavior

  });
});
