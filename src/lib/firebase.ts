// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-9338543700-b73b4",
  "appId": "1:731509284055:web:1a15e641fdf493ba71e492",
  "apiKey": "AIzaSyA68Sc8cqM5Cjn2dbe5rMzysCdzakqXIpY",
  "authDomain": "studio-9338543700-b73b4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "731509284055"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db, app };
