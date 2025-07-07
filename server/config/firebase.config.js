// server/config/firebase.config.js

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// This function initializes Firebase and ensures it only happens once.
const initializeFirebaseApp = () => {
    // getApps() checks if an app is already initialized.
    if (getApps().length > 0) {
        return getApps()[0]; // Return the existing app if it's there
    }

    // --- THIS IS THE MAIN CHANGE ---
    // The Firebase Admin SDK is smart. When initializeApp() is called with no arguments,
    // it will AUTOMATICALLY look for the GOOGLE_APPLICATION_CREDENTIALS environment
    // variable, which you have set in your server/.env file.
    // We no longer need to manually build the serviceAccount object.

    console.log("Attempting Firebase Admin SDK initialization...");

    // Check if the environment variable is set before attempting to initialize
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error("FATAL ERROR: Missing required Firebase Admin SDK credentials!");
        console.error("The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
        console.error("Please ensure it is defined in your server/.env file and points to your service account JSON file.");
        process.exit(1); // Exit the process because the server cannot run.
    }
    
    // Initialize the app. The SDK handles the rest.
    const app = initializeApp(); 

    console.log("Firebase Admin SDK initialized successfully.");
    return app;
};

// Initialize the app immediately when this module is loaded.
const app = initializeFirebaseApp();

// We export functions that RETURN the initialized services. This is good practice.
export const getFirebaseAuth = () => getAuth(app);
export const getFirebaseDb = () => getFirestore(app);