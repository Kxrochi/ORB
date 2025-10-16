import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Firestore data helpers
 *
 * Encapsulates reads/writes for likes, comments, user preferences, and
 * planner data. Functions return safe defaults when possible and throw
 * on user-triggered write failures so UI can display errors.
 */
// Likes functionality
/** Returns the list of user ids who liked the recipe (creates doc if missing). */
export const getLikes = async (recipeId) => {
  try {
    const recipeDoc = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeDoc);
    
    if (recipeSnap.exists()) {
      const likes = recipeSnap.data().likes || [];
      return likes;
    } else {
      // Create the recipe document if it doesn't exist
      await setDoc(recipeDoc, { likes: [] });
      return [];
    }
  } catch (error) {
    // console.error('Error getting likes:', error);
    return [];
  }
};

/** Toggles like for a user on a recipe. Returns new like state (boolean). */
export const toggleLike = async (recipeId, userId) => {
  try {
    const recipeDoc = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeDoc);
    
    if (recipeSnap.exists()) {
      const currentLikes = recipeSnap.data().likes || [];
      const isLiked = currentLikes.includes(userId);
      
      if (isLiked) {
        await updateDoc(recipeDoc, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(recipeDoc, {
          likes: arrayUnion(userId)
        });
      }
      
      return !isLiked;
    } else {
      // Create the recipe document with the like
      await setDoc(recipeDoc, { likes: [userId] });
      return true;
    }
  } catch (error) {
    // Surface underlying Firebase error for better debugging in UI
    const message = (error && (error.message || error.code)) || 'Failed to update like.';
    throw new Error(message);
  }
};

/** Returns ids of recipes liked by the given user. */
export const getUserLikes = async (userId) => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, where('likes', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    const likedRecipeIds = querySnapshot.docs.map(doc => doc.id);
    return likedRecipeIds;
  } catch (error) {
    // console.error('Error getting user likes:', error);
    return [];
  }
};

// Comments functionality
/** Returns comments for a recipe, newest first. */
export const getComments = async (recipeId) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('recipeId', '==', recipeId));
    const querySnapshot = await getDocs(q);
    
    const comments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date()
      };
    });
    
    // Sort comments by timestamp in descending order (newest first)
    comments.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeB - timeA;
    });
    
    return comments;
  } catch (error) {
    // console.error('Error getting comments:', error);
    return [];
  }
};

/** Adds a comment and returns the created comment with a local timestamp. */
export const addComment = async (recipeId, commentData) => {
  try {
    const commentsRef = collection(db, 'comments');
    const newComment = {
      recipeId,
      user: commentData.user,
      comment: commentData.comment,
      timestamp: serverTimestamp(),
      userId: commentData.userId
    };
    
    const docRef = await addDoc(commentsRef, newComment);
    const result = {
      id: docRef.id,
      ...newComment,
      timestamp: new Date()
    };
    
    return result;
  } catch (error) {
    // console.error('Error adding comment:', error);
    throw new Error('Failed to post comment. Please check your internet connection and try again.');
  }
};

// User preferences functionality
/** Returns user preferences object, creating defaults if none exist. */
export const getUserPreferences = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(userDoc);
    
    if (userSnap.exists()) {
      const preferences = userSnap.data().preferences || {};
      return preferences;
    } else {
      // Create user document with default preferences
      const defaultPreferences = {
        servingSize: 1,
        theme: 'light',
        notifications: true
      };
      await setDoc(userDoc, { preferences: defaultPreferences });
      return defaultPreferences;
    }
  } catch (error) {
    // console.error('Error getting user preferences:', error);
    return {};
  }
};

/** Updates user preferences (merge). */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, { preferences }, { merge: true });
  } catch (error) {
    // console.error('Error updating user preferences:', error);
    throw new Error('Failed to update preferences. Please check your internet connection and try again.');
  }
};

// Get most liked recipes
/** Returns top recipe ids sorted by like count (desc), up to `limit`. */
export const getMostLikedRecipes = async (limit = 12) => {
  try {
    const recipesRef = collection(db, 'recipes');
    const querySnapshot = await getDocs(recipesRef);
    
    // Process recipes and sort by like count
    const recipesWithLikes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      likeCount: doc.data().likes?.length || 0
    }));
    
    // Sort by like count (descending) and take the top ones
    const topLikedRecipes = recipesWithLikes
      .filter(recipe => recipe.likeCount > 0) // Only include recipes with likes
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit);
    
    return topLikedRecipes.map(recipe => recipe.id);
  } catch (error) {
    // console.error('Error getting most liked recipes:', error);
    return [];
  }
};

// Get most engaged recipes (likes + comments)
/** Returns top recipe ids by engagement score (likes + comments). */
export const getMostEngagedRecipes = async (limit = 12) => {
  try {
    const recipesRef = collection(db, 'recipes');
    const recipesSnapshot = await getDocs(recipesRef);
    const recipes = recipesSnapshot.docs.map(doc => ({
      id: doc.id,
      likeCount: doc.data().likes?.length || 0
    }));

    // For each recipe, get the comment count
    const commentsRef = collection(db, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    const commentCounts = {};
    commentsSnapshot.docs.forEach(doc => {
      const recipeId = doc.data().recipeId;
      if (recipeId) {
        commentCounts[recipeId] = (commentCounts[recipeId] || 0) + 1;
      }
    });

    // Combine like and comment counts
    const recipesWithEngagement = recipes.map(recipe => ({
      id: recipe.id,
      likeCount: recipe.likeCount,
      commentCount: commentCounts[recipe.id] || 0,
      engagementScore: recipe.likeCount + (commentCounts[recipe.id] || 0)
    }));

    // Sort by engagement score (descending) and take the top ones
    const topEngagedRecipes = recipesWithEngagement
      .filter(recipe => recipe.engagementScore > 0)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);

    return topEngagedRecipes.map(recipe => recipe.id);
  } catch (error) {
    // console.error('Error getting most engaged recipes:', error);
    return [];
  }
};

// Planner functionality
/** Returns the planner object for a user (empty object if none). */
export const getPlanner = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data().planner || {};
    }
    return {};
  } catch (error) {
    // console.error('Error getting planner:', error);
    return {};
  }
};

/** Updates the planner for a user (merge). */
export const updatePlanner = async (userId, plannerData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { planner: plannerData }, { merge: true });
  } catch (error) {
    // console.error('Error updating planner:', error);
    throw new Error('Failed to update planner.');
  }
}; 