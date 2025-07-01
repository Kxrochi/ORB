import axios from 'axios';

const API_URL = 'https://www.themealdb.com/api/json/v1/1/';

const api = axios.create({
  baseURL: API_URL,
});

export const getRandomRecipes = async () => {
  try {
    // TheMealDB random.php endpoint returns a single random meal.
    const response = await api.get('random.php');
    return response.data.meals;
  } catch (error) {
    return [];
  }
};

export const getMultipleRandomRecipes = async (count = 12) => {
  try {
    // Use only 2-3 simple strategies for random recipes
    const strategies = [
      // Strategy 1: Random letters (most diverse)
      async () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = letters.split('').sort(() => 0.5 - Math.random()).slice(0, 8);
        const promises = randomLetters.map(letter => 
          api.get(`search.php?f=${letter}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      },
      // Strategy 2: Popular categories
      async () => {
        const categories = ['Beef', 'Chicken', 'Pasta', 'Seafood', 'Vegetarian', 'Dessert'];
        const randomCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 3);
        const promises = randomCategories.map(category => 
          api.get(`filter.php?c=${category}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      },
      // Strategy 3: Popular cuisines
      async () => {
        const areas = ['Italian', 'American', 'Chinese', 'Indian', 'Mexican', 'French'];
        const randomAreas = areas.sort(() => 0.5 - Math.random()).slice(0, 3);
        const promises = randomAreas.map(area => 
          api.get(`filter.php?a=${area}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      }
    ];
    
    // Use only 2-3 strategies randomly
    const selectedStrategies = strategies.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 strategies
    
    let allRecipes = [];
    for (const strategy of selectedStrategies) {
      try {
        const recipes = await strategy();
        allRecipes = [...allRecipes, ...recipes];
      } catch (error) {
        continue;
      }
    }
    
    // Shuffle and get unique recipes
    const shuffled = allRecipes.sort(() => 0.5 - Math.random());
    const uniqueRecipes = Array.from(new Set(shuffled.map(r => r.idMeal)))
                              .map(id => shuffled.find(r => r.idMeal === id));
    
    // Get full recipe details for recipes that might be missing category/area
    const recipesWithFullDetails = await Promise.all(
      uniqueRecipes.slice(0, count).map(async (recipe) => {
        // If recipe has category and area, it's already complete
        if (recipe.strCategory && recipe.strArea) {
          return recipe;
        }
        // Otherwise, fetch full details
        try {
          const fullRecipe = await getRecipeById(recipe.idMeal);
          return fullRecipe || recipe; // Fallback to original if fetch fails
        } catch (error) {
          return recipe; // Return original recipe if fetch fails
        }
      })
    );
    
    // Filter out any null recipes
    return recipesWithFullDetails.filter(recipe => recipe !== null);
  } catch (error) {
    return [];
  }
};

export const getMoreRandomRecipes = async (count = 6, excludeIds = []) => {
  try {
    // Use only 2-3 simple strategies for loading more recipes
    const strategies = [
      // Strategy 1: Different random letters
      async () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = letters.split('').sort(() => 0.5 - Math.random()).slice(0, 6);
        const promises = randomLetters.map(letter => 
          api.get(`search.php?f=${letter}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      },
      // Strategy 2: Different categories
      async () => {
        const categories = ['Beef', 'Chicken', 'Lamb', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Dessert', 'Miscellaneous'];
        const randomCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 2);
        const promises = randomCategories.map(category => 
          api.get(`filter.php?c=${category}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      },
      // Strategy 3: Different areas
      async () => {
        const areas = ['American', 'British', 'Chinese', 'French', 'Indian', 'Italian', 'Japanese', 'Mexican', 'Thai', 'Turkish'];
        const randomAreas = areas.sort(() => 0.5 - Math.random()).slice(0, 2);
        const promises = randomAreas.map(area => 
          api.get(`filter.php?a=${area}`).then(response => response.data.meals || [])
        );
        const results = await Promise.all(promises);
        return results.flat();
      }
    ];
    
    // Use only 2-3 strategies randomly
    const selectedStrategies = strategies.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 strategies
    
    let allRecipes = [];
    for (const strategy of selectedStrategies) {
      try {
        const recipes = await strategy();
        allRecipes = [...allRecipes, ...recipes];
      } catch (error) {
        continue;
      }
    }
    
    // Shuffle and filter out excluded IDs
    const shuffled = allRecipes.sort(() => 0.5 - Math.random());
    const uniqueRecipes = Array.from(new Set(shuffled.map(r => r.idMeal)))
                              .map(id => shuffled.find(r => r.idMeal === id))
                              .filter(recipe => !excludeIds.includes(recipe.idMeal));
    
    // Get full recipe details for recipes that might be missing category/area
    const recipesWithFullDetails = await Promise.all(
      uniqueRecipes.slice(0, count).map(async (recipe) => {
        // If recipe has category and area, it's already complete
        if (recipe.strCategory && recipe.strArea) {
          return recipe;
        }
        // Otherwise, fetch full details
        try {
          const fullRecipe = await getRecipeById(recipe.idMeal);
          return fullRecipe || recipe; // Fallback to original if fetch fails
        } catch (error) {
          return recipe; // Return original recipe if fetch fails
        }
      })
    );
    
    // Filter out any null recipes
    return recipesWithFullDetails.filter(recipe => recipe !== null);
  } catch (error) {
    return [];
  }
};

export const searchRecipesByNameAndIngredients = async (query) => {
  try {
    // First, search by recipe name
    const nameResults = await searchRecipesByName(query);
    
    // Then, search by ingredient
    const ingredientResults = await searchRecipesByIngredient(query);
    
    // Fetch complete details for ingredient results (they only have basic info)
    const ingredientDetailsPromises = ingredientResults.map(recipe => getRecipeById(recipe.idMeal));
    const ingredientDetails = await Promise.all(ingredientDetailsPromises);
    const validIngredientDetails = ingredientDetails.filter(recipe => recipe !== null);
    
    // Combine and deduplicate results with match type information
    const allResults = [];
    const nameIds = new Set(nameResults.map(recipe => recipe.idMeal));
    
    // Add name results first
    nameResults.forEach(recipe => {
      allResults.push({
        ...recipe,
        searchMatch: 'name'
      });
    });
    
    // Add ingredient results that aren't already in name results
    validIngredientDetails.forEach(recipe => {
      if (!nameIds.has(recipe.idMeal)) {
        allResults.push({
          ...recipe,
          searchMatch: 'ingredient'
        });
      }
    });
    
    return allResults;
  } catch (error) {
    return [];
  }
};

export const searchRecipesByName = async (query) => {
  try {
    const response = await api.get(`search.php?s=${query}`);
    return response.data.meals || [];
  } catch (error) {
    return [];
  }
};

export const searchRecipesByIngredient = async (ingredient) => {
  try {
    const response = await api.get(`filter.php?i=${ingredient}`);
    return response.data.meals || [];
  } catch (error) {
    return [];
  }
};

export const getRecipeById = async (id) => {
  try {
    const response = await api.get(`lookup.php?i=${id}`);
    return response.data.meals ? response.data.meals[0] : null;
  } catch (error) {
    return null;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await api.get('categories.php');
    return response.data.categories || [];
  } catch (error) {
    return [];
  }
};

export const getRecipesByCategory = async (category) => {
  try {
    const response = await api.get(`filter.php?c=${category}`);
    return response.data.meals || [];
  } catch (error) {
    return [];
  }
};

export const getAllAreas = async () => {
  try {
    const response = await api.get('list.php?a=list');
    return response.data.meals || [];
  } catch (error) {
    return [];
  }
};

export const getRecipesByArea = async (area) => {
  try {
    const response = await api.get(`filter.php?a=${area}`);
    return response.data.meals || [];
  } catch (error) {
    return [];
  }
}; 