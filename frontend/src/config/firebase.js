// Import required Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config from console
const firebaseConfig = {
  apiKey: "AIzaSyDsCPAMbtnrH3X6nCQhh0cBcz_iiHF4UME",
  authDomain: "drive-3b9b8.firebaseapp.com",
  projectId: "drive-3b9b8",
  storageBucket: "drive-3b9b8.firebasestorage.app",
  messagingSenderId: "948719635744",
  appId: "1:948719635744:web:c23d5ab1d393e96690db45",
  measurementId: "G-01Y8T3PLBP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

export default app;
