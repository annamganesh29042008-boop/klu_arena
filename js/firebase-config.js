// Firebase configuration for KLU Arena.
// This web config is safe to include in a client-side app.
// Never place Firebase Admin/service-account credentials here.

const firebaseConfig = {
  apiKey: "AIzaSyA7ekDD58vRUEmeDmgfuU6hyayRFWt4uR8",
  authDomain: "klu-arena.firebaseapp.com",
  projectId: "klu-arena",
  storageBucket: "klu-arena.firebasestorage.app",
  messagingSenderId: "1033851338798",
  appId: "1:1033851338798:web:27c862df655d535603dfbf",
  measurementId: "G-PTH8N83STG"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
