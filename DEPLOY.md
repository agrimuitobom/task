# Firebase Hostingへのデプロイ手順

## 前提条件
- Node.js と npm がインストールされていること
- Googleアカウントを持っていること
- Firebaseプロジェクト（task-sainou）が作成済みであること

## デプロイ手順

### 1. プロジェクトをダウンロード

Gitリポジトリからクローンするか、プロジェクトファイルをダウンロードしてください。

```bash
git clone [your-repository-url]
cd task
```

### 2. Firebase CLIをインストール

ターミナル（コマンドプロンプト）で以下のコマンドを実行：

```bash
npm install -g firebase-tools
```

### 3. Firebaseにログイン

```bash
firebase login
```

ブラウザが開くので、Googleアカウントでログインしてください。

### 4. プロジェクト設定の確認

`.firebaserc` ファイルを開いて、プロジェクトIDが正しいか確認：

```json
{
  "projects": {
    "default": "task-sainou"
  }
}
```

### 5. デプロイ

```bash
firebase deploy
```

成功すると、以下のような出力が表示されます：

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/task-sainou/overview
Hosting URL: https://task-sainou.web.app
```

### 6. アプリにアクセス

ブラウザで `https://task-sainou.web.app` を開いてください。

## トラブルシューティング

### エラー: "Failed to authenticate"
→ `firebase login` を再度実行してログインしてください

### エラー: "Permission denied"
→ Firebaseプロジェクトの権限を確認してください
→ Firebase Consoleで「プロジェクト設定」→「ユーザーと権限」を確認

### デプロイ前にローカルでテストしたい場合

```bash
firebase serve
```

`http://localhost:5000` でアプリを確認できます。

## デプロイ後の更新

コードを変更した後、再度デプロイするには：

```bash
# 変更をコミット
git add .
git commit -m "Update app"
git push

# デプロイ
firebase deploy
```

## 注意事項

- Firebase Authenticationで「承認済みドメイン」に `task-sainou.web.app` が追加されているか確認してください
- 初回デプロイ後、Firebase Consoleで Hosting の設定を確認してください
