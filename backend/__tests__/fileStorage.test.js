const fs = require("fs");
const FileStorage = require("../fileStorage");

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue("[]"),
    writeFile: jest.fn().mockResolvedValue(),
  },
}));

describe("FileStorage Implementation", () => {
  test("should return an empty array if the file does not exist", async () => {
    // When readFile is rejected, our implementation should log a warning and return []
    fs.promises.readFile.mockRejectedValue(new Error("File not found"));
    
    // Since getRecipes catches the error and returns [], we expect resolution, not a rejection.
    await expect(FileStorage.getRecipes()).resolves.toEqual([]);
  });

  test("should handle file write errors gracefully", async () => {
    // When writeFile is rejected, our implementation returns false.
    fs.promises.writeFile.mockRejectedValue(new Error("Write failed"));

    // Since saveRecipes catches the error and returns false, we expect resolution to false.
    await expect(FileStorage.saveRecipes([{ name: "Test" }])).resolves.toBe(false);
  });

  test("should save recipes to a file", async () => {
    const mockRecipes = [
      { name: "Pasta", ingredients: ["noodles", "sauce"], instructions: "Boil and mix." },
    ];
    fs.promises.writeFile.mockResolvedValue();
    const result = await FileStorage.saveRecipes(mockRecipes);
    expect(result).toBe(true);
  });
});
