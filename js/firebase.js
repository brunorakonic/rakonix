import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDMFY9xxq0iuzgcTRz-fcnNQSmZvophiBM",
    authDomain: "rakonix-13f8a.firebaseapp.com",
    projectId: "rakonix-13f8a",
    storageBucket: "rakonix-13f8a.firebasestorage.app",
    messagingSenderId: "951134472966",
    appId: "1:951134472966:web:bec936e3a3b119ee9c2c87",
    measurementId: "G-QBDYRZENJW"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };