
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


// All these values must be set as environment vars in Firebase Studio
const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.appspot.com",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:bbf1511a890e423c0e4c85"
};

function initializeFirebase() {
    if (getApps().length > 0) {
        return {
            app: getApp(),
            auth: getAuth(getApp()),
            db: getFirestore(getApp()),
        };
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    if (typeof window !== 'undefined') {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (siteKey) {
            try {
                const appCheck = initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider(siteKey),
                    isTokenAutoRefreshEnabled: true
                });
            } catch (error) {
                console.error("Error initializing App Check:", error);
            }
        } else {
            console.warn("ReCAPTCHA V3 site key is not set. App Check will not be initialized.");
        }
    }
    
    return { app, auth, db };
}

export { initializeFirebase };
