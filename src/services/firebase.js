import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCvn7rk5j5acvoztVUcxb5vIKqySHKo764", 
    authDomain: "recipebook-f9a16.firebaseapp.com",  
    projectId: "recipebook-f9a16", 
    storageBucket: "recipebook-f9a16.appspot.com", 
    messagingSenderId: "9128141515",  
    appId: "1:9128141515:web:913a9c45f1533f2030314e",
    measurementId: "G-BSJ42EEHQH"
  };
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 