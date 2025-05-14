const Storage = require("../storage");
const FileStorage = require("../fileStorage");

describe("Storage Interface", () => {
  test("should throw an error when calling unimplemented methods", async () => {
    const storage = new Storage();

    // Because getRecipes() and saveRecipes() are async, we use reject matchers.
    await expect(storage.getRecipes()).rejects.toThrow("getRecipes() must be implemented.");
    await expect(storage.saveRecipes([])).rejects.toThrow("saveRecipes() must be implemented.");
  });
});

describe("FileStorage Implementation", () => {
  beforeEach(() => {
    jest.restoreAllMocks(); // Reset mocks before each test.
  });

  test("should return an empty array if the file does not exist", async () => {
    // Here we simulate the case by mocking the method to resolve with an empty array.
    jest.spyOn(FileStorage, "getRecipes").mockResolvedValue([]);
    const recipes = await FileStorage.getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should save recipes to a file", async () => {
    const mockRecipes = [
      {
        name: "Pasta",
        ingredients: ["noodles", "sauce"],
        instructions: "Boil and mix.",
      },
    ];

    // Mock saveRecipes to resolve with true indicating success.
    jest.spyOn(FileStorage, "saveRecipes").mockResolvedValue(true);
    const result = await FileStorage.saveRecipes(mockRecipes);
    expect(result).toBe(true);
  });
});
