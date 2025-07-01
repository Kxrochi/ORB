import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMultipleRandomRecipes, getMoreRandomRecipes, getRecipeById } from '../services/mealdbApi';
import { getMostEngagedRecipes } from '../services/firebaseStorage';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const observer = useRef();

  const lastRecipeElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreRecipes();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore]);

  const loadMoreRecipes = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const excludeIds = recipes.map(recipe => recipe.idMeal);
      const moreRecipes = await getMoreRandomRecipes(6, excludeIds);
      
      if (moreRecipes.length === 0) {
        setHasMore(false);
      } else {
        setRecipes(prev => [...prev, ...moreRecipes]);
      }
    } catch (error) {
      // console.error('Error loading more recipes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchInitialRecipes = async () => {
    try {
      setLoading(true);
      
      // First, try to get most engaged recipes from Firebase
      const mostEngagedIds = await getMostEngagedRecipes(6);
      let mostEngagedRecipes = [];
      
      if (mostEngagedIds.length > 0) {
        const recipePromises = mostEngagedIds.map(id => getRecipeById(id));
        mostEngagedRecipes = await Promise.all(recipePromises);
        mostEngagedRecipes = mostEngagedRecipes.filter(recipe => recipe !== null);
      }
      
      // Fill remaining slots with random recipes
      const remainingSlots = 12 - mostEngagedRecipes.length;
      const randomRecipes = await getMultipleRandomRecipes(remainingSlots);
      
      // Combine and shuffle recipes
      const allRecipes = [...mostEngagedRecipes, ...randomRecipes];
      const shuffledRecipes = allRecipes.sort(() => 0.5 - Math.random());
      
      setRecipes(shuffledRecipes);
    } catch (error) {
      // console.error('Error fetching initial recipes:', error);
      // Fallback to random recipes only
      const fallbackRecipes = await getMultipleRandomRecipes(12);
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialRecipes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ORB
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            OnlineRecipeBook!
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes, ingredients..."
                className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded-r-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Recipes Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recommended Recipes
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => {
              if (recipes.length === index + 1) {
                return (
                  <div key={recipe.idMeal} ref={lastRecipeElementRef}>
                    <RecipeCard recipe={recipe} />
                  </div>
                );
              } else {
                return <RecipeCard key={recipe.idMeal} recipe={recipe} />;
              }
            })}
          </div>
          
          {loadingMore && (
            <div className="text-center py-8">
              <LoadingSpinner />
            </div>
          )}
          
          {!hasMore && recipes.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                You've reached the end! Check back later for more recipes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 