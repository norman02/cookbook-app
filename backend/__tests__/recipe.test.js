const { getRecipes } = require("../index"); // Import function

describe("Recipe API", () => {
  test("should return an array of recipes", () => {
    const recipes = getRecipes();
    expect(Array.isArray(recipes)).toBe(true); // Expect result to be an array
  });
});
