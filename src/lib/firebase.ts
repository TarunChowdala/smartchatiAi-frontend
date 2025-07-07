import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsKDml88xdad4G1qn1aE1HYgv5HWHManQ",
  authDomain: "smartchatai-a4efb.firebaseapp.com",
  projectId: "smartchatai-a4efb",
  storageBucket: "smartchatai-a4efb.appspot.com",
  messagingSenderId: "178712645982",
  appId: "1:178712645982:web:7ab0da7ee0c3a9a30cffcf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
