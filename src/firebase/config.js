import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDthbv3vnk2XzAe4AGGPbr0Lvy2VZsdThs",
  authDomain: "fresh-wave.firebaseapp.com",
  projectId: "fresh-wave",
  storageBucket: "fresh-wave.firebasestorage.app",
  messagingSenderId: "360597128372",
  appId: "1:360597128372:web:7349f7fa8ee7962e03c3e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);