// 認証管理
let currentUser = null;

// Firebaseの初期化
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    setupAuthListeners();
    checkAuthState();
});

// 認証状態の監視
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // ログイン済み
            currentUser = user;
            showApp();
            displayUserInfo(user);
            // アプリを初期化（script.jsのinitApp関数を呼び出し）
            if (typeof initApp === 'function') {
                initApp();
            }
        } else {
            // 未ログイン
            currentUser = null;
            showLogin();
        }
    });
}

// Googleログイン
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('ログイン成功:', result.user.displayName);
        })
        .catch((error) => {
            console.error('ログインエラー:', error);
            alert('ログインに失敗しました: ' + error.message);
        });
}

// ログアウト
function logout() {
    if (confirm('ログアウトしますか？')) {
        auth.signOut()
            .then(() => {
                console.log('ログアウト成功');
            })
            .catch((error) => {
                console.error('ログアウトエラー:', error);
                alert('ログアウトに失敗しました: ' + error.message);
            });
    }
}

// ユーザー情報を表示
function displayUserInfo(user) {
    document.getElementById('user-name').textContent = user.displayName || 'ユーザー';
    document.getElementById('user-photo').src = user.photoURL || 'https://via.placeholder.com/40';
}

// ログイン画面を表示
function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

// アプリ画面を表示
function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

// イベントリスナーの設定
function setupAuthListeners() {
    // Googleログインボタン
    document.getElementById('google-login-btn').addEventListener('click', googleLogin);

    // ログアウトボタン
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// 現在のユーザーIDを取得
function getCurrentUserId() {
    return currentUser ? currentUser.uid : null;
}

// 現在のユーザーを取得
function getCurrentUser() {
    return currentUser;
}
