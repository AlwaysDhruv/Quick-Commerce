// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "swiftshopper-do90e",
  "appId": "1:726467092760:web:d7b8ee0a810d86a14d7e6d",
  "storageBucket": "swiftshopper-do90e.firebasestorage.app",
  "apiKey": "AIzaSyArdbFLAA-PtM7PzZ0bJ6kN-9r2_Thp3M0",
  "authDomain": "swiftshopper-do90e.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "726467092760"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
