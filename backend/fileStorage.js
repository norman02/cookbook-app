const fs = require("fs").promises;
const path = require("path");
const Storage = require("./storage");

const filePath = path.join(__dirname, "recipes.json");

class FileStorage extends Storage {
  async getRecipes() {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.warn("⚠️ File not found or invalid JSON, returning empty array.");
      return [];
    }
  }

  async saveRecipes(recipes) {
    try {
      await fs.writeFile(filePath, JSON.stringify(recipes, null, 2));
      return true;
    } catch (error) {
      console.error("❌ Error saving recipes:", error);
      return false;
    }
  }
}

module.exports = new FileStorage();
