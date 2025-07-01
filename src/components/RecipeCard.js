import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe, searchMatch }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Get ingredients for the tooltip
  const getIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 8; i++) {
      if (recipe[`strIngredient${i}`] && recipe[`strIngredient${i}`].trim()) {
        ingredients.push(recipe[`strIngredient${i}`]);
      }
    }
    return ingredients;
  };

  // Get cooking time estimate (placeholder - could be enhanced with real data)
  const getCookingTime = () => {
    const ingredientCount = getIngredients().length;
    if (ingredientCount <= 5) return '15-20 min';
    if (ingredientCount <= 10) return '25-35 min';
    return '40-50 min';
  };

  // Get difficulty level based on ingredients and instructions
  const getDifficulty = () => {
    const ingredientCount = getIngredients().length;
    const instructionLength = recipe.strInstructions?.length || 0;
    
    if (ingredientCount <= 5 && instructionLength < 500) return { level: 'Easy', color: 'text-green-400' };
    if (ingredientCount <= 8 && instructionLength < 800) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Advanced', color: 'text-red-400' };
  };

  const ingredients = getIngredients();
  const cookingTime = getCookingTime();
  const difficulty = getDifficulty();

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl dark:hover:shadow-gray-900/70 group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link to={`/recipe/${recipe.idMeal}`} className="block">
        <div className="relative overflow-hidden">
          <img 
            src={recipe.strMealThumb} 
            alt={recipe.strMeal} 
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {recipe.strMeal}
          </h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {searchMatch && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                searchMatch === 'name' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : searchMatch === 'ingredient'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : searchMatch === 'category'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : searchMatch === 'area'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {searchMatch === 'name' && 'Name Match'}
                {searchMatch === 'ingredient' && 'Ingredient Match'}
                {searchMatch === 'category' && 'Category Match'}
                {searchMatch === 'area' && 'Cuisine Match'}
              </span>
            )}
            {recipe.strCategory && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {recipe.strCategory}
              </span>
            )}
            {recipe.strArea && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {recipe.strArea}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Enhanced Hover Tooltip */}
      {showTooltip && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95 text-white p-4 flex flex-col justify-center z-30 transition-all duration-500 transform scale-100 opacity-100 backdrop-blur-sm pointer-events-none overflow-y-auto">
          <div className="text-center space-y-3 min-h-0">
            {/* Recipe Title */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent break-words">
                {recipe.strMeal}
              </h4>
              <div className="flex justify-center items-center gap-2 text-xs flex-wrap">
                <span className={`px-2 py-1 rounded-full ${difficulty.color} bg-white/10`}>
                  {difficulty.level}
                </span>
                <span className="px-2 py-1 rounded-full bg-white/10">
                  ⏱️ {cookingTime}
                </span>
              </div>
            </div>

            {/* Cuisine Info */}
            <div className="text-xs text-gray-300">
              {recipe.strCategory && (
                <span className="inline-block px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 mr-1 mb-1">
                  {recipe.strCategory}
                </span>
              )}
              {recipe.strArea && (
                <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                  {recipe.strArea}
                </span>
              )}
            </div>
            
            {/* Ingredients Preview */}
            {ingredients.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-yellow-300">
                  Key Ingredients
                </p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {ingredients.slice(0, 4).map((ingredient, index) => (
                    <div 
                      key={index}
                      className="px-2 py-1 rounded bg-white/10 text-gray-200"
                    >
                      • {ingredient}
                    </div>
                  ))}
                  {ingredients.length > 4 && (
                    <div className="px-2 py-1 rounded bg-white/10 text-gray-400 text-center">
                      +{ingredients.length - 4} more ingredients
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard; 