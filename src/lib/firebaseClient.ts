import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.appspot.com",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:bbf1511a890e423c0e4c85"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();