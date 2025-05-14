class Storage {
  async getRecipes() {
    throw new Error("getRecipes() must be implemented.");
  }
  async saveRecipes(recipes) {
    throw new Error("saveRecipes() must be implemented.");
  }
}
module.exports = Storage;
