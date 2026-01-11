// Firebase設定
// 注意: このファイルにあなたのFirebaseプロジェクトの設定情報を入力してください
// Firebase Consoleから取得できます: https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSyCKt5XkLWlpSqdY6t3nwO9n0BNDaELSuew",
  authDomain: "task-sainou.firebaseapp.com",
  projectId: "task-sainou",
  storageBucket: "task-sainou.firebasestorage.app",
  messagingSenderId: "874953051328",
  appId: "1:874953051328:web:9a0a748d442dbed021f125",
  measurementId: "G-JD4Y9194LX"
};

// Firebaseの初期化
// このコードは変更しないでください
let app, auth, db;

function initFirebase() {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
}
