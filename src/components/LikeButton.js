import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLikes, toggleLike } from '../services/firebaseStorage';

/**
 * LikeButton
 *
 * Displays like state and count for a recipe. Auth-only interaction toggles
 * the like and updates Firestore; unauthenticated users see a disabled count.
 */
const LikeButton = ({ recipeId }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likes = await getLikes(recipeId);
        setLikeCount(likes.length);
        setIsLiked(user ? likes.includes(user.uid) : false);
      } catch (error) {
        // console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [recipeId, user]);

  const handleLike = async () => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      setError('');
      const newIsLiked = await toggleLike(recipeId, user.uid);
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    } catch (error) {
      setError(error?.message || 'Failed to update like. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">{likeCount}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
        isLiked
          ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
      <svg 
        className={`w-6 h-6 transition-transform duration-200 ${isLiked ? 'scale-110' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isLiked ? 0 : 2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className="text-sm font-medium">{likeCount}</span>
      </button>
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  );
};

export default LikeButton; 