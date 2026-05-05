import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5EEAnMbijtcoC4vVd2WbYDy8zjj-KAlM",
  authDomain: "sevasarthi-f0398.firebaseapp.com",
  projectId: "sevasarthi-f0398",
  storageBucket: "sevasarthi-f0398.firebasestorage.app",
  messagingSenderId: "691248764404",
  appId: "1:691248764404:web:31a4f68f04c6f7f458d5a1",
  measurementId: "G-46QSMKWJWT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
