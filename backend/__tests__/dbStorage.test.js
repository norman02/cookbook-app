const DBStorage = require("../dbStorage");
const MongoClient = require("mongodb").MongoClient;

jest.mock("mongodb", () => {
  const mockCollection = {
    find: jest
      .fn()
      .mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    insertMany: jest.fn().mockResolvedValue({ insertedCount: 1 }),
  };

  const mockDb = { collection: jest.fn(() => mockCollection) };
  const mockClient = {
    db: jest.fn(() => mockDb),
    connect: jest.fn(),
    close: jest.fn(),
  };

  return { MongoClient: jest.fn(() => mockClient) };
});

describe("DBStorage Implementation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error logs
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console behavior after tests
  });

  test("should return an empty array if no recipes exist in the database", async () => {
    const recipes = await DBStorage.getRecipes();
    expect(recipes).toEqual([]);
  });

  test("should save recipes to the database", async () => {
    const mockRecipes = [
      {
        name: "Pasta",
        ingredients: ["noodles", "sauce"],
        instructions: "Boil and mix.",
      },
    ];
    const result = await DBStorage.saveRecipes(mockRecipes);
    expect(result).toBe(true);
  });

  test("should handle database connection errors gracefully", async () => {
    jest
      .spyOn(DBStorage.client, "connect")
      .mockRejectedValue(new Error("Database connection failed"));
    await expect(DBStorage.getRecipes()).resolves.toEqual([]);
  });

  test("should handle database query errors gracefully", async () => {
    jest.spyOn(DBStorage.collection, "find").mockReturnValue({
      toArray: jest.fn().mockRejectedValue(new Error("Query failed")),
    });
    const recipes = await DBStorage.getRecipes();
    expect(recipes).toEqual([]);
  });
  test("should ensure database connection closes even after an error", async () => {
    const closeSpy = jest.spyOn(DBStorage.client, "close").mockResolvedValue();
    jest
      .spyOn(DBStorage.client, "connect")
      .mockRejectedValue(new Error("Database connection failed"));

    await DBStorage.getRecipes(); // This should trigger the error

    expect(closeSpy).toHaveBeenCalled(); // Ensure client.close() runs
  });
});
