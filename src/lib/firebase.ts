// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfO5BYIxKFfKJLtVcY2u7IwocJRWMuDyk",
  authDomain: "a2g-smartprep-web.firebaseapp.com",
  databaseURL: "https://a2g-smartprep-web-default-rtdb.firebaseio.com",
  projectId: "a2g-smartprep-web",
  storageBucket: "a2g-smartprep-web.appspot.com",
  messagingSenderId: "119647035955",
  appId: "1:119647035955:web:32d6877563c74cd40a7946",
  measurementId: "G-KR7ER86LVR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
