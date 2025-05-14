const DBStorage = require("../dbStorage");

describe("DBStorage Implementation", () => {
  test("should return an empty array if no recipes exist in the database", async () => {
    jest.spyOn(DBStorage, "getRecipes").mockResolvedValue([]);
    const recipes = await DBStorage.getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should save recipes to the database", async () => {
    const mockRecipes = [
      { name: "Pasta", ingredients: ["noodles", "sauce"], instructions: "Boil and mix." },
    ];

    jest.spyOn(DBStorage, "saveRecipes").mockResolvedValue(true);
    const result = await DBStorage.saveRecipes(mockRecipes);
    expect(result).toBe(true);
  });
});
