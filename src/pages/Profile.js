import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserLikes } from '../services/firebaseStorage';
import { getRecipeById } from '../services/mealdbApi';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLikedRecipes = async () => {
      try {
        setLoading(true);
        const likedIds = await getUserLikes(user.uid);
        
        // Fetch full recipe details for liked recipes
        const recipePromises = likedIds.map(id => getRecipeById(id));
        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter(recipe => recipe !== null);
        
        setLikedRecipes(validRecipes);
      } catch (error) {
        // console.error('Error fetching liked recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      // console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Liked Recipes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Liked Recipes ({likedRecipes.length})
          </h2>
          
          {loading ? (
            <LoadingSpinner />
          ) : likedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                ❤️
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No liked recipes yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start exploring recipes and like your favorites to see them here!
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Explore Recipes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedRecipes.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 