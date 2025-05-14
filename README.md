# 🍽️ Cookbook App - MERN Stack

Welcome to the **Cookbook App**, a full-stack web application built with the **MERN (MongoDB, Express.js, React, Node.js) stack**. This app allows users to store, search, and manage their favorite recipes dynamically.

## 📌 Project Roadmap

### ✅ **Phase 1: Planning & Setup (Completed)**
- [x] Define project goals and features **✔ Completed**

### 🚀 **Phase 2: Backend Development (Node.js + Express)**
- [x] Implement **storage abstraction** (file-based & database storage)
- [x] Develop CRUD operations for recipes (`getRecipes`, `addRecipe`, `updateRecipe`, `deleteRecipe`)
- [x] Add **duplicate prevention** (recipes with the same name are not added twice)
- [x] Implement **schema validation** (filters out unexpected fields)
- [ ] Set up Express server and define API routes (`/recipes`, `/users`)
- [ ] Create database schema with Mongoose for recipes and users
- [ ] Implement authentication (JWT-based user sessions)
- [ ] Add middleware for error handling and request validation

### 🎨 **Phase 3: Frontend Development (React)**
- [ ] Design UI components (Navbar, Recipe List, Recipe Detail, User Profile, etc.)
- [ ] Manage state using React Context API or Redux
- [ ] Connect frontend with backend API to fetch and store recipes
- [ ] Add search and filtering functionality
- [ ] Build recipe form for adding new recipes

### ☁ **Phase 4: Deployment & Optimization**
- [ ] Deploy frontend (Netlify/Vercel) and backend (Render/DigitalOcean)
- [ ] Optimize performance (caching, lazy loading, database indexing)
- [ ] Enhance security (input validation, HTTPS, authentication)
- [ ] Improve user experience with accessibility features

### 💡 **Phase 5: Future Enhancements**
- [ ] Add user favorites & ratings for recipes
- [ ] Implement image uploads for recipe pictures
- [ ] Introduce social sharing options for recipes
- [ ] AI-powered recommendations for personalized recipe suggestions

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/cookbook-app.git
cd cookbook-app
npm install
```

### Running the App
Start the backend:
```bash
npm run server
```
Start the frontend:
```bash
npm start
```

## 🔧 Storage Backend
The app dynamically selects the storage backend based on an environment variable:

- **File-based storage** (default) – Recipes are stored in `recipes.json`
- **Database storage** – Uses MongoDB when `USE_DB=true`

### Switching Storage Backend
To use **database storage**, set the environment variable:
```bash
export USE_DB=true
```
To revert to **file-based storage**, unset the variable:
```bash
unset USE_DB
```

## 📜 API Endpoints
The following functions are available in `index.js`:

### `getRecipes()`
Retrieves all stored recipes.
```javascript
const recipes = await getRecipes();
console.log(recipes);
```

### `addRecipe(recipe)`
Adds a new recipe (if it doesn’t already exist).
```javascript
const newRecipe = {
  name: "Chocolate Cake",
  ingredients: ["flour", "sugar"],
  instructions: "Bake at 350°F for 30 minutes.",
};
const success = await addRecipe(newRecipe);
console.log(success); // true if added, false if duplicate
```

### `updateRecipe(recipeName, updatedRecipe)`
Updates an existing recipe.
```javascript
const success = await updateRecipe("Chocolate Cake", { ingredients: ["flour", "sugar", "vanilla"] });
console.log(success); // true if updated, false if not found
```

### `deleteRecipe(recipeName)`
Deletes a recipe by name.
```javascript
const success = await deleteRecipe("Chocolate Cake");
console.log(success); // true if deleted, false if not found
```

## 🧪 Running Tests
The app uses **Jest** for unit testing. To run tests:
```bash
npm test
```
Tests include:
- **Storage abstraction** (`storage.test.js`)
- **File-based storage** (`dbStorage.test.js`)
- **Recipe API validation** (`recipe.test.js`)

## 🤝 Contributing
Feel free to submit pull requests or open issues for improvements!

## 📜 License
This project is licensed under the MIT License. Feel free to contribute!
```
