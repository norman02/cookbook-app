const fs = require("fs");
const {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipes,
} = require("../index");

// Mock file system functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));

// Shared test recipe
const testRecipe = {
  name: "Chocolate Cake",
  ingredients: ["flour", "sugar"],
  instructions: "Bake at 350°F for 30 minutes.",
};

// Helper function to mock file existence and contents
const mockFileExists = (exists, recipes = []) => {
  fs.existsSync.mockReturnValue(exists);
  fs.readFileSync.mockReturnValue(JSON.stringify(recipes));
};

// Setup and Cleanup
beforeEach(() => {
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
    mockFileExists(true, [testRecipe]);

    const recipes = getRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes).toHaveLength(1);
  });

  test("should return an empty array if recipes.json is missing", () => {
    mockFileExists(false);

    const recipes = getRecipes();
    expect(recipes).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ recipes.json file not found, returning an empty array.",
    );
  });

  test("should add a new recipe", async () => {
    mockFileExists(true, []);
    fs.promises.writeFile.mockResolvedValue();

    const result = await addRecipe(testRecipe);
    expect(result).toBe(true);
  });

  test("should not add a duplicate recipe", async () => {
    mockFileExists(true, [testRecipe]);
    fs.promises.writeFile.mockResolvedValue();

    const result = await addRecipe(testRecipe);
    expect(result).toBe(false);
  });

  test("should update an existing recipe", async () => {
    mockFileExists(true, [testRecipe]);
    fs.promises.writeFile.mockResolvedValue();

    const updatedRecipe = { ingredients: ["flour", "sugar", "vanilla"] };
    const result = await updateRecipe(testRecipe.name, updatedRecipe);
    expect(result).toBe(true);
  });

  test("should delete an existing recipe", async () => {
    mockFileExists(true, [testRecipe]);
    fs.promises.writeFile.mockResolvedValue();

    const result = await deleteRecipe(testRecipe.name);
    expect(result).toBe(true);
  });

  test("should return false if writing recipes file fails", async () => {
    fs.promises.writeFile.mockRejectedValue(new Error("Write failed"));

    const result = await saveRecipes([testRecipe]);
    expect(result).toBe(false);
  });
  test("should return an empty array if recipes.json contains invalid JSON", () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("INVALID_JSON"); // Corrupted JSON

    const recipes = getRecipes();
    expect(recipes).toEqual([]);
  });
  test("should return false if trying to update a non-existent recipe", async () => {
    mockFileExists(true, []); // No recipes exist
    fs.promises.writeFile.mockResolvedValue();

    const result = await updateRecipe("Nonexistent Recipe", {
      ingredients: ["vanilla"],
    });
    expect(result).toBe(false);
  });
  test("should return false if trying to delete a non-existent recipe", async () => {
    mockFileExists(true, []); // No recipes exist
    fs.promises.writeFile.mockResolvedValue();

    const result = await deleteRecipe("Nonexistent Recipe");
    expect(result).toBe(false);
  });
  test("should return an empty array if parsed data is not an array", () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(
      JSON.stringify({ invalidKey: "Not an array" }),
    ); // Simulate incorrect JSON structure

    const recipes = getRecipes();
    expect(recipes).toEqual([]);
  });
  test("should add a recipe with categrory", async () => {
    mockFileExists(true, []); // Simulate an empty recipe array.
    fs.promises.writeFile.mockResolvedValue();

    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350 F for 30 minutes.",
      categrory: "Desert",
    };
    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);
  });
  test("should ignore unexpected fields in recipe", async () => {
    mockFileExists(true, []);
    fs.promises.writeFile.mockResolvedValue();

    const newRecipe = {
      name: "Chocolate Cake",
      ingredients: ["flour", "sugar"],
      instructions: "Bake at 350°F",
      category: "Dessert",
      maliciousField: "HACKER_DATA", // Unwanted field
    };

    const result = await addRecipe(newRecipe);
    expect(result).toBe(true);

    const recipes = getRecipes();
    expect(recipes.some((r) => r.maliciousField)).toBe(false); // Ensure it's removed
  });
});
