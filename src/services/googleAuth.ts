
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Auth } from "firebase/auth";

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await signInWithPopup(auth, provider);
  } catch (err: any) {
    // Popup blocked fallback
    if (err.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}
