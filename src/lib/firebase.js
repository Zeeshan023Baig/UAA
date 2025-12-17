// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUCPnr07evlvsSSAFRVTO4gWNmx085WGw",
    authDomain: "uaa-ipad.firebaseapp.com",
    projectId: "uaa-ipad",
    storageBucket: "uaa-ipad.firebasestorage.app",
    messagingSenderId: "263294265828",
    appId: "1:263294265828:web:45ec07d5753258140dfff1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
