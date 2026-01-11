# 学生タスク管理アプリ

高校生向けのシンプルなタスク管理アプリケーションです。

## 機能

### 1. やるべきことリスト
- タスクの追加・削除
- タスクの完了/未完了の切り替え
- **日付の設定**（例：1月14日放課後面談）
- 期限までの残り日数を自動計算
- 日付順に自動ソート
- シンプルで使いやすいインターフェース

### 2. カレンダー
- 月間カレンダー表示
- タスクと宿題を日付ごとに表示
- 今後7日間の予定を一覧表示
- タスク数と宿題数をカレンダー上に表示
- 月の切り替え機能

### 3. 時間割管理
- 月曜日〜金曜日の時間割を登録
- 各曜日で最大6時間目まで対応
- 科目ごとに登録・削除が可能

### 4. 科目ごとの宿題管理
- **時間割から科目をプルダウンで選択**
- 宿題の内容と期限を登録
- 期限までの残り日数を自動表示
- 完了/未完了の管理
- 期限順に自動ソート

## セットアップ

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力して作成

### 2. Firebase Authenticationの設定

1. Firebase Consoleで「Authentication」を選択
2. 「Sign-in method」タブを開く
3. 「Google」を有効化

### 3. Cloud Firestoreの設定

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. 「テストモードで開始」を選択（後で本番モードに変更可能）
4. ロケーションを選択（asia-northeast1推奨）

### 4. Firebase設定情報の取得

1. Firebase Consoleで歯車アイコン → 「プロジェクトの設定」
2. 「マイアプリ」セクションで「ウェブアプリ」を追加
3. 表示される設定情報（firebaseConfig）をコピー

### 5. アプリケーションの設定

1. `firebase-config.js` を開く
2. 取得した設定情報を貼り付ける

```javascript
const firebaseConfig = {
    apiKey: "あなたのAPIキー",
    authDomain: "あなたのプロジェクトID.firebaseapp.com",
    projectId: "あなたのプロジェクトID",
    storageBucket: "あなたのプロジェクトID.appspot.com",
    messagingSenderId: "あなたのメッセージング送信者ID",
    appId: "あなたのアプリID"
};
```

### 6. Firebase Hostingの設定

1. `.firebaserc` を開く
2. `YOUR_PROJECT_ID` を自分のFirebaseプロジェクトIDに置き換える

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 7. Firebase CLIのインストール（初回のみ）

```bash
npm install -g firebase-tools
```

### 8. Firebaseにログイン

```bash
firebase login
```

### 9. アプリケーションのデプロイ

```bash
firebase deploy
```

デプロイが完了すると、`https://your-project-id.web.app` のようなURLが表示されます。

### ローカルでの動作確認（オプション）

デプロイ前にローカルで確認したい場合：

```bash
firebase serve
```

ブラウザで `http://localhost:5000` を開いて確認できます。

## 使い方

### ログイン
1. アプリを開くとログイン画面が表示されます
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントを選択してログイン

### データ管理
- すべてのデータはユーザーごとにFirestoreに保存されます
- どのデバイスからログインしても同じデータにアクセスできます
- ログアウトするには、ヘッダーの「ログアウト」ボタンをクリック

### やるべきことリストの使い方
1. テキスト欄にタスクを入力
2. 日付を設定（任意）- 例：「1月14日放課後面談」など
3. 「追加」ボタンをクリック
4. チェックボックスで完了/未完了を切り替え
5. 「削除」ボタンで不要なタスクを削除

### カレンダーの使い方
1. 「カレンダー」タブを選択
2. 月間カレンダーで各日のタスクと宿題を確認
3. ◀ ▶ ボタンで月を切り替え
4. 下部に今後7日間の予定が表示されます

### 時間割の使い方
1. 曜日ボタンで登録したい曜日を選択
2. 時間目を選択
3. 科目名を入力
4. 「追加」ボタンをクリック
5. 登録した科目は宿題管理で自動的に選択肢に表示されます

### 宿題管理の使い方
1. プルダウンから科目を選択（時間割に登録した科目から選択）
2. 宿題の内容を入力
3. 期限を選択（任意）
4. 「追加」ボタンをクリック
5. 完了したら「完了」ボタンをクリック

## Firebase Hostingのメリット

- **HTTPS対応の公開URL**: `https://your-app.web.app` で世界中からアクセス可能
- **どこからでもアクセス**: スマホ、タブレット、PCどのデバイスからでもOK
- **無料**: 月10GBまで無料（個人利用には十分）
- **簡単デプロイ**: `firebase deploy` コマンド一発
- **高速CDN**: Googleのグローバルネットワークで高速配信
- **URLの共有**: 友達や他の生徒にURLを共有するだけで使ってもらえる

## 技術仕様

- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Authentication（Googleログイン）
- Cloud Firestore（データ永続化）
- Firebase Hosting（Webホスティング）

## ブラウザ対応

モダンブラウザ（Chrome, Firefox, Safari, Edge）に対応しています。

## データの保存

- すべてのデータはCloud Firestoreに保存されます
- ユーザーごとに独立したデータベースが管理されます
- データ構造：
  ```
  users/{userId}/data/
    ├─ todos (やるべきことリスト)
    ├─ timetable (時間割)
    └─ homework (宿題)
  ```

## セキュリティ

- Firebase Authenticationによる認証
- ユーザーごとにデータが分離されているため、他のユーザーのデータは閲覧・編集できません
- 本番環境では、Firestoreのセキュリティルールを適切に設定してください
