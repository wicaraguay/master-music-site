import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDf2KNTcr4JSzVxCY_VBIn9OVz76MN_llQ",
    authDomain: "maestro-portfolio.firebaseapp.com",
    projectId: "maestro-portfolio",
    storageBucket: "maestro-portfolio.firebasestorage.app",
    messagingSenderId: "421781444208",
    appId: "1:421781444208:web:bd13c414d31dad201ec6b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
