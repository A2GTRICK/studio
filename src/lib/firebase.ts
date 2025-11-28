// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration will be injected automatically.
const firebaseConfig = {
  "projectId": "a2g-smart-notes-1st",
  "appId": "1:593098306784:web:bbf1511a890e423c0e4c85",
  "apiKey": "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  "authDomain": "a2g-smart-notes-1st.firebaseapp.com",
  "messagingSenderId": "593098306784"
};

// Initialize Firebase
let app;
// Check if firebaseConfig.apiKey is not an empty string
if (firebaseConfig && firebaseConfig.apiKey) {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (e) {
        console.error("Failed to initialize Firebase", e);
      }
    } else {
      app = getApp();
    }
}


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
