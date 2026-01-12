// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDt73jiw7T1KldzzL8T9QtM3IeLUJhp3cs",
    authDomain: "unitder-booking-v2.firebaseapp.com",
    projectId: "unitder-booking-v2",
    storageBucket: "unitder-booking-v2.firebasestorage.app",
    messagingSenderId: "43698396696",
    appId: "1:43698396696:web:fc3a99975ab913edd5ad6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);