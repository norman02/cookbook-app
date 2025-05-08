const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'recipes.json');

// Function to retrieve recipes
const getRecipes = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading recipes:', error);
    return []; // Return empty array if file is missing
  }
};

module.exports = { getRecipes };
