const { MongoClient } = require("mongodb");
const Storage = require("./storage");

class DBStorage extends Storage {
  constructor() {
    super();
    this.client = new MongoClient("mongodb://localhost:27017");
    this.db = this.client.db("cookbook");
    this.collection = this.db.collection("recipes");
  }

  async getRecipes() {
    try {
      await this.client.connect();
      return await this.collection.find().toArray();
    } catch (error) {
      console.error("❌ Error fetching recipes from database:", error);
      return [];
    } finally {
      await this.client.close();
    }
  }

  async saveRecipes(recipes) {
    try {
      await this.client.connect();
      await this.collection.deleteMany({});
      await this.collection.insertMany(recipes);
      return true;
    } catch (error) {
      console.error("❌ Error saving recipes to database:", error);
      return false;
    } finally {
      await this.client.close();
    }
  }
}

module.exports = new DBStorage();
