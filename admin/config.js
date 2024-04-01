import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCS8jvOj-PeVpJvO_jI7JJG4mudLBi2x50",
  authDomain: "food-delivery-app-413414.firebaseapp.com",
  projectId: "food-delivery-app-413414",
  storageBucket: "food-delivery-app-413414.appspot.com",
  messagingSenderId: "216264872510",
  appId: "1:216264872510:web:dff2f4ed1cd85e395fb76f",
  measurementId: "G-6W74XW1JGM"
};
  const app = initializeApp(firebaseConfig);
  const db = getFirestore();
  
  export {
    db
  }