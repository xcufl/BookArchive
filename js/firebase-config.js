const firebaseConfig = {
    apiKey: "AIzaSyBYedvL3VXUTXwbGSZknsHr4rJmtgIDPq0",
    authDomain: "tugasrpl-1a3a2.firebaseapp.com",
    databaseURL: "https://tugasrpl-1a3a2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tugasrpl-1a3a2",
    storageBucket: "tugasrpl-1a3a2.firebasestorage.app",
    messagingSenderId: "667366396587",
    appId: "1:667366396587:web:82cea888343d8e4ff7ddee",
    measurementId: "G-M1ELZ4LY0C"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
