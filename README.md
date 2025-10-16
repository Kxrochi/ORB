# ORB - Online Recipe Book

## Project Overview

ORB (Online Recipe Book) is a modern, full-featured web application for discovering, searching, and planning recipes. It leverages a combination of third-party APIs, cloud services, and a robust React frontend to deliver a seamless and interactive user experience. The app supports user authentication, personalized planners, likes, comments, and advanced search/filtering, all with a responsive and accessible design.

---
## Installation
- Download the repository.
- Run "npm install" in the terminal
- after a successfull install, use 'npm start' to run the website on localhost:3000

## Environment Setup

Before running the application, you need to set up Firebase configuration by creating a `.env` file in the project root directory.

### Firebase Setup

1. **Go to the Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** (or select an existing one)
3. **Add a web app** to your project
4. **Enable Authentication and Firestore** in your Firebase project settings
5. **Copy the configuration values** from the Firebase config object

### Create .env File

Create a `.env` file in the project root directory with the following content:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Replace the placeholder values with your actual Firebase configuration values.

## Table of Contents

- [Project Structure](#project-structure)
- [Core Technologies & Reasoning](#core-technologies--reasoning)
- [Key Features & Architecture](#key-features--architecture)
  - [Routing & App Structure](#routing--app-structure)
  - [Context Providers](#context-providers)
  - [Pages](#pages)
  - [Components](#components)
  - [Services](#services)
- [Testing](#testing)
- [Design Decisions & Rationale](#design-decisions--rationale)




## Core Technologies & Reasoning

### React

- **How it's used:** All UI and logic are built as functional components, leveraging hooks for state and side effects.

### React Router (`react-router-dom`)

- **How it's used:** Defines routes for Home, Search, Recipe Details, Login, Profile, and Planner pages.

### Firebase (Auth, Firestore)

- **How it's used:** Handles user authentication, stores user data (likes, comments, planner), and manages real-time updates.

### Axios

- **How it's used:** Fetches recipe data from TheMealDB API.

### TheMealDB API

- **Why:** A free, open API for meal recipes, ideal for prototyping and educational projects.
- **How it's used:** Supplies the core recipe data for browsing, searching and filtering.

### Context API

- **How it's used:** `AuthContext` manages user authentication state; `ThemeContext` manages dark/light mode.

### Tailwind CSS (implied by class names)

- **How it's used:** All components use Tailwind classes for styling and responsive design.

---

## Key Features & Architecture

### Routing & App Structure

- **`App.js`**: The root component. Wraps the app in `ThemeProvider` and `AuthProvider`, sets up the router, and defines all main routes.
- **`index.js`**: Bootstraps the React app and renders it into the DOM.

### Context Providers

- **`AuthContext.js`**: Manages authentication state using Firebase Auth. Exposes user info, loading state and sign-out functionality. Ensures that only authenticated users can access certain features (e.g., Planner).
- **`ThemeContext.js`**: Manages dark/light mode, persists preference in localStorage, and updates the DOM class for theme switching.

### Pages

- **`Home.js`**: Displays a hero section, search bar, and a grid of recommended recipes. Uses infinite scroll to load more recipes, combining popular (most engaged) and random recipes for variety.
- **`Search.js`**: Advanced search with filters for category, cuisine and dietary preferences (vegetarian, vegan, etc.). Results are fetched from TheMealDB and filtered client-side for dietary needs.
- **`RecipeDetail.js`**: Shows detailed information about a selected recipe, including ingredients, instructions, likes and comments.
- **`Login.js`**: Handles user authentication (login/signup) via Firebase.
- **`Profile.js`**: Displays user profile, liked recipes and preferences.
- **`Planner.js`**: Allows authenticated users to plan meals, using Firestore for persistent storage.

### Components

- **`Header.js`**: Responsive navigation bar with links, theme toggle, and user menu. Adapts based on authentication state.
- **`RecipeCard.js`**: Displays a recipe summary with image, category, cuisine, difficulty, and a hover tooltip for more info.
- **`LikeButton.js`**: Allows users to like/unlike recipes, updating Firestore in real time.
- **`CommentForm.js`**: Lets users add comments to recipes, stored in Firestore.
- **`LoadingSpinner.js`**: Simple spinner for loading states.

### Services

- **`firebase.js`**: Initializes Firebase app, exports Auth and Firestore instances.
- **`firebaseStorage.js`**: Handles all Firestore interactions for likes, comments, user preferences and planner data. Abstracts Firestore logic away from UI components.
- **`mealdbApi.js`**: Handles all interactions with TheMealDB API, including fetching random recipes, searching, and filtering by category/cuisine.

---

## Design Decisions & Rationale

### Why Firebase?

- **Authentication:** Secure, easy to set up, and integrates seamlessly with React.
- **Firestore:** Real-time updates, scalable and flexible data model. Ideal for storing user-generated content (likes, comments, planners).
- **Alternatives considered:** Custom backend (would require more setup and maintenance), Supabase (similar, but Firebase is more widely adopted).

### Why TheMealDB?

- **Open API:** No need for custom backend or scraping.
- **Rich dataset:** Includes images, ingredients, instructions and categories.
- **Alternatives considered:** Spoonacular (has a free tier but with stricter limits), Edamam (requires API key and has usage limits), A Food.com dataset with over a million recipes(but the images were of poor quality).

### Why Context API over Redux?

- **Simplicity:** Context is sufficient for global state (auth, theme) without the boilerplate of Redux.
- **Performance:** Only a few global states; no need for complex state management.

### Why Tailwind CSS?

- **Rapid development:** Utility classes speed up styling and prototyping.
- **Theming:** Easy to implement dark mode and responsive design.
- **Alternatives considered:** Styled-components (good for component-level styles, but Tailwind is faster for prototyping), plain CSS (less maintainable).

### Why Axios?

- **Simplicity:** Cleaner API than fetch, better error handling.
- **Alternatives considered:** Native fetch (more verbose, less convenient for interceptors/global config).

### Component Structure

- **Separation of concerns:** Pages handle data fetching and state, components handle UI and user interaction.
- **Reusability:** Components like `RecipeCard`, `LikeButton`, and `CommentForm` are used across multiple pages.

### Accessibility & Responsiveness

- **Accessibility:** Semantic HTML and ARIA attributes are used where appropriate.
- **Responsiveness:** Tailwind ensures the app works well on all screen sizes.


### References
- **Cursor style by Eder Anaya**
- https://speckyboy.com/css-javascript-cursor-effects/ 
