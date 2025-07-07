// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyChQTjusJzCa5MFhAmNRE75bvqe-zyk_eo",
  authDomain: "proyectojuego-efebb.firebaseapp.com",
  projectId: "proyectojuego-efebb",
  storageBucket: "proyectojuego-efebb.firebasestorage.app",
  messagingSenderId: "220567573863",
  appId: "1:220567573863:web:9ab1f60b07f1d2081dcbc2",
  measurementId: "G-P3W5V47634"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (prevents warnings in React Native)
let analytics = null;
isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);

// Initialize Auth with persistence for React Native
export const auth = getAuth(app);