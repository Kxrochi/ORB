import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeById } from '../services/mealdbApi';
import { useAuth } from '../context/AuthContext';
import { getComments, addComment } from '../services/firebaseStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import LikeButton from '../components/LikeButton';
import CommentForm from '../components/CommentForm';

/**
 * RecipeDetail
 *
 * Fetches and displays a full recipe, including ingredients and instructions.
 * Includes interactive features: likes and comments with Firestore storage.
 */
const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [servingSize, setServingSize] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const recipeData = await getRecipeById(id);
        setRecipe(recipeData);
      } catch (error) {
        // console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const commentsData = await getComments(id);
        setComments(commentsData);
      } catch (error) {
        // console.error('Error fetching comments:', error);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchRecipe();
    fetchComments();
  }, [id]);

  const handleAddComment = async (commentText) => {
    if (!user) return;

    try {
      const newComment = await addComment(id, {
        user: user.displayName || user.email,
        comment: commentText,
        userId: user.uid
      });

      setComments(prevComments => [newComment, ...prevComments]);
    } catch (error) {
      // console.error('Error adding comment:', error);
    }
  };

  const getIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  const getInstructions = () => {
    if (!recipe?.strInstructions) return [];
    return recipe.strInstructions
      .split('.')
      .map(instruction => instruction.trim())
      .filter(instruction => instruction.length > 0);
  };

  const calculateIngredientAmount = (measure) => {
    if (!measure) return '';
    
    // Simple calculation for common measurements
    const numericMatch = measure.match(/(\d+(?:\.\d+)?)/);
    if (numericMatch) {
      const amount = parseFloat(numericMatch[1]) * servingSize;
      return measure.replace(numericMatch[1], amount.toFixed(1));
    }
    return measure;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The recipe you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const ingredients = getIngredients();
  const instructions = getInstructions();
  const displayedIngredients = ingredients;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Recipe Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden mb-8">
          <div className="relative">
            <img 
              src={recipe.strMealThumb} 
              alt={recipe.strMeal} 
              className="w-full h-96 object-cover"
            />
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {recipe.strCategory && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                  {recipe.strCategory}
                </span>
              )}
              {recipe.strArea && (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                  {recipe.strArea}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {recipe.strMeal}
              </h1>
              <LikeButton recipeId={id} />
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {recipe.strInstructions?.substring(0, 200)}...
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Servings:
                </label>
                <select 
                  value={servingSize} 
                  onChange={(e) => setServingSize(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1, 2, 4].map(size => (
                    <option key={size} value={size}>{size}x</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-400">
                <span>Checked {checkedIngredients.length} of {ingredients.length}</span>
                <span>{Math.round((checkedIngredients.length / ingredients.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedIngredients.length / ingredients.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              {displayedIngredients.map((item, index) => (
                <label
                  key={index}
                  htmlFor={`ingredient-checkbox-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer select-none"
                >
                  <input
                    id={`ingredient-checkbox-${index}`}
                    type="checkbox"
                    checked={checkedIngredients.includes(index)}
                    onChange={() => {
                      setCheckedIngredients((prev) =>
                        prev.includes(index)
                          ? prev.filter(i => i !== index)
                          : [...prev, index]
                      );
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <span className="text-gray-900 dark:text-white">
                    <span className="font-medium">
                      {calculateIngredientAmount(item.measure)}
                    </span>
                    {' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.ingredient}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Instructions
            </h2>
            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {instruction}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Comments
          </h2>
          
          {user && (
            <CommentForm onSubmit={handleAddComment} />
          )}
          
          {commentsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-6 space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.timestamp instanceof Date 
                          ? comment.timestamp.toLocaleDateString()
                          : new Date(comment.timestamp).toLocaleDateString()
                        }
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 