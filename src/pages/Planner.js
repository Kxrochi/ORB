import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPlanner, updatePlanner } from '../services/firebaseStorage';
import { searchRecipesByNameAndIngredients } from '../services/mealdbApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Planner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [planner, setPlanner] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState(null); // { day, meal }
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPlannerData = async () => {
      setLoading(true);
      const data = await getPlanner(user.uid);
      setPlanner(data);
      setLoading(false);
    };

    fetchPlannerData();
  }, [user, navigate]);

  const handleUpdatePlanner = async (updatedPlanner) => {
    setPlanner(updatedPlanner);
    if (user) {
      await updatePlanner(user.uid, updatedPlanner);
    }
  };
  
  const openAddRecipeModal = (day, meal) => {
    setModalContext({ day, meal });
    setIsModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContext(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchRecipesByNameAndIngredients(searchQuery.trim());
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectRecipe = (recipe) => {
    const { day, meal } = modalContext;
    const updatedPlanner = {
      ...planner,
      [day]: {
        ...planner[day],
        [meal]: {
          id: recipe.idMeal,
          name: recipe.strMeal,
          img: recipe.strMealThumb,
        },
      },
    };
    handleUpdatePlanner(updatedPlanner);
    closeModal();
  };

  const handleRemoveRecipe = (day, meal) => {
    const updatedPlanner = { ...planner };
    if (updatedPlanner[day]) {
      delete updatedPlanner[day][meal];
      if (Object.keys(updatedPlanner[day]).length === 0) {
        delete updatedPlanner[day];
      }
    }
    handleUpdatePlanner(updatedPlanner);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Weekly Meal Planner
          </h1>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {days.map(day => (
            <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">{day}</h2>
              <div className="space-y-4 flex-grow">
                {meals.map(meal => {
                  const recipe = planner[day]?.[meal];
                  return (
                    <div key={meal}>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{meal}</h3>
                      <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-center p-2">
                        {recipe ? (
                          <>
                            <img src={recipe.img} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30" />
                            <div className="relative z-10">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{recipe.name}</p>
                              {isEditMode && (
                                <div className="mt-2 space-x-2">
                                  <button 
                                    onClick={() => openAddRecipeModal(day, meal)} 
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                  >
                                    Change
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveRecipe(day, meal)} 
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                            {!isEditMode && (
                              <button
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                                className="absolute inset-0 w-full h-full bg-transparent hover:bg-black hover:bg-opacity-10 transition-colors rounded-lg"
                                aria-label={`View ${recipe.name} recipe`}
                              />
                            )}
                          </>
                        ) : (
                          isEditMode ? (
                            <button 
                              onClick={() => openAddRecipeModal(day, meal)} 
                              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              + Add Recipe
                            </button>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No recipe planned</span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add a recipe to {modalContext.meal} on {modalContext.day}</h2>
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a recipe..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" disabled={isSearching}>
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="mt-4 max-h-64 overflow-y-auto">
              {isSearching ? <LoadingSpinner /> : (
                <ul className="space-y-2">
                  {searchResults.map(recipe => (
                    <li key={recipe.idMeal} onClick={() => handleSelectRecipe(recipe)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-12 h-12 rounded-md object-cover" />
                      <span>{recipe.strMeal}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={closeModal} className="mt-6 w-full py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner; 