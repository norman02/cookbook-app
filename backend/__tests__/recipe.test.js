const fs = require("fs");
const { getRecipes, addRecipe, updateRecipe, deleteRecipe, saveRecipes } = require("../index");

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));

// Setup and Cleanup
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {}); // Silence console errors in tests
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
  jest.restoreAllMocks(); // Restore original behavior
});

describe("Recipe API", () => {
  test("should return an array of recipes", () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ name: "Chocolate Cake" }]));

    const recipes = getRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBe(1);
  });

  test("should return an empty array if recipes.json is missing", () => {
    fs.existsSync.mockReturnValue(false);
    const recipes = getRecipes();
    expect(recipes).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith("⚠️ recipes.json file not found, returning an empty array.");
  });

  test("should add a new recipe", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([]));

    const newRecipe = { name: "Chocolate Cake", ingredients: ["flour", "sugar"], instructions: "Bake." };
    fs.promises.writeFile.mockResolvedValue(); // Simulate successful file write

    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
  });

  test("should not add a duplicate recipe", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ name: "Chocolate Cake" }]));

    const duplicateRecipe = { name: "Chocolate Cake", ingredients: ["flour", "sugar"], instructions: "Bake." };
    fs.promises.writeFile.mockResolvedValue();

    const result = await addRecipe(duplicateRecipe);
    expect(result).toBe(false);
  });

  test("should update an existing recipe", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ name: "Chocolate Cake", ingredients: ["flour"] }]));

    const updatedRecipe = { ingredients: ["flour", "sugar", "vanilla"] };
    fs.promises.writeFile.mockResolvedValue();

    const result = await updateRecipe("Chocolate Cake", updatedRecipe);
    expect(result).toBe(true);
  });

  test("should delete an existing recipe", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ name: "Chocolate Cake" }]));

    fs.promises.writeFile.mockResolvedValue();

    const result = await deleteRecipe("Chocolate Cake");
    expect(result).toBe(true);
  });

  test("should return false if writing recipes file fails", async () => {
    fs.promises.writeFile.mockRejectedValue(new Error("Write failed"));
    const recipes = [{ name: "Chocolate Cake", ingredients: ["flour", "sugar"], instructions: "Bake." }];

    const result = await saveRecipes(recipes);
    expect(result).toBe(false);
  });
});
