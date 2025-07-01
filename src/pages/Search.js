import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  searchRecipesByNameAndIngredients,
  getAllCategories,
  getRecipesByCategory,
  getAllAreas,
  getRecipesByArea,
  getRecipeById
} from '../services/mealdbApi';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '');
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch categories and areas on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesData, areasData] = await Promise.all([
          getAllCategories(),
          getAllAreas()
        ]);
        setCategories(categoriesData);
        setAreas(areasData);
      } catch (error) {
        // ignore
      }
    };
    loadOptions();
  }, []);

  // Update search when params change
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const area = searchParams.get('area');
    setQuery(q || '');
    setSelectedCategory(category || '');
    setSelectedArea(area || '');
    if (q || category || area) {
      performSearch(q, category, area);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery, category, area) => {
    setLoading(true);
    setSearched(true);
    try {
      let results = [];
      // If searching by query
      if (searchQuery) {
        results = await searchRecipesByNameAndIngredients(searchQuery);
      }
      // If filtering by category
      if (category) {
        const categoryResults = await getRecipesByCategory(category);
        // Fetch full details for each recipe
        const details = await Promise.all(
          categoryResults.map(r => getRecipeById(r.idMeal))
        );
        const validDetails = details.filter(r => r !== null);
        // Add searchMatch for UI
        validDetails.forEach(recipe => {
          if (!results.some(r => r.idMeal === recipe.idMeal)) {
            results.push({ ...recipe, searchMatch: 'category' });
          }
        });
      }
      // If filtering by area
      if (area) {
        const areaResults = await getRecipesByArea(area);
        const details = await Promise.all(
          areaResults.map(r => getRecipeById(r.idMeal))
        );
        const validDetails = details.filter(r => r !== null);
        validDetails.forEach(recipe => {
          if (!results.some(r => r.idMeal === recipe.idMeal)) {
            results.push({ ...recipe, searchMatch: 'area' });
          }
        });
      }
      setRecipes(results);
    } catch (error) {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedArea) params.set('area', selectedArea);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedArea('');
    setSearchParams({});
    setRecipes([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="max-w-6xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            {/* Main Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for recipes or ingredients..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            {/* Category and Cuisine Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.strCategory} value={category.strCategory}>
                      {category.strCategory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuisine
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">All Cuisines</option>
                  {areas.map((area) => (
                    <option key={area.strArea} value={area.strArea}>
                      {area.strArea}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                type="submit" 
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Recipes
                  </div>
                )}
              </button>
              <button 
                type="button"
                onClick={clearSearch}
                className="flex-1 sm:flex-none bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 border-2 border-red-200 dark:border-red-800"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {recipes.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Search Results
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          Found <span className="font-semibold text-blue-600 dark:text-blue-400">{recipes.length}</span> recipe{recipes.length !== 1 ? 's' : ''} matching your criteria
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {recipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.idMeal} recipe={recipe} searchMatch={recipe.searchMatch} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="max-w-md mx-auto">
                      <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No recipes found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Try adjusting your search terms to find more recipes.
                      </p>
                      <button
                        onClick={clearSearch}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Clear Search
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 